import { useContext, useEffect, useRef } from "react";
import { GameContext } from "./GameContext";
import Gamepiece from "./Gamepiece";
import "./Gameboard.scss";

const buildBoard = (board, pieces, seen, x, y) => {
  if (!board) return;
  if (seen.get(x)?.get(y)) return;
  const col = seen.get(x) || new Map();
  col.set(y, true);
  seen.set(x, col);
  pieces.push(<Gamepiece key={`${x},${y}`} value={board.val} x={x} y={y} />);
  buildBoard(board.right, pieces, seen, x + 1, y);
  buildBoard(board.left, pieces, seen, x - 1, y);
  buildBoard(board.up, pieces, seen, x, y + 1);
  buildBoard(board.down, pieces, seen, x, y - 1);
};

export default function GameBoard() {
  const { board } = useContext(GameContext);
  const centerRef = useRef(null);
  const boardRef = useRef(null);
  const coords = useRef([0, 0]);

  const pieces = [];
  const seen = new Map();

  if (board) {
    buildBoard(board, pieces, seen, 0, 0);
  }

  useEffect(() => {
    if (!centerRef.current || ! boardRef.current) return;
    const listener = (e) => {
      if (e instanceof MouseEvent && e.buttons !== 1) return;
      let [x, y] = coords.current;
      [x, y] = coords.current = [x - e.movementX, y - e.movementY];
      centerRef.current.style.setProperty('--offset-x', `${x}px`);
      centerRef.current.style.setProperty('--offset-y', `${y}px`);
    };
    boardRef.current.addEventListener('mousemove', listener);
    return () => boardRef.current.removeEventListener('mousemove', listener);
  }, [centerRef.current, boardRef.current, coords.current]);

  return (
    <div className="game-board" ref={boardRef}>
      <div className="center-piece" ref={centerRef}>
        {pieces};
      </div>
    </div>
  )
};
