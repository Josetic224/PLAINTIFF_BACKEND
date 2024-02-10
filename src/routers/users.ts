import express, { Request, Response } from "express";
import { getAllUsersController } from "../controllers/user.controller";
import{signUp, logIn} from "../controllers/onboarding.js"
export default (router: express.Router) => {
  router.get("/users", getAllUsersController);

  router.post("/user/signup",signUp );
  router.post("/user", logIn)
};
