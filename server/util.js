import { ObjectId } from "mongodb";

export class StatusError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
};

export const forceObjectId = id => {
  if (typeof id === 'string' && ObjectId.isValid(id))
    return new ObjectId(id);
  if (typeof id === 'object' && id instanceof ObjectId && ObjectId.isValid(id))
    return id;
  throw StatusError(400, 'Invalid ObjectID');
};

export const validateUsername = username => {
  if (typeof username !== 'string' || !(username = username.trim()))
    throw new StatusError(400, 'Must provide a valid username.');
  if (!username.test(/[a-zA-Z0-9]{6,}/))
    throw new StatusError(400, 'Username must be alphanumeric and 6 or more characters long.');
  return username.toLowerCase();
};