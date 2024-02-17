import express, { Request, Response } from "express";
import {
  getAllUsersController,
  signUp,
  signIn,
  forgotPassword,
  resetPassword,
  verifyEmail,
  signOut,
  downloadTemplateController,
  
} from "../controllers/user.controller";
import { handleValidationErrors, validateUserRegistration } from "../validator/validator";
// import { updateUser } from "../db/users.db";

export default (router: express.Router) => {
  router.get("/users", getAllUsersController);

  router.post("/signup",validateUserRegistration,handleValidationErrors, signUp);
  router.post("/login",  signIn);
  router.get("/verify/:UserID/:Token", verifyEmail)
  router.post("/forgotPassword", forgotPassword)
  router.put("/reset/:UserID", resetPassword)
  router.get("/signout/:UserID/:Token", signOut)
  router.get('/download-template/:UserID', downloadTemplateController)
  };
