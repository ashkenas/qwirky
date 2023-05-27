import { MongoClient } from "mongodb";

let _conn;
let _db;

export const dbConnection = async () => {
  if (!_conn) {
    _conn = await MongoClient.connect(process.env.CONNECTION_URL);
    _db = _conn.db(process.env.DATABASE);
  }

  return _db;
};

export const closeConnection = async () => {
  await _conn.close();
  _conn = null;
  _db = null;
};
