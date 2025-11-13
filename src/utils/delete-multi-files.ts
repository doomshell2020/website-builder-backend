import fs from "fs";
import path from "path";
import { Request } from "express";

/**
 * 🗑 Deletes uploaded files (single or multiple) from the /uploads/<folderName> directory.
 * Works with multer's req.file, req.files, and req.imagefolder (from createUploader).
 */
export const deleteUploadedFilesFromReq = (req: Request) => {
    try {
        // 🧩 Detect folder name (where files were uploaded)
        const folderName = (req as any).imagefolder || req.body?.imagefolder || null;

        if (!folderName) {
            console.warn("⚠️ No folder name found in request. Cannot delete files.");
            return;
        }

        // 🧩 Get all uploaded filenames
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

        // 🧩 Combine all filenames
        const allFiles = [
            ...(singleFile ? [singleFile] : []),
            ...multipleFiles,
        ];

        // 🧹 Delete each file from the folder
        allFiles.forEach((filename) => {
            const filePath = path.join(process.cwd(), "uploads", folderName, filename);

            if (fs.existsSync(filePath)) {
                try {
                    fs.unlinkSync(filePath);
                    console.log(`🗑 Deleted file: ${filePath}`);
                } catch (err) {
                    console.error(`❌ Failed to delete file "${filename}":`, err);
                }
            } else {
                console.warn(`⚠️ File not found: ${filePath}`);
            }
        });
    } catch (error) {
        console.error("❌ Error deleting uploaded files:", error);
    }
};