import GameBoard from "./GameBoard";
import Controls from "./Controls";
import { Link } from "react-router-dom";
import { useWebSocket } from "../util";
import { useContext } from "react";
import { GameDispatchContext } from "../contexts/GameContext";
import Loading from "./Loading";
import Scoreboard from "./Scoreboard";
import TileCounter from "./TileCounter";
import CenterPopup from "./CenterPopup";

export default function GamePage() {
  const dispatch = useContext(GameDispatchContext)
  const [ws, message] = useWebSocket(dispatch);

  if (!ws) return <Loading message={message}/>;

  return (
    <CenterPopup>
      <GameBoard />
      <Controls ws={ws} />
      <Scoreboard />
      <TileCounter />
      <Link to="/dash" className="back" />
    </CenterPopup>
  );
};
