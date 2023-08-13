import { errors } from "../mongo/collections.js";

export const logError = async (error, location) => {
  const col = await errors();
  try {
    const res = await col.insertOne({
      errorType: error?.constructor?.name,
      error: error.toString(),
      location: location ?? null
    });
    if (!res.acknowledged)
      console.error('Failed to make log for error:\n' + error.toString());
  } catch (e) {
    console.error(e);
  }
};