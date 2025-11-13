import fs from "fs";
import path from "path";

/**
 * 🗑 Deletes an entire upload folder if it exists.
 * Example: deleteUploadFolder("tenantA_1731424523123");
 */
export const deleteUploadFolder = (folderName?: string) => {
  if (!folderName) return;

  try {
    const folderPath = path.join(process.cwd(), "uploads", folderName);

    if (fs.existsSync(folderPath)) {
      fs.rmSync(folderPath, { recursive: true, force: true });
      console.log(`🗑 Deleted folder: ${folderPath}`);
    } else {
      console.warn(`⚠️ Folder not found: ${folderPath}`);
    }
  } catch (error) {
    console.error(`❌ Error deleting folder (${folderName}):`, error);
  }
};