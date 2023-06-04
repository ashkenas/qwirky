import { useCallback, useContext, useMemo, useState } from "react";
import { GameContext } from "../contexts/GameContext";
import "../styles/Scoreboard.scss";

export default function Scoreboard() {
  const { currentPlayer, players, scores } = useContext(GameContext);
  const [open, setOpen] = useState(false);

  const list = useMemo(() => {
    const withScores = players.map((p, i) => [p, scores[i]]);
    const list = withScores.slice(currentPlayer)
      .concat(withScores.slice(0, currentPlayer));
    return list.map(([player, score]) => (
      <tr key={player}>
        <td>{player}</td>
        <td>{score}</td>
      </tr>
    ));
  }, [players, currentPlayer, scores]);

  const toggleOpen = useCallback(() =>
    setOpen(!open)
  , [open, setOpen]);

  return (
    <div className="scoreboard" onClick={toggleOpen}>
      <table>
        <tbody>
          {open ? list : list[0]}
        </tbody>
      </table>
    </div>
  );
};
