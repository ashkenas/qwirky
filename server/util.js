import { ObjectId } from "mongodb";

export const sync = f => (req, res, next) => f(req, res, next).catch(next);

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
  throw new StatusError(400, 'Invalid ObjectID');
};

export const validateUsername = username => {
  if (typeof username !== 'string' || !(username = username.trim()))
    throw new StatusError(400, 'Must provide a valid username.');
  if (!(/^[a-zA-Z0-9_]{4,20}$/).test(username))
    throw new StatusError(400, 'Username must be alphanumeric and 4 to 20 characters long.');
  return username.toLowerCase();
};
