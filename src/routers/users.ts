import express, { Request, Response } from "express";
import multer from 'multer';
// Define storage settings for multer
const storage = multer.memoryStorage();

// Initialize multer with the storage settings
const upload = multer({dest: './uploads/' });
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
  getAppointmentsForNext7Days,
  getNumberOfSchedules,
  getAllSchedules,
  deleteClient,
  getDeletedClients,
  restoreClient,
  resetPassword,
  forgotPassword,
  deleteSchedule,
  addClientDocument,
  getClientDocuments,
  createUserSettings,
  handleupdateUserSettings,
  
  // deleteUser,
  // senAppointmentReminders,

} from "../controllers/user.controller";

import { validateUserLogin, validateUserRegistration } from "../validator/validator";

// import { updateUser } from "../db/users.db";

export default (router: express.Router) => {
  router.get("/users", getAllUsersController);

  router.post("/signup",validateUserRegistration,signUp);
  router.post("/login", validateUserLogin, signIn);
  // Route for verifying email
router.get("/verify/:Token",verifyEmail)
router.post('/forgot-password', forgotPassword);
router.put("/reset-password", resetPassword);


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
  router.get('/schedules/upcoming-appointment/:UserID',getAppointmentsForNext7Days),
  router.get('/schedules/count/:UserID',getNumberOfSchedules),
  router.get('/schedules/all_schedules/:UserID', getAllSchedules)
  router.delete("/client/delete/:userId/:clientId/:caseId",deleteClient)
  router.get('/client/deleted-clients/:userId', getDeletedClients);
  router.put("/client/restore/:userId/:clientId", restoreClient)
  router.delete("/schedule/delete/:userId/:scheduleId", deleteSchedule)
  router.post('/createsettings/:userId',createUserSettings)
  router.put('/updatesettings/:userId', handleupdateUserSettings)
 router.post('/upload_Document/:clientId/:userId', addClientDocument)
 router.get('/all_Documents/:clientId/:userId', getClientDocuments)
}  




