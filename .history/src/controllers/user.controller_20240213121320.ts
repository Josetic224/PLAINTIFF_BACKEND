import express, { Request, Response } from "express";
import { getAllUsers, getUserByEmail } from "../db/users.db";

export const getAllUsersController = async (req: Request, res: Response) => {
  try {
    const users = await getAllUsers();
    return res.status(200).json(users);
  } catch (err) {
    console.log(err);
    return res.sendStatus(400);
  }
};

export const signUp = async (req: Request, res: Response) => { 

  const { email, password, legalFirmName } = req.body;

  let user = await getUserByEmail(email);

  if (!user) { 
    throw Error("User already exists")
  }

  user = await 
}
