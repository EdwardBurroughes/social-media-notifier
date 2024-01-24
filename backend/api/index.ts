import express, { Express } from "express";
// import dotenv from "dotenv";
import router from "./routes/messagesRoutes.js";
import bodyParser from "body-parser";

// dotenv.config();

const app: Express = express();
const port = process.env.PORT || 8080;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use("/", router);

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
