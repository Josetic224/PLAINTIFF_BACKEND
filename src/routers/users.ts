import express, { Request, Response } from "express";
import { getAllUsersController } from "../controllers/user.controller";
import signUp from "../controllers/signup.controller";

export default (router: express.Router) => {
  router.get("/users", getAllUsersController);

  router.post("/user", (req, res) => {});
  router.post("/users/signup", signUp)
};


