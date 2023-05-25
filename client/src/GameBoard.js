import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { GameContext } from "./GameContext";
import Gamepiece from "./Gamepiece";
import "./Gameboard.scss";
import Placement from "./Placement";

const distSq = (t1, t2) =>
  ((t1.pageX - t2.pageX) ** 2) + ((t1.pageY - t2.pageY) ** 2);

const buildBoard = (board, pieces, seen, x, y, moving) => {
  if (seen.get(x)?.get(y)) return;
  const col = seen.get(x) || new Map();
  col.set(y, true);
  seen.set(x, col);
  if (!board) return pieces.push(<Placement key={`${x},${y}`} x={x} y={y} />);
  pieces.push(<Gamepiece key={`${x},${y}`} value={board.val} x={x} y={y}
    canRemove={board.canRemove} />);
  buildBoard(board.right, pieces, seen, x + 1, y);
  buildBoard(board.left, pieces, seen, x - 1, y);
  buildBoard(board.up, pieces, seen, x, y + 1);
  buildBoard(board.down, pieces, seen, x, y - 1);
};

export default function GameBoard() {
  const { board } = useContext(GameContext);
  const centerRef = useRef(null);
  const boardRef = useRef(null);
  const coords = useRef([0, 0, 1]);
  const [moving, setMoving] = useState(false);

  const pieces = [];
  const seen = new Map();

  if (board) {
    buildBoard(board, pieces, seen, 0, 0);
  }

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

  useEffect(() => {
    if (!centerRef.current || ! boardRef.current) return;
    const boardElement = boardRef.current;
    let lastTouches = null;
    const touchListener = (e) => {
      if (lastTouches && lastTouches.length === e.touches.length) {
        if (e.touches.length === 1) {
          e.movementX = e.touches[0].pageX - lastTouches[0].pageX;
          e.movementY = e.touches[0].pageY - lastTouches[0].pageY;
          move(e);
        } else {
          e.preventDefault();
          if (e.touches.length === 2) {
            const r = Math.sqrt(distSq(...e.touches) / distSq(...lastTouches));
            const newScale = coords.current[2] * r;
            if (newScale > .2 && newScale < 5) coords.current[2] = newScale;
            centerRef.current.style.setProperty('--scale', coords.current[2]);
          }
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
      onClickCapture={doneMoving}>
      <div className="center-piece" ref={centerRef}>
        {pieces};
      </div>
    </div>
  )
};
