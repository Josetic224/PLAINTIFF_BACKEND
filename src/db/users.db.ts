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
    const token = sign({ FirmName }, jwtSecret, { expiresIn: "1h" });

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


export const comparePassword = async (password: string, user: object) => {
  if (!compareSync(password, "jsdhjdjh")) {
    return false;
    // throw Error(`Incorrect Password ${password}`);
  }
  return true;
};


//update password
export const updateUserPassword = async (userId: number, newPassword: string) => {
  try {
    // Update the user's email and password
    const updatedUser = await prisma.user.update({
      where: { UserID: userId},
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
export const getAllClients = ()=>prisma.client.findMany()

//get client by Firstname
export const getClientByFirstname = async (firstname: string) => {
  try {
    const client = await prisma.client.findFirst({
      where: {
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
    
  } catch (error) {
    throw new Error(`Error finding Client by CaseId`)
  }
  const client = await prisma.case.findFirst({where:{CaseID:caseId}})
  return client;
}


export const createClientManually = async(userId:number, firstname:string,lastname:string,contactNumber:string,email:string,address:string,Gender:string,CaseName:string,assignedUserId:number)=>{
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


export const createClientBatchUpload = async(userId:number, FirstName:string,LastName:string,ContactNumber:string,Email:string,Address:string,Gender:string,CaseName:string,assignedUserId:number)=>{
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

