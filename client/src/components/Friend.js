import { useCallback, useState } from "react";
import { useAction } from "../util";

export default function Friend({ friend, refetch }) {
  const [confirming, setConfirming] = useState(false);
  const onRemoveFriendError = useCallback(() => {
    setConfirming(false);
    alert(`Could not delete friend '${friend.username}'.`);
  }, [setConfirming, friend.username]);
  const [removeFriend, { loading }] = useAction(`/api/friends/${friend._id}`, {
    method: 'delete',
    onComplete: refetch,
    onError: onRemoveFriendError
  });

  const clickRemoveFriend = useCallback(() => {
    if (loading) return;
    if (confirming) return removeFriend();
    setConfirming(true);
  }, [loading, confirming, setConfirming, removeFriend]);

  return (
    <div key={friend._id} className="item clickable buttons">
      {friend.username}
      <span className="remove" onClick={clickRemoveFriend}>
        {confirming ? 'Confirm' : 'Remove'}
      </span>
    </div>
  );
};
