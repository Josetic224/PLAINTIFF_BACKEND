import express, { Request, Response } from "express";
import { getAllUsersController } from "../controllers/user.controller";
import{signUp, logIn} from "../controllers/onboarding.js"
import { handleValidationErrors, validateUserRegistration } from "../validation/validator";
export default (router: express.Router) => {
  router.get("/users", getAllUsersController);

  router.post("/user/signup",validateUserRegistration,handleValidationErrors,signUp );
  router.post("/user", logIn)
};
