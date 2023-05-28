import { users } from "../mongo/collections.js";
import { forceObjectId, StatusError, validateUsername } from "../util.js";

export const getUserByUid = async uid => {
  const col = await users();
  const user = await col.findOne({
    firebaseId: uid
  });
  if (!user) {
    const res = await col.insertOne({
      firebaseId: uid,
      username: `user${Date.now().toString().substring(2)}`,
      friends: [],
      requests: [],
      games: []
    });

    if (!res.acknowledged || !res.insertedId)
      throw new Error('Failed to create new user.');

    return await getUserByUid(uid);
  }
  return user;
};

export const getUserById = async id => {
  const col = await users();
  return await col.findOne({
    id: forceObjectId(id)
  });
};

export const getUserByUsername = async name => {
  const col = await users();
  return await col.findOne({
    username: name
  });
};

export const changeUsername = async (uid, username) => {
  username = validateUsername(username);
  const user = await getUserByUid(uid);
  const col = await users();
  const res = await col.updateOne(
    { _id: user._id },
    { username: username }
  );
  if (!res.acknowledged)
    throw new Error('Failed to update username.');
}

export const getFriends = async uid => {
  const user = await getUserByUid(uid);
  const col = await users();
  const cursor = col.aggregate([
    { $match: { _id: user._id } },
    { $project: { friends: 1, _id: 0 } },
    { $unwind: '$friends' },
    {
      $lookup: {
        from: 'users',
        localField: 'friends',
        foreignField: '_id',
        as: 'friends'
      }
    },
    { $unwind: '$friends' },
    { $replaceRoot: { newRoot: '$friends' } },
    { $project: { username: 1 } }
  ]);
  return await cursor.toArray();
};

export const makeFriendRequest = async (uid, username) => {
  const friend = await getUserByUsername(username);
  if (!friend) throw new StatusError(404, 'User not found.');
  const user = await getUserByUid(uid);
  const col = await users();
  if (user.requests.some(fid => fid.equals(friend._id)))
    return await acceptFriendRequest(uid, friend._id);
  const res = await col.updateOne(
    { _id: friend._id },
    { $push: { requests: user._id } }
  );
  if (!res.acknowledged)
    throw new Error('Failed to create friend request.');
};

export const acceptFriendRequest = async (uid, id) => {
  const user = await getUserByUid(uid);
  id = forceObjectId(id);
  if (!user.requests.some(fid => fid.equals(id)))
    throw new StatusError(404, 'Cannot accept non-existent friend request.');
  const col = await users();
  const friend = await getUserById(id);
  if (!friend) {
    await col.updateOne(
      { _id: user._id },
      { $pull: { requests: id } }
    );
    throw new StatusError(400, 'User does not exist.');
  }
  const res1 = await col.updateOne(
    { _id: user._id },
    {
      $push: { friends: id },
      $pull: { requests: id }
    }
  );
  if (!res1.acknowledged)
    throw new Error('Failed to accept friend request. (1)');
  const res2 = await col.updateOne(
    { _id: id },
    { $push: { friends: user._id } }
  );
  if (!res2.acknowledged)
    throw new Error('Failed to accept friend request. (2)');
};

export const removeFriend = async (uid, id) => {
  const user = await getUserByUid(uid);
  id = forceObjectId(id);
  if (!user.friends.some(fid => fid.equals(id)))
    throw new StatusError(404, 'Cannot remove non-existent friend.');
  const col = await users();
  const friend = await getUserById(id);
  if (!friend) {
    await col.updateOne(
      { _id: user._id },
      { $pull: { friends: id } }
    );
    throw new StatusError(400, 'User does not exist.');
  }
  const res1 = await col.updateOne(
    { _id: user._id },
    { $pull: { friends: id } }
  );
  if (!res1.acknowledged)
    throw new Error('Failed to remove friend. (1)');
  const res2 = await col.updateOne(
    { _id: id },
    { $pull: { friends: user._id } }
  );
  if (!res2.acknowledged)
    throw new Error('Failed to remove friend. (2)');
};
