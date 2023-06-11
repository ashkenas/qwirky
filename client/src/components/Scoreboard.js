import { useCallback, useContext, useMemo, useState } from "react";
import { GameContext } from "../contexts/GameContext";
import "../styles/Scoreboard.scss";

export default function Scoreboard() {
  const { currentPlayer, players, scores, over } = useContext(GameContext);
  const [open, setOpen] = useState(false);

  const list = useMemo(() => {
    const withScores = players.map((p, i) => [p, scores[i]]);
    const list = withScores.slice(currentPlayer)
      .concat(withScores.slice(0, currentPlayer));
    if (over) list.sort(([_p1, a], [_p2, b]) => b - a);
    return list.map(([player, score]) => (
      <tr key={player}>
        <td>{player}</td>
        <td>{score}</td>
      </tr>
    ));
  }, [players, currentPlayer, scores, over]);

  const toggleOpen = useCallback(() =>
    setOpen(!open)
  , [open, setOpen]);

  return (
    <div className="scoreboard" onClick={toggleOpen}>
      {over && <p className="results-head">Results</p>}
      <table>
        <tbody>
          {(open || over) ? list : list[0]}
        </tbody>
      </table>
    </div>
  );
};
