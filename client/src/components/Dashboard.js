import { Link } from "react-router-dom";
import { auth } from "../contexts/firebase";
import { useAction, useData } from "../util";
import Loading from "./Loading";
import { useCallback, useState } from "react";
import DashboardSection from "./DashboardSection";
import Accordion from "./Accordion";
import "../styles/Dashboard.scss";
import Friend from "./Friend";

export default function Dashboard() {
  const [name, setName] = useState('');
  const onGetProfileComplete = useCallback((data) =>
    setName(data.username)
  , [setName]);
  const { data, error, loading, refetch } = useData('/api/profile', {
    onComplete: onGetProfileComplete
  });
  const onSetUsernameError = useCallback((status, message) => {
    if (status === 500)
      return alert('Failed to update username, try again later.');
    else return alert(message);
  }, []);
  const [setUsername, { loading: editLoading }] =
    useAction('/api/profile/username', {
      method: 'post',
      onComplete: refetch,
      onError: onSetUsernameError
    });
    
  const [friendName, setFriendName] = useState('');
  const onAddFriendComplete = useCallback(() =>
    setFriendName('')
  , [setFriendName]);
  const onAddFriendError = useCallback((status, message) => {
    if (status !== 500) alert(message);
    else alert('Failed to add friend, try again later.');
  }, []);
  const friends = useData('/api/friends');
  const [addFriend, { loading: addFriendLoading }] = useAction('/api/friends', {
    method: 'post',
    onComplete: onAddFriendComplete,
    onError: onAddFriendError
  });

  const onSubmitSetUsername = useCallback((e) => {
    e.preventDefault();
    if (editLoading) return;
    setUsername({ username: name });
  }, [name, setUsername, editLoading]);

  const onNameChange = useCallback((e) => {
    setName(e.target.value);
  }, [setName]);

  const onSubmitAddFriend = useCallback((e) => {
    e.preventDefault();
    if (addFriendLoading) return;
    addFriend({ username: friendName })
  }, [addFriendLoading, friendName, addFriend]);

  const onFriendNameChange = useCallback((e) => {
    setFriendName(e.target.value);
  }, [setFriendName])

  if (error) return error;
  if (loading && !data) return <Loading />;

  return (
    <div className="columns">
      <div className="column">
        <h1 className="has-input">
          Hello,&nbsp;{data.username}
        </h1>
        <Accordion initial={"Friends"}>
          <DashboardSection title={"Profile"}>
            <div className="item">
              <form onSubmit={onSubmitSetUsername}>
                <label htmlFor="change-name">
                  Change Name
                </label>
                <div className="control">
                  <input type="text" value={name}
                    id="change-name"
                    onChange={onNameChange}
                    onBlur={onNameChange} />
                  <button className={editLoading ? "loading" : ""}
                    type="submit" disabled={editLoading}>
                    Change
                  </button>
                </div>
              </form>
            </div>
            <div className="item clickable"
              onClick={() => auth.signOut()}
              ariaRole="button">
              Sign Out
            </div>
          </DashboardSection>
          <DashboardSection title={"Friends"}>
            <div className="item">
              <form onSubmit={onSubmitAddFriend}>
                <label htmlFor="add-friend-name">
                  Add Friend
                </label>
                <div className="control">
                  <input type="text" value={friendName}
                    id="add-friend-name"
                    onChange={onFriendNameChange}
                    onBlur={onFriendNameChange} />
                  <button className={addFriendLoading ? "loading" : ""}
                    type="submit" disabled={addFriendLoading}>
                    Add
                  </button>
                </div>
              </form>
            </div>
            {!friends.data && friends.loading && <Loading inline />}
            {friends.error ?
              <div className="item">
                Something went wrong. Please try again later.
              </div>
            : friends.data.friends.map(friend =>
              <Friend key={friend._id} friend={friend} refetch={friends.refetch} />
            )}
          </DashboardSection>
          <DashboardSection title={"New Game"}>
          </DashboardSection>
          <DashboardSection title={"In-progress Games"}>
          </DashboardSection>
          <DashboardSection title={"Finished Games"}>
          </DashboardSection>
        </Accordion>
        <Link to="/new" className="navbtn b">New Game</Link>
      </div>
      <div className="column">
        <h1 className="is-desktop" style={{ userSelect: 'none' }}>&nbsp;</h1>
        <div className="column-body">
          {data && data.games && data.games.map(game => (
            <Link key={game._id} className="game-card" to={`/game/${game._id}`}>
              <p className="game-name">{game.name}</p>
              <p className="game-players">
                {game.usernames.join(', ')}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};
