import { useContext, useEffect, useState } from "react";
import ErrorPage from "./components/ErrorPage";
import { auth, AuthContext } from "./contexts/firebase";

export async function useData(url) {
  const user = useContext(AuthContext);
  const [state, setState] = useState({
    data: null,
    error: false,
    loading: true
  });

  useEffect(() => {
    if (!user) return setState({
      data: null,
      error: false,
      loading: false
    });
    let abort = false;
    auth.currentUser?.getIdToken().then(async token => {
      const res = await fetch(url, {
        headers: {
          'Authorization': token
        }
      });
      if (abort) return;
      if (!res.ok) return setState({
        data: null,
        error: (<ErrorPage status={500}
          message={"An error occured. Please try again later."} />),
        loading: false
      });
      setState({
        data: await res.json(),
        error: false,
        loading: true
      });
    });
    return () => abort = true;
  }, [url, setState]);

  return state;
};
