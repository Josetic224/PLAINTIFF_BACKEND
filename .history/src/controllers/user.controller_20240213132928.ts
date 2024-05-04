import express, { Request, Response } from "express";
import {
  getAllUsers,
  getUserByEmail,
  createUser,
  comparePassword,
} from "../db/users.db";
import * as jwt from "jsonwebtoken";

import { hashSync, compareSync } from "bcrypt";
import { JWT_SECRET } from "../config/secrets";

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

  if (user) {
    throw Error("User already exists");
  }
  user = await createUser(legalFirmName, password, email);

  res.json(user);
};

export const signIn = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const existingUser = await getUserByEmail(email);

  if (!existingUser) {
    throw Error(`User ${email} does not exist`);
  }

  if (!compareSync(password, existingUser.Password)) {
    throw Error(`Incorrect Password ${password}`);
  }

  const token = jwt.sign(
    {
      userId: existingUser.UserID,
    },
    JWT_SECRET
  );

  res.json({ user: existingUser, token });
};
