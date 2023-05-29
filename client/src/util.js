import { useCallback, useContext, useEffect, useState } from "react";
import ErrorPage from "./components/ErrorPage";
import { auth, AuthContext } from "./contexts/firebase";

export function useData(url, options = {}) {
  const { onComplete = null, onError = null } = options;
  const user = useContext(AuthContext);
  const [i, setI] = useState(0);
  const refetch = useCallback(() => setI(i + 1), [i, setI]);
  const [state, setState] = useState({
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
  }, [url, user, setState]);

  return [action, state];
};
