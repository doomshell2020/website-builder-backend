import fs from "fs";
import path from "path";
import { Request } from "express";

/** * Deletes uploaded files (single or multiple) from the /uploads directory using req.
 * Works with multer's `req.file` or `req.files`.
 */

export const deleteUploadedFilesFromReq = (req: Request) => {
    // Support single file
    const singleFile = req.file?.filename;

    // Support multiple files (from multer's array or fields)
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

    // Combine all filenames
    const allFiles = [
        ...(singleFile ? [singleFile] : []),
        ...multipleFiles,
    ];

    allFiles.forEach((filename) => {
        const filePath = path.join(process.cwd(), "uploads", filename);
        if (fs.existsSync(filePath)) {
            try {
                fs.unlinkSync(filePath);
                console.log(`Deleted file: ${filename}`);
            } catch (err) {
                console.error(`Failed to delete file "${filename}":`, err);
            }
        } else {
            console.warn(`File not found: ${filename}`);
        }
    });
};
