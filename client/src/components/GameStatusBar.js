import { useCallback, useContext, useState } from "react";
import { Link } from "react-router-dom";
import { GameContext } from "../contexts/GameContext";
import "../styles/GameStatusBar.scss";
import Chevron from "./Chevron";
import Scoreboard from "./Scoreboard";

export default function GameStatusBar() {
  const { tilesLeft, currentPlayer, players, over } = useContext(GameContext);
  const [showScoreboard, setShowScoreboard] = useState(false);

  const toggleScoreboard = useCallback(() => {
    setShowScoreboard(!showScoreboard)
  }, [showScoreboard, setShowScoreboard]);

  return (
    <div className="game-status-bar">
      <Link id="home-link" to="/dash">
        <Chevron left />
        &nbsp;Home
      </Link>
      <span tabIndex={0} id="tile-counter">
        {tilesLeft}
        <span>Remaining tiles in bag.</span>
      </span>
      <span id="current-player">{over ? 'Game Over' : players[currentPlayer]}</span>
      <span>{!over ? '\'s turn' : ''}</span>
      <span tabIndex={0} id="scoreboard-btn" onClick={toggleScoreboard}>
        <Chevron down={!showScoreboard} up={showScoreboard} />
        &nbsp;Scoreboard
        <Scoreboard show={showScoreboard} />
      </span>
    </div>
  );
};
