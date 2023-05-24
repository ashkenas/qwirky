import { useCallback, useContext } from "react";
import { GameDispatchContext, placePiece } from "./GameContext";
import "./Placement.scss";

export default function Placement({ x, y }) {
  const dispatch = useContext(GameDispatchContext);

  const onClick = useCallback(() => {
    dispatch(placePiece(x, y));
  }, [x, y, dispatch])

  return (
    <button className={`placement`} onClick={onClick}
      style={{ top: `${-y}00%`, left: `${x}00%` }}></button>
  );
}
