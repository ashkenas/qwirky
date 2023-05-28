import { useCallback, useState } from "react";
import { useAction, useData } from "../util";
import "../styles/Friends.scss";
import { Link } from "react-router-dom";

export default function Friends() {
  const [name, setName] = useState('');
  const { data, error, loading } = useData('/api/friends');
  const [addFriend, { loading: addLoading }] = useAction('/api/friends', 'post', () =>
    setName('')
  );

  const onNameChange = useCallback((e) => {
    setName(e.target.value);
  }, [setName]);

  const clickAddFriend = useCallback(() => {
    if (addLoading) return;
    addFriend({ username: name })
  }, [addLoading, addFriend, name]);

  if (error) return error;
  if (loading) return "loading";
  return (
    <div className="container">
      <Link to="/dash">Back</Link>
      <h1>Add Friend</h1>
      <input type="text" value={name} onChange={onNameChange}
        onBlur={onNameChange} />
      <button onClick={clickAddFriend}>Add Friend</button>
      <h1>Friend Requests</h1>
      {data.requests.map(f=><p>{f.username}</p>)}
      <h1>Friends</h1>
      {data.friends.map(f=><p>{f.username}</p>)}
    </div>
  );
};
