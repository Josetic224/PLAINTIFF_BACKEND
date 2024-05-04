import express, { Request, Response } from "express";
import {
  getAllUsersController,
  signUp,
  signIn,
} from "../controllers/user.controller";

export default (router: express.Router) => {
  router.get("/users", getAllUsersController);

  router.post("/signup", signUp);
  router.post("/login", signIn);
};
