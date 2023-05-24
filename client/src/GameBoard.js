import { useContext } from "react";
import { GameContext } from "./GameContext";
import Gamepiece from "./Gamepiece";

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

    const pieces = [];
    const seen = new Map();

    if (board) {
        buildBoard(board, pieces, seen, 0, 0);
    }

    return (
        <div className="game-board">
            <div className="center-piece">
                {pieces};
            </div>
        </div>
    )
};
