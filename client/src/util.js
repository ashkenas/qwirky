import { useCallback, useContext, useEffect, useState } from "react";
import ErrorPage from "./components/ErrorPage";
import { DataContext, DataDispatchContext } from "./contexts/DataContext";
import { auth, AuthContext } from "./contexts/firebase";

export function useStoredData(url, initialState) {
  const store = useContext(DataContext);
  const dispatch = useContext(DataDispatchContext);

  const setData = useCallback((payload) => {
    dispatch({
      url: url,
      payload: payload
    });
  }, [url, dispatch]);

  return [store.get(url) || initialState, setData];
};

export function useWebSocket(dispatch) {
  const user = useContext(AuthContext);
  const [ws, setWS] = useState(null);
  const [message, setMessage] = useState('Connecting...');

  useEffect(() => {
    const { host, pathname } = window.location;
    let ws;
    let retryIn = 1;
    let ignore = false;
    const attempt = (retry) => {
      auth.currentUser?.getIdToken().then(async token => {
        ws = new WebSocket(`wss://${host}${pathname}`, token);
        ws.addEventListener('open', () => {
          retry = false;
          retryIn = 1;
          setWS(ws);
        });
        ws.addEventListener('message', ({ data }) => {
          dispatch(JSON.parse(data));
        });
        ws.addEventListener('close', () => {
          if (ignore) return;
          setWS(null);
          let timeout = retry ? Math.min(30, retryIn += retryIn) : 0;
          setMessage(retry ? `Retrying in ${timeout}s...` : 'Reconnecting...');
          setTimeout(() => attempt(true), timeout * 1000);
        });
      });
    };
    attempt();
    return () => {
      ignore = true;
      ws.close();
      setWS(null);
    };
  }, [user, dispatch, setWS, setMessage]);

  return [ws, message];
}

export function useData(url, options = {}) {
  const { onComplete = null, onError = null } = options;
  const user = useContext(AuthContext);
  const [i, setI] = useState(0);
  const refetch = useCallback(() => setI(i + 1), [i, setI]);
  const [state, setState] = useStoredData(url, {
    data: null,
    error: false,
    loading: true
  });

  useEffect(() => {
    if (!user) return setState({
      data: state.data,
      error: <ErrorPage status={401}
        message={"You must be logged in to view this page."} />,
      loading: false
    });
    let abort = false;
    auth.currentUser?.getIdToken().then(async token => {
      setState({
        data: state.data,
        error: false,
        loading: true
      });
      const res = await fetch(url, {
        headers: {
          'Authorization': token
        }
      });
      if (abort) return;
      if (!res.ok) {
        setState({
          data: state.data,
          error: (<ErrorPage status={500}
            message={"An error occured. Please try again later."} />),
          loading: false
        });
        let error = await res.text();
        try {
          error = JSON.parse(error).error;
        } catch (e) {}
        if (onError) onError(res.status, error);
        return;
      }
      const data = await res.json();
      setState({
        data: data,
        error: false,
        loading: false
      });
      if (onComplete) onComplete(data);
    });
    return () => abort = true;
  // eslint-disable-next-line
  }, [url, user, setState, i]);

  return { ...state, refetch: refetch };
};

export function useAction(url, options = {}) {
  const { method = 'get', onComplete = undefined, onError = undefined } = options;
  const user = useContext(AuthContext);
  const [state, setState] = useState({
    data: null,
    error: false,
    loading: false
  });

  const action = useCallback((body) => {
    if (!user) return setState({
      data: null,
      error: <ErrorPage status={401}
        message={"You must be logged in to do this action."} />,
      loading: false
    });
    let abort = false;
    auth.currentUser?.getIdToken().then(async token => {
      setState({
        data: null,
        error: false,
        loading: true
      });
      const res = await fetch(url, {
        body: body ? JSON.stringify(body) : '',
        method: method,
        headers: {
          'Authorization': token,
          ...(body ? { 'Content-Type': 'application/json' } : {})
        }
      });
      if (abort) return;
      if (!res.ok) {
        setState({
          data: null,
          error: (<ErrorPage status={500}
            message={"An error occured. Please try again later."} />),
          loading: false
        });
        let error = await res.text();
        try {
          error = JSON.parse(error).error;
        } catch (e) {}
        if (onError) onError(res.status, error);
        return;
      }
      let data = await res.text();
      try {
        data = JSON.parse(data);
      } catch (e) {}
      setState({
        data: data,
        error: false,
        loading: false
      });
      if (onComplete) onComplete(data);
    });
    return () => abort = true;
  // eslint-disable-next-line
  }, [url, user, setState]);

  return [action, state];
};
