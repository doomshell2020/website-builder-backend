import fs from 'fs';
import path from 'path';
import { Request, Response, NextFunction } from 'express';
import { FileFilterCallback } from 'multer'; // comes from @types/multer

// For multer file type
interface MulterFile {
  filename: string;
  path: string;
  [key: string]: any;
}

const validateWithCleanup = (schema: any) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body);

    if (error) {
      // 🧹 single file
      if (req.file) {
        cleanupFile(req.file as MulterFile);
      }

      // 🧹 multiple files
      if (req.files) {
        // upload.array → req.files is MulterFile[]
        if (Array.isArray(req.files)) {
          (req.files as MulterFile[]).forEach(cleanupFile);
        }

        // upload.fields → req.files is { fieldName: MulterFile[] }
        if (!Array.isArray(req.files)) {
          Object.values(req.files).forEach((fileArray) => {
            (fileArray as MulterFile[]).forEach(cleanupFile);
          });
        }
      }

      console.log("error at cleanup validation: ", error);
      return res.status(400).json({ error: error.details[0].message });
    }

    next();
  };
};

// helper
function cleanupFile(file: MulterFile) {
  const filePath = path.join(process.cwd(), 'uploads', file.filename);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    console.log(`File deleted due to validation error: ${filePath}`);
  }
}

export default validateWithCleanup;
