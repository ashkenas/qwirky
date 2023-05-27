import { Link } from "react-router-dom";
import "../styles/Dashboard.scss";

export default function Dashboard() {
  const games = [];

  return (
    <div className="container">
      <Link to="/friends">Friends</Link>
      <Link to="/new">New Game</Link>
      <h1>On-going Games</h1>
      {games && games.forEach(game => <p>{game.name}</p>)}
    </div>
  );
};
