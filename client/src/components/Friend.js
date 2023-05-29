import { useCallback, useState } from "react";
import { useAction } from "../util";

export default function Friend({ friend, refetch }) {
  const [confirming, setConfirming] = useState(false);
  const [removeFriend, { loading }] = useAction(`/api/friends/${friend._id}`, {
    method: 'delete',
    onComplete: refetch,
    onError: () => {
      setConfirming(false);
      alert(`Could not delete friend '${friend.username}'.`);
    }
  });
  const clickRemoveFriend = useCallback(() => {
    if (loading) return;
    if (confirming) return removeFriend();
    setConfirming(true);
  });
  return (
    <div className="friend">
      <p className="friend-name">{friend.username}</p>
      <button onClick={clickRemoveFriend}>
        {confirming ? 'Confirm' : 'Remove'}
      </button>
    </div>
  );
};
