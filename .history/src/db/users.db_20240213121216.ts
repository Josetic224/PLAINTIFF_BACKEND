import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getAllUsers = () => prisma.user.findMany();

export const getUserByEmail = (email: string) =>
  prisma.user.findFirst({ where: { Email: email } });
// UserID     Int      @id @default(autoincrement())
//   Username   String?
//   Password   String
//   Email      String  @unique
//   RoleID     Int

export const createUser = (
  legalFirmName: string,
  password: string,
  email: string
) =>
  prisma.user.create({
    data: {
      Username: legalFirmName,
      Email: email,
      Password: password,
      RoleID: 1,
    },
  });
