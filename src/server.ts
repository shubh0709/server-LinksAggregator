import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import router from "./route";
import morgan from "morgan";
import cors from "cors";
import bodyParser from "body-parser";

dotenv.config();

const app: Express = express();

//middlewares
app.use("/app", router);
app.use(morgan("dev"));
app.use(bodyParser.json());
app.use(cors());

let port = process.env.port || 8080;

app.listen(port, () => {
  console.log("server started at port " + port);
});
