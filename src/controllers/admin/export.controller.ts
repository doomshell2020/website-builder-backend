import { Request, Response } from "express";
import fs from "fs";
import { ExportZipService } from "../../services/admin/export.service";

const exporter = new ExportZipService();

export const downloadSchemaZip = async (req: Request, res: Response) => {
  try {
    const { name } = req.params;
    const { format } = req.query;

    // convert incoming format param to array: "json,excel" → ["json","excel"]
    const formats: any = format
      ? String(format).split(",").map(f => f.trim().toLowerCase())
      : ["json", "excel", "sql"]; // default all

    const zipPath = await exporter.exportSchemaZip(name, formats);

    res.download(zipPath, () => {
      // Optional: Delete file after download completes
      setTimeout(() => {
        if (fs.existsSync(zipPath)) fs.unlinkSync(zipPath);
      }, 5000);
    });

  } catch (err) {
    console.error("❌ ZIP Export Failed:", err);
    res.status(500).json({ error: "Failed to export ZIP" });
  }
};