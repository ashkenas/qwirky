import GameBoard from "./GameBoard";
import PieceRack from "./PieceRack";
import { Link } from "react-router-dom";
import { useWebSocket } from "../util";
import { useContext } from "react";
import { GameDispatchContext } from "../contexts/GameContext";
import SubmitButton from "./SubmitButton";
import Loading from "./Loading";

export default function GamePage() {
  const dispatch = useContext(GameDispatchContext)
  const [ws, loading] = useWebSocket(dispatch);

  if (loading) return <Loading />;

  return (<>
    <GameBoard />
    <PieceRack />
    <SubmitButton ws={ws} />
    <Link to="/dash" className="back" />
  </>);
};
