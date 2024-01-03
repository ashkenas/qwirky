import { GoogleAuthProvider, signInWithRedirect } from "firebase/auth";
import { useContext, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { auth, AuthContext } from "../contexts/firebase";
import "../styles/Home.scss";

const googleProvider = new GoogleAuthProvider();

export default function Home() {
  const user = useContext(AuthContext);
  const navigate = useNavigate();
  const [params] = useSearchParams();

  useEffect(() => {
    if (user) navigate(params.get('re') || '/dash');
  }, [user, navigate, params]);

  return (
    <div className="columns homepage">
      <div className="column">
        <h1 className="title">
          <span className="color1">Q</span>
          <span className="color2">w</span>
          <span className="color3">i</span>
          <span className="color4">r</span>
          <span className="color5">k</span>
          <span className="color6">y</span>
        </h1>
        <p>
          A fun online multiplayer tile matching game.
          Score the most points to win!
        </p>
        <button className="social-btn" onClick={() => signInWithRedirect(auth, googleProvider)}>
          <img src="/google-signin.svg" alt="Sign in with Google"/>
          Sign in with Google
        </button>
      </div>
    </div>
  );
};
