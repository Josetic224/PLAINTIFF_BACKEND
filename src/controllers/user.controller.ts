import express, { Request, Response } from "express";
import {
  getAllUsers,
  getUserByEmail,
  createUser,
  comparePassword,
  getUserById,
  jwtverify,
  updateUser,
  verification,
  createNewToken,
} from "../db/users.db";
import * as jwt from "jsonwebtoken";

import { hashSync, compareSync } from "bcrypt";

import { sendEmail } from "../middleware/nodemailer";

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
    if(!email || !password || !legalFirmName){
      res.status(400).json("one or more input fields are empty")
    }
    let user = await getUserByEmail(email);

    if (user) {
      throw new Error("User already exists");
    }

    //sign the user
    // Create the user
    user = await createUser(legalFirmName, password, email);



    const subject = 'Email Verification'
    //jwt.verify(token, process.env.secret)
    const link = `${req.protocol}://${req.get('host')}/api_v1/verify/${user.UserID}/${user.Token}`
    const html = `<a href="${link}">Click here to verify your email</a>`;
    sendEmail({
        email: user.Email,
        html,
        subject
    })

    // Send a response indicating success
    return res.status(200).json(user);
  } catch (err: any) {
    // Handle errors
    console.error(err);
    // Send an error response
    return res.status(400).json({ status: false, message: err.message });
  }
};

//verify email function

export const verifyPassword = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    const token = req.params.token;

    // Get the intended user by id
    const user = await getUserById(id);

    if (!user) {
      throw new Error("User not found");
    }

    // Verify the token after getting the user ID
    await jwtverify(token);

    // If the verification was successful, update the user's isVerified status
    const updatedUser = await verification(user.UserID, true);

   if(updatedUser.isVerified ===true){
    return res.status(200).send("<h1>You have been successfully verified. Kindly visit the login page.</h1>");

   }
//write the function if there is error in verifying the token
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      // Handle token expiration
      const id = parseInt (req.params.id, 10);
      const updatedUser = await getUserById(id)
      
      if (updatedUser) {
        // Create a new token for the user
        const newToken = await createNewToken({ email: updatedUser.Email });
  
        // Update the user's token with the new one
        updatedUser.Token = newToken;
      // Save the updated user with the new token
      const savedUser = await updateUser(updatedUser.UserID, newToken);

      const link = `${req.protocol}://${req.get('host')}/api_v1/verify/${updatedUser.UserID}/${updatedUser.Token}`;
      console.log(link)
      sendEmail({
        email: updatedUser.Email,
        html: `<a href="${link}">Click here to verify your email</a>`,
        subject: "RE-VERIFY YOUR ACCOUNT"
      });
      return res.status(401).send("<h1>This link is expired. Kindly check your email for another email to verify.</h1>");

    }  else {
      return res.status(500).json({
        message:error.message,
      });
    }
  }

    }


  }



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

    res.json({ user: existingUser });
  } catch (err: any) {
    return res.status(400).json({ status: false, message: err.message });
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
