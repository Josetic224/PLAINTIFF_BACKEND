// app.get("/ping", (req: Request, res: Response) => {
//   res.send("pong");
// });

import express, { Request, Response } from "express";
import { pingPong } from "../controllers/healthcheck.controller";

export default (router: express.Router) => {
  router.get("/ping", pingPong);
};
