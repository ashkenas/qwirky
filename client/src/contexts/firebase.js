import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { createContext, useEffect, useState } from "react";

export const app = initializeApp({
  apiKey: process.env.REACT_APP_apiKey,
  authDomain: process.env.REACT_APP_authDomain,
  projectId: process.env.REACT_APP_projectId,
  storageBucket: process.env.REACT_APP_storageBucket,
  messagingSenderId: process.env.REACT_APP_messagingSenderId,
  appId: process.env.REACT_APP_appId
});

export const auth = getAuth(app);

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [{ user, loading }, setState] = useState({
    user: null,
    loading: true
  });

  useEffect(() => {
    return auth.onAuthStateChanged((newUser) =>
      setState({
        user: newUser,
        loading: false
      })
    );
  }, []);

  if (loading) return <p>Loading auth info...</p>;

  return (
    <AuthContext.Provider value={user}>
      {children}
    </AuthContext.Provider>
  );
};
