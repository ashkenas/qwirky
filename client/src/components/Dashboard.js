import { Link } from "react-router-dom";
import { auth } from "../contexts/firebase";
import { useAction, useData } from "../util";
import Loading from "./Loading";
import { useCallback, useState } from "react";
import DashboardSection from "./DashboardSection";
import Accordion from "./Accordion";
import "../styles/Dashboard.scss";
import Friend from "./Friend";
import FriendRequest from "./FriendRequest";

export default function Dashboard() {
  const [name, setName] = useState('');
  const onGetProfileComplete = useCallback((data) =>
    setName(data.username)
  , [setName]);
  const profile = useData('/api/profile', {
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
      onComplete: profile.refetch,
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

  if (profile.error) return profile.error;
  if (profile.loading && !profile.data) return <Loading />;

  let games = [<div className="item">No games available.</div>];
  let finishedGames = [<div className="item">No games available.</div>];
  if (profile.data && profile.data.games) {
    const notOver = profile.data.games.filter(game => !game.over);
    if (notOver.length) {
      games = notOver.map(game => {
        const yourTurn =
          game.usernames[game.currentPlayer] === profile.data.username;
        const extra = yourTurn ? ' indicated' : '';
        return (
          <Link key={game._id}
            className={`item clickable game${extra}`}
            to={`/game/${game._id}`}>
            <p className="name">{game.name}</p>
            {yourTurn && <span className="indicator">Your Turn</span>}
            <p className="players">
              {game.usernames.map(u =>
                u === profile.data.username ? 'you' : u
              ).join(', ')}
            </p>
          </Link>
        );
      });
    }
    const over = profile.data.games.filter(game => game.over);
    if (over.length) {
      finishedGames = notOver.map(game => (
        <Link key={game._id}
          className="item clickable game" to={`/game/${game._id}`}>
          <p className="name">{game.name}</p>
          <p className="players">
            {game.usernames.map(u =>
              u === profile.data.username ? 'you' : u
            ).join(', ')}
          </p>
        </Link>
      ));
    }
  }

  return (<>
    <h1 className="title dash">
      <span className="color1">Q</span>
      <span className="color2">w</span>
      <span className="color3">i</span>
      <span className="color4">r</span>
      <span className="color5">k</span>
      <span className="color6">y</span>
    </h1>
    <div className="columns">
      <div className="column">
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
            <div className="item clickable red"
              onClick={() => auth.signOut()}
              role="button">
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
            {!friends.loading && friends.error ?
              <div className="item">
                Something went wrong. Please try again later.
              </div>
            : friends.data && friends.data.friends.map(friend =>
              <Friend key={friend._id} friend={friend} refetch={friends.refetch} />
            )}
          </DashboardSection>
          {!!friends.data.requests.length &&
            <DashboardSection title={"Friend Requests"}>
              {!friends.data && friends.loading && <Loading inline />}
              {!friends.loading && friends.error ?
                <div className="item">
                  Something went wrong. Please try again later.
                </div>
              : friends.data && friends.data.requests.map(friend =>
                <FriendRequest key={friend._id} friend={friend} refetch={friends.refetch} />
              )}
            </DashboardSection>
          }
          <DashboardSection title={"New Game"}>

          </DashboardSection>
        </Accordion>
      </div>
      <div className="column">
        <Accordion initial={"In-Progress Games"}>
          <DashboardSection title={"In-Progress Games"}>
            {games}
          </DashboardSection>
          <DashboardSection title={"Finished Games"}>
            {finishedGames}
          </DashboardSection>
        </Accordion>
      </div>
    </div>
  </>);
};
