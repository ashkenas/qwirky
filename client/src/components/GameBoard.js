import { useCallback, useContext, useMemo, useRef, useState } from "react";
import { GameContext } from "../contexts/GameContext";
import Gamepiece from "./Gamepiece";
import Placement from "./Placement";
import "../styles/Gameboard.scss";

const pageDist = (a, b) => Math.hypot(a.pageX - b.pageX, a.pageY - b.pageY);

export default function GameBoard() {
  const { board, placed, lastMove, dragDisabled, coords } = useContext(GameContext);
  const centerRef = useRef(null);
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
          const highlight = lastMove.includes(board[x][y]);
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
    if (dragDisabled.current) return;
    if (e.nativeEvent instanceof MouseEvent && e.buttons !== 1) return;
    setMoving(true);
    const scale = coords.current[2];
    const x = coords.current[0] += e.movementX / scale;
    const y = coords.current[1] += e.movementY / scale;
    centerRef.current.style.setProperty('--offset-x', `${x}px`);
    centerRef.current.style.setProperty('--offset-y', `${y}px`);
  }, [setMoving, dragDisabled, coords]);

  const doneMoving = useCallback((e) => {
    if (!moving) return;
    e.stopPropagation();
    setMoving(false);
  }, [moving, setMoving]);

  const onWheel = useCallback((e) => {
    const { clientX, clientY, deltaY } = e;
    const scaleBy = deltaY < 0 ? 1.1 : 0.909090909;
    const newScale = coords.current[2] * scaleBy; 
    if (newScale < .2 || newScale > 5) return;
    const { x, y, width, height } = centerRef.current.getBoundingClientRect();
    coords.current[0] = (((x + (width / 2) - clientX) * scaleBy)
      + clientX - (window.innerWidth / 2)) / newScale;
    coords.current[1] = (((y + (height / 2) - clientY) * scaleBy)
      + clientY - (window.innerHeight / 2)) / newScale;
    coords.current[2] = newScale;
    centerRef.current.style.setProperty('--scale', coords.current[2]);
    centerRef.current.style.setProperty('--offset-x', `${coords.current[0]}px`);
    centerRef.current.style.setProperty('--offset-y', `${coords.current[1]}px`);
  }, [coords]);

  const lastTouches = useRef(null);
  const touchMoveListener = useCallback((e) => {
    if (lastTouches.current && lastTouches.current.length === e.touches.length) {
      e.preventDefault();
      if (e.touches.length === 1) {
        e.movementX = e.touches[0].pageX - lastTouches.current[0].pageX;
        e.movementY = e.touches[0].pageY - lastTouches.current[0].pageY;
        move(e);
      } else if (e.touches.length === 2) {
        const r = Math.sqrt(pageDist(...e.touches) / pageDist(...lastTouches.current));
        const newScale = coords.current[2] * r;
        if (newScale < .2 || newScale > 5) return;
        const centerX = (e.touches[0].pageX + e.touches[1].pageX) / 2;
        const centerY = (e.touches[0].pageY + e.touches[1].pageY) / 2;
        const { x, y, width, height } = centerRef.current.getBoundingClientRect();
        coords.current[0] = (((x + (width / 2) - centerX) * r)
          + centerX - (window.innerWidth / 2)) / newScale;
        coords.current[1] = (((y + (height / 2) - centerY) * r)
          + centerY - (window.innerHeight / 2)) / newScale;
        coords.current[2] = newScale;
        centerRef.current.style.setProperty('--scale', coords.current[2]);
        centerRef.current.style.setProperty('--offset-x', `${coords.current[0]}px`);
        centerRef.current.style.setProperty('--offset-y', `${coords.current[1]}px`);
      }
    }
    lastTouches.current = e.touches;
  }, [coords, move]);
  const touchEndListener = useCallback(() => {
    setMoving(false);
    lastTouches.current = null;
  }, [setMoving]);

  return (
    <div className="game-board"
      onTouchMove={touchMoveListener}
      onTouchEnd={touchEndListener}
      onMouseMove={move}
      onClickCapture={doneMoving}
      onWheel={onWheel}>
      <div className="center-piece" ref={centerRef}>
        {pieces}
      </div>
    </div>
  )
};
