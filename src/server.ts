import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";

dotenv.config({ debug: process.env.DEBUG === "true" });
process.on("uncaughtException", (err) => {
  console.log(err.name, err.message);
  console.log("Uncaught Exception occured! Shutting down...");
  process.exit(1);
});

import router from "./route";
import morgan from "morgan";
import cors from "cors";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import audit, { Logger } from "express-requests-logger";
import { validateSignIn } from "./controller/auth";
import { CustomError } from "./utils/errors";
import { globalErrorHandler } from "./middlewares/error";

const app: Express = express();

// db
mongoose
  .connect(process.env.DB_CONNECT!)
  .then(() => console.log("DB connected"))
  .catch((err) => console.log("DB connection failed :", err));

//middlewares
app.use(
  cors({
    origin: process.env.CLIENT_URL,
  })
);
app.use(
  audit({
    excludeURLs: ["health", "metrics"], // Exclude paths which enclude 'health' & 'metrics'
    request: {
      // maskBody: ["password"], // Mask 'password' field in incoming requests
      // excludeHeaders: ["authorization"], // Exclude 'authorization' header from requests
      excludeBody: [""], // Exclude 'creditCard' field from requests body
      // maskHeaders: ["header1"], // Mask 'header1' header in incoming requests
      // maxBodyLength: 50, // limit length to 50 chars + '...'
    },
    response: {
      // maskBody: ["session_token"], // Mask 'session_token' field in response body
      // excludeHeaders: ["*"], // Exclude all headers from responses,
      // excludeBody: ["*"], // Exclude all body from responses
      // maskHeaders: ["header1"], // Mask 'header1' header in incoming requests
      // maxBodyLength: 50, // limit length to 50 chars + '...'
    },
  })
);

app.use(morgan("dev"));
app.use(bodyParser.json({ limit: "5mb" }));
app.use("/app", router);
app.all("*", (req: Request, res: Response, next) => {
  const err = new CustomError(
    `Can't find ${req.originalUrl} on the server!`,
    404
  );
  next(err);
});

app.use(globalErrorHandler);

let port = process.env.PORT || 8080;

const server = app.listen(port, () => {
  console.log("server started at port " + port);
});

process.on("unhandledRejection", (err: Error) => {
  console.log(err.name, err.message);
  console.log("Unhandled rejection occured! Shutting down...");

  server.close(() => {
    process.exit(1);
  });
});
