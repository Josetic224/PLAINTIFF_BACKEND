-- CreateTable
CREATE TABLE "Contact" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "registeredUserId" INTEGER NOT NULL,

    CONSTRAINT "Contact_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Contact" ADD CONSTRAINT "Contact_registeredUserId_fkey" FOREIGN KEY ("registeredUserId") REFERENCES "users"("UserID") ON DELETE RESTRICT ON UPDATE CASCADE;
