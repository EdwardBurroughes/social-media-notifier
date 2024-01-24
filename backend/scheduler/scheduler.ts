import moment from "moment";
import { CronJob } from "cron";
import * as utils from "@edly01/rabbitmq-utils";
import * as pg from "pg";
import { pool } from "./dbPool.js";

const SOCIAL_MEDIA_QUEUE_NAME = "social-media";

type ScheduledSlackMessageOutput = {
  id: string;
  channel_name: string;
  message: string;
};

class DbQueryError extends Error {}

const producer = await utils.createMQProducer(
  "amqp://username:password@rabbitmq:5672",
  SOCIAL_MEDIA_QUEUE_NAME
);

const getCurrentDateTimeWithoutSeconds = (): [string, string] => {
  const now = moment();
  const upperBound = now.clone().add(1, "minute");
  return [
    now.format("YYYY-MM-DD HH:mm"),
    upperBound.format("YYYY-MM-DD HH:mm"),
  ];
};

const queryDb = async <T, V extends any[]>(
  sql: string,
  values: V,
  poolClient: pg.Pool
): Promise<T[]> => {
  const client = await poolClient.connect();
  try {
    const result = await client.query(sql, values);
    return result.rows;
  } catch (err) {
    console.error(`error querying db: ${err}`);
    throw new DbQueryError();
  } finally {
    client.release();
  }
};

const fetchSlackMessagesWithinRange = async (
  now: string,
  upperbound: string
): Promise<ScheduledSlackMessageOutput[]> => {
  const result: ScheduledSlackMessageOutput[] = await queryDb(
    `SELECT 
        id, 
        channel_name, 
        message 
      FROM slack_messages 
      WHERE schedule_time >= $1 and schedule_time < $2 
      and scheduled_status = FALSE`,
    [now, upperbound],
    pool
  );
  return result;
};

const alterScheduledStatus = async (ids: string[]) => {
  const result = queryDb(
    ` 
    UPDATE slack_messages
    SET scheduled_status = TRUE
    WHERE id = ANY($1::UUID[])
    RETURNING *
    `,
    [ids],
    pool
  );
  console.log(`updated results ${result}`);
};

const sendDataToQueue = (res: ScheduledSlackMessageOutput[]): string[] => {
  const ids: string[] = [];
  res.forEach((row) => {
    const slackMsgObj = JSON.stringify({
      channelName: row.channel_name,
      message: row.message,
    });
    ids.push(row.id);
    console.log(`sending message to the queue: ${SOCIAL_MEDIA_QUEUE_NAME}`);
    producer(slackMsgObj);
    console.log(`successfully sent msg to ${SOCIAL_MEDIA_QUEUE_NAME}`);
  });
  return ids;
};

const sendScheduledMsgToQueue = async () => {
  const [now, upperbound] = getCurrentDateTimeWithoutSeconds();
  console.log(now, upperbound)
  const res = await fetchSlackMessagesWithinRange(now, upperbound);
  console.log(res)
  if (res.length) {
    const ids = sendDataToQueue(res);
    await alterScheduledStatus(ids);
  }
};

const job = CronJob.from({
  cronTime: "* * * * *",
  onTick: async () => {
    sendScheduledMsgToQueue();
  },
});
job.start();
