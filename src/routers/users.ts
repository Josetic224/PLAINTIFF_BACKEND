import express, { Request, Response } from "express";
import multer from 'multer';
// Define storage settings for multer
const storage = multer.memoryStorage();

// Initialize multer with the storage settings
const upload = multer({ storage: storage });
// import upload from "../config/multer.config";
import {
  getAllUsersController,
  signUp,
  signIn,
  forgotPassword,
  resetPassword,
  verifyEmail,
  signOut,
  downloadTemplateController,
  uploadFile,

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
  router.get("/download-template/:UserID", downloadTemplateController),
  router.post("/upload-Template/:UserID/:AssignedUserID",upload.single("file"),uploadFile )
  };
