import { Link, useNavigate } from "react-router-dom";
import { useAction, useData } from "../util";
import { useCallback, useState } from "react";
import Loading from "./Loading";

export default function NewGame() {
  const navigate = useNavigate();
  const [players, setPlayers] = useState([]);
  const { data: friends, loading, error } = useData('/api/friends');
  const [createGame, { loading: loadingNew }] = useAction('/api/games', {
    method: 'post',
    onComplete: (data) => navigate(`/game/${data._id}`),
    onError: () => alert('An error occured, try again later.')
  });

  const clickCreateGame = useCallback(() => {
    if (loadingNew) return;
    if (players.length < 1)
      return alert('There must be at least one other player.');
    createGame({ players });
  }, [createGame, loadingNew, players]);

  const toggleFriends = useCallback((e) => {
    const id = e.target.getAttribute('data-id');
    const value = e.target.checked;
    if (value) {
      if (players.length >= 3) return;
      if (players.includes(value)) return;
      setPlayers([...players, id]);
    } else {
      const idx = players.indexOf(id);
      if (idx === -1) return;
      const newPlayers = [...players];
      newPlayers.splice(idx, 1);
      setPlayers(newPlayers);
    }
  }, [players]);

  // if (loading) return <Loading />;
  if (error) return error;

  const remaining = 3 - players.length;

  return (
    <div className="columns">
      <div className="column">
        <Link to="/dash" className="back is-desktop" aria-label="back" />
        <Link to="/dash" className="back is-mobile" aria-label="back">
          Back
        </Link>
        <h1>New Game</h1>
        <p>You can select up to {remaining} more friend{remaining !== 1 && 's'} to play with you.</p>
        {(loading && !friends) ? <Loading inline /> : friends.friends.map(f => {
          const checked = players.includes(f._id);
          return (
            <div key={f._id}>
              <label>
                <input type="checkbox" data-id={f._id} checked={checked}
                  onChange={toggleFriends} disabled={!remaining && !checked} />
                {f.username}
              </label>
            </div>
          );
        })}
        <button onClick={clickCreateGame}>Create</button>
      </div>
    </div>
  );
};
