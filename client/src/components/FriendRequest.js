import { useCallback, useState } from "react";
import { useAction } from "../util";

export default function FriendRequest({ friend, refetch }) {
  const [confirming, setConfirming] = useState(false);
  const onAcceptRequestError = useCallback(() => {
    alert(`Failed to accept request from '${friend.username}'. Try again later.`);
  }, [friend.username]);
  const [acceptRequest, { loading }] = useAction(`/api/friends/accept/${friend._id}`, {
    method: 'post',
    onComplete: refetch,
    onError: onAcceptRequestError
  });
  const onRemoveRequestError = useCallback(() => {
    setConfirming(false);
    alert(`Failed to ignore request from '${friend.username}'. Try again later.`);
  }, [setConfirming, friend.username])
  const [removeRequest, { loading: loadingRemove }] = useAction(`/api/friends/decline/${friend._id}`, {
    method: 'post',
    onComplete: refetch,
    onError: onRemoveRequestError
  });

  const onClickAcceptRequest = useCallback(() => {
    if (loading) return;
    acceptRequest();
  }, [loading, acceptRequest]);

  const onClickRemoveRequest = useCallback(() => {
    if (loadingRemove) return;
    if (confirming) return removeRequest();
    setConfirming(true);
  }, [loadingRemove, confirming, setConfirming, removeRequest]);

  return (
    <div className="item clickable buttons">
      {friend.username}
      <span onClick={onClickAcceptRequest} className="accept">
        Accept
      </span>
      <span onClick={onClickRemoveRequest} className="remove">
        {confirming ? 'Confirm' : 'Ignore'}
      </span>
    </div>
  );
};
