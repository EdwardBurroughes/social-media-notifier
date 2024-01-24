import axios from "axios";
import * as utils from "@edly01/rabbitmq-utils";

export const SOCIAL_MEDIA_QUEUE_NAME = "social-media";
const SLACK_URL = "https://slack.com/api/chat.postMessage";

type SendSlackMsgType = {
  channelName: string;
  message: string;
};

class SlackMsgError extends Error {}

class SlackTokenNotSetError extends Error {}

const retrieveSlackToken = () => {
  const token = process.env.SLACK_TOKEN;
  if (!token) {
    console.error("no slack token has been set in the env file");
    throw new SlackTokenNotSetError();
  }
  return token;
};

const sendSlackMsg = async ({ channelName, message }: SendSlackMsgType) => {
  console.log(`posting message to channel: ${channelName}`);
  const token = retrieveSlackToken();
  try {
    const res = await axios.post(
      SLACK_URL,
      { channel: channelName, text: message },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    console.log(res.status, res.data);
  } catch (err) {
    console.error(
      `failed to send message to slack channel ${channelName}: ${err}`
    );
    throw new SlackMsgError(channelName);
  }
};

const consumeMessage = async (url: string, queue: string) => {
  const channel = await utils.rabbitMQConnect(url);
  console.log(`checking for queue ${queue}`);
  await channel.assertQueue(queue);

  channel.consume(queue, async (msg) => {
    if (msg !== null) {
      const data: SendSlackMsgType = JSON.parse(msg.content.toString());
      console.log(`data returned from message: ${data}`);
      await sendSlackMsg(data);
      channel.ack(msg);
    } else {
      console.error("Consumer cancelled by server");
    }
  });
};

// does rabbit MQ connection work
const url = `amqp://${process.env.RABBITMQ_DEFAULT_USER}:${process.env.RABBITMQ_DEFAULT_PASS}@rabbitmq:5672`;
await consumeMessage(url, SOCIAL_MEDIA_QUEUE_NAME);
