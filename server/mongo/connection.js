import { MongoClient } from "mongodb";
import { connectionURL, database } from "./settings";

let _conn;
let _db;

export const dbConnection = async () => {
  if (!_conn) {
    _conn = await MongoClient.connect(connectionURL);
    _db = _conn.db(database);
  }

  return _db;
};

export const closeConnection = async () => {
  await _conn.close();
  _conn = null;
  _db = null;
};
