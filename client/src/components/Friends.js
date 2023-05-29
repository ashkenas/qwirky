import { useCallback, useState } from "react";
import { useAction, useData } from "../util";
import "../styles/Friends.scss";
import { Link } from "react-router-dom";
import Friend from "./Friend";
import FriendRequest from "./FriendRequest";

export default function Friends() {
  const [name, setName] = useState('');
  const { data, error, loading, refetch } = useData('/api/friends');
  const [addFriend, { loading: addLoading }] = useAction('/api/friends', {
    method: 'post',
    onComplete: () => setName(''),
    onError: () => alert('Failed to add friend, try again later.')
  });

  const onNameChange = useCallback((e) => {
    setName(e.target.value);
  }, [setName]);

  const clickAddFriend = useCallback(() => {
    if (addLoading) return;
    addFriend({ username: name })
  }, [addLoading, addFriend, name]);

  if (error) return error;
  if (loading && !data) return "loading";
  return (
    <div className="container">
      <Link to="/dash">Back</Link>
      <h1>Add Friend</h1>
      <input type="text" value={name} onChange={onNameChange}
        onBlur={onNameChange} />
      <button onClick={clickAddFriend}>Add Friend</button>
      <h1>Friend Requests</h1>
      {data.requests.map(f=> <FriendRequest key={f._id} friend={f} refetch={refetch} />)}
      <h1>Friends</h1>
      {data.friends.map(f => <Friend key={f._id} friend={f} refetch={refetch} />)}
    </div>
  );
};
