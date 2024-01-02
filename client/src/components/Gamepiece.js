import { useCallback, useContext, useRef, useState } from "react";
import { acquireDrag, GameContext, GameDispatchContext, releaseDrag, select } from "../contexts/GameContext";
import { motion, useMotionValue } from "framer-motion";
import "../styles/Gamepiece.scss";

export default function Gamepiece({ value, x, y, highlight, placing, selected, racked }) {
  const dispatch = useContext(GameDispatchContext);
  const { coords, dragDisabled } = useContext(GameContext);
  const [dragging, setDragging] = useState(false);
  const doSelect = useCallback(() => {
    dispatch(select(x));
  }, [x, dispatch]);
  const doStartDrag = useCallback(() => {
    setDragging(true);
    dispatch(select(x));
    dragDisabled.current = true;
  }, [setDragging, x, dispatch, dragDisabled]);
  const lastOver = useRef(null);
  const doEndDrag = useCallback((e) => {
    setDragging(false);
    dragDisabled.current = false;
    document.elementFromPoint(e.clientX, e.clientY).click();
    lastOver.current?.classList.remove('hover');
    lastOver.current = null;
  }, [setDragging, dragDisabled]);
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
      whileDrag={{ scale: coords.current[2], zIndex: 100 }}
      onDragStart={doStartDrag}
      onDragEnd={doEndDrag}
      onTouchMove={doTouchMove}
      animate={{
        x: dragging ? ax : 0,
        y: dragging ? ay : (selected ? -10 : 0)
      }}
      transition={{ type: "spring", stiffness: 1000, damping: 100 }} />
  );
};
