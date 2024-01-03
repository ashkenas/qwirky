import { GoogleAuthProvider, signInWithRedirect } from "firebase/auth";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { useContext, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { auth, AuthContext } from "../contexts/firebase";
import "../styles/Home.scss";
import Gamepiece from "./Gamepiece";

const googleProvider = new GoogleAuthProvider();

const randomComponent = () => Math.floor(Math.random() * 6) + 1;
const randomValue = () => randomComponent() + (randomComponent() * 16);

function MotionPiece() {
  const value = randomValue();
  const side = Math.floor(Math.random() * 4);
  const tx = .6 * Math.random() + .2;
  const ty = .6 * Math.random() + .2;
  const x = useMotionValue(
    side % 2 ? Math.random() * window.innerWidth
    : (side ? -100 : window.innerWidth + 100));
  const y = useMotionValue(
    side % 2 ? (side === 1 ? -100 : window.innerHeight + 100)
    : Math.random() * window.innerHeight);
  const sx = useSpring(x, {
    damping: 0,
    stiffness: 1
  });
  const sy = useSpring(y, {
    damping: 0,
    stiffness: 1
  });

  useEffect(() => {
    const updateTarget = () => {
      x.set(window.innerWidth * tx);
      y.set(window.innerHeight * ty);
    };
    updateTarget();
    window.addEventListener('resize', updateTarget);
    return () => window.removeEventListener('resize', updateTarget);
  }, [x, y, tx, ty])

  return (
    <motion.div style={{ x: sx, y: sy }}>
      <motion.div animation={{ rotate: 360 }}>
        <Gamepiece value={value} x={0} y={0} />
      </motion.div>
    </motion.div>
  );
}

function MotionPieces() {
  const [pieces, setPieces] = useState([]);

  useEffect(() => {
    const max = (window.innerHeight * window.innerWidth) / (64 * 64) * .2;
    if (pieces.length > max) return;
    setTimeout(() => setPieces(
      [...pieces, <MotionPiece key={pieces.length}/>]
    ), 100);
  }, [pieces, setPieces]);

  return (
    <div className="rain">
      {pieces}
    </div>
  );
}

export default function Home() {
  const user = useContext(AuthContext);
  const navigate = useNavigate();
  const [params] = useSearchParams();

  useEffect(() => {
    if (user) navigate(params.get('re') || '/dash');
  }, [user, navigate, params]);

  return (
    <div className="homepage">
      <MotionPieces />
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
        <button className="social-btn" onClick={() => signInWithRedirect(auth, googleProvider)}>
          <img src="/google-signin.svg" alt="Sign in with Google"/>
          Sign in with Google
        </button>
      </div>
    </div>
  );
};
