import express, { Request, Response } from "express";
import {
  getAllUsersController,
  signUp,
  signIn,
  forgotPassword,
  resetPassword,
  verifyEmail,
  signOut,
  
} from "../controllers/user.controller";
// import { updateUser } from "../db/users.db";

export default (router: express.Router) => {
  router.get("/users", getAllUsersController);

  router.post("/signup", signUp);
  router.post("/login",  signIn);
  router.get("/verify/:UserID/:Token", verifyEmail)
  router.post("/forgotPassword", forgotPassword)
  router.put("/reset/:UserID", resetPassword)
  router.get("/signout/:UserID", signOut)
  
};
