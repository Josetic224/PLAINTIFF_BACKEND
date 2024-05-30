import express, { Request, Response } from "express";
import multer from 'multer';
// Define storage settings for multer
// Multer storage configuration
const storage = multer.memoryStorage();

// Initialize multer with the storage settings
const upload = multer({ storage: storage });

// Multer upload configuration

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
  clientById,
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
  // addClientDocument,
  getClientDocuments,
  clientuploadDocument,
  getClientDocumentByName,
  createUserSettings,
  handleupdateUserSettings,
  verifyOTP,

  
  // deleteUser,
  // senAppointmentReminders,

} from "../controllers/user.controller";

import { validateUserLogin, validateUserRegistration } from "../validator/validator";

// import { updateUser } from "../db/users.db";

export default (router: express.Router) => {
  router.get("/users", getAllUsersController);

  router.post("/signup",validateUserRegistration,signUp);
  router.post("/login", validateUserLogin, signIn);
  router.post('/verify-otp', verifyOTP);
  // Route for verifying email
router.get("/verify/:Token",verifyEmail)
router.post('/forgot-password', forgotPassword);
router.put("/reset-password", resetPassword);


  router.get("/signout/:UserID/:Token", signOut)
  router.get("/download-template/:UserID", downloadTemplateController)
  router.post("/batch_Upload/:UserID/:AssignedUserID",upload.single("file"),ClientBatchUpload)
  router.post('/save_client/:UserID',upload.array('file'),createClientController)
  router.get("/get_Clients/:UserID",Allclients)
  router.get("/get_Client/:userID/:clientID", clientById)
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
 router.post('/upload_Document/:userId/:clientId', upload.array("file"),clientuploadDocument)
 router.get('/all_Documents/:userId/:clientId', getClientDocuments)
 router.get('/one_Document/:userId/:clientId', getClientDocumentByName )
 router.post('/settings/:userId', createUserSettings)
 router.put('/update_settings/:userId', handleupdateUserSettings)

}  




