import { useContext } from "react";
import { GameContext, GameDispatchContext, pickup } from "../contexts/GameContext";
import Gamepiece from "./Gamepiece";
import SubmitButton from "./SubmitButton";
import "../styles/Controls.scss";

export default function Controls({ ws }) {
  const { hand, selected, placed } = useContext(GameContext);
  const dispatch = useContext(GameDispatchContext);

  return (
    <div class="controls">
      <div className="rack">
        {hand.map((val, x) =>
          <Gamepiece key={x} value={val} x={x}
            selected={x === selected} racked />
        )}
      </div>
      <div className="buttons">
        {placed.length === 0 &&
          <button className="trade" onClick={() => {}}>Trade</button>
        }
        {placed.length > 0 && (<>
          <button className="undo" onClick={() => dispatch(pickup())}>Undo</button>
          <SubmitButton ws={ws} />
        </>)}
      </div>
    </div>
  );
}
