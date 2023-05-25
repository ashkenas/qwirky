import { useContext } from "react";
import { GameContext, GameDispatchContext, pickup } from "./GameContext";
import Gamepiece from "./Gamepiece";
import "./PieceRack.scss";

export default function PieceRack() {
  const { pieces, selected } = useContext(GameContext);
  const dispatch = useContext(GameDispatchContext);

  return (
    <div className="rack">
      {pieces.map((val, x) =>
        <Gamepiece key={x} value={val} x={x}
          selected={x === selected} racked />
      )}
      <div className="undo" onClick={() => dispatch(pickup())}></div>
    </div>
  );
}
