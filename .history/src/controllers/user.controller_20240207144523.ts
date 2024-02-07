import express, { Request, Response } from "express";
import { getAllUsers } from "../db/users.db";

export const getAllUser = async (req: Request, res: Response) => {
  try {
    const users = await getAllUsers();
    return res.status(200).json(users);
  } catch (err) {
    console.log(err);
    return res.sendStatus(400);
  }
};
