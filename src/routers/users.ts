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
  // resetPassword,
  verifyEmail,
  signOut,
  downloadTemplateController,
  createClientController,
  ClientBatchUpload,
  Allclients,
  clientByFirstname,
  clientByLastname,
  updateClient,
  Totalclients,
  createScheduleAndSendEmail,
  getFirstUpcomingAppointment,
  getNumberOfSchedules,
  getAllSchedules,
  
  // deleteUser,
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
router.get("/verify/:Token",verifyEmail)

  // router.put("/reset/", resetPassword);

  router.get("/signout/:UserID/:Token", signOut)
  router.get("/download-template/:UserID", downloadTemplateController)
  router.post("/batch_Upload/:UserID/:AssignedUserID",upload.single("file"),ClientBatchUpload)
  router.post('/save_client/:UserID',createClientController)
  router.get("/getClients/:UserID",Allclients)
  router.get("/getClients/firstname/:UserID", clientByFirstname)
  router.get("/getClients/lastname/:UserID", clientByLastname)
  router.put("/update_client/:UserID/:clientId", updateClient);
  router.get("/total_clients/:UserID", Totalclients)
  router.post("/create-schedule/:UserID", createScheduleAndSendEmail),
  router.get('/schedules/first-upcoming-appointment/:UserID',getFirstUpcomingAppointment);
  router.get('/schedules/count/:UserID',getNumberOfSchedules);
  router.get('/schedules/all_schedules/:UserID', getAllSchedules)

 
  };
