import express, { Request, Response } from "express";
import { getAllUsersController } from "../controllers/user.controller";

export default (router: express.Router) => {
  router.get("/user", getAllUsersController);

  router.post("/user", (req, res) => {});
};
