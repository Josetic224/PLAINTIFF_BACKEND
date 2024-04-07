-- CreateTable
CREATE TABLE "users" (
    "UserID" TEXT NOT NULL,
    "Username" TEXT,
    "Password" TEXT NOT NULL,
    "Email" TEXT NOT NULL,
    "PhoneNumber" TEXT NOT NULL,
    "Token" TEXT NOT NULL DEFAULT '',
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "RoleID" INTEGER NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("UserID")
);

-- CreateTable
CREATE TABLE "roles" (
    "RoleID" TEXT NOT NULL,
    "RoleName" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("RoleID")
);

-- CreateTable
CREATE TABLE "clients" (
    "ClientID" TEXT NOT NULL,
    "FirstName" TEXT NOT NULL,
    "LastName" TEXT NOT NULL,
    "ContactNumber" TEXT NOT NULL,
    "Email" TEXT NOT NULL,
    "Address" TEXT NOT NULL,
    "Gender" TEXT NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "CaseID" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "clients_pkey" PRIMARY KEY ("ClientID")
);

-- CreateTable
CREATE TABLE "cases" (
    "CaseID" TEXT NOT NULL,
    "CaseName" TEXT NOT NULL,
    "CaseDescription" TEXT NOT NULL,
    "AssignedUserID" TEXT NOT NULL,

    CONSTRAINT "cases_pkey" PRIMARY KEY ("CaseID")
);

-- CreateTable
CREATE TABLE "document" (
    "DocumentID" TEXT NOT NULL,
    "DocumentName" TEXT NOT NULL,
    "FilePath" TEXT NOT NULL,
    "Content" BYTEA NOT NULL,
    "UploadDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ClientID" TEXT NOT NULL,

    CONSTRAINT "document_pkey" PRIMARY KEY ("DocumentID")
);

-- CreateTable
CREATE TABLE "Schedule" (
    "id" TEXT NOT NULL,
    "clientName" TEXT NOT NULL,
    "clientEmail" TEXT NOT NULL,
    "dateOfAppointment" TIMESTAMP(3) NOT NULL,
    "timeOfAppointment" TEXT NOT NULL,
    "scheduleDetails" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Schedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Contact" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "message" TEXT NOT NULL,

    CONSTRAINT "Contact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "settings" (
    "settingsID" TEXT NOT NULL,
    "Firmname" TEXT NOT NULL,
    "Email" TEXT NOT NULL,
    "Location" TEXT,
    "FirmDescription" TEXT,
    "CurrentCountry" TEXT,
    "newUserID" TEXT NOT NULL,

    CONSTRAINT "settings_pkey" PRIMARY KEY ("settingsID")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_Email_key" ON "users"("Email");

-- CreateIndex
CREATE UNIQUE INDEX "users_UserID_key" ON "users"("UserID");

-- CreateIndex
CREATE UNIQUE INDEX "roles_RoleID_key" ON "roles"("RoleID");

-- CreateIndex
CREATE UNIQUE INDEX "clients_Email_key" ON "clients"("Email");

-- CreateIndex
CREATE UNIQUE INDEX "clients_FirstName_Email_key" ON "clients"("FirstName", "Email");

-- CreateIndex
CREATE UNIQUE INDEX "cases_CaseID_key" ON "cases"("CaseID");

-- CreateIndex
CREATE UNIQUE INDEX "document_DocumentID_key" ON "document"("DocumentID");

-- CreateIndex
CREATE UNIQUE INDEX "settings_Email_key" ON "settings"("Email");

-- CreateIndex
CREATE UNIQUE INDEX "settings_newUserID_key" ON "settings"("newUserID");

-- AddForeignKey
ALTER TABLE "roles" ADD CONSTRAINT "roles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("UserID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clients" ADD CONSTRAINT "clients_CaseID_fkey" FOREIGN KEY ("CaseID") REFERENCES "cases"("CaseID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clients" ADD CONSTRAINT "clients_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("UserID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cases" ADD CONSTRAINT "cases_AssignedUserID_fkey" FOREIGN KEY ("AssignedUserID") REFERENCES "users"("UserID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document" ADD CONSTRAINT "document_ClientID_fkey" FOREIGN KEY ("ClientID") REFERENCES "clients"("ClientID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Schedule" ADD CONSTRAINT "Schedule_clientName_clientEmail_fkey" FOREIGN KEY ("clientName", "clientEmail") REFERENCES "clients"("FirstName", "Email") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Schedule" ADD CONSTRAINT "Schedule_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("UserID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "settings" ADD CONSTRAINT "settings_newUserID_fkey" FOREIGN KEY ("newUserID") REFERENCES "users"("UserID") ON DELETE RESTRICT ON UPDATE CASCADE;
