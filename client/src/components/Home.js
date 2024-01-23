import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { useContext, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { auth, AuthContext } from "../contexts/firebase";
import "../styles/Home.scss";
import Chevron from "./Chevron";

const googleProvider = new GoogleAuthProvider();

export default function Home() {
  const user = useContext(AuthContext);
  const navigate = useNavigate();
  const [params] = useSearchParams();

  useEffect(() => {
    if (user) navigate(params.get('re') || '/dash');
  }, [user, navigate, params]);

  return (
    <div className="homepage">
      <div className="tiled-bg"></div>
      <div className="content">
        <h1 className="title">
          <span className="color1">Q</span>
          <span className="color2">w</span>
          <span className="color3">i</span>
          <span className="color4">r</span>
          <span className="color5">k</span>
          <span className="color6">y</span>
        </h1>
        <p>
          A simple yet fun multiplayer tile matching game.
        </p>
        <div>
          <Link to="/how-to" className="landing-rules">
            How To Play
          </Link>
          <button className="social-btn" onClick={() => signInWithPopup(auth, googleProvider)}>
            <img src="/google-signin.svg" alt="Sign in with Google"/>
            Sign in with Google
          </button>
        </div>
      </div>
    </div>
  );
};
