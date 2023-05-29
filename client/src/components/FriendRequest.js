import { useCallback, useState } from "react";
import { useAction } from "../util";

export default function FriendRequest({ friend, refetch }) {
  const [confirming, setConfirming] = useState(false);
  const [acceptRequest, { loading }] = useAction(`/api/friends/accept/${friend._id}`, {
    method: 'post',
    onComplete: refetch,
    onError: () => {
      alert(`Failed to accept request from '${friend.username}'. Try again later.`);
    }
  });
  const [removeRequest, { loading: loadingRemove }] = useAction(`/api/friends/decline/${friend._id}`, {
    method: 'post',
    onComplete: refetch,
    onError: () => {
      setConfirming(false);
      alert(`Failed to ignore request from '${friend.username}'. Try again later.`);
    }
  });

  const clickAcceptRequest = useCallback(() => {
    if (loading) return;
    acceptRequest();
  }, [loading, acceptRequest]);

  const clickRemoveRequest = useCallback(() => {
    if (loadingRemove) return;
    if (confirming) return removeRequest();
    setConfirming(true);
  }, [loadingRemove, confirming, setConfirming, removeRequest]);

  return (
    <div className="friend">
      <p className="friend-name">{friend.username}</p>
      <button onClick={clickAcceptRequest} className="friend-accept">
        Accept
      </button>
      <button onClick={clickRemoveRequest} className="friend-remove">
        {confirming ? 'Confirm' : 'Ignore'}
      </button>
    </div>
  );
};
