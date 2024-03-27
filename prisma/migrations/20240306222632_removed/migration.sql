-- CreateTable
CREATE TABLE "settings" (
    "settingsID" SERIAL NOT NULL,
    "Firmname" TEXT NOT NULL,
    "Email" TEXT NOT NULL,
    "Location" TEXT,
    "FirmDescription" TEXT,
    "CurrentCountry" TEXT,
    "newUserID" INTEGER NOT NULL,

    CONSTRAINT "settings_pkey" PRIMARY KEY ("settingsID")
);

-- CreateIndex
CREATE UNIQUE INDEX "settings_Email_key" ON "settings"("Email");

-- CreateIndex
CREATE UNIQUE INDEX "settings_newUserID_key" ON "settings"("newUserID");

-- AddForeignKey
ALTER TABLE "settings" ADD CONSTRAINT "settings_newUserID_fkey" FOREIGN KEY ("newUserID") REFERENCES "users"("UserID") ON DELETE RESTRICT ON UPDATE CASCADE;
