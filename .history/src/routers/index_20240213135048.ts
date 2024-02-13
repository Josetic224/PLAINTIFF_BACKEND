import express from "express";
import users from "./users";
import healthchecks from "./healthchecks";

const router = express.Router();

export default (): express.Router => {
  users(router);
  healthchecks(router);

  return router;
};
