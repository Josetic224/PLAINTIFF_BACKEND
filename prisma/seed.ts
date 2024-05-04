import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function run() {
  const user = await prisma.user.upsert({
    where: { Email: "mqrksimon@gmail.com" },
    update: {},
    create: {
      Email: "mqrksimon@gmail.com",
      Username: "mqrksimon",
      Password: "your_password", // Add a password field here
      RoleID: 1,
    },
  });

  console.log({ user });
}

run()
  .catch((e) => {
    console.log(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
