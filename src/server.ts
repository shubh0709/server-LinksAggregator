import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import router from "./route";
import morgan from "morgan";
import cors from "cors";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import audit, { Logger } from "express-requests-logger";

dotenv.config({ debug: process.env.DEBUG === "true" });

const app: Express = express();

// db
mongoose
  .connect(process.env.DB_CONNECT!)
  .then(() => console.log("DB connected"))
  .catch((err) => console.log(err));

console.log("client url: ", process.env.CLIENT_URL);

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
      // excludeBody: ["creditCard"], // Exclude 'creditCard' field from requests body
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
app.use(bodyParser.json());
app.use("/app", router);

let port = process.env.PORT || 8080;

app.listen(port, () => {
  console.log("server started at port " + port);
});
