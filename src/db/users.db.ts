import { PrismaClient,} from "@prisma/client";
import { hashSync, compareSync } from "bcrypt";
import { sign, verify } from "jsonwebtoken";
import dotenv from "dotenv";
import { log } from "console";


dotenv.config({ path: ".env" });

const prisma = new PrismaClient();

async function connectToDatabase() {
  try {
      await prisma.$connect();
      console.log('Connected to the database');
  } catch (error:any) {
      console.error('Error connecting to the database:', error.message);
      // Retry mechanism
      console.log('Retrying connection...');
      await retryConnection(3); // Retry 3 times
  }
}

async function retryConnection(retries: number) {
  for (let i = 0; i < retries; i++) {
      try {
          await prisma.$connect();
          console.log('Connected to the database');
          return; // Connection successful, exit retry loop
      } catch (error:any) {
          console.error('Error connecting to the database:', error.message);
          if (i < retries - 1) {
              // Delay before retrying
              const delay = Math.pow(2, i) * 1000; // Exponential backoff
              console.log(`Retrying in ${delay} milliseconds...`);
              await new Promise(resolve => setTimeout(resolve, delay));
          }
      }
  }
  console.error('Unable to connect to the database after retrying');
}

export { connectToDatabase, prisma };

export const getAllUsers = () => prisma.user.findMany();

export const getUserByEmail = (email: string) =>
  prisma.user.findFirst({ where: { Email: email } });

export const getUserById = async (userId:string) => {
  try {
    const user = await prisma.user.findUnique({
      where: { UserID: userId },
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
  PhoneNumber: string
) => {
  try {
    const hashedPassword = hashSync(password, 10);
    const jwtSecret = process.env.JWT_SECRET || "pgiir7dkuciylf"; // Providing a default value if JWT_SECRET is undefined
    const token = sign({ FirmName, email }, jwtSecret, { expiresIn: "1h" });


    const newUser = await prisma.user.create({
      data: {
        Username: FirmName,
        Email: email.toLocaleLowerCase(),
        Password: hashedPassword,
        PhoneNumber: PhoneNumber,
        Token: token,
      },
    });

    return newUser;
  } catch (error) {
    console.error("Error creating user:", error);
    throw new Error("Failed to create user.");
  }
};


export const comparePassword = async (
  password: string,
  hashedPassword: string
) => {
  try {
    if (!compareSync(password, hashedPassword)) {
      // If passwords don't match, return false
      return false;
    }
    // If passwords match, return true
    return true;
  } catch (error: any) {
    throw new Error("Password is Incorrect!");
  }
};

//update password
export const updateUserPassword = async (
  userId: string,
  newPassword: string
) => {
  try {
    // Update the user's email and password
    const updatedUser = await prisma.user.update({
      where: {
        UserID: userId,
      },
      data: {
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
export const verification = async (id: string, isVerified: boolean) => {
  try {
    // Update the user's isVerified status
    const verifying = await prisma.user.update({
      where: { UserID: id },
      data: {
        isVerified: isVerified,
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

export const updateUserToken = async (id: string, token: string) => {
  try {
    // Update the user's token
    const updatedUser = await prisma.user.update({
      where: { UserID: id },
      data: { Token: token },
    });

    return updatedUser;
  } catch (error) {
    // Handle errors
    console.error("Error updating user token:", error);
    throw new Error("Failed to update user token.");
  }
};

export const destroyToken = async (id: string) => {
  try {
    // Update the user's token
    const updatedUser = await prisma.user.update({
      where: { UserID: id },
      data: { Token: "" },
    });

    return updatedUser;
  } catch (error) {
    // Handle errors
    console.error("Error updating user token:", error);
    throw new Error("Failed to update user token.");
  }
};

// for client

export const getAllClients = (userId: string) =>
  prisma.client.findMany({
    where: {
      userId: userId,
      isDeleted: false,
    },include:{
      Documents:true
    }
  });

export const getAClient = async (
  userId: string,
  clientId: string,
) => {
  try {
    const client = await prisma.client.findFirst({
      where: {
        userId: userId,
        ClientID: clientId,
        isDeleted:false
      },include:{
        Case:true,
        Documents:true
      }
    });
   return client // Return true if client exists, false otherwise
  } catch (error) {
    console.error("Error fetching client:", error);
    throw new Error("Failed to fetch client.");
  }
};

//get client by Firstname
export const getClientByFirstname = async (
  firstname: string,
  userId: string
) => {
  try {
    const client = await prisma.client.findFirst({
      where: {
        userId: userId,
        FirstName: firstname, // Specify the field and its value directly
      },
    });
    return client;
  } catch (error: any) {
    throw new Error(`Error finding client by firstname: ${error.message}`);
  }
};

export const getClientByLastname = async (lastname: string) => {
  try {
    const client = await prisma.client.findFirst({
      where: { LastName: lastname },
    });
    return client;
  } catch (error) {
    throw new Error(`Error finding client by firstname`);
  }
};

export const getClientByCaseId = async (caseId: string) => {
  try {
    const client = await prisma.case.findFirst({ where: { CaseID: caseId } });
    return client;
  } catch (error) {
    throw new Error(`Error finding Client by CaseId`);
  }
};

export const createClientManually = async (
  userId: string,
  firstname: string,
  lastname: string,
  contactNumber: string,
  email: string,
  address: string,
  Gender: string,
  CaseName: string,
  CaseDescription: string,
  assignedUserId: string
) => {
  try {
    const newClient = await prisma.client.create({
      data: {
        FirstName: firstname,
        LastName: lastname,
        ContactNumber: contactNumber,
        Email: email,
        Address: address,
        Gender: Gender,
        User: { connect: { UserID: userId } }, // Connect client to user
        Case: {
          create: {
            CaseName: CaseName,
            CaseDescription: CaseDescription,
            AssignedUserID: assignedUserId,
          },
        },
      },
      include: {
        Case: true,
      },
    });
    return newClient;
  } catch (error: any) {
    if (error.code === "P2002" && error.meta?.target?.includes("Email")) {
      throw new Error("client with this email already exists");
    }
  }
};

export const updateClientManually = async (
  clientId: string,
  firstname: string,
  lastname: string,
  contactNumber: string,
  email: string,
  address: string,
  Gender: string,
  caseId: string,
  CaseName: string,
  CaseDescription: string,
  assignedUserId: string
) => {
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
            where: { CaseID: caseId }, // Upsert the case associated with the client
            create: {
              CaseName: CaseName,
              CaseDescription: CaseDescription,
              AssignedUserID: assignedUserId,
            },
            update: {
              CaseName: CaseName,
              CaseDescription: CaseDescription,
              AssignedUserID: assignedUserId,
            },
          },
        },
      },
      include: {
        Case: true,
        Documents:true
      },
    });
    return updatedClient;
  } catch (error: any) {
    throw new Error(error);
  }
};

export const createClientBatchUpload = async (
  userId: string,
  FirstName: string,
  LastName: string,
  ContactNumber: string,
  Email: string,
  Address: string,
  Gender: string,
  CaseName: string,
  CaseDescription: string,
  assignedUserId: string
) => {
  try {
    const newClient = await prisma.client.create({
      data: {
        FirstName: FirstName,
        LastName: LastName,
        ContactNumber: ContactNumber,
        Email: Email,
        Address: Address,
        Gender: Gender,
        User: { connect: { UserID: userId } }, // Connect client to user
        Case: {
          create: {
            CaseName: CaseName,
            CaseDescription: CaseDescription,
            AssignedUserID: assignedUserId,
          },
        },
      },
      include: {
        Case: true,
      },
    });
    return newClient;
  } catch (error: any) {
    throw new Error(error);
  }
};

// export const createSchedule = async (req: Request, Res: Response) => {
//   try {
//     const createdSchedule = await prisma;
//   } catch (error: any) {
//     throw new Error(error.message);
//   }
// };

//Function to check if client exists by name or email
export const checkClientExists = async (
  clientName: string,
  clientEmail: string
): Promise<void> => {
  try {
    // Check if client exists by name
    const clientByName = await prisma.client.findFirst({
      where: {
        FirstName: clientName,
      },
    });

    // Check if client exists by email
    const clientByEmail = await prisma.client.findFirst({
      where: {
        Email: clientEmail,
      },
    });

    // If client does not exist by name or email, throw an error
    if (!clientByName && !clientByEmail) {
      throw new Error("Client not found");
    }
  } catch (error) {
    throw error; // Re-throw the error to be handled by the caller
  }
};

interface Settings {
  settingsID?: string
  Firmname: string;
  Email: string;
  Location: string;
  FirmDescription: string ;
  CurrentCountry: string;
  PhoneNumber:string;
}

// 
export const createSettings = async (
  userId: string,
  settingsData: Settings
) => {
  try {
    // Fetch user and settings
    const user = await prisma.user.findUnique({
      where: { UserID: userId },
      include: { settings: true },
    });

    if (!user || !user.settings) {
      throw new Error("User or settings not found");
    }

    
    const settings: Settings = user.settings as unknown as Settings;
    
     // Fetch the updated user
     const updatedUser = await prisma.user.update({
      where: { UserID: userId },
      data: {
        Username: settingsData.Firmname || user.Username,
        Email: settingsData.Email || user.Email,
        PhoneNumber:settingsData.PhoneNumber || user.PhoneNumber
      },
    });

    const updatedSettings = await prisma.settings.create({
      data: {
        // Assuming newUserID is required and userId corresponds to the new settings
        Firmname: settingsData.Firmname ?? user.Username,
        Email: settingsData.Email ?? user.Email,
        newUserID: userId,
        Location: settingsData.Location || settings.Location,
        FirmDescription: settingsData.FirmDescription || settings.FirmDescription,
        CurrentCountry: settingsData.CurrentCountry || settings.CurrentCountry,
        PhoneNumber:settingsData.PhoneNumber || settings.PhoneNumber
      },
    });

    
 return { user: updatedUser, settings: { ...updatedSettings } };
  } catch (error) {
    console.error("Error creating settings:", error);
    throw error;
  }
};


export const updateSettings = async (
  userId:string,
  settingsData:Settings
)=>{

  try {

       const user = await prisma.user.findUnique({
      where: { UserID: userId },
      include: { settings: true },
    });
    const userSettings = await prisma.settings.findFirst({
      where:{newUserID:userId}
    })
    if(!userSettings){
      throw new Error ("settings not found for this User")
    }
    //if found then update settings

    const updatedSettings = await prisma.settings.update({
      where:{settingsID:userSettings.settingsID},
      data:{
        Firmname:settingsData.Firmname || userSettings.Firmname,
        Email:settingsData.Email || userSettings.Email,
        Location:settingsData.Location || userSettings.Location,
        FirmDescription:settingsData.FirmDescription || userSettings.FirmDescription,
        CurrentCountry:settingsData.CurrentCountry || userSettings.CurrentCountry,
        PhoneNumber:settingsData.PhoneNumber || userSettings.PhoneNumber

      }

    })
    return updatedSettings;
  } catch (error) {
    console.error("error updating settings", error)
    throw error
  }
}

export const uploadDocument = async(
  clientId : string,
  document: any,
  userId: string
) =>{
  try {
    const client = await prisma.client.findUnique({where:{ClientID:clientId}})
    if(!client){
      throw new Error ("No client Found")
    }
    if(client.userId != userId){
      throw new Error("Unauthorized User!")
    }

    const uploadedDocument = await prisma.document.create({
      data:{
       DocumentName:document.name,
       FilePath:document.path,
       ClientID:clientId
      },
    })
    return uploadedDocument;
  } catch (error) {
   console.error(`error uploading Documents`, error) 
   throw error;
  }
}

export const getAllDocuments = async(clientId:string,userId:string)=>{
  try {
   const client = await prisma.client.findUnique({where:{ClientID:clientId}})
   if(!client || Object.keys(client).length===0){
    throw new Error ("no client Found")
   }
   if(client.userId !== userId){
    throw new Error ("UnAuthorized User")
   }
   const Documents = await prisma.document.findMany({
    where:{
      ClientID:clientId,
    }
   })
   return Documents;
  } catch (error) {
    console.error(`error getting Document`)
    throw error
  }

}

export const getOneDocument = async(clientId:string,userId:string, documentName:string)=>{
  try {
   const client = await prisma.client.findUnique({where:{ClientID:clientId}})
   if(!client || Object.keys(client).length===0){
    throw new Error ("no client Found")
   }
   if(client.userId !== userId){
    throw new Error ("UnAuthorized User")
   }
   const documents = await prisma.$runCommandRaw({
    find: "document",
    filter: {
      ClientID: clientId,
      DocumentName: { $regex: documentName, $options: "i" } // Case-insensitive regex
    }
  });

  // If no documents are found, throw an error
  if (!documents || documents.length === 0) {
    throw new Error("No documents found");
  }
   return documents;
  } catch (error) {
    console.error(`error getting Document`)
    throw error
  }

}


export const getDocumentbyName = async (clientId: string, userId: string, documentName?: string) => {
  try {
    const client = await prisma.client.findUnique({ where: { ClientID: clientId } });
    if (!client || Object.keys(client).length === 0) {
      throw new Error("No client found");
    }
    if (client.userId !== userId) {
      throw new Error("Unauthorized user");
    }

    let whereClause = { ClientID: clientId };
    if (documentName) {
      // Filter documents by name if provided
      const documents = await prisma.document.findMany({
        where: {
          ClientID: clientId,
          DocumentName: documentName
        }
      });
      return documents;
    }

    const documents = await prisma.document.findMany({
      where: { ClientID: clientId }
    });

    return documents;
  } catch (error) {
    console.error("Error getting documents:", error);
    throw error;
  }
}


export const contactCompany = async(name:string, email:string, companyName:string, message:string )=>{
  try {
    const sendContact = await prisma.contact.create({
      data:{
        name: name,
        email:email,
        companyName:companyName,
        message:message
      }
    })
    return sendContact;
  } catch (error) {
    console.error('error contacting PlaintiffAid');
    
    throw error
  }
  
}