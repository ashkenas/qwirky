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
  const [code, setCode] = useState(0);

  useEffect(() => {
    const { hostname, host, pathname } = window.location;
    let ws;
    let retryIn = 1;
    let ignore = false;
    const attempt = (retry) => {
      auth.currentUser?.getIdToken().then(async token => {
        if (process.env.NODE_ENV === 'production')
          ws = new WebSocket(`wss://${host + pathname}`, token);
        else
          ws = new WebSocket(`ws://${hostname}:4000${pathname}`, token);
        ws.addEventListener('open', () => {
          retry = false;
          retryIn = 1;
          setWS(ws);
        });
        ws.addEventListener('message', ({ data }) => {
          const action = JSON.parse(data);
          if (action.type === 'connectionError') {
            ignore = true;
            ws.close();
            setCode(action.code);
            setMessage(action.error);
          } else dispatch(action);
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
      ws?.close();
      setWS(null);
      setCode(0);
    };
  }, [user, dispatch, setWS, setMessage, setCode]);

  return [ws, message, code];
}

export function useData(url, options = {}) {
  const { onComplete = null, onError = null } = options;
  const user = useContext(AuthContext);
  const [i, setI] = useState(0);
  const refetch = useCallback(() => setI(i + 1), [i, setI]);
  const [data, setData] = useStoredData(url, null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setError(<ErrorPage status={401}
        message={"You must be logged in to view this page."} />);
      setLoading(false);
      return;
    }
    let abort = false;
    auth.currentUser?.getIdToken().then(async token => {
      setError(false);
      setLoading(true);
      const res = await fetch(url, {
        headers: {
          'Authorization': token
        }
      });
      if (abort) return;
      if (!res.ok) {
        setError(<ErrorPage status={500}
          message={"An error occured. Please try again later."} />);
        setLoading(false);
        let error = await res.text();
        try {
          error = JSON.parse(error).error;
        } catch (e) {}
        if (onError) onError(res.status, error);
        return;
      }
      const data = await res.json();
      setData(data);
      setError(false);
      setLoading(false);
      if (onComplete) onComplete(data);
    });
    return () => abort = true;
  }, [url, user, setData, setError, setLoading, i, onComplete, onError]);

  return {
    data: data,
    error: error,
    loading: loading,
    refetch: refetch
  };
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
  }, [url, user, setState, onComplete, onError, method]);

  return [action, state];
};
