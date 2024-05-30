import express, { NextFunction, Request, Response } from "express";
import { Case, Client, Prisma, PrismaClient, Schedule, User } from '@prisma/client';
import nodemailer from "nodemailer"
import dotenv from "dotenv";
import passport from"passport"
import path from "path";
import { Readable } from "stream";
import fs from "fs"
import crypto from "crypto"

import multer from 'multer'

import {v2 as cloudinary} from 'cloudinary';
dotenv.config({path:".env"})

cloudinary.config({ 
  cloud_name: process.env.CLOUD_NAME, 
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET
});




dotenv.config({ path: ".env" });
const prisma = new PrismaClient();
import * as  exceljs from "exceljs";

import {
  getAllUsers,
  getUserByEmail,
  createUser,
  comparePassword,
  getUserById,
  jwtverify,
  verification,
  createNewToken,
  updateUserPassword,
  updateUserToken,
  destroyToken,
  createClientManually,
  createClientBatchUpload,
  getAllClients,
  getClientByLastname,
  getClientByCaseId,
  getClientByFirstname,
  getAClient,
  checkClientExists,
  uploadDocument,
  getAllDocuments,
  createSettings,
  updateSettings,
  contactCompany,
  getOneDocument,
  updateUserOTP
} from "../db/users.db";
import * as jwt from "jsonwebtoken";

import { hashSync, compareSync } from "bcrypt";

import { sendEmail } from "../middleware/nodemailer";
import { generateDynamicEmail } from "../middleware/html";
import { generateEmailTemplate } from "../Appointment";
import { JWT_SECRET } from "../config/secrets";
import { resetEmail } from "../middleware/resetEmail";
import { error, log } from "console";
import { fsync } from "fs";
import { sendOTPEmail } from "../middleware/otp";




export const getAllUsersController = async (req: Request, res: Response) => {
  try {
    const users = await getAllUsers();
    return res.status(200).json(users);
  } catch (err: any) {
    console.log(err);
    return res.sendStatus(400).json({ status: "false", message: err.message });
  }
};


export const signUp = async (req: Request, res: Response) => {
  const { email, password, confirmPassword, PhoneNumber, FirmName } = req.body;
console.log(req.body)
  try {
    if (!email || !password || !FirmName || !PhoneNumber) {
      res.status(400).json("one or more input fields are empty")
    }
    let user = await getUserByEmail(email);

    if (user) {
      throw new Error("Email already exists");
    }
  
    if (password !== confirmPassword) {
      return res.status(401).json("both passwords do not match")
    }
 
    //sign the user
    // Create the user
    user = await createUser(FirmName, password, email, PhoneNumber);



    const subject = 'Email Verification'
    //jwt.verify(token, process.env.secret)
    const link = `https://plaintiffaid.vercel.app/#/verification/${user.Token}`
    
    const html = generateDynamicEmail(link, FirmName)
    sendEmail({
      email: user.Email,
      html,
      subject
    })

    // Send a response indicating success
    return res.status(200).json({
      message:"Signup Successful please click the link sent to your Email to verify your account!",
      user
    });
  } catch (err: any) {
    // Handle errors
    console.error(err);
    // Send an error response
    return res.status(500).json({ status: false, message: err.message });
  }
};

//verify email function



export const verifyEmail = async (req: Request, res: Response): Promise<void> => {
  try {
    const token: string = req.params.Token;
    
    // Verify the token
    const decodedToken: any = await jwtverify(token);

    // Extract the email from the decoded token
    const email: string = decodedToken.email;

    // Retrieve the user by email
    const user = await getUserByEmail(email);

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    // If the user is already verified, return a message
    if (user.isVerified) {
      res.status(200).json({ message: "User is already verified" });
      return;
    }

    // Update the user's isVerified status
    const updatedUser = await verification(user.UserID, true);

    if (updatedUser.isVerified) {
     res.redirect(`https://plaintiffaid.vercel.app/#/login`),
     res.status(200).json("user has been verified") // Send the login link in the response
      return;
    } else {
      res.status(400).json({ message: "Verification failed" });
      return;
    }
  } catch (error:any) {
    // Handle token verification errors
    if (error instanceof jwt.JsonWebTokenError) {
      // Handle token expiration
      try {
        const token: string = req.params.Token; // Define token here

        const decodedToken: any = jwt.decode(token);

        // Extract the email from the decoded token
        const email: string = decodedToken.email;

        // Retrieve the user by email
        const user = await getUserByEmail(email);

        if (!user) {
          res.status(404).json({ message: "User not found" });
          return;
        }

        // Create a new token for the user
        const Token = await createNewToken({ email: user.Email });

        // Update the user's token with the new one
        const updatedUser = await updateUserToken(user.UserID, Token);

        // Send re-verification email
        const link = `https://plaintiffaid.vercel.app/#/verification/${user.Token}`;
        sendEmail({
          email: user.Email,
          html: generateDynamicEmail(link, user.Username),
          subject: "RE-VERIFY YOUR ACCOUNT"
        });

        // Inform the user that the link is expired and a new email has been sent for re-verification
        res.status(401).json({ message: "This link is expired. Kindly check your email for another email to verify." });
        return;
      } catch (error:any) {
        res.status(500).json({ message: error.message });
        return;
      }
    } else {
      // Other errors
      res.status(500).json({ message: error.message });
      return;
    }
  }
};




export const signIn = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const existingUser = await getUserByEmail(email);
    if (!existingUser) {
      throw new Error(`User ${email} does not exist`);
    }

    if(existingUser.isVerified == false){
      res.status(403).json({
        message:"This user is not Verified. please click the Link sent to your Email to verify your account!"
      })
      return;
    }

    const checkPassword = await comparePassword(password, existingUser.Password);
    if (!checkPassword) {
      return res.status(400).json("Incorrect password");
    }

    // Generate OTP
    const otp = crypto.randomInt(100000, 999999).toString();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // OTP valid for 10 minutes

    // Update user with OTP and expiry time
    await updateUserOTP(existingUser.UserID, otp, otpExpiresAt);

    // Send OTP to user's email
            sendOTPEmail(otp, existingUser.Username);
    sendEmail({
      email: existingUser.Email,
      html:  sendOTPEmail(otp, existingUser.Username),
      subject: "OTP"
    });

    console.log(sendOTPEmail)

    res.status(200).json({
      message: 'OTP sent to your email. Please verify to continue.',
    });
  } catch (err: any) {
    return res.status(500).json({ status: false, message: err.message });
  }
};


export const verifyOTP = async (req: Request, res: Response) => {
  const { email, otp } = req.body;

  try {
    const existingUser = await getUserByEmail(email);
    if (!existingUser) {
      console.log(`User ${email} does not exist`);
      return res.status(404).json({ message: `User ${email} does not exist` });
    }

    const currentTime = new Date();
    console.log(`User: ${existingUser.Email}, Stored OTP: ${existingUser.OTP}, Provided OTP: ${otp}, OTP Expires At: ${existingUser.OTPExpiresAt}, Current Time: ${currentTime}`);

    // Check if OTP is correct and not expired
    if (!existingUser.OTP || !existingUser.OTPExpiresAt || existingUser.OTP !== otp || existingUser.OTPExpiresAt < currentTime) {
      // Generate a new OTP
      const newOtp = crypto.randomInt(100000, 999999).toString();
      const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // OTP valid for 10 minutes

      // Update user with new OTP and expiry time
      await updateUserOTP(existingUser.UserID, newOtp, otpExpiresAt);
      console.log(`Generated new OTP: ${newOtp} for user: ${email}`);
      await sendOTPEmail(existingUser.Email, newOtp);

      return res.status(400).json("Invalid or expired OTP. A new OTP has been sent to your email.");
    }

    // Clear OTP and expiry time
    await updateUserOTP(existingUser.UserID, null, null);

    // Create a token for the logged-in user
    const token = await createNewToken({ email: existingUser.Email, id: existingUser.UserID });

    // Assign the token to the existingUser's Token property
    existingUser.Token = token;

    // Update the user record in the database with the new token
    await updateUserToken(existingUser.UserID, token);

    if (existingUser.isVerified) {
      return res.status(200).json({
        message: `Welcome, ${existingUser.Username}!`,
        data: existingUser,
      });
    } else {
      return res.status(400).json("Sorry, you are not verified yet! Check email for verification link.");
    }
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ status: false, message: err.message });
  }
};


//write the function for forgot Password
export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    // Find user by email
    const user = await getUserByEmail(email)

    // If user with the provided email doesn't exist, return error
    if (!user) {
      return res.status(404).json({ status: false, message: 'User not found' });
    }

    // Generate password reset token with short expiration time (e.g., 15 minutes)
    const token = jwt.sign({ userId: user.UserID }, JWT_SECRET, { expiresIn: '15m' });

    // Send email with password reset link
    const link = `https://plaintiffaid.vercel.app/#/newpassword/${token}`
    const firmName = user.Username
    console.log(firmName)
  const html = await resetEmail(link, firmName)
  const subject = `PLAINTIFFAID RESET PASSWORD`
  sendEmail({
    email: user.Email,
    html,
    subject
  })
    // Respond with success message
    res.status(200).json({ status: true, message: 'Password reset email sent' });
  } catch (error:any) {
    // Handle errors
    console.error('Error in forgotPassword:', error);
    res.status(500).json({ status: false, message: error.message });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token } = req.query; // Retrieve token from query parameters
    const { newPassword} = req.body;

    if (!token || typeof token !== 'string') {
      return res.status(400).json({ status: false, message: 'Invalid token' });
    }

    // Check if newPassword and confirmPassword match
    if (!newPassword) {
      return res.status(400).json({ status: false, message: 'Password has been used before' });
    }

    // Verify the token
    const decodedToken: any = jwt.verify(token, JWT_SECRET);

    // Extract user ID from the token payload
    const userId = decodedToken.userId;

    // Find user by ID
    const user = await getUserById(userId)

    // If user doesn't exist or token is invalid, return error
    if (!user) {
      return res.status(404).json({ status: false, message: 'User not found or invalid token' });
    }

    // Update user's password (you'll need to hash the password)
    await updateUserPassword(userId,newPassword) // Update password with the new one
   

    // Respond with success message
    res.status(200).json({ status: true, message: 'Password reset successful' });
  } catch (error:any) {
    // Handle errors
    console.error('Error in resetPassword:', error);
    res.status(500).json({ status: false, message: error.message });
  }
};



//function to sign out the user... 
export const signOut = async (req: Request, res: Response) => {
  try {
    const userId = req.params.UserID

    // Get user by id
    const user = await getUserById(userId);
    if (!user) {
      return res.status(400).json("User doesn't exist");
    }

    // Check if the user's token is already null or not a string
    if (user.Token === "") {
      // Respond with a message indicating that the user is already signed out
      return res.status(400).json({ message: 'User is already signed out' });
    }

    // Update user's token to an empty string
    await destroyToken(userId);

    // Respond with success message
    return res.status(200).json({ message: 'User signed out successfully' });
  } catch (error) {
    // Handle errors
    console.error('Error signing out user:', error);
    return res.status(500).json(error);
  }
};




// //create a client manually
// export const createClientController = async (req: Request, res: Response) => {
//   const { firstname, lastname, contactNumber, email, address, Gender, caseName, CaseDescription } = req.body;

//   try {
//     // Check if request body is missing
//     if (!req.body || Object.keys(req.body).length == 0) {
//       return res.status(400).json({ error: "empty field" });
//     }

//     // Validate firstname
//     if (!firstname || typeof firstname !== 'string') {
//       return res.status(400).json({ error: "Firstname field is empty or contains invalid characters" });
//     }

//     // Validate lastname
//     if (!lastname || typeof lastname !== 'string') {
//       return res.status(400).json({ error: "Lastname field is empty or contains invalid characters" });
//     }

//     // Validate contactNumber
//     if (!contactNumber || typeof contactNumber !== 'string' || !/^\d{11}$/.test(contactNumber)) {
//       return res.status(400).json({ error: "Contact number is required and must be a 10-digit number" });
//     }

//     // Validate email
//     if (!email || typeof email !== 'string' || !/\S+@\S+\.\S+/.test(email)) {
//       return res.status(400).json({ error: "Email field is empty or contains invalid characters" });
//     }

//     // Validate address
//     if (!address || typeof address !== 'string') {
//       return res.status(400).json({ error: "Address field is empty or contains invalid characters" });
//     }

//     // Validate Gender
//     if (!Gender || typeof Gender !== 'string') {
//       return res.status(400).json({ error: "Gender is empty or contains invalid Characters" });
//     }

//     // Validate caseName
//     if (!caseName || typeof caseName !== 'string') {
//       return res.status(400).json({ error: "caseName is empty or contains invalid Characters" });
//     }

//     // Validate CaseDescription
//     if (!CaseDescription || typeof CaseDescription !== 'string') {
//       return res.status(400).json({ error: "Case description is empty or contains invalid Characters" });
//     }

//     // Continue with your existing code
//     const userId = req.params.UserID; // Extract userId from URL params
//     const files = req.files as unknown as { [fieldname: string]: UploadedFile[] }; // Type assertion

//     if (!files || Object.keys(files).length === 0) {
//       res.status(400).json("No files provided");
//       return;
//     }
//     const authenticatedUser = await getUserById(userId);

//     if (!authenticatedUser) {
//       return res.status(403).json("Forbidden");
//     }

//     if (userId !== authenticatedUser.UserID) {
//       return res.status(403).json("Forbidden");
//     }
//     const newClient = await createClientManually(userId, firstname, lastname, contactNumber, email, address, Gender, caseName, CaseDescription, userId);

    
//     res.status(201).json(newClient);
//   } catch (error:any) {
//     res.status(500).json({message:error.message})
//   }
// };
// export const createClientController = async (req: Request, res: Response) => {
//   const { firstname, lastname, contactNumber, email, address, Gender, caseName, CaseDescription } = req.body;
//   const userId = req.params.UserID; // Extract userId from URL params

//   try {
//     const authenticatedUser = await getUserById(userId);

//     if (!authenticatedUser) {
//       return res.status(403).json("Forbidden");
//     }

//     if (userId !== authenticatedUser.UserID) {
//       return res.status(403).json("Forbidden");
//     }

//     // Check if request body is missing
//     if (!req.body) {
//       return res.status(400).json({ error: "Empty field" });
//     }

//     // Validate firstname
//     if (!firstname) {
//       return res.status(400).json({ error: "Firstname field is empty or contains invalid characters" });
//     }

//     // Validate lastname
//     if (!lastname || typeof lastname !== 'string') {
//       return res.status(400).json({ error: "Lastname field is empty or contains invalid characters" });
//     }

//     // Validate contactNumber
//     if (!contactNumber || typeof contactNumber !== 'string' || !/^\d{11}$/.test(contactNumber)) {
//       return res.status(400).json({ error: "Contact number is required and must be an 11-digit number" });
//     }

//     // Validate email
//     if (!email || typeof email !== 'string' || !/\S+@\S+\.\S+/.test(email)) {
//       return res.status(400).json({ error: "Email field is empty or contains invalid characters" });
//     }

//     const existingClient = await prisma.client.findUnique({
//       where: { Email: email }
//     });
//     if (existingClient) {
//       return res.status(401).json({ error: "Client with this email already exists" });
//     }

//     // Validate address
//     if (!address || typeof address !== 'string') {
//       return res.status(400).json({ error: "Address field is empty or contains invalid characters" });
//     }

//     // Validate Gender
//     if (!Gender || typeof Gender !== 'string') {
//       return res.status(400).json({ error: "Gender is empty or contains invalid characters" });
//     }

//     // Validate caseName
//     if (!caseName || typeof caseName !== 'string') {
//       return res.status(400).json({ error: "caseName is empty or contains invalid characters" });
//     }

//     // Validate CaseDescription
//     if (!CaseDescription || typeof CaseDescription !== 'string') {
//       return res.status(400).json({ error: "Case description is empty or contains invalid characters" });
//     }

//     // Create the client and associate it with the user and case
//     const newClient = await prisma.client.create({
//       data: {
//         FirstName: firstname,
//         LastName: lastname,
//         ContactNumber: contactNumber,
//         Email: email,
//         Address: address,
//         Gender: Gender,
//         Case: {
//           create: {
//             CaseName: caseName,
//             CaseDescription: CaseDescription,
//             AssignedUser: {
//               connect: { UserID: userId }
//             }
//           }
//         },
//         User: {
//           connect: { UserID: userId }
//         }
//       }
//     });

//     console.log(newClient);

//     const uploadedDocuments: any[] = [];

//     // Handle file uploads and save document information if files are provided
//     if (req.files && Object.keys(req.files).length > 0) {
//       // Type assertion for files
//       const files = req.files as unknown as { [fieldname: string]: UploadedFile[] };

//       // Iterate over each field name in req.files
//       for (const fieldName in files) {
//         if (Object.prototype.hasOwnProperty.call(files, fieldName)) {
//           const file = files[fieldName]; // Get the file(s) for this field name

//           // If there's only one file, convert it to an array to unify handling
//           const fileList = Array.isArray(file) ? file : [file];

//           // Process each file in the fileList
//           for (const singleFile of fileList) {
//             const result = await cloudinary.uploader.upload(singleFile.tempFilePath, {
//               public_id: `${Date.now()}`,
//               resource_type: "auto"
//             });

//             const document = {
//               name: singleFile.name,
//               path: result.secure_url
//             };

//             const uploadedDocument = await uploadDocument(newClient.ClientID, document, userId);
//             uploadedDocuments.push(uploadedDocument);
//           }
//         }
//       }
//     }

//     // Send response
//     res.status(201).json({
//       message: "Client created successfully",
//       newClient: newClient,
//       uploadedDocuments: uploadedDocuments
//     });
//   } catch (error: any) {
//     res.status(500).json({ message: "forbidden" });
//     console.log(error);
//   }
// };


export const createClientController = async (req: Request, res: Response) => {
  // Extract userId from URL params
  const userId = req.params.UserID;

  try {
    // Check if user is authenticated
    const authenticatedUser = await getUserById(userId);
    if (!authenticatedUser) {
      return res.status(403).json("Forbidden");
    }

    // Process text fields
    const { firstname, lastname, contactNumber, email, address, Gender, caseName, CaseDescription } = req.body;

    // Validate text fields...
  // Check if request body is missing
  if (!req.body) {
     res.status(400).json({ error: "Request body is missing" });
     return;
  }

  // Validate firstname
  if (!firstname || typeof firstname !== 'string') {
    res.status(400).json({ error: "Firstname field is empty or contains invalid characters" });
    return;
  }

  // Validate lastname
  if (!lastname || typeof lastname !== 'string') {
     res.status(400).json({ error: "Lastname field is empty or contains invalid characters" });
     return;
  }

  // Validate contactNumber
  if (!contactNumber || typeof contactNumber !== 'string' || !/^\d{11}$/.test(contactNumber)) {
     res.status(400).json({ error: "Contact number is required and must be a 10-digit number" });
    return;
  }

  // Validate email
  if (!email || typeof email !== 'string' || !/\S+@\S+\.\S+/.test(email)) {
   res.status(400).json({ error: "Email field is empty or contains invalid characters" });
   return;
  }
  const getUserByEmail= await prisma.user.findUnique({where:{Email:email}})

    if(getUserByEmail){
      res.status(401).json("Please enter a Unique Email")
      return;
    }

  // Validate address
  if (!address || typeof address !== 'string') {
    return res.status(400).json({ error: "Address field is empty or contains invalid characters" });
  }
  const errors: string[] = [];  // Validate Gender
  const validGenders = ['Male', 'Female'];
  if (!Gender || !validGenders.includes(Gender)) {
   res.status(400).json({error:'Invalid or missing Gender'});
   return;
  }
  

  // Validate caseName
  if (!caseName || typeof caseName !== 'string') {
    return res.status(400).json({ error: "caseName is empty or contains invalid Characters" });
  }

  // Validate CaseDescription
  if (!CaseDescription || typeof CaseDescription !== 'string') {
    return res.status(400).json({ error: "Case description is empty or contains invalid Characters" });
  }
    // Create the client and associate it with the user and case
    const newClient = await prisma.client.create({
      data: {
        FirstName: firstname,
        LastName: lastname,
        ContactNumber: contactNumber,
        Email: email,
        Address: address,
        Gender: Gender,
        Case: {
          create: {
            CaseName: caseName,
            CaseDescription: CaseDescription,
            AssignedUser: {
              connect: { UserID: userId }
            }
          }
        },
        User: {
          connect: { UserID: userId }
        }
      }
    });

    // Handle file uploads and save document information if files are provided
    const uploadedDocuments: any[] = [];
    if (req.files && Array.isArray(req.files)) {
      for (const file of req.files as Express.Multer.File[]) {
        console.log(`Processing file: ${file.filename}`);
        // Here you can save document information without using Cloudinary
        const document = {
          name: file.originalname,
          // Assuming you have a file storage system, save the path accordingly
          path: `../uploads/${file.originalname}` // Example path
        };
        // Save document information to your database
        const uploadedDocument = await uploadDocument(newClient.ClientID, document, userId);
        uploadedDocuments.push(uploadedDocument);
      }
    }
    // Send response
    res.status(201).json({
      message: "Client created successfully",
      newClient: newClient,
      uploadedDocuments: uploadedDocuments
    });
  } catch (error: any) {
    res.status(500).json({ message: "Internal Server Error" });
    console.log(error.message);
  }
};


export const downloadTemplateController = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId: string = req.params.UserID;
    const user = await getUserById(userId);
    if (!user) {
      res.status(403).json("Forbidden");
      return;
    }

    // Create Excel workbook
    const workbook = new exceljs.Workbook();
    const worksheet = workbook.addWorksheet('Clients');

    // Clear existing worksheet content
    worksheet.spliceRows(1, worksheet.rowCount); // Remove all existing rows

    // Add headers to the worksheet
    worksheet.addRow(['FirstName', 'LastName', 'ContactNumber', 'Email', 'Address', 'Gender', 'CaseName', 'CaseDescription']);

    // Generate the Excel file in memory
    const excelBuffer = await workbook.xlsx.writeBuffer();

    // Set response headers
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="Plaintiff_Aid.xlsx"');

    // Send the file content as response
    res.status(200).send(excelBuffer);
  } catch (error) {
    console.error('Error downloading template:', error);
    res.status(500).send('Internal server error');
  }
};


export const ClientBatchUpload = async (req: Request, res: Response) => {
  const userId =req.params.UserID
  const assignedUserId =req.params.AssignedUserID // Parse assignedUserId as well

  try {
    // Check if user is authenticated
    const user = await getUserById(userId);
    if (!user) {
      return res.status(403).json("Forbidden");
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const workbook = new exceljs.Workbook();

    // Read the Excel file from memory
    await workbook.xlsx.load(req.file.buffer);

    // Get the first worksheet
    const worksheet = workbook.getWorksheet(1);

    if (!worksheet) {
      throw new Error("Worksheet not found");
    }

    // Initialize row array
    const clientsData: any[] = [];
    interface ClientData {}
    
    // Enum for gender
    const validGenders = ['male', 'female']; // Updated to lowercase
        // Initialize array to store created clients
          // Initialize array to store created clients
          const createdClients: ClientData[] = [];


    // Iterate through each row in the worksheet and push to clientsData
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber > 1) { // Skip header row
        clientsData.push(row.values);
      }
    });

    // Save data to database
    await Promise.all(clientsData.map(async (row: any[]) => {
      const [_, FirstName, LastName, ContactNumber, EmailObj, Address, Gender, CaseName, CaseDescription] = row;

      // Extracting email from the object
      const Email = typeof EmailObj === 'object' && EmailObj.text ? EmailObj.text : '';

      // Ensure all fields are valid
      const genderString = String(Gender).trim().toLowerCase(); // Convert to lowercase
      if (!validGenders.includes(genderString)) {
        throw new Error(`Invalid gender value, Gender value must be either male or female`);
        return;
      }
      
      // Ensure other fields are not empty
      if (!FirstName || !LastName || !ContactNumber || !Email || !Address || !CaseName || !CaseDescription) {
        throw new Error(`One or more fields are missing in row `);
        return;
      }

      // Validate ContactNumber format
      if (!/^\d{11}$/.test(ContactNumber)) {
        throw new Error(`Invalid ContactNumber, ContactNumber must have 11 digits`);
        return;
      }

      // Check if a client with the same email already exists
      const existingClient = await prisma.client.findUnique({
        where: {
          Email: Email,
        },
      });
      if (existingClient) {
        throw new Error(`Client with email ${Email} already exists`);
        return;
      }

      // Create client and push to createdClients array
      const newClient = await createClientBatchUpload(userId, FirstName, LastName, ContactNumber, Email, Address, genderString, CaseName, CaseDescription, assignedUserId);
      createdClients.push(newClient);
    }));


    res.status(200).json({ message: 'Data uploaded successfully', data:createdClients});
  } catch (error: any) {
    console.error('Error uploading file:', error);
    res.status(500).json({ message: error.message });
  }
};






export const Allclients = async (req: Request, res: Response) => {
  //perform the try catch 
  try {
    const userId = req.params.UserID;
    const user = await getUserById(userId)
    if (!user) {
      res.status(403).json("forbidden")
    }
    const getClients = await getAllClients(userId)
    if (!getClients) {
      return res.status(401).json({
        status: false,
        message: "no clients found"
      })
    }
    res.status(200).json({
      status: true,
      data: getClients
    })

  } catch (error: any) {
    res.status(500).json({
      status: false,
      message: error.message
    })
  }
}

export const clientById = async (req: Request, res: Response) => {
  try {
    const userId = req.params.userID;
    const clientId = req.params.clientID;
    const user = await getUserById(userId);
    if (!user) {
      return res.status(403).json("Forbidden"); // Send response and exit the function
    }

    const findClient = await getAClient(userId, clientId);
    if (findClient === undefined || findClient === null) {
      return res.status(401).json({
        status: false,
        message: "Client could not be found"
      });
    }
    
    //If client is found, send response with client data
    res.status(200).json({
      status: true,
      data: findClient
    });
  } catch (error: any) {
    res.status(500).json({
      status: false,
      message: error.message
    });
  }
};



export const clientByLastname = async (req: Request, res: Response) => {
  try {
    const userId = req.params.UserID
    const user = await getUserById(userId)
    if (!user) {
      res.status(403).json("forbidden")
    }
    const { lastname } = req.body
    const findClient = await getClientByLastname(lastname)
    if (findClient === undefined || findClient === null) {
      res.status(401).json({
        status: false,
        message: "no client found"
      })
    }
  } catch (error: any) {
    res.status(500).json({
      status: false,
      message: error.message
    })
  }
}
export const clientByCaseId = async (req: Request, res: Response) => {
  try {
    const userId = req.params.UserID
    const user = await getUserById(userId)
    if (!user) {
      res.status(403).json({
        status: false,
        message: "forbidden"
      })
    }
    const { caseId } = req.body
    const findClientByCaseId = await getClientByCaseId(caseId)
    if (findClientByCaseId === undefined || findClientByCaseId === null) {
      res.status(401).json({
        status: false,
        message: "client not found"
      })
    }

  } catch (error: any) {
    res.status(500).json({
      status: false,
      message: error.message
    })
  }
}


export const updateClient = async (req: Request, res: Response) => {
  const userId = req.params.userId;
  const clientId = req.params.clientId;
  const caseId = req.params.caseId
  const { firstname, lastname, contactNumber, email, address, gender, caseName, caseDescription } = req.body;

  try {
    // Check if the client exists
    const client = await prisma.client.findFirst({
      where: {
        ClientID: clientId,
        userId: userId,
        CaseID:caseId // Make sure userId is properly passed here
      },
    });

    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }

    // Update client information
    const updatedClient = await prisma.client.update({
      where: {
        ClientID: clientId,
      },
      data: {
        FirstName: firstname,
        LastName: lastname,
        ContactNumber: contactNumber,
        Email: email,
        Address: address,
        Gender: gender,
        Case: {
          update: {
            CaseName: caseName,
            CaseDescription: caseDescription,
          },
        },
      },
      include: {
        Case: true,
        Documents:true
      },
    });

    return res.status(200).json(updatedClient);
  } catch (error:any) {
    return res.status(500).json({ status: 'Failed to update client', message: error.message });
  }
};




export const Totalclients = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId: string = req.params.UserID;
    const user = await getUserById(userId);
    if (!user) {
      res.status(403).json("Forbidden");
      return;
    }

    const getClients = await getAllClients(userId);
    if (!getClients || getClients.length === 0) {
       res.status(404).json({
        status: false,
        message: "No clients found"
      });
      return;
    }

    // Calculate total number of clients
    const totalClients: number = getClients.length;

    res.status(200).json({
      status: true,
      totalClients: totalClients
    });
  } catch (error: any) {
    console.error('Error fetching clients:', error);
    res.status(500).json({
      status: false,
      message: error.message
    });
  }
};






export const createScheduleAndSendEmail = async (req: Request, res: Response): Promise<void> => {
  try {
    const { clientName, clientEmail, dateOfAppointment, timeOfAppointment, scheduleDetails} = req.body;
    const userId = req.params.UserID;
  

    // Fetch user by ID
    const user = await getUserById(userId);
    if (!user) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }
    const FirmName = user.Username
    const ContactNumber = user.PhoneNumber

    const client = await prisma.client.findUnique({
      where: {
        FirstName:clientName,
        Email: clientEmail
      }
    });
    
    if (!client) {
      // Client with the provided email doesn't exist
      // Handle the error or take appropriate action
      res.status(404).json({ error: 'Client not found' });
      return;
    }
    
       
    // Reconcile dateOfAppointment from request body
    const dateParts = dateOfAppointment.split("/");
    const dateOfAppointmentFormatted = new Date(`${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`);
    dateOfAppointmentFormatted.setHours(dateOfAppointmentFormatted.getHours() + 1);
    // Use the retrieved ClientID to connect the client to the schedule
    const createdSchedule = await prisma.schedule.create({
      data: {
        dateOfAppointment: dateOfAppointmentFormatted,
        timeOfAppointment,
        scheduleDetails,
        clientName: client.FirstName, 
        clientEmail: client.Email,
        user: { connect: { UserID: user.UserID } },
        client: { connect: { ClientID: client.ClientID } }
      }
    });

    
    const subject = `${user.Username} Appointment Notice`;
    const html = generateEmailTemplate(clientName,FirmName,  dateOfAppointment, timeOfAppointment, ContactNumber)
    sendEmail({
      email: clientEmail,
      html,
      subject
    });

    
    
    res.status(200).json({ message: 'Schedule created successfully and email sent to the user.' });
  } catch (error:any) {
    res.status(404).json({ error: error.message });
  }
};







export const getNumberOfSchedules = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId =req.params.UserID;

    // Fetch user by ID
    const user = await getUserById(userId);
    if (!user) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    // Count the number of schedules associated with the user
    const scheduleCount = await prisma.schedule.count({
      where: {
        userId: userId,
      },
    });

    res.status(200).json({ scheduleCount });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};



export const getAllSchedules = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.params.UserID
    const user = getUserById(userId)
    if(!user){
      res.status(400).json("failed to fetch userId")
    }
    console.log(user)
  const allSchedule = await prisma.schedule.findMany({
    where:{
      userId:userId
    }
  })
  res.status(200).json(allSchedule)
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const getAppointmentsForNext7Days = async (req: Request, res: Response) => {
  try {
    const userId = req.params.UserID;
    const today = new Date();
    const next7Days = new Date(today);
    next7Days.setDate(today.getDate() + 7);

    // Format dates to DD/MM/YYYY format
    const formattedToday = formatDate(today);
    const formattedNext7Days = formatDate(next7Days);

    // Convert formatted dates back to ISO-8601 format
    const isoFormattedToday = convertToIsoFormat(formattedToday);
    const isoFormattedNext7Days = convertToIsoFormat(formattedNext7Days);

    // Fetch upcoming schedules for the user within the next 7 days
    const upcomingSchedules = await prisma.schedule.findMany({
      where: {
        userId: userId,
        dateOfAppointment: {
          gte: isoFormattedToday,
          lt: isoFormattedNext7Days,
        },
      },
      include: {
        client: true,
      },
      
      orderBy: {
        dateOfAppointment: 'asc', // Order by ascending date
      },
    });

    // Modify the date format and remove the unwanted portion from the date string
    const modifiedSchedules = upcomingSchedules.map(schedule => ({
      ...schedule,
      dateOfAppointment: formatDateForDisplay(schedule.dateOfAppointment.toISOString()),
    }));
    
    if(modifiedSchedules.length === 0){
      res.status(404).json("No upcoming schedules found less than 7 days from now excluding yesterday.")
    }
    

    res.status(200).json(modifiedSchedules);
  } catch (error:any) {
    console.error("Error fetching upcoming schedules:", error);
    res.status(500).json({ error: "Internal Server Error", message: error.message });
  }
};

// Function to format date to DD/MM/YYYY
function formatDate(date:Date) {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0'); // January is 0!
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

// Function to convert DD/MM/YYYY formatted date to ISO-8601 format
function convertToIsoFormat(dateString:String) {
  const [day, month, year] = dateString.split('/');
  return `${year}-${month}-${day}T00:00:00.000Z`;
}

// Function to format date for display (DD-MM-YYYY)
function formatDateForDisplay(dateString:String) {
  const [datePart] = dateString.split('T'); // Get only the date part
  const [year, month, day] = datePart.split('-');
  return `${day}-${month}-${year}`;
}






export const deleteClient = async (req: Request, res: Response) => {
  const userId = req.params.userId
  const clientId = req.params.clientId
  const caseId = req.params.caseId; // Assuming you have caseId in the URL params

  try {
    // Check if the client exists
    const client = await prisma.client.findFirst({
      where: {
        ClientID: clientId,
        userId: userId,
        CaseID:caseId, // Make sure userId is properly passed here
      },
    });

    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }

    // Update client information to mark as deleted
    await prisma.client.update({
      where: {
        ClientID: clientId,
      },
      data: {
        isDeleted: true,
      },
    });

    return res.status(200).json({ message: 'Client marked as deleted successfully' });
  } catch (error:any) {
    return res.status(500).json({ status: 'Failed to delete client', message: error.message });
  }
};

export const getDeletedClients = async (req: Request, res: Response) => {
  const userId = req.params.userId

  try {
    // Retrieve deleted clients
    const deletedClients = await prisma.client.findMany({
      where: {
        userId: userId,
        isDeleted: true,
      },
    });

    return res.status(200).json(deletedClients);
  } catch (error: any) {
    return res.status(500).json({ status: 'Failed to retrieve deleted clients', message: error.message });
  }
};

// Function to restore a deleted client
export const restoreClient = async (req: Request, res: Response) => {
  const userId = req.params.userId; // Extract userId from request params
  const clientId = req.params.clientId; // Extract clientId from request params

  try {
    // Check if the client exists and belongs to the user
    const client = await prisma.client.findFirst({
      where: {
        ClientID: clientId,
        userId: userId,
        isDeleted: true, // Make sure the client is marked as deleted
      },
    });

    if (!client) {
      return res.status(404).json({ error: 'Client not found or already restored' });
    }

    // Update client information to mark as not deleted
    const restoredClient = await prisma.client.update({
      where: {
        ClientID: clientId,
      },
      data: {
        isDeleted: false, // Mark as not deleted
      },
      include:{
        Case:true,
        Documents:true
      }
    });

    // Send success message and restored client as JSON response
    return res.status(200).json({ message: 'Client restored successfully', client: restoredClient });
  } catch (error: any) {
    // Handle errors
    return res.status(500).json({ status: 'Failed to restore client', message: error.message });
  }
};



export const deleteSchedule = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.params.userId;
    const scheduleId = req.params.scheduleId; // Assuming the scheduleId is passed in the request parameters
const user = await getUserById(userId)
if(!user){
  res.status(404).json("failed to fetch user by Id")
}
    // Check if the schedule exists
    const existingSchedule = await prisma.schedule.findUnique({
      where: {
        userId:userId,
        id: scheduleId
      }
    });

    if (!existingSchedule) {
      res.status(404).json({ error: 'Schedule not found' });
      return;
    }

    // Delete the schedule
    await prisma.schedule.delete({
      where: {
        id: scheduleId
      }
    });

    res.status(200).json({ message: 'Schedule deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};


//add a document 

export const clientuploadDocument = async (req: Request, res: Response) => {
  const { userId, clientId } = req.params;
  const user = await getUserById(userId)
  if(!user){
    res.status(404).json("failed to fetch user by Id")
  }

  const client = await prisma.client.findFirst({
    where: {
      ClientID: clientId,
      userId: userId,
    },
  });

  if (!client) {
    return res.status(404).json({ error: 'Client not found' });
  }
  // Handle file uploads and save document information if files are provided
  try{
  const uploadedDocuments: any[] = [];
  if (req.files && Array.isArray(req.files)) {
    for (const file of req.files as Express.Multer.File[]) {
      console.log(`Processing file: ${file.filename}`);
      // Here you can save document information without using Cloudinary
      const document = {
        name: file.originalname,
        // Assuming you have a file storage system, save the path accordingly
        path: `../uploads/${file.originalname}` // Example path
      };
      // Save document information to your database
      const uploadedDocument = await uploadDocument(client.ClientID, document, userId);
      uploadedDocuments.push(uploadedDocument);
    }
  }
  console.log(uploadedDocuments);
  
    res.status(201).json({
      message:"Docment Successfully Uploaded",
      data: uploadedDocuments
    });
  } catch (error) {
    console.error('Error uploading documents:', error);
    res.status(500).json({ error: 'Error uploading documents' });
  };
}



export const getClientDocuments = async(req: Request, res: Response): Promise<void> => {
  try {
    const { userId, clientId } = req.params;

    // Check if user exists
    const getUser = await getUserById(userId);
    if (!getUser) {
      res.status(401).json("User not found");
      return;
    }

    // Get all documents for the client
    const documents = await getAllDocuments(clientId, userId);

    // Send the documents as a response
    res.status(200).json(documents);
  } catch (error: any) {
    // Handle any errors
    console.error(`Error getting documents: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
}
export const getClientDocumentByName = async(req: Request, res: Response): Promise<void> => {
  try {
    const { userId, clientId } = req.params;
    const { documentName } = req.body;
  
    // Check if user exists
    const getUser = await getUserById(userId);
    if (!getUser) {
      res.status(401).json("User not found");
      return;
    }
    // Validate documentName
    if (!documentName || Object.keys(documentName).length == 0) {
      res.status(400).json({ error: 'Document name is required' });  return;
     }
    // Get all documents for the client
    const documents = await getOneDocument(clientId, userId, documentName);

    // Send the documents as a response
    res.status(200).json(documents);
  } catch (error: any) {
    // Handle any errors
    console.error(`Error getting documents: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
};


// export const DeleteDocuments =
export const createUserSettings = async (req: Request, res: Response) => {
  const userId = req.params.userId; // Extract userId from request params
  const settingsData = req.body; // Extract settings data from request body
  try {
const getUserByEmail= await prisma.user.findUnique({where:{Email:settingsData.Email}})

if(getUserByEmail){
  res.status(401).json("Please enter a Unique Email")
  return;
}
  
    const result = await createSettings(userId, settingsData); // Call updateSettings function
    res.status(200).json({
      message:"User Settings Saved!",
      result}); // Send success response with updated user settings
  } catch (error) {
    console.error('Error creating user settings:', error);
    res.status(500).json({ error: 'Error creating user settings' }); // Send error response
  }
};

export const handleupdateUserSettings = async(req:Request, res:Response)=>{
  const userId:any = req.params.userId;
  const settingsData = req.body;

  try {
    
    const getUser = await getUserById(userId)
    if(!getUser){
      res.status(401).json("user not Found")
      return;
    }
    const getUserByEmail= await prisma.user.findUnique({where:{Email:settingsData.Email}})

    if(getUserByEmail){
      res.status(401).json("Please enter a Unique Email")
      return;
    }

    const result = await updateSettings(userId, settingsData)



    res.status(200).json({
  message:"User Settings successfully Updated!",
  data:result
})
  } catch (error) {
    console.error(error);
    res.status(500).json({error:"Error updating user settings"})
    
  }
}

// export const sendMessagetoPlaintiffAid = async(req:Request, res:Response)=>{
//   const {name, email, companyName, message} = req.body
//   const FirmName = "PlaintiffAid"

//   if(!req.body || Object.keys(length == 0)){
//     res.status(400).json("One or More Fields Empty")
//     return;
//   }

//   const sendContactMessage = await contactCompany(name, email, companyName, message)

//   const subject = 'Email Verification'
//     //jwt.verify(token, process.env.secret)
    
//     const html = generateDynamicEmail(link, FirmName)
//     sendEmail({
//       email: user.Email,
//       html,
//       subject
//     })




// }