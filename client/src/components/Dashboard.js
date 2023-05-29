import { Link } from "react-router-dom";
import { auth } from "../contexts/firebase";
import { useAction, useData } from "../util";
import "../styles/Dashboard.scss";
import { useCallback, useEffect, useState } from "react";

export default function Dashboard() {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const { data, error, loading } = useData('/api/profile', {
    onComplete: (data) => setName(data.username)
  });
  const [setUsername, { loading: editLoading }] =
    useAction('/api/profile/username', {
      method: 'post',
      onComplete: () => {
        setEditing(false);
      },
      onError: (status, message) => {
        if (status === 500)
          return alert('Failed to update username, try again later.');
        else return alert(message);
      }
    });

  const editClicked = useCallback(() => {
    if (editLoading) return;
    if (!editing) {
      setEditing(true);
    } else {
      setUsername({ username: name });
    }
  }, [editing, setUsername, editLoading, name, setEditing]);

  const onNameChange = useCallback((e) => {
    setName(e.target.value);
  }, [setName]);

  if (error) return error;
  if (loading && !editing) return "loading...";

  return (
    <div className="columns">
      <div className="column">
        <h1>Hello, {editing ? <input type="text" value={name} onChange={onNameChange} onBlur={onNameChange} /> : name}</h1>
        <button onClick={editClicked}
          className={`navbtn d${editLoading ? ' loading' : ''}`}>
          {editing ? 'Save' : 'Change Name'}
        </button>
        <Link to="/friends" className="navbtn a">Friends</Link>
        <Link to="/new" className="navbtn b">New Game</Link>
        <button onClick={() => auth.signOut()} className="navbtn c">
          Sign Out
        </button>
      </div>
      <div className="column">
        <h1>On-going Games</h1>
        <div className="column-body">
          {data.games.forEach(game => <p>{game.name}</p>)}
          <div className="game-card">
            <p className="game-name">47 Ducks</p>
            <p className="game-players">
              johnnyboy8, robotlover, arson2, beanman
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
