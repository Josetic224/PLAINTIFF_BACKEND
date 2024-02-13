import { PrismaClient } from "@prisma/client";
import { hashSync, compareSync } from "bcrypt";
import * as jwt from "jsonwebtoken";

const prisma = new PrismaClient();

export const getAllUsers = () => prisma.user.findMany();

export const getUserByEmail = (email: string) =>
  prisma.user.findFirst({ where: { Email: email } });

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

export const comparePassword = (password: string, email: string) => {
  const existingUser = getUserByEmail(email);

  if (!existingUser) {
    throw Error(`User ${email} does not exist`);
  }
  if (!compareSync(password, "jsdhjdjh")) {
    throw Error(`Incorrect Password ${password}`);
  }
};
