import express, { Request, Response } from "express";
import { getAllUsers } from "../db/users.db";

export const getAllUser = async (req: Request, res: Response) => {
  try {
    const users = await getAllUsers();
  } catch (err) {}
};
