import { useCallback, useContext } from "react";
import { GameDispatchContext, pickup } from "./GameContext";

export default function Gamepiece({ value, x, y, canRemove }) {
  const dispatch = useContext(GameDispatchContext);

  const onClick = useCallback(() => {
    if (!canRemove) return;
    dispatch(pickup(x, y));
  }, [x, y, dispatch]);

  return (
    <div className={`piece p${value & 0xF}${(value >> 4) & 0xF}${canRemove ? ' removable' : ''}`}
      style={{ top: `${-y}00%`, left: `${x}00%` }} onClick={onClick}></div>
  );
};
