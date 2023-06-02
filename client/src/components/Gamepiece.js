import { useCallback, useContext } from "react";
import { GameDispatchContext, select } from "../contexts/GameContext";
import "../styles/Gamepiece.scss";

export default function Gamepiece({ value, x, y, highlight, selected, racked }) {
  const dispatch = useContext(GameDispatchContext);

  const classes = ['piece', `p${value & 0xF}${(value >> 4) & 0xF}`];
  if (highlight) classes.push('highlight');
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
