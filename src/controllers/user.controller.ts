import express, { Request, Response } from "express";
import {
  getAllUsers,
  getUserByEmail,
  createUser,
  comparePassword,
  updateUser,
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
      throw new Error("User already exists");
    }

    // Create the user
    user = await createUser(legalFirmName, password, email);

    // Send a response indicating success
    return res.status(200).json(user);
  } catch (err: any) {
    // Handle errors
    console.error(err);
    // Send an error response
    return res.status(400).json({ status: false, message: err.message });
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




export const forgotPassword = async (req: Request, res: Response) => {
  const { email, newPassword, confirmPassword } = req.body;
  try {
    // Check if the passwords match
    if (newPassword !== confirmPassword) {
      throw new Error("Passwords do not match");
    }

    const existingUser = await getUserByEmail(email);
    if (!existingUser) {
      throw new Error(`User ${email} does not exist`);
    }

   
    // Update the user's password with the new password
    await updateUser(existingUser.UserID, newPassword);

    // Send a response indicating success
    res.status(200).json({ status: true, message: "Password reset successful. Your password has been updated." });
  } catch (err) {
    // Handle errors
    console.error(err);
    return res.status(400).json({ status: false, message: err || "Password reset failed. Please try again later." });
  }
};

