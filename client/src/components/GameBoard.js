import { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { GameContext } from "../contexts/GameContext";
import Gamepiece from "./Gamepiece";
import Placement from "./Placement";
import "../styles/Gameboard.scss";

const distSq = (t1, t2) =>
  ((t1.pageX - t2.pageX) ** 2) + ((t1.pageY - t2.pageY) ** 2);

export default function GameBoard() {
  const { board, placed, lastMove } = useContext(GameContext);
  const centerRef = useRef(null);
  const boardRef = useRef(null);
  const coords = useRef([0, 0, 1]);
  const [moving, setMoving] = useState(false);

  const pieces = useMemo(() => {
    if (board) {
      const pieces = [];
      const placements = {};
      for (let x in board) {
        x = +x;
        if (!placements[x - 1]) placements[x - 1] = {};
        if (!placements[x]) placements[x] = {};
        if (!placements[x + 1]) placements[x + 1] = {};
        for (let y in board[x]) {
          y = +y;
          const placing = placed.some(([, px, py]) => x === px && y === py);
          const highlight = lastMove.some(([, px, py]) => x === px && y === py);
          pieces.push(<Gamepiece key={`${x},${y}`} x={x} y={y}
            value={board[x][y]} highlight={highlight} placing={placing} />);

          if (!board[x + 1]?.[y]) placements[x + 1][y] = true;
          if (!board[x - 1]?.[y]) placements[x - 1][y] = true;
          if (!board[x]?.[y + 1]) placements[x][y + 1] = true;
          if (!board[x]?.[y - 1]) placements[x][y - 1] = true;
        }
      }

      for (const x in placements)
        for (const y in placements[x])
          pieces.unshift(<Placement key={`${x},${y}`} x={+x} y={+y} />);
      
      return pieces;
    } else {
      return [<Placement key="0,0" x={0} y={0} />];
    }
  }, [board, placed, lastMove]);

  const move = useCallback((e) => {
    if (e.nativeEvent instanceof MouseEvent && e.buttons !== 1) return;
    setMoving(true);
    const scale = coords.current[2];
    const x = coords.current[0] += e.movementX / scale;
    const y = coords.current[1] += e.movementY / scale;
    centerRef.current.style.setProperty('--offset-x', `${x}px`);
    centerRef.current.style.setProperty('--offset-y', `${y}px`);
  }, [setMoving]);

  const doneMoving = useCallback((e) => {
    if (!moving) return;
    e.stopPropagation();
    setMoving(false);
  }, [moving, setMoving]);

  const onWheel = useCallback((e) => {
    const newScale = coords.current[2] * (e.deltaY < 0 ? 1.1 : .91); 
    if (newScale < .2 || newScale > 5) return;
    coords.current[2] = newScale;
    centerRef.current.style.setProperty('--scale', coords.current[2]);
  }, []);

  useEffect(() => {
    if (!centerRef.current || ! boardRef.current) return;
    const boardElement = boardRef.current;
    let lastTouches = null;
    const touchListener = (e) => {
      if (lastTouches && lastTouches.length === e.touches.length) {
        e.preventDefault();
        if (e.touches.length === 1) {
          e.movementX = e.touches[0].pageX - lastTouches[0].pageX;
          e.movementY = e.touches[0].pageY - lastTouches[0].pageY;
          move(e);
        } else if (e.touches.length === 2) {
          const r = Math.sqrt(distSq(...e.touches) / distSq(...lastTouches));
          const newScale = coords.current[2] * r;
          if (newScale < .2 || newScale > 5) return;
          coords.current[2] = newScale;
          centerRef.current.style.setProperty('--scale', coords.current[2]);
        }
      }
      lastTouches = e.touches;
    };
    const endTouchListener = (e) => {
      setMoving(false);
      lastTouches = null;
    };
    boardRef.current.addEventListener('touchmove', touchListener);
    boardRef.current.addEventListener('touchend', endTouchListener);
    return () => {
      boardElement.removeEventListener('touchmove', touchListener);
      boardElement.removeEventListener('touchend', endTouchListener);
    };
  }, [move, setMoving]);

  return (
    <div className="game-board" ref={boardRef} onMouseMove={move}
      onClickCapture={doneMoving} onWheel={onWheel}>
      <div className="center-piece" ref={centerRef}>
        {pieces}
      </div>
    </div>
  )
};
