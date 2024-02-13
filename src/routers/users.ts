import express, { Request, Response } from "express";
import {
  getAllUsersController,
  signUp,
  signIn,
  forgotPassword,
} from "../controllers/user.controller";
import { updateUser } from "../db/users.db";

export default (router: express.Router) => {
  router.get("/users", getAllUsersController);

  router.post("/signup", signUp);
  router.post("/login", signIn);
  router.put("/resetPassword", forgotPassword)
};
