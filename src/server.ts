import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import router from "./route";

dotenv.config();

const app: Express = express();

// app.use("/app", router);

app.get("/app/register", (req: Request, res: Response) => {
  res.json({
    mess: "hola",
  });
});

let port = process.env.port || 8080;

app.listen(port, () => {
  console.log("server started at port " + port);
});
