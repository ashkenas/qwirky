import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { GameContext } from "../contexts/GameContext";
import "../styles/CenterPopup.scss";

export default function CenterPopup({ children }) {
  const { yourTurn, over, scores, players } = useContext(GameContext);
  const [show, setShow] = useState(yourTurn);

  useEffect(() => {
    setShow(yourTurn || over);
  }, [yourTurn, over, setShow]);

  const hide = useCallback(() => setShow(false), [setShow]);

  const winner = useMemo(() => {
    if (!over) return null;

    return scores.reduce(([p, i], c, ci) => {
      if (p >= c) return [p, i];
      return [c, ci];
    }, [0, 0])[1];
  }, [over, scores]);

  return (
    <div className="center-popup-container" onMouseDownCapture={hide} onTouchStartCapture={hide}>
      {children}
      {show && (
        <div className="popup">
          <p>{over ? `${players[winner]} wins!` : 'Your turn!'}</p>
        </div>
      )}
    </div>
  );
};
