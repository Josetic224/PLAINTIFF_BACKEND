import { PrismaClient } from "@prisma/client";



import bcrypt from  "bcrypt"
const prisma = new PrismaClient();

exports.signup = async (req, res) => {
  const { username, phonenumber, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        username,
        phonenumber,
        password: hashedPassword,
      },
    });

    res.status(201).json({
      status: 'success',
      user,
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      error: error.message,
    });
  }
};







export const login = async (req: Request, res: Response) => {
  const { Username,  Password } = req.body;

  try {
    const user = await prisma.user.findUnique({
      where: {
        Username,
      },
    });

    if (!user) {
      return res.status(401).json({
        error: "Invalid username or password",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        error: "Invalid username or password",
      });
    }

    // return a token or session ID here

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};