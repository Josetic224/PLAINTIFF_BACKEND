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
  createClientController,
  ClientBatchUpload,
  Allclients,
  clientByFirstname,
  clientByLastname,
  // senAppointmentReminders,

} from "../controllers/user.controller";

import { validateUserLogin, validateUserRegistration } from "../validator/validator";
import { createClientManually } from "../db/users.db";

// import { updateUser } from "../db/users.db";

export default (router: express.Router) => {
  router.get("/users", getAllUsersController);

  router.post("/signup",validateUserRegistration,signUp);
  router.post("/login", validateUserLogin, signIn);
  // Route for verifying email
router.get("/verify/:UserID/:Token", async (req, res) => {
  try {
    // Call your verifyEmail handler
    await verifyEmail(req, res);
  } catch (error) {
    // Handle any errors
    console.error("Error verifying email:", error);
    res.status(500).send("Internal server error");
  }
});

  router.post("/forgotPassword/:UserID", forgotPassword)
  router.get("/reset/:UserID", resetPassword)
  router.get("/signout/:UserID/:Token", signOut)
  router.get("/download-template/:UserID", downloadTemplateController)
  router.post("/batch_Upload/:UserID/:AssignedUserID",upload.single("file"),ClientBatchUpload)
  router.post('/save_client/:UserID',createClientController)
  router.get("/getClients/:UserID",Allclients)
  router.get("/getClients/firstname/:UserID", clientByFirstname)
  router.get("/getClients/lastname/:UserID", clientByLastname)
  
  };
