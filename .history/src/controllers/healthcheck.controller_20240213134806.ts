import express, { Request, Response } from "express";

export const pingPong = (req: Request, res: Response) => {
  return res.status(200).send("PONG");
};
