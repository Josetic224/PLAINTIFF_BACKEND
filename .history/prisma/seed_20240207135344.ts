import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function run() {
  const user = await prisma.user.upsert({
    where: { Email: "mqrksimon@gmail.com" },
    update: {},
    create: {
      Email: "mqrksimon@gmail.com",
      Username: "mqrksimon",
    },
  });
}
