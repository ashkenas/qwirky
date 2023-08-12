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

    return over.map(i => players[i]).join(' & ');
  }, [over, scores]);

  return (
    <div className="center-popup-container" onMouseDownCapture={hide} onTouchStartCapture={hide}>
      {children}
      {show && (
        <div className="popup">
          <p>{over ? `${winner} win${over.length === 1 ? 's' : ''}!` : 'Your turn!'}</p>
        </div>
      )}
    </div>
  );
};
