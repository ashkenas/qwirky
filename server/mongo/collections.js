import { dbConnection } from "./connection.js";

const memoCollection = (collection) => {
  let _col;

  return async () => {
    if (!_col) {
      const db = await dbConnection();
      _col = db.collection(collection);
    }

    return _col;
  };
};

export const users = memoCollection('users');
export const games = memoCollection('games');