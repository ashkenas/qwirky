import { useCallback, useState } from "react";
import { useAction, useData } from "../util";
import "../styles/Friends.scss";
import { Link } from "react-router-dom";
import Friend from "./Friend";
import FriendRequest from "./FriendRequest";
import Loading from "./Loading";

export default function Friends() {
  const [name, setName] = useState('');
  const { data, error, loading, refetch } = useData('/api/friends');
  const [addFriend, { loading: addLoading }] = useAction('/api/friends', {
    method: 'post',
    onComplete: () => setName(''),
    onError: (status, message) => {
      if (status !== 500) alert(message);
      else alert('Failed to add friend, try again later.');
    }
  });

  const onNameChange = useCallback((e) => {
    setName(e.target.value);
  }, [setName]);

  const clickAddFriend = useCallback(() => {
    if (addLoading) return;
    addFriend({ username: name })
  }, [addLoading, addFriend, name]);

  if (error) return error;
  if (loading && !data) return <Loading />;

  return (<>
    <Link to="/dash" className="back is-desktop" aria-label="back" />
    <div className="columns">
      <div className="column">
        <Link to="/dash" className="back is-mobile" aria-label="back">
          Back
        </Link>
        <h1>Add Friend</h1>
        <div>
          <input type="text" value={name} onChange={onNameChange}
            onBlur={onNameChange} className="friend-input" />
          <button onClick={clickAddFriend} className="friend-submit">
            Add
          </button>
        </div>
        <h1>Friend Requests</h1>
        {data.requests.map(f=> <FriendRequest key={f._id} friend={f} refetch={refetch} />)}
      </div>
      <div className="column">
        <h1>Friends</h1>
        {data.friends.map(f => <Friend key={f._id} friend={f} refetch={refetch} />)}
      </div>
    </div>
  </>);
};
