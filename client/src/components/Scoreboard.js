import { useCallback, useContext, useMemo, useState } from "react";
import { GameContext } from "../contexts/GameContext";
import "../styles/Scoreboard.scss";

export default function Scoreboard() {
  const { currentPlayer, yourTurn, justMoved, players } = useContext(GameContext);
  const [open, setOpen] = useState(false);

  const text = useMemo(() =>
    yourTurn ? 'Your Turn' : justMoved ? 'Processing...' : players[currentPlayer]
  , [yourTurn, justMoved, players, currentPlayer]);

  const list = useMemo(() => {
    const list = players.slice(currentPlayer + 1).concat(players.slice(0, currentPlayer));
    return list.map(p => <p key={p}>{p}</p>);
  }, [players, currentPlayer]);

  const toggleOpen = useCallback(() =>
      setOpen(!open)
  , [open, setOpen]);

  return (
    <div className="scoreboard" onClick={toggleOpen}>
      <p>{text}</p>
      {open && list}
    </div>
  )
};
