import { Link, useNavigate } from "react-router-dom";
import { auth } from "../contexts/firebase";
import { useAction, useData, useWebSocket } from "../util";
import Loading from "./Loading";
import { useCallback, useState } from "react";
import DashboardSection from "./DashboardSection";
import Accordion from "./Accordion";
import Friend from "./Friend";
import FriendRequest from "./FriendRequest";
import Chevron from "./Chevron";
import { AnimatePresence, motion } from "framer-motion";
import "../styles/Dashboard.scss";

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

  const [friendSearch, setFriendSearch] = useState('');
  const onFriendSearchChange = useCallback((e) => {
    setFriendSearch(e.target.value);
  }, [setFriendSearch]);

  const [selectedPlayers, setSelectedPlayers] = useState([]);
  const addPlayer = useCallback((id) => () => {
    if (selectedPlayers.length >= 3) return;
    setSelectedPlayers([...selectedPlayers, id])
  }, [selectedPlayers, setSelectedPlayers]);
  const removePlayer = useCallback((id) => () => {
    const idx = selectedPlayers.indexOf(id);
    if (idx === -1) return;
    const newPlayers = [...selectedPlayers];
    newPlayers.splice(idx, 1)
    setSelectedPlayers(newPlayers);
  }, [selectedPlayers, setSelectedPlayers]);

  const navigate = useNavigate();
  const onCreateGameComplete = useCallback((data) =>
    navigate(`/game/${data._id}`)
  , [navigate]);
  const onCreateGameError = useCallback(() =>
    alert('An error occured, try again later.')
  , []);
  const [createGame, { loading: createLoading }] = useAction('/api/games', {
    method: 'post',
    onComplete: onCreateGameComplete,
    onError: onCreateGameError
  });
  const onClickCreateGame = useCallback(() => {
    if (createLoading) return;
    if (!selectedPlayers.length || selectedPlayers.length > 3)
      return alert('You must select 1-3 other players.');
    createGame({ players: selectedPlayers });
  }, [createLoading, selectedPlayers, createGame]);

  const dashDispatch = useCallback((action) => {
    if (action.type === 'profile')
      profile?.refetch();
    else if (action.type === 'friends')
      friends?.refetch();
  // The linter isn't the smartest
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.refetch, friends?.refetch])
  useWebSocket(dashDispatch);

  if (profile.error) return profile.error;
  if (profile.loading && !profile.data) return <Loading />;

  let games = [<div key={0} className="item">No games available.</div>];
  let finishedGames = [
    <div key={0} className="item">No games available.</div>
  ];
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
      finishedGames = over.map(game => (
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
  
  const searchResults = friends.data?.friends.filter(friend =>
    friend.username.includes(friendSearch)
  ) || [];
  let resultItems = [<div className="item keep">No results.</div>];
  if (searchResults.length) {
    resultItems = searchResults.map(friend =>
      <div key={friend._id} className="item clickable buttons">
          {friend.username}
          {selectedPlayers.includes(friend._id)
          ? <span className="remove" onClick={removePlayer(friend._id)}>
              Remove
            </span>
          : <span className="accept" onClick={addPlayer(friend._id)}>
              Add
            </span>}
      </div>
    );
  }

  const initialSection = friends.data?.requests.length > 0
    ? "Friend Requests"
    : "New Game";

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
        <motion.section className="section"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}>
          <Link to="/how-to">
            <h2>
              The Rules<Chevron expand="Left" />
            </h2>
          </Link>
        </motion.section>
        <Accordion initial={initialSection}>
          <AnimatePresence>
            <DashboardSection key={"Profile"} title={"Profile"}>
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
              <div className="item sign-out"
                onClick={() => auth.signOut()}
                role="button">
                Sign Out
              </div>
            </DashboardSection>
            <DashboardSection key={"Friends"} title={"Friends"}>
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
            { friends.data?.requests.length > 0 &&
              <DashboardSection key={"Requests"} title={"Friend Requests"}>
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
            <DashboardSection key={"New"} title={"New Game"}>
              <div className="item">
                Select 1-3 friends to play with you.
              </div>
              <div className="item">
                <label htmlFor="search-friends">
                  Search Friends
                </label>
                <div className="control solo">
                  <input id="search-friends" type="text"
                    onChange={onFriendSearchChange}
                    onBlur={onFriendSearchChange} />
                </div>
              </div>
              <div className="item super">
                {resultItems}
              </div>
              <div className="item">
                  Selected Players: {selectedPlayers.map((fid, i) =>
                    <span key={fid} className="cross-out"
                      onClick={removePlayer(fid)}>
                      {friends.data.friends.find(f => f._id === fid).username
                        + (i < selectedPlayers.length - 1 ? ', ' : '')}
                    </span>
                  )}
              </div>
              <div className="item start" onClick={onClickCreateGame}>
                Start New Game
              </div>
            </DashboardSection>
          </AnimatePresence>
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
