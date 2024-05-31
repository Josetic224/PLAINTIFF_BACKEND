import express, { Application, Request, Response } from "express";
import "dotenv/config";
import routers from "./routers";
import helmet from "helmet";
import cors, {CorsOptions} from "cors"
import bodyParser from "body-parser";
import { connectToDatabase, prisma } from "./db/users.db";
const app: Application = express();

app.use(cors({
  origin: '*', // Allow all origins
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
}));
app.use(bodyParser.json()); 
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet());

async function startApp() {
  try {
      await connectToDatabase();
      // Proceed with your application logic after successful connection
      // For example:
      const users = await prisma.user.findMany();
      console.log('Users:', users);
  } catch (error) {
      console.error('Error starting the application:', error);
  } finally {
      await prisma.$disconnect(); // Disconnect from the database when the application exits
  }
}

startApp();






const port: number = 3000;

// Define a route for the homepage
app.get("/", (req: Request, res: Response) => {
  res.send("<h1>Welcome to Plaintiff Aid Backend!</h1>");
});

// Mount your routers
app.use("/api_v1/", routers());

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
