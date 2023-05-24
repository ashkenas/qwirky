import { useContext, useState } from "react";
import { GameContext } from "./GameContext";
import Gamepiece from "./Gamepiece";
import "./PieceRack.scss";

export default function PieceRack() {
  const { pieces } = useContext(GameContext);
  const [selected, setSelected] = useState(-1);

  return (
    <div className="rack">
      {pieces.map((val, x) =>
        <Gamepiece key={x} value={val} x={0} y={0} />
      )}
    </div>
  );
}
