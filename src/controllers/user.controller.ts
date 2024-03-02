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
  createClientManually,
  createClientBatchUpload,
  getAllClients,
  getClientByLastname,
  getClientByCaseId,
  getClientByFirstname,
  getAClient
} from "../db/users.db";
import * as jwt from "jsonwebtoken";

import { hashSync, compareSync } from "bcrypt";

import { sendEmail } from "../middleware/nodemailer";
import { generateDynamicEmail } from "../middleware/html";
import { empty } from "@prisma/client/runtime/library";
import { buffer } from "node:stream/consumers";




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
    return res.status(200).json(user);
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
const checkPassword = await comparePassword(password, existingUser.Password)
if(!checkPassword){
  return res.status(400).json("Incorrect password")
}
    // Create a token for the logged-in user
    const token = await createNewToken({ email: existingUser.Email, id: existingUser.UserID });

    // Assign the token to the existingUser's Token property
    existingUser.Token = token;

    // Update the user record in the database with the new token
    await updateUserToken(existingUser.UserID, token)

    if (existingUser.isVerified === true) {
      res.status(200).json({
        message: `welcome!, ${existingUser.Username}`,
        data: existingUser,
      })

    }
    else {
      res.status(400).json("sorry, you are not verified yet!. check email for verification link")
    }

  } catch (err:any) {
    return res.status(500).json({ status: false, message:err.message});
  }
};




// export const resetPassword = async (req: Request, res: Response): Promise<Response> => {
//   try {
//     const { email} = req.body;
//     const user = await getUserByEmail(email)
//    if(!user){
//     return res.status(401).json("email not found")
//    }
   

   
//     //after this, hash the password
//     await updateUserPassword(email, newPassword);
//     return res.status(200).json("Password reset successfully");

//   } catch (error) {
//     return res.status(500).json(error);
//   }
// }

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
export const createClientController = async (req: Request, res: Response) => {
  const { firstname, lastname, contactNumber, email, address, Gender, caseName, CaseDescription } = req.body;

  try {
    // Check if request body is missing
    if (!req.body) {
      return res.status(400).json({ error: "Request body is missing" });
    }

    // Validate firstname
    if (!firstname || typeof firstname !== 'string') {
      return res.status(400).json({ error: "Firstname field is empty or contains invalid characters" });
    }

    // Validate lastname
    if (!lastname || typeof lastname !== 'string') {
      return res.status(400).json({ error: "Lastname field is empty or contains invalid characters" });
    }

    // Validate contactNumber
    if (!contactNumber || typeof contactNumber !== 'string' || !/^\d{11}$/.test(contactNumber)) {
      return res.status(400).json({ error: "Contact number is required and must be a 10-digit number" });
    }

    // Validate email
    if (!email || typeof email !== 'string' || !/\S+@\S+\.\S+/.test(email)) {
      return res.status(400).json({ error: "Email field is empty or contains invalid characters" });
    }

    // Validate address
    if (!address || typeof address !== 'string') {
      return res.status(400).json({ error: "Address field is empty or contains invalid characters" });
    }

    // Validate Gender
    if (!Gender || typeof Gender !== 'string') {
      return res.status(400).json({ error: "Gender is empty or contains invalid Characters" });
    }

    // Validate caseName
    if (!caseName || typeof caseName !== 'string') {
      return res.status(400).json({ error: "caseName is empty or contains invalid Characters" });
    }

    // Validate CaseDescription
    if (!CaseDescription || typeof CaseDescription !== 'string') {
      return res.status(400).json({ error: "Case description is empty or contains invalid Characters" });
    }

    // Continue with your existing code
    const userId = parseInt(req.params.UserID, 10); // Extract userId from URL params
    const authenticatedUser = await getUserById(userId);

    if (!authenticatedUser) {
      return res.status(403).json("Forbidden");
    }

    if (userId !== authenticatedUser.UserID) {
      return res.status(403).json("Forbidden");
    }

    const newClient = await createClientManually(userId, firstname, lastname, contactNumber, email, address, Gender, caseName, CaseDescription, userId);
    res.status(201).json(newClient);
  } catch (error) {
    console.error('Error creating client:', error);
    res.status(500).send('Internal server error');
  }
};




// export const downloadTemplateController = async (req: Request, res: Response) => {

//   try {
//     const userId = parseInt(req.params.UserID, 10);
//     const User = await getUserById(userId);
//     if (!User) {
//       return res.status(403).json("Forbidden");
//     }


//     // Create Excel workbook
//     const workbook = new exceljs.Workbook();
//     const worksheet = workbook.addWorksheet('Clients');

//     // Add headers to the worksheet
//     worksheet.addRow(['FirstName', 'LastName', 'ContactNumber', 'Email', 'Address', 'Gender', 'CaseName', 'CaseDescription']);

//     // Send the Excel file as a response
//     res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
//     res.setHeader('Content-Disposition', 'attachment; filename="Plaintiff_Aid.xlsx"');
//     workbook.xlsx.write(res)
//       .then(() => {
//         res.status(200).end();
//       });
//   } catch (error) {
//     console.error('Error downloading template:', error);
//     res.status(500).send('Internal server error');
//   }
// };







// export const downloadTemplateController = async (req: Request, res: Response): Promise<void> => {
//   try {
//     const userId: number = parseInt(req.params.UserID, 10);
//     const User = await getUserById(userId);
//     if (!User) {
//       res.status(403).json("Forbidden");
//       return;
//     }

//     // Create Excel workbook
//     const workbook = new exceljs.Workbook();
//     const worksheet = workbook.addWorksheet('Clients');

//     // Add headers to the worksheet
//     worksheet.addRow(['FirstName', 'LastName', 'ContactNumber', 'Email', 'Address', 'Gender', 'CaseName', 'CaseDescription']);

//     // Generate the Excel file in memory
//     const excelBuffer = await workbook.xlsx.writeBuffer();

//     // Create a Blob from the binary data
//     const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

//     // Generate a Blob URL
//     const blobUrl = URL.createObjectURL(blob);

//     // Send the Blob URL as response
//     res.status(200).json({ blobUrl });
//   } catch (error) {
//     console.error('Error downloading template:', error);
//     res.status(500).send('Internal server error');
//   }
// };


export const downloadTemplateController = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId: number = parseInt(req.params.UserID, 10);
    const user = await getUserById(userId);
    if (!user) {
     res.status(403).json("Forbidden");
     return;
    }

    // Create Excel workbook
    const workbook = new exceljs.Workbook();
    const worksheet = workbook.addWorksheet('Clients');

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
  const userId = parseInt(req.params.UserID, 10);
  const assignedUserId = parseInt(req.params.AssignedUserID)

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

      await createClientBatchUpload(userId, FirstName, LastName, ContactNumber, Email, Address, Gender, CaseName, CaseDescription, assignedUserId);
    }));

    res.status(200).json({ message: 'Data uploaded successfully' });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};














export const Allclients = async (req: Request, res: Response) => {
  //perform the try catch 
  try {
    const userId = parseInt(req.params.UserID, 10)
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

export const clientByFirstname = async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.UserID);
    const user = await getUserById(userId);
    if (!user) {
      return res.status(403).json("Forbidden"); // Send response and exit the function
    }
    const { firstname } = req.body;
    const findClient = await getClientByFirstname(firstname, userId);
    if (findClient === undefined || findClient === null) {
      return res.status(401).json({
        status: false,
        message: "Client could not be found by first name"
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
    const userId = parseInt(req.params.UserID, 10)
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
    const userId = parseInt(req.params.UserID, 10)
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
  const userId = parseInt(req.params.userId, 10);
  const clientId = parseInt(req.params.clientId, 10);
  const { firstname, lastname, contactNumber, email, address, gender, caseName, caseDescription } = req.body;

  try {
    // Check if the client exists
    const client = await prisma.client.findFirst({
      where: {
        ClientID: clientId,
        userId: userId, // Make sure userId is properly passed here
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
      },
    });

    return res.status(200).json(updatedClient);
  } catch (error:any) {
    return res.status(500).json({ status: 'Failed to update client', message: error.message });
  }
};




export const Totalclients = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId: number = parseInt(req.params.UserID, 10);
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
