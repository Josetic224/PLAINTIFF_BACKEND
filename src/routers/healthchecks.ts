import express, { Request, Response } from "express";
import { pingPong } from "../controllers/healthcheck.controller";

export default (router: express.Router) => {
  router.get("/ping", pingPong);
};
