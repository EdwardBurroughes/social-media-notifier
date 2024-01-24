import { Response, Request } from "express";
import { DbError, addMessage, getMessages } from "../models/messagesModel.js";
import { MessageData } from "../utils/types.js";

const MAX_MESSAGE_LENGTH = 40000;

const buildAPIError = (
  res: Response,
  message: string,
  status: number = 400
): Response => {
  return res.status(status).json({ error: message });
};

export const getMessagesFromDb = async (req: Request, res: Response) => {
  try {
    const result = await getMessages();
    res.json(result);
  } catch (DbError) {
    return buildAPIError(res, "failed to retrieve data", 500);
  }
};

export const addMessageToDB = async (
  req: Request<{}, {}, MessageData>,
  res: Response,
  // figure out to import types from a typescript package
  producer: any
) => {
  const { channelName, message, schedule } = req.body;
  if (message.length > MAX_MESSAGE_LENGTH) {
    return buildAPIError(
      res,
      `Message exceeds maximum length ${message.length}`
    );
  }

  if (!channelName || typeof channelName !== "string") {
    return buildAPIError(res, "Invalid or missing key");
  }

  if (!message || typeof message !== "string") {
    return buildAPIError(res, "Invalid or missing key");
  }

  try {
    await addMessage({ channelName, message, schedule });
  } catch (err) {
    console.error(`Problem writing to the database, ${err}`);
    buildAPIError(res, "Internal Server Error", 500);
  }
  if (!schedule) {
    try {
      producer(JSON.stringify({ channelName, message, schedule }));
    } catch (err) {
      console.error(`problem writing to queue ${err}`);
      buildAPIError(res, "Internal Server Error", 500);
    }
  }
  res.json({
    success: true,
    message: "successfully validated and stored data",
  });
};
