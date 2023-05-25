import { useCallback, useContext } from "react";
import { GameDispatchContext, select } from "./GameContext";

export default function Gamepiece({ value, x, y, canRemove, selected, racked }) {
  const dispatch = useContext(GameDispatchContext);

  const classes = ['piece', `p${value & 0xF}${(value >> 4) & 0xF}`];
  if (canRemove) classes.push('removeable');
  if (selected) classes.push('selected');

  const onClick = useCallback(() => {
    if (racked)
      return dispatch(select(x));
  }, [x, racked, dispatch]);

  return (
    <div className={classes.join(' ')} onClick={onClick}
      style={racked ? {} : { top: `${-y}00%`, left: `${x}00%` }}></div>
  );
};
