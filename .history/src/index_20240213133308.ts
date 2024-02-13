import express, { Application, Request, Response } from "express";
import "dotenv/config";
import routers from "./routers";

const app: Application = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const port: number = 3000;

app.use("/api_v1/", routers());

app.get("/ping", (req: Request, res: Response) => {
  res.send("pong");
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
