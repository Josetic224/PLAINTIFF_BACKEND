import express, { Application, Request, Response } from "express";
import "dotenv/config";

const app: Application = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const port: number = 3000;

app.get("/ping", (req: Request, res: Response) => {
  res.send("pong");
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
