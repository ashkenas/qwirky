import { useContext, useMemo } from "react";
import { GameContext } from "../contexts/GameContext";
import "../styles/Scoreboard.scss";

export default function Scoreboard({ show }) {
  const { currentPlayer, players, scores, over } = useContext(GameContext);

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

  return (
    <div className={`scoreboard${show ? ' show' : ''}`}>
      <table>
        <thead>
          <tr>
            <th colSpan="2">
              {over ? 'Scores' : 'Turn Order'}
            </th>
          </tr>
          <tr>
            <th>Player</th>
            <th>Score</th>
          </tr>
        </thead>
        <tbody>
          {list}
        </tbody>
      </table>
    </div>
  );
};
