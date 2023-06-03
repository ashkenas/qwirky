import GameBoard from "./GameBoard";
import Controls from "./Controls";
import { Link } from "react-router-dom";
import { useWebSocket } from "../util";
import { useContext } from "react";
import { GameDispatchContext } from "../contexts/GameContext";
import Loading from "./Loading";
import Scoreboard from "./Scoreboard";

export default function GamePage() {
  const dispatch = useContext(GameDispatchContext)
  const [ws, loading] = useWebSocket(dispatch);

  if (loading) return <Loading />;

  return (<>
    <GameBoard />
    <Controls ws={ws} />
    <Scoreboard />
    <Link to="/dash" className="back" />
  </>);
};
