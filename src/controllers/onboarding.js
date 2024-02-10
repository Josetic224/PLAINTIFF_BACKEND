// onboarding.js

const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');

const prisma = new PrismaClient();

exports.signUp = async (req, res) => {
  try {
    const { firmname, password, email, roleId } = req.body;

    // Check if any of the required fields are missing
    if (!firmname || !password  || !email || !roleId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Hash the password using crypto
    const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');

    // Generate a token for the user
    const token = crypto.randomBytes(32).toString('hex');

    // Create a new user
    const newUser = await prisma.user.create({
      data: {
        Firmname: firmname,
        Password: hashedPassword, // Store hashed password in the database
        Token: token, // Store the generated token
        Email: email,
        RoleID: roleId
      }
    });

    res.status(201).json({ message: 'User created successfully', user: newUser });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


exports.logIn = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(401).json("Email and password fields are required");
    }

    // Check to see if the user exists in the database
    const userExist = await prisma.user.findUnique({
      where: { Email: email }
    });

    if (!userExist) {
      return res.status(401).json("User with this email not found");
    }

    // Compare passwords securely (consider using bcrypt or similar)
    if (userExist.Password !== password) {
      return res.status(401).json("Incorrect email or password");
    }

    // Generate a random session token for the user
    let sessionToken = crypto.randomBytes(32).toString('hex');

    // Update the user's database with the token
    await prisma.user.update({
      where: { Email: email },
      data: { Token: sessionToken }
    });

    // Send back the session token to the client
    return res.status(200).json({ sessionToken });
    
  } catch (error) {
    res.status(500).json(error);
  }
};
