import { useCallback, useContext, useRef, useState } from "react";
import { acquireDrag, GameDispatchContext, releaseDrag, select } from "../contexts/GameContext";
import { motion, useMotionValue } from "framer-motion";
import "../styles/Gamepiece.scss";

export default function Gamepiece({ value, x, y, highlight, placing, selected, racked }) {
  const dispatch = useContext(GameDispatchContext);
  const [dragging, setDragging] = useState(false);
  const doSelect = useCallback(() => {
    dispatch(select(x));
  }, [x, dispatch]);
  const doStartDrag = useCallback(() => {
    setDragging(true);
    dispatch(select(x));
    dispatch(acquireDrag());
  }, [setDragging, x, dispatch]);
  const lastOver = useRef(null);
  const doEndDrag = useCallback((e) => {
    setDragging(false);
    dispatch(releaseDrag());
    document.elementFromPoint(e.clientX, e.clientY).click();
    lastOver.current?.classList.remove('hover');
    lastOver.current = null;
  }, [setDragging, dispatch]);
  const doTouchMove = useCallback((e) => {
    const { clientX, clientY } = e.changedTouches[0];
    const over = document.elementFromPoint(clientX, clientY);
    if (lastOver.current === over) return;
    lastOver.current?.classList.remove('hover');
    lastOver.current = over;
    over.classList.add('hover');
  }, []);
  const ax = useMotionValue(0);
  const ay = useMotionValue(0);

  let classes = `piece p${value & 0xF}${(value >> 4) & 0xF}`;
  if (highlight) classes += ' highlight';
  if (placing) classes += ' placing';
  if (dragging) classes += ' dragging';

  if (!racked) {
    return (
      <div
        className={classes}
        style={{ top: `${-y*100}%`, left: `${x*100}%` }} />
    );
  }
  return (
    <motion.div
      className={classes}
      onClick={doSelect}
      drag
      onDragStart={doStartDrag}
      onDragEnd={doEndDrag}
      onTouchMove={doTouchMove}
      animate={{
        x: dragging ? ax : 0,
        y: dragging ? ay : (selected ? -10 : 0)
      }}
      style={{
        pointerEvents: !dragging
      }}
      transition={{ type: "spring", stiffness: 1000, damping: 100 }} />
  );
};
