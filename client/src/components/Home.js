import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, AuthContext } from "../contexts/firebase";
import "../styles/Home.scss";

const googleProvider = new GoogleAuthProvider();

export default function Home() {
  const user = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate('/dash');
  }, [user]);

  return (
    <div className="container">
      <h1>Qwirky</h1>
      <p>
        A fun online multiplayer tile matching game.
        Score the most points to win!
      </p>
      <button className="social-btn" onClick={() => signInWithPopup(auth, googleProvider)}>
        <img src="/google-signin.svg" alt="Sign in with Google"/>
        Sign in with Google
      </button>
    </div>
  );
};
