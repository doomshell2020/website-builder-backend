import fs from 'fs';
import path from 'path';

// 🧹 File Delete Helper
export const deleteFile = (filename?: string) => {
    if (!filename) return;

    try {
        // 🧠 Clean input to avoid double "uploads/"
        // This handles both "tenantA_123/file.png" and "uploads/tenantA_123/file.png"
        const cleanFilename = filename.replace(/^uploads[\\/]/, "");

        const filePath = path.join(process.cwd(), "uploads", cleanFilename);

        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            console.log(`🗑 Deleted file: ${filePath}`);
        } else {
            console.warn(`⚠️ File not found: ${filePath}`);
        }
    } catch (error) {
        console.error(`❌ Error deleting file: ${filename}`, error);
    }
};