import GameBoard from "./GameBoard";
import Controls from "./Controls";
import { useWebSocket } from "../util";
import { useContext } from "react";
import { GameDispatchContext } from "../contexts/GameContext";
import Loading from "./Loading";
import CenterPopup from "./CenterPopup";
import ErrorPage from "./ErrorPage";
import GameStatusBar from "./GameStatusBar";

export default function GamePage() {
  const dispatch = useContext(GameDispatchContext)
  const [ws, message, code] = useWebSocket(dispatch);

  if (code) return <ErrorPage message={message} status={code} />
  if (!ws) return <Loading message={message}/>;

  return (<>
    <GameStatusBar />
    <CenterPopup>
      <GameBoard />
      <Controls ws={ws} />
    </CenterPopup>
  </>);
};
