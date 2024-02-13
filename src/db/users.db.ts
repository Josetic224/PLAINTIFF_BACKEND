import { PrismaClient } from "@prisma/client";
import { hashSync, compareSync } from "bcrypt";
import * as jwt from "jsonwebtoken";

const prisma = new PrismaClient();

export const getAllUsers = () => prisma.user.findMany();

export const getUserByEmail = (email: string) =>
  prisma.user.findFirst({ where: { Email: email } });

  export const getUserById = (id:number) =>
  prisma.user.findFirst({ where: { UserID:id} });

export const createUser = (
  legalFirmName: string,
  password: string,
  email: string
) =>
  prisma.user.create({
    data: {
      Username: legalFirmName,
      Email: email,
      Password: hashSync(password, 10),
      RoleID: 1,
    },
  });

export const comparePassword = async (password: string, user: object) => {
  if (!compareSync(password, "jsdhjdjh")) {
    return false;
    // throw Error(`Incorrect Password ${password}`);
  }
  return true;
};




export const updateUser = async ( id:number, newPassword: string) => {
  try {
    // Update the user's email and password
    const updatedUser = await prisma.user.update({
      where: { UserID:id },
      data:
       {
        Password:hashSync(newPassword,10)
       },
    });

    return updatedUser;
  } catch (error) {
    // Handle errors
    console.error("Error updating user:", error);
    throw new Error("Failed to update user.");
  }
};

