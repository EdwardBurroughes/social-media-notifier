import express, { Request, Response } from "express";
import { createMQProducer } from "@edly01/rabbitmq-utils";
import {
  addMessageToDB,
  getMessagesFromDb,
} from "../services/messagesService.js";
import { MessageData } from "../utils/types.js";
const SOCIAL_MEDIA_QUEUE_NAME = "social-media";

const router = express.Router();
const producer = await createMQProducer(
  "amqp://username:password@rabbitmq:5672",
  SOCIAL_MEDIA_QUEUE_NAME
);

router.get("/messages", async (req: Request, res: Response) => {
  getMessagesFromDb(req, res);
});

router.post(
  "/messages",
  async (req: Request<{}, {}, MessageData>, res: Response) => {
    addMessageToDB(req, res, producer);
  }
);

export default router;
