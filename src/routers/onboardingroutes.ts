import express, { Application, Request, Response } from "express";
import {signup as signupController } from "../cont"
export default (router: express.Router) => {
    router.post("/signupuser",signupController)
}
import router = express.Router();

router.post('/signup', signupController.signup);
export const signup = async (req: Request, res: Response) => {
  // your signup logic here
}
module.exports = router;

