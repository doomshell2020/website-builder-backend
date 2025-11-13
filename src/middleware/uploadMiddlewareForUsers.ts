import fs from "fs";
import multer, { FileFilterCallback } from "multer";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import crypto from "crypto";
import { Request } from "express";

// 📁 Shared Upload Settings //
const baseUploadDir = path.join("uploads");
fs.mkdirSync(baseUploadDir, { recursive: true });

/** * 🧠 Generates a unique folder name based on schema or random. */
const generateFolderName = (schemaName?: string) => {
  const timestamp = Date.now();
  if (schemaName && schemaName.trim() !== "") {
    // Example → tenantA_1731424523123
    return `${schemaName}_${timestamp}`;
  }
  const random = crypto.randomBytes(4).toString("hex");
  return `folder_${timestamp}_${random}`;
};

/** * 🧠 Ensures directory exists. */
const ensureDir = (dirPath: string) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

/** * 🧠 Generate file name with UUID + timestamp. */
const generateFilename = (file: Express.Multer.File) => {
  const ext = path.extname(file.originalname);
  return `${uuidv4()}_${Date.now()}${ext}`;
};

// ⚙️ Universal Upload Function (Smart) //
export default function createUploaderForUsers(
  fields: string[] | string,
  mode: "single" | "multi" = "single",
  allowed: "image" | "image+pdf" | "csv+xlsx" | "all" = "image",
  maxSizeMB: number = 5
) {
  // 🔍 File filter
  const fileFilter = (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    let allowedTypes: RegExp;
    let errorMsg: string;

    switch (allowed) {
      case "image":
        allowedTypes = /jpeg|jpg|png/;
        errorMsg = "Only .jpeg, .jpg, .png files are allowed";
        break;
      case "image+pdf":
        allowedTypes = /jpeg|jpg|png|pdf/;
        errorMsg = "Only .jpeg, .jpg, .png, .pdf files are allowed";
        break;
      case "csv+xlsx":
        allowedTypes = /csv|xlsx/;
        errorMsg = "Only .csv and .xlsx files are allowed";
        break;
      case "all":
        allowedTypes = /jpeg|jpg|png|pdf|csv|xlsx/;
        errorMsg = "Only .jpeg, .jpg, .png, .pdf, .csv, .xlsx files are allowed";
        break;
      default:
        allowedTypes = /jpeg|jpg|png/;
        errorMsg = "Only .jpeg, .jpg, .png files are allowed";
    }

    const mimetypeOk = allowedTypes.test(file.mimetype);
    const extnameOk = allowedTypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetypeOk && extnameOk) cb(null, true);
    else cb(new Error(errorMsg));
  };

  // 💾 Storage configuration
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      // 1️⃣ If folder already exists in body, reuse it
      let folderName = req.body?.imageFolder;


      if (folderName && folderName.trim() !== "") {
        console.log(`🟢 Using existing folder: ${folderName}`);
      } else {
        // 2️⃣ Otherwise, generate new one using schema_name or random
        const schemaName = req.body?.schema_name;
        folderName = generateFolderName(schemaName);
        console.log(`🆕 Creating new folder: ${folderName}`);
      }

      // 3️⃣ Ensure directory exists
      const uploadPath = path.join(baseUploadDir, folderName);
      ensureDir(uploadPath);

      // 4️⃣ Attach folder name to request for controller
      (req as any).imagefolder = folderName;

      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      cb(null, generateFilename(file));
    },
  });

  const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: maxSizeMB * 1024 * 1024 },
  });

  // ✅ Works with single/multi modes like before
  if (mode === "single" && typeof fields === "string") {
    return upload.single(fields);
  }

  if (mode === "multi" && Array.isArray(fields)) {
    return upload.fields(fields.map((name) => ({ name, maxCount: 20 })));
  }
  throw new Error("Invalid uploader configuration");
}