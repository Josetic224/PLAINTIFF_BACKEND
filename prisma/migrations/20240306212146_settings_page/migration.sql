-- CreateTable
CREATE TABLE "Settings" (
    "SettingsID" SERIAL NOT NULL,
    "Firmname" TEXT NOT NULL,
    "Email" TEXT NOT NULL,
    "Location" TEXT,
    "FirmDescription" TEXT,
    "CurrentCountry" TEXT,
    "approvedUserId" INTEGER NOT NULL,

    CONSTRAINT "Settings_pkey" PRIMARY KEY ("SettingsID")
);

-- AddForeignKey
ALTER TABLE "Settings" ADD CONSTRAINT "Settings_approvedUserId_fkey" FOREIGN KEY ("approvedUserId") REFERENCES "users"("UserID") ON DELETE RESTRICT ON UPDATE CASCADE;
