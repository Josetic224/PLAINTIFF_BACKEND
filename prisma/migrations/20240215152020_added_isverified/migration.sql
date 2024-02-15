-- CreateTable
CREATE TABLE `users` (
    `UserID` INTEGER NOT NULL AUTO_INCREMENT,
    `Username` VARCHAR(191) NULL,
    `Password` VARCHAR(191) NOT NULL,
    `Email` VARCHAR(191) NOT NULL,
    `Token` VARCHAR(191) NOT NULL,
    `isVerified` BOOLEAN NOT NULL DEFAULT false,
    `RoleID` INTEGER NOT NULL,

    UNIQUE INDEX `users_Email_key`(`Email`),
    UNIQUE INDEX `users_UserID_key`(`UserID`),
    PRIMARY KEY (`UserID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `roles` (
    `RoleID` INTEGER NOT NULL AUTO_INCREMENT,
    `RoleName` VARCHAR(191) NOT NULL,
    `userId` INTEGER NOT NULL,

    UNIQUE INDEX `roles_RoleID_key`(`RoleID`),
    PRIMARY KEY (`RoleID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `clients` (
    `ClientID` INTEGER NOT NULL AUTO_INCREMENT,
    `FirstName` VARCHAR(191) NOT NULL,
    `LastName` VARCHAR(191) NOT NULL,
    `ContactNumber` VARCHAR(191) NOT NULL,
    `Email` VARCHAR(191) NOT NULL,
    `Address` VARCHAR(191) NOT NULL,
    `CaseID` INTEGER NULL,
    `userId` INTEGER NOT NULL,

    UNIQUE INDEX `clients_ClientID_key`(`ClientID`),
    PRIMARY KEY (`ClientID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cases` (
    `CaseID` INTEGER NOT NULL AUTO_INCREMENT,
    `CaseName` VARCHAR(191) NOT NULL,
    `CaseDescription` VARCHAR(191) NOT NULL,
    `CaseStatus` VARCHAR(191) NOT NULL,
    `AssignedUserID` INTEGER NOT NULL,

    UNIQUE INDEX `cases_CaseID_key`(`CaseID`),
    PRIMARY KEY (`CaseID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `document` (
    `DocumentID` INTEGER NOT NULL AUTO_INCREMENT,
    `DocumentName` VARCHAR(191) NOT NULL,
    `FilePath` VARCHAR(191) NOT NULL,
    `UploadDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `ClientID` INTEGER NOT NULL,

    UNIQUE INDEX `document_DocumentID_key`(`DocumentID`),
    PRIMARY KEY (`DocumentID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `communication` (
    `CommunicationID` INTEGER NOT NULL AUTO_INCREMENT,
    `CommunicationType` VARCHAR(191) NOT NULL,
    `CommunicationDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `Description` VARCHAR(191) NOT NULL,
    `ClientID` INTEGER NOT NULL,

    UNIQUE INDEX `communication_CommunicationID_key`(`CommunicationID`),
    PRIMARY KEY (`CommunicationID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `roles` ADD CONSTRAINT `roles_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`UserID`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `clients` ADD CONSTRAINT `clients_CaseID_fkey` FOREIGN KEY (`CaseID`) REFERENCES `cases`(`CaseID`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `clients` ADD CONSTRAINT `clients_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`UserID`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cases` ADD CONSTRAINT `cases_AssignedUserID_fkey` FOREIGN KEY (`AssignedUserID`) REFERENCES `users`(`UserID`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `document` ADD CONSTRAINT `document_ClientID_fkey` FOREIGN KEY (`ClientID`) REFERENCES `clients`(`ClientID`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `communication` ADD CONSTRAINT `communication_ClientID_fkey` FOREIGN KEY (`ClientID`) REFERENCES `clients`(`ClientID`) ON DELETE RESTRICT ON UPDATE CASCADE;
