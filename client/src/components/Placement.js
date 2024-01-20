import { useCallback, useContext } from "react";
import { GameContext, GameDispatchContext, placePiece } from "../contexts/GameContext";
import "../styles/Placement.scss";

export default function Placement({ x, y, full }) {
  const dispatch = useContext(GameDispatchContext);
  const { dragDisabled } = useContext(GameContext);

  const onClick = useCallback(() => {
    dispatch(placePiece(x, y));
  }, [x, y, dispatch])

  const onDragEnd = useCallback(() => {
    dragDisabled && dispatch(placePiece(x, y));
  }, [x, y, dragDisabled, dispatch])

  if (full) {
    return (
      <button className="placement full"
        onClick={onClick}
        onMouseUp={onDragEnd} />
    );
  }

  return (
    <button className="placement"
      onClick={onClick}
      onMouseUp={onDragEnd}
      style={{ top: `${-y}00%`, left: `${x}00%` }} />
  );
}
