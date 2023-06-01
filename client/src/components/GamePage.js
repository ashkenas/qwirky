import GameBoard from "./GameBoard";
import PieceRack from "./PieceRack";
import { Link } from "react-router-dom";
import { useWebSocket } from "../util";
import { useContext } from "react";
import { GameDispatchContext } from "../contexts/GameContext";

export default function GamePage() {
  const dispatch = useContext(GameDispatchContext)
  const [ws, loading] = useWebSocket(dispatch);
  
  return (<>
    <GameBoard />
    <PieceRack />
    <Link to="/dash" className="back" />
  </>);
};
