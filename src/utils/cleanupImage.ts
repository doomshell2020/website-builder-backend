import fs from 'fs';
import path from 'path';

const deleteFile = (filename: string) => {
  const filePath = path.join(process.cwd(), 'uploads', filename);
  if (fs.existsSync(filePath)) {
    try {
      fs.unlinkSync(filePath);
    } catch (err) {
      console.error('Failed to delete uploaded file:', err);
    }
  }
};

const cleanupUploads = (req: any) => {
  // Single file
  if (req.file?.filename) deleteFile(req.file.filename);

  // Multiple files
  if (req.files) {
    Object.values(req.files).forEach((fileOrFiles: any) => {
      const files = Array.isArray(fileOrFiles) ? fileOrFiles : [fileOrFiles];
      files.forEach((f: any) => f.filename && deleteFile(f.filename));
    });
  }
};

export default cleanupUploads;
