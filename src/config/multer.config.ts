import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Request, Response } from 'express';

const uploadDirectory = path.join(__dirname, '../uploads');

// Ensure that the upload directory exists, create it if it doesn't
if (!fs.existsSync(uploadDirectory)) {
    fs.mkdirSync(uploadDirectory, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
       cb(null, uploadDirectory);
    },
    filename: (req, file, cb) => {
       cb(null, file.fieldname + "-" + Date.now() + "-" + file.originalname);
    }
});  
   

// File type validation function
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
   // Accept xlsx files only
   if (file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
       cb(null, true);
   } else {
       cb(null,false);
   }
};
const upload = multer({ 
   storage: storage,
   fileFilter: fileFilter
});


export default upload;
