import fs from 'fs';
import multer, { FileFilterCallback } from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { Request } from 'express';

///////////////////////////////
// 📁 Shared Upload Settings //
///////////////////////////////

// Ensure uploads directory exists
const destination = path.join('uploads');
fs.mkdirSync(destination, { recursive: true });

const generateFilename = (file: Express.Multer.File) => {
  const ext = path.extname(file.originalname);
  return `${uuidv4()}_${Date.now()}${ext}`;
};

/////////////////////////////////////////
// 🔥 Universal Upload Function (One) //
/////////////////////////////////////////

export default function createUploader(
  fields: string[] | string,
  mode: 'single' | 'multi' = 'single',
  allowed: 'image' | 'image+pdf' | 'csv+xlsx' | 'all' = 'image',
  maxSizeMB: number = 5
) {
  // Dynamic file filter
  const fileFilter = (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    let allowedTypes: RegExp;
    let errorMsg: string;

    switch (allowed) {
      case 'image':
        allowedTypes = /jpeg|jpg|png/;
        errorMsg = 'Only .jpeg, .jpg, .png files are allowed';
        break;
      case 'image+pdf':
        allowedTypes = /jpeg|jpg|png|pdf/;
        errorMsg = 'Only .jpeg, .jpg, .png, .pdf files are allowed';
        break;
      case 'csv+xlsx':
        allowedTypes = /csv|xlsx/;
        errorMsg = 'Only .csv and .xlsx files are allowed';
        break;
      case 'all':
        allowedTypes = /jpeg|jpg|png|pdf|csv|xlsx/;
        errorMsg = 'Only .jpeg, .jpg, .png, .pdf, .csv, .xlsx files are allowed';
        break;
      default:
        allowedTypes = /jpeg|jpg|png/;
        errorMsg = 'Only .jpeg, .jpg, .png files are allowed';
    }

    const mimetypeOk = allowedTypes.test(file.mimetype);
    const extnameOk = allowedTypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetypeOk && extnameOk) cb(null, true);
    else cb(new Error(errorMsg));
  };

  const upload = multer({
    storage: multer.diskStorage({
      destination: (req, file, cb) => cb(null, destination),
      filename: (req, file, cb) => cb(null, generateFilename(file)),
    }),
    fileFilter,
    limits: { fileSize: maxSizeMB * 1024 * 1024 },
  });

  if (mode === 'single' && typeof fields === 'string') {
    return upload.single(fields);
  }

  if (mode === "multi" && Array.isArray(fields)) {
    return upload.fields(fields.map((name) => ({ name, maxCount: 20 })));
  }

  throw new Error('Invalid uploader configuration');
}

// How to use :
{
  /** Single profile image (max 2MB)
router.post("/profile", createUploader("profile", "single", "image", 2), controller);

// Customer profile + documents (multi-field, 2MB limit)
router.post(
  "/customer",
  createUploader(["profile", "document"], "multi", "image+pdf", 2),
  controller
);

// Testimonial (image + company_logo, 5MB limit)
router.post(
  "/testimonial",
  createUploader(["image", "company_logo"], "multi", "image", 5),
  controller
);

// Whatsapp import (only csv/xlsx, 10MB)
router.post(
  "/whatsapp/import",
  createUploader("import_csv", "single", "csv+xlsx", 10),
  controller
);

// General gallery upload (multi-image, 5MB each)
router.post(
  "/gallery",
  createUploader(["img1", "img2", "img3"], "multi", "image", 5),
  controller
);
 */
}
