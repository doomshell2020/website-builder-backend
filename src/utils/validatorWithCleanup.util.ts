import fs from "fs";
import path from "path";
import { Request, Response, NextFunction } from "express";

/** * ✅ Middleware that validates req.body with a schema,
 * and cleans up uploaded files (inside /uploads/<folder>) if validation fails. */
const validateWithCleanup = (schema: any) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body);

    if (error) {
      console.warn("⚠️ Validation failed:", error.details?.[0]?.message);

      // 🧹 Clean up all uploaded files (if any)
      deleteUploadedFilesFromReq(req);

      // Respond with validation error
      return res.status(400).json({
        status: false,
        message: error.details[0].message,
      });
    }

    next();
  };
};

/** * 🧹 Deletes uploaded files (single or multiple) from the /uploads/<folderName> directory.
 * Works with multer's req.file, req.files, and req.imagefolder. */
function deleteUploadedFilesFromReq(req: Request) {
  try {
    const folderName = (req as any).imagefolder || req.body?.imagefolder || null;

    if (!folderName) {
      console.warn("⚠️ No folder name found in request. Cannot delete uploaded files.");
      return;
    }

    // 🧩 Gather all filenames
    const singleFile = req.file?.filename;
    let multipleFiles: string[] = [];

    if (Array.isArray(req.files)) {
      // Case: upload.array()
      multipleFiles = req.files.map((file: any) => file.filename);
    } else if (req.files && typeof req.files === "object") {
      // Case: upload.fields()
      Object.values(req.files).forEach((fileArray: any) => {
        fileArray.forEach((file: any) => multipleFiles.push(file.filename));
      });
    }

    const allFiles = [...(singleFile ? [singleFile] : []), ...multipleFiles];

    if (allFiles.length === 0) {
      console.warn("⚠️ No uploaded files found to delete.");
      return;
    }

    // 🧹 Delete files one by one
    allFiles.forEach((filename) => {
      const filePath = path.join(process.cwd(), "uploads", folderName, filename);
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
          console.log(`🗑 Deleted file due to validation failure: ${filePath}`);
        } catch (err) {
          console.error(`❌ Failed to delete file "${filename}":`, err);
        }
      } else {
        console.warn(`⚠️ File not found: ${filePath}`);
      }
    });

    // ✅ Optionally delete the folder if it’s empty afterward
    const folderPath = path.join(process.cwd(), "uploads", folderName);
    if (fs.existsSync(folderPath) && fs.readdirSync(folderPath).length === 0) {
      fs.rmSync(folderPath, { recursive: true, force: true });
      console.log(`🗑 Deleted empty folder after cleanup: ${folderPath}`);
    }
  } catch (error) {
    console.error("❌ Error while cleaning up uploaded files:", error);
  }
}

export default validateWithCleanup;