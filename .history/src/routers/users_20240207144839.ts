import express, { Request, Response } from "express";
import { getAllUsersController } from "../controllers/user.controller";

export default (router: express.Router) => {
  router.get("/user", getAllUsersController(req: Request, res: Response));

  router.post("/user", (req, res) => {});
};
