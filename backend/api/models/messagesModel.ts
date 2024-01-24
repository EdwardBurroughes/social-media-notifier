import { pool } from "./db.js";

type AddMessageParams = {
  channelName: string;
  message: string;
  schedule?: string | null;
};

type slackMessages = {
  id: string;
  channelName: string;
  message: string;
  schedule_time: string;
  scheduled_status: boolean;
};

export class DbError extends Error {}

export const getMessages = async (): Promise<slackMessages[]> => {
  const client = await pool.connect();
  try {
    const result = await client.query(
      `SELECT 
        id, 
        channel_name, 
        message, 
        schedule_time, 
        scheduled_status 
      FROM 
        slack_messages`
    );
    return result.rows;
  } catch (err) {
    throw new DbError(`failed to retrieve messages from db: ${err}`);
  } finally {
    client.release();
  }
};

export const addMessage = async ({
  channelName,
  message,
  schedule = null,
}: AddMessageParams) => {
  const client = await pool.connect();
  const nowDate = new Date().toISOString();

  try {
    const result = await client.query(
      `INSERT INTO slack_messages (id, channel_name, message, schedule_time, inserted_date, scheduled_status) 
      VALUES (uuid_generate_v4(), $1, $2, $3, $4, $5) RETURNING *`,
      [channelName, message, schedule, nowDate, false]
    );
    return result.rows[0];
  } finally {
    client.release();
  }
};
