import amqplib, { Channel } from "amqplib";

class RabbitMQError extends Error {}

type ProducerCallable = (msg: string) => void;

export const rabbitMQConnect = async (url: string): Promise<Channel> => {
  console.log(`connecting to rabbit MQ`);
  const conn = await amqplib.connect(url);
  return await conn.createChannel();
};

export const createMQProducer = async (
  amqpUrl: string,
  queueName: string
): Promise<ProducerCallable> => {
  try {
    const channel = await rabbitMQConnect(amqpUrl);
    await channel.assertQueue(queueName);
    return (msg: string) => {
      console.log(`sending ${msg} to ${queueName}`);
      channel.sendToQueue(queueName, Buffer.from(msg));
    };
  } catch (err) {
    console.error(`failed to send message to ${queueName}, due to ${err}`);
    throw new RabbitMQError(queueName);
  }
};
