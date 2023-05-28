import { Link } from "react-router-dom";
import { auth } from "../contexts/firebase";
import { useAction, useData } from "../util";
import "../styles/Dashboard.scss";
import { useCallback, useEffect, useState } from "react";

export default function Dashboard() {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const { data, error, loading, refetch } = useData('/api/profile', (data) =>
    setName(data.username)
  );
  const [setUsername, { error: editError, loading: editLoading }] =
    useAction('/api/profile/username', 'post', refetch);

  useEffect(() => {
    setEditing(false);
  }, [data]);

  const editClicked = useCallback(() => {
    if (editLoading) return;
    if (!editing) {
      setEditing(true);
    } else {
      setUsername({ username: name });
    }
  }, [editing, setUsername, editLoading, name]);

  const onNameChange = useCallback((e) => {
    setName(e.target.value);
  });

  if (error) return error;
  if (loading && !editing) return "loading...";

  return (
    <div className="container">
      <h1>Hello, {editing ? <input type="text" value={name} onChange={onNameChange} onBlur={onNameChange} /> : data.username}</h1>
      <button onClick={editClicked}>{editing ? 'Save' : 'Change Name'}</button>
      <Link to="/friends">Friends</Link>
      <Link to="/new">New Game</Link>
      <button onClick={() => auth.signOut()}>Sign Out</button>
      <h2>On-going Games</h2>
      {data.games.forEach(game => <p>{game.name}</p>)}
    </div>
  );
};
