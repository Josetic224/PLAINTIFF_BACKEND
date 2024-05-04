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
  } catch (err: any) {
    console.log(err);
    return res.sendStatus(400).json({ status: "false", message: err.message });
  }
};

export const signUp = async (req: Request, res: Response) => {
  const { email, password, legalFirmName } = req.body;

  try {
    let user = await getUserByEmail(email);

    if (user) {
      throw Error("User already exists");
    }
    user = await createUser(legalFirmName, password, email);
    return res.status(200).json(user);
  } catch (err: any) {
    return res.sendStatus(400).json({ status: "false", message: err.message });
  }
};

export const signIn = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
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
  } catch (err: any) {
    return res.sendStatus(400).json({ status: "false", message: err.message });
  }
};
