import express, { NextFunction, Request, Response } from "express";

import { Case, Client, PrismaClient, User } from '@prisma/client';
import nodemailer from "nodemailer"
import dotenv from "dotenv";

// Load environment variables from .env file
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
  
} from "../db/users.db";
import * as jwt from "jsonwebtoken";

import { hashSync, compareSync } from "bcrypt";

import { sendEmail } from "../middleware/nodemailer";




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
  const { email, password, legalFirmName } = req.body;

  try {
    if(!email || !password || !legalFirmName){
      res.status(400).json("one or more input fields are empty")
    }
    let user = await getUserByEmail(email);

    if (user) {
      throw new Error("User already exists");
    }

    //sign the user
    // Create the user
    user = await createUser(legalFirmName, password, email);



    const subject = 'Email Verification'
    //jwt.verify(token, process.env.secret)
    const link = `${req.protocol}://${req.get('host')}/api_v1/verify/${user.UserID}/${user.Token}`
    const html = `<a href="${link}">Click here to verify your email</a>`;
    sendEmail({
        email: user.Email,
        html,
        subject
    })

    // Send a response indicating success
    return res.status(200).json(user);
  } catch (err: any) {
    // Handle errors
    console.error(err);
    // Send an error response
    return res.status(400).json({ status: false, message: err.message });
  }
};

//verify email function

export const verifyEmail= async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.UserID, 10);
    const token = req.params.Token;

    // Get the intended user by id
    const user = await getUserById(userId);

    if (!user) {
      throw new Error("User not found");
    }

    // Verify the token after getting the user ID
    await jwtverify(token);

    // If the verification was successful, update the user's isVerified status
    const updatedUser = await verification(user.UserID, true);

   if(updatedUser.isVerified ===true){
    return res.status(200).send("<h1>You have been successfully verified. Kindly visit the login page.</h1>");

   }
//write the function if there is error in verifying the token
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      // Handle token expiration
      const userId = parseInt (req.params.UserID, 10);
      const updateUser = await getUserById(userId)
      
      if (updateUser) {
        // Create a new token for the user
        const newToken = await createNewToken({ email: updateUser.Email });
  
        // Update the user's token with the new one
        updateUser.Token = newToken;
      // Save the updated user with the new token
      const savedUser = await updateUserPassword(updateUser.UserID, newToken);

      const link = `${req.protocol}://${req.get('host')}/api_v1/verify/${updateUser.UserID}/${updateUser.Token}`;
      console.log(link)
      sendEmail({
        email: updateUser.Email,
        html: `<a href="${link}">Click here to verify your email</a>`,
        subject: "RE-VERIFY YOUR ACCOUNT"
      });
      return res.status(401).send("<h1>This link is expired. Kindly check your email for another email to verify.</h1>");

    }  else {
      return res.status(500).json({
        message:error.message,
      });
    }
  }

    }


  }


  export const signIn = async (req: Request, res: Response) => {
    const { email, password } = req.body;
  
    try {
      const existingUser = await getUserByEmail(email);
      if (!existingUser) {
        throw new Error(`User ${email} does not exist`);
      }
  
      if (!compareSync(password, existingUser.Password)) {
        throw new Error(`Incorrect Password ${password}`);
      }
  
      // Create a token for the logged-in user
      const token = await createNewToken({ email: existingUser.Email, id: existingUser.UserID });
  
      // Assign the token to the existingUser's Token property
      existingUser.Token = token;
  
      // Update the user record in the database with the new token
      await updateUserToken(existingUser.UserID, token)
   
      if(existingUser.isVerified === true){
        res.status(200).json({
          message: `welcome!, ${existingUser.Username}`,
          data:existingUser,
        })
      }
      else{
        res.status(400).json("sorry, you are not verified yet!. check email for verification link")
      }
  
    } catch (err: any) {
      return res.status(400).json({ status: false, message: err.message });
    }
  };
  

export const forgotPassword = async (req: Request, res: Response) => {
  const { email} = req.body;
  try {
    // Check if the User exists
    const existingUser = await getUserByEmail(email);
    if (!existingUser) {
      throw new Error(`User ${email} does not exist`);
    }

    //after this, send the user a reset password link
    else{
      const link = `${req.protocol}://${req.get('host')}/api_v1/reset/${existingUser.UserID}`;
      console.log(link)
      sendEmail({
        email: existingUser.Email,
        html: `<a href="${link}">Click here to reset your password</a>`,
        subject: "PASSWORD RESET"
      });

    }
    return res.status(200).json({
      message:"kindly check your email to reset your password"
    })

  }catch(error){
     res.status(500).json(error)
  }
}
//after this, write a fuction that resets the password itself

export const resetPassword = async(req:Request, res:Response)=>{
  try {
    const userId = parseInt(req.params.UserID, 10)
  const {newPassword, confirmPassword} = req.body.password
  if(!newPassword || !confirmPassword){
   return res.status(400).json("password and confirmPassword can't be empty!")
  }

  if(newPassword !== confirmPassword){
    return res.status(400).json("passwords do not match")
  }
  //after this, hash the password
  await updateUserPassword(userId, newPassword)
  return res.status(200).json("Password reset successfully")
  } catch (error) {
    res.status(500).json(error)
  }
  
}


//function to sign out the user... 
export const signOut = async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.UserID, 10);
   
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




//create a client manually

// export const createClientController = async (req: Request, res: Response) => {
//   try {
//     const userId = parseInt(req.params.UserID); // Extract userId from URL params

//     // Get the authenticated user
//     const authenticatedUser = await getUserById(userId);

//     // Check if user is authenticated
//     if (!authenticatedUser) {
//       return res.status(403).json("Forbidden"); // Send forbidden response if user is not authenticated
//     }

//     // Check if userId from URL params matches authenticated user's ID
//     if (userId !== authenticatedUser.UserID) {
//       return res.status(403).json("Forbidden"); // Send forbidden response if userId doesn't match authenticated user's ID
//     }

//     // Extract client and case data from request body
//     const { firstname, lastname, contactNumber, email, address, caseName, caseDescription, caseStatus, assignedUserId } = req.body;

//     // Call createClient function to create a new client
//     const newClient = await createClient(userId, firstname, lastname, contactNumber, email, address, caseName, caseDescription, caseStatus, assignedUserId);

//     // Respond with the created client
//     res.status(201).json(newClient);
//   } catch (error) {
//     console.error('Error creating client:', error);
//     res.status(500).send('Internal server error');
//   }
// };



//function to download excel sheet from the server for the batch upload

// Endpoint for downloading the Excel template
// export const downloadTemplateController = (req: Request, res: Response) => {
//   try {
//     // Create Excel workbook
//     const workbook = new exceljs.Workbook();
//     const worksheet = workbook.addWorksheet('Clients');

//     // Add headers to the worksheet
//     worksheet.addRow(['FirstName', 'LastName', 'ContactNumber', 'Email', 'Address', 'CaseName', 'CaseDescription', 'CaseStatus', 'AssignedUserID']);

//     // Send the Excel file as a response
//     res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
//     res.setHeader('Content-Disposition', 'attachment; filename="client_template.xlsx"');
//     workbook.xlsx.write(res)
//       .then(() => {
//         res.status(200).end();
//       });
//   } catch (error) {
//     console.error('Error downloading template:', error);
//     res.status(500).send('Internal server error');
//   }
// };


export const downloadTemplateController = (req: Request, res: Response) => {
  try {
    // Create Excel workbook
    const workbook = new exceljs.Workbook();
    const worksheet = workbook.addWorksheet('Clients');

    // Add headers to the worksheet
    worksheet.addRow(['FirstName', 'LastName', 'ContactNumber', 'Email', 'Address', 'CaseName', 'CaseDescription', 'CaseStatus', 'DateOfAppointment','TimeOfAppointment']);

    // Set the DateOfAppointment column format
    worksheet.getColumn('I').numFmt = 'dd/mm/yyyy'; // Custom format for date-time
    // Add a comment to the cell next to the 'DateOfAppointment' header
    const dateColumnHeaderCell = worksheet.getCell('I1');
    dateColumnHeaderCell.note = 'Please enter dates in DD/MM/YYYY format';

    // Set the TimeOfAppointment column format
worksheet.getColumn('J').numFmt = 'hh:mm'; // Custom format for time

// Add a comment to the cell next to the 'TimeOfAppointment' header
const timeColumnHeaderCell = worksheet.getCell('J1');
timeColumnHeaderCell.note = 'Please enter times in HH:mm format';

    // Send the Excel file as a response
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="client_template.xlsx"');
    workbook.xlsx.write(res)
      .then(() => {
        res.status(200).end();
      });
  } catch (error) {
    console.error('Error downloading template:', error);
    res.status(500).send('Internal server error');
  }
};
 // Safe access, value will be undefined if obj is null or undefined


// Function to parse time strings like "4pm", "3am" into a specific format
// function parseTime(timeString: string): string {
//   const match = timeString.match(/^(\d{1,2})([ap]m)$/i);
//   if (!match) {
//       throw new Error('Invalid time format');
//   }

//   const [_, hours, modifier] = match;
//   let hour = parseInt(hours, 10);
//   if (modifier.toLowerCase() === 'pm' && hour < 12) {
//       hour += 12;
//   }
//   if (modifier.toLowerCase() === 'am' && hour === 12) {
//       hour = 0;
//   }
//   return hour.toString().padStart(2, '0') + ":00";
// }


function parseTime(timeString: string): string {
  const match = timeString.match(/^(\d{1,2})(:(\d{2}))?\s*(am|pm)?$/i);
  if (!match) {
      throw new Error('Invalid time format');
  }

  const [_, hours, __, minutes, modifier] = match;
  let hour = parseInt(hours, 10);
  let minute = minutes ? parseInt(minutes, 10) : 0; // If minutes not provided, default to 0

  if (modifier && modifier.toLowerCase() === 'pm' && hour < 12) {
      hour += 12;
  }
  if (modifier && modifier.toLowerCase() === 'am' && hour === 12) {
      hour = 0;
  }

  // Convert to 24-hour format
  const formattedHour = hour.toString().padStart(2, '0');
  const formattedMinute = minute.toString().padStart(2, '0');

  return `${formattedHour}:${formattedMinute}:00`;
}





export const uploadFile = async (req: Request, res: Response) => {
    const userId = parseInt(req.params.UserID, 10);
    const AssignedUserID = parseInt(req.params.AssignedUserID, 10)
    try {
      
     const Id = await getUserById(userId)
      if(!Id){
        res.status(403).json("forbidden")
      }

        if (!req.file) {
            throw new Error('No file uploaded');
        }

        const workbook = new exceljs.Workbook();

        // Read the Excel file from memory
        await workbook.xlsx.load(req.file.buffer);

        // Assuming the Excel file has a specific structure
        const worksheet = workbook.getWorksheet(1);

if(!worksheet){
 throw new Error("Worksheet not found")
}
        // Initialize row array
        const clientsData: any[] = [];

        // Iterate through each row in the worksheet and push to clientsData
        worksheet?.eachRow((row, rowNumber) => {
            if (rowNumber > 1) { // Skip header row
                clientsData.push(row.values);
            }
        });

        // Save data to database
        await Promise.all(clientsData.map(async (row: any[]) => {
          const [_, FirstName, LastName, ContactNumber, EmailObj, Address, CaseName, CaseDescription, CaseStatus, DateOfAppointment, TimeOfAppointment] = row;
       
          console.log(DateOfAppointment)
          // Extracting email from the object
          const Email = typeof EmailObj === 'object' && EmailObj.text ? EmailObj.text : '';
          
          console.log(row);
                     
            
            // Save client data
            await prisma.client.create({
                data: {
                    FirstName: FirstName,
                    LastName: LastName,
                    ContactNumber: ContactNumber,
                    Email: Email,
                    Address: Address,
                    User: {
                        connect: {
                            UserID: userId
                        }
                    },
                    Case: {
                        create: {
                            CaseName: CaseName,
                            CaseDescription: CaseDescription,
                            CaseStatus: CaseStatus,
                            DateOfAppointment:DateOfAppointment,
                            TimeOfAppointment:parseTime(TimeOfAppointment),
                            AssignedUser:{
                              connect:{
                                UserID: AssignedUserID 
                              }
                            }
                        }
                    }
                }
            });
        }));

        res.status(200).json({ message: 'Data uploaded successfully' });
    } catch (error) {
        console.error('Error uploading file:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};









async function sendEmails(client: Client, caseData: Case) {
  // Create a transporter
  const transporter = nodemailer.createTransport({
      // Your email configuration
      // Example for Gmail:
      service: 'gmail',
      auth: {
          user: 'josephochiagha112@gmail.com',
          pass: process.env.secretKey
      }
  });

  // Mail options
  const mailOptions = {
      from: 'josephochiagha112@gmail.com',
      to: client.Email,
      subject: 'Appointment Reminder',
      text: `Dear ${client.FirstName} ${client.LastName},\n\nThis is a reminder that you have an appointment today at ${caseData.TimeOfAppointment} for case "${caseData.CaseName}".\n\nBest regards,\n`
  };

  // Send mail
  try {
      const info = await transporter.sendMail(mailOptions);
      console.log('Email sent:', info.response);
  } catch (error) {
      console.error('Error sending email:', error);
  }
}

// Function to check for appointments today and send reminder emails
async function sendAppointmentReminders() {
  try {
      // Get today's date
      const today = new Date();
      // Strip time from today's date
      today.setHours(0, 0, 0, 0);

      // Find appointments with DateOfAppointment equal to today's date
      const appointmentsToday = await prisma.case.findMany({
          where: {
              DateOfAppointment: today
          },
          include: {
              Clients: true
          }
      });

      // Iterate through appointments today and send reminder emails
      for (const appointment of appointmentsToday) {
          for (const client of appointment.Clients) {
              await sendEmails(client, appointment,);
          }
      }
  } catch (error) {
      console.error('Error checking appointments and sending reminders:', error);
  } finally {
      await prisma.$disconnect();
  }
}

// Call the function to check for appointments and send reminder emails
sendAppointmentReminders();



import cron from "node-cron"

// Your sendAppointmentReminders function here...

// Schedule the job to run every day at 1pm
cron.schedule('15 13 * * *', () => {
  console.log('Running appointment reminder job...');
  sendAppointmentReminders();
});


// export const Allclients = async (req:Request, res:Response)=>{
//   //perform the try catch 
//   try {
    
//   } catch (error) {
//     res.status(500).json("error")
//   }
// }