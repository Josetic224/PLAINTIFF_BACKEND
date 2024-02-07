import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getAllUsers = () => prisma.user.findMany();
