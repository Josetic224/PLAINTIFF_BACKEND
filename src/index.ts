import express, { Application, Request, Response } from "express";
import "dotenv/config";
import routers from "./routers";
import helmet from "helmet";

const app: Application = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet());

const port: number = 3000;

// Define a route for the homepage
app.get("/api_v1/homepage", (req: Request, res: Response) => {
  res.send("<h1>Welcome to Plaintiff Aid Backend!</h1>");
});

// Mount your routers
app.use("/api_v1/", routers());

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
