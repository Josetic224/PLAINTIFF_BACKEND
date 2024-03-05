import { PrismaClient } from "@prisma/client";
import { hashSync, compareSync } from "bcrypt";
import { sign, verify } from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config({ path: ".env" });


const prisma = new PrismaClient();

export const getAllUsers = () => prisma.user.findMany();

export const getUserByEmail = (email: string) =>
  prisma.user.findFirst({ where: { Email: email } });

export const getUserById = async (userId: number) => {
  try {
    const user = await prisma.user.findUnique({
      where: { UserID: userId }
    });
    return user;
  } catch (error) {
    // console.error("Error fetching user by ID:", error);
    throw new Error("Failed to fetch user by ID.");
  }
};



export const createUser = async (
  FirmName: string,
  password: string,
  email: string,
  PhoneNumber:string
) => {
  try {
    const hashedPassword = hashSync(password, 10);
    const jwtSecret = process.env.JWT_SECRET || "pgiir7dkuciylf"; // Providing a default value if JWT_SECRET is undefined
    const token = sign({ FirmName, email }, jwtSecret, { expiresIn: "1h" });

    const newUser = await prisma.user.create({
      data: {
        Username:FirmName,
        Email: email.toLocaleLowerCase(),
        Password: hashedPassword,
        PhoneNumber:PhoneNumber,
        RoleID: 1,
        Token: token
      }
    });

    return newUser;
  } catch (error) {
    console.error("Error creating user:", error);
    throw new Error("Failed to create user.");
  }
};

export const comparePassword = async (password: string, hashedPassword: string) => {
  try {
    if (!compareSync(password, hashedPassword)) {
      // If passwords don't match, return false
      return false;
    }
    // If passwords match, return true
    return true;
  } catch (error:any) {
    throw new Error("Password is Incorrect!");
  }
};


//update password
export const updateUserPassword = async (email:string, 
  newPassword: string,
) => {
  try {
    // Update the user's email and password
    const updatedUser = await prisma.user.update({
      where: { 
      Email:email},
      data:
      {
        Password: hashSync(newPassword, 10),

      },
    });

    return updatedUser;
  } catch (error) {
    // Handle errors
    console.error("Error updating user:", error);
    throw new Error("Failed to update user.");
  }
};



export const jwtverify = async (token: string) => {
  try {
    const jwtSecret = process.env.JWT_SECRET || "pgiir7dkuciylf"; // Providing a default value if JWT_SECRET is undefined
    const decodedToken = verify(token, jwtSecret);
    return decodedToken;
  } catch (error) {
    console.error("Error verifying JWT:", error);
    throw new Error("Failed to verify JWT.");
  }
};
//update for verification
export const verification = async (id: number, isVerified: boolean) => {
  try {
    // Update the user's isVerified status
    const verifying = await prisma.user.update({
      where: { UserID: id },
      data: {
        isVerified: isVerified
      },
    });

    return verifying;
  } catch (error) {
    // Handle errors
    console.error("Error updating user:", error);
    throw new Error("Failed to update user.");
  }
};


export const createNewToken = async (payload: any) => {
  try {
    // Get the JWT secret from environment variables
    const jwtSecret = process.env.JWT_SECRET || "pgiir7dkuciylf"; // Providing a default value if JWT_SECRET is undefined

    // Sign the payload to create a new token
    const token = sign(payload, jwtSecret, { expiresIn: "1h" }); // Example expiry time: 1 hour (you can adjust as needed)

    return token;
  } catch (error) {
    // Handle errors
    console.error("Error creating new token:", error);
    throw new Error("Failed to create new token.");
  }
};


export const updateUserToken = async (id: number, token: string) => {
  try {
    // Update the user's token
    const updatedUser = await prisma.user.update({
      where: { UserID: id },
      data: { Token: token }
    });

    return updatedUser;
  } catch (error) {
    // Handle errors
    console.error("Error updating user token:", error);
    throw new Error("Failed to update user token.");
  }
};




export const destroyToken = async (id: number) => {
  try {
    // Update the user's token
    const updatedUser = await prisma.user.update({
      where: { UserID: id },
      data: { Token: "" }
    });

    return updatedUser;
  } catch (error) {
    // Handle errors
    console.error("Error updating user token:", error);
    throw new Error("Failed to update user token.");
  }
};





// for client

export const getAllClients = (userId: number) => prisma.client.findMany({
  where: {
    userId: userId,
  },
});

export const getAClient = async (userId: number, clientId: number, caseId:number) => {
  try {
    const client = await prisma.client.findFirst({
      where: {
        userId: userId,
        ClientID: clientId,
        CaseID:caseId
      }
    });
    return client !== null; // Return true if client exists, false otherwise
  } catch (error) {
    console.error("Error fetching client:", error);
    throw new Error("Failed to fetch client.");
  }
};

//get client by Firstname
export const getClientByFirstname = async (firstname: string, userId:number) => {
  try {
    const client = await prisma.client.findFirst({
      where: {
        userId:userId,
        FirstName: firstname // Specify the field and its value directly
      }
    });
    return client;
  } catch (error:any) {
    throw new Error(`Error finding client by firstname: ${error.message}`);
  }
};



export const getClientByLastname = async(lastname:string)=>{
  try {
   const client = await prisma.client.findFirst({where:{LastName:lastname}})
   return client;
  } catch (error) {
    throw new Error(`Error finding client by firstname`)
  }
 
}


export const getClientByCaseId = async(caseId:number)=>{
  try {
      const client = await prisma.case.findFirst({where:{CaseID:caseId}})
  return client;
  } catch (error) {
    throw new Error(`Error finding Client by CaseId`)
  }

}


export const createClientManually = async(userId:number, firstname:string,lastname:string,contactNumber:string,email:string,address:string,Gender:string,CaseName:string, CaseDescription:string, assignedUserId:number)=>{
  try {
    const newClient = await prisma.client.create({
      data: {
        FirstName: firstname,
        LastName: lastname,
        ContactNumber: contactNumber,
        Email: email,
        Address: address,
        Gender:Gender,
        User:{connect:{UserID:userId}}, // Connect client to user
        Case:{
          create:{
            CaseName:CaseName,
            CaseDescription:CaseDescription,
            AssignedUserID:assignedUserId
          }
        }
      },
      include:{
        Case:true
      }
    })
return newClient
  } catch (error:any) {
    if (error.code === 'P2002' && error.meta?.target?.includes('Email')) {
     throw new Error("client with this email already exists");
    }
  }
}



export const updateClientManually = async (clientId: number, firstname: string, lastname: string, contactNumber: string, email: string, address: string, Gender: string, caseId:number, CaseName: string, CaseDescription: string, assignedUserId: number) => {
  try {
    const updatedClient = await prisma.client.update({
      where: { ClientID: clientId },
      data: {
        FirstName: firstname,
        LastName: lastname,
        ContactNumber: contactNumber,
        Email: email,
        Address: address,
        Gender: Gender,
        Case: {
          upsert: {
            where: {CaseID:caseId}, // Upsert the case associated with the client
            create: {
              CaseName: CaseName,
              CaseDescription: CaseDescription,
              AssignedUserID: assignedUserId
            },
            update: {
              CaseName: CaseName,
              CaseDescription: CaseDescription,
              AssignedUserID: assignedUserId
            }
          }
        }
      },
      include: {
        Case: true
      }
    });
    return updatedClient;
  } catch (error:any) {
    throw new Error(error);
  }
};


export const createClientBatchUpload = async(userId:number, FirstName:string,LastName:string,ContactNumber:string,Email:string,Address:string,Gender:string,CaseName:string, CaseDescription:string, assignedUserId:number)=>{
  try {
    const newClient = await prisma.client.create({
      
      data: {
        FirstName: FirstName,
        LastName: LastName,
        ContactNumber: ContactNumber,
        Email: Email,
        Address: Address,
        Gender:Gender,
        User:{connect:{UserID:userId}}, // Connect client to user
        Case:{
          create:{
            CaseName:CaseName,
            CaseDescription:CaseDescription,
            AssignedUserID:assignedUserId
          }
        }
      },
      include:{
        Case:true
      }
    })
return newClient
  } catch (error:any) {
    throw new Error(error)
  }
}



export const createSchedule = async(req:Request, Res:Response)=>{
  try {
    const createdSchedule = await prisma
  } catch (error:any) {
    throw new Error(error.message)
  }
  
}


//Function to check if client exists by name or email
export const checkClientExists = async (clientName: string, clientEmail: string): Promise<void> => {
  try {
    // Check if client exists by name
    const clientByName = await prisma.client.findFirst({
      where: {
        FirstName: clientName
      }
    });

    // Check if client exists by email
    const clientByEmail = await prisma.client.findFirst({
      where: {
        Email: clientEmail
      }
    });

    // If client does not exist by name or email, throw an error
    if (!clientByName && !clientByEmail) {
      throw new Error('Client not found');
    }
  } catch (error) {
    throw error; // Re-throw the error to be handled by the caller
  }
};

