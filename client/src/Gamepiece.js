import { useCallback, useContext } from "react";
import { GameDispatchContext, pickup } from "./GameContext";

export default function Gamepiece({ value, x, y, canRemove, selected }) {
  const dispatch = useContext(GameDispatchContext);

  const classes = ['piece', `p${value & 0xF}${(value >> 4) & 0xF}`];
  if (canRemove) classes.push('removeable');
  if (selected) classes.push('selected');

  const onClick = useCallback(() => {
    if (!canRemove) return;
    dispatch(pickup(x, y));
  }, [x, y, dispatch]);

  return (
    <div className={classes.join(' ')} onClick={onClick}
      style={{ top: `${-y}00%`, left: `${x}00%` }}></div>
  );
};
