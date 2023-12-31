import { useCallback, useContext } from "react";
import { GameContext, GameDispatchContext, placePiece } from "../contexts/GameContext";
import "../styles/Placement.scss";

export default function Placement({ x, y }) {
  const dispatch = useContext(GameDispatchContext);
  const { dragDisabled } = useContext(GameContext);

  const onClick = useCallback(() => {
    dispatch(placePiece(x, y));
  }, [x, y, dispatch])

  const onDragEnd = useCallback(() => {
    dragDisabled && dispatch(placePiece(x, y));
  }, [x, y, dragDisabled, dispatch])

  const center = x === 0 && y === 0;

  return (
    <button
      className={`placement${center ? ' hover' : ''}`}
      onClick={onClick}
      onMouseUp={onDragEnd}
      onTouchEnd={onDragEnd}
      style={{ top: `${-y}00%`, left: `${x}00%` }} />
  );
}
