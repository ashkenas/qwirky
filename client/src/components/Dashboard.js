import { Link } from "react-router-dom";
import { auth } from "../contexts/firebase";
import { useData } from "../util";
import "../styles/Dashboard.scss";

export default function Dashboard() {
  const { data, error, loading } = useData('/api/profile');

  if (error) return error;
  if (loading) return "loading...";

  return (
    <div className="container">
      <h1>Hello, {data.username}</h1>
      <Link to="/friends">Friends</Link>
      <Link to="/new">New Game</Link>
      <button onClick={() => auth.signOut()}>Sign Out</button>
      <h2>On-going Games</h2>
      {data.games.forEach(game => <p>{game.name}</p>)}
    </div>
  );
};
