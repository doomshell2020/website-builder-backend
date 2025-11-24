import sequelize from "../../../config/database.config";
import ExcelJS from "exceljs";
import archiver from "archiver";
import fs from "fs";
import path from "path";

type ExportFormat = "json" | "excel" | "sql";

export class ExportZipService {

  private excludedTables = ["cms_country"];

  async exportSchemaZip(schema: string, formats: ExportFormat[] = ["json", "excel", "sql"]): Promise<string> {
    // Ensure lowercase/unique
    formats = [...new Set(formats.map(f => f.toLowerCase() as ExportFormat))];

    const schemaName = schema.toLowerCase().trim();
    const timestamp = Date.now();

    const exportFolder = path.join(__dirname, "../../exports");
    if (!fs.existsSync(exportFolder)) fs.mkdirSync(exportFolder, { recursive: true });

    const tempDir = path.join(exportFolder, `${schemaName}_${timestamp}`);
    fs.mkdirSync(tempDir);

    console.log(`📁 Exporting schema '${schemaName}' with formats:`, formats);

    // -------------------------------------------------------------------------
    // STEP 1: GET TABLE LIST
    // -------------------------------------------------------------------------
    const tables = await sequelize.query<{ table_name: string }>(
      `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = :schema 
      AND table_type='BASE TABLE'
      ORDER BY table_name ASC
      `,
      { replacements: { schema: schemaName }, type: "SELECT" as any }
    );

    if (!tables.length) throw new Error(`Schema '${schemaName}' has no tables.`);

    const jsonData: Record<string, any[]> = {};
    let sqlDump = "";

    // -------------------------------------------------------------------------
    // STEP 2: FETCH DATA
    // -------------------------------------------------------------------------
    for (const { table_name } of tables) {
      if (!table_name) continue;
      const table = table_name.toLowerCase();

      if (this.excludedTables.includes(table)) {
        console.log(`⛔ Skipped: ${schemaName}.${table}`);
        continue;
      }

      const rows: any[] = await sequelize.query(
        `SELECT * FROM "${schemaName}"."${table}"`,
        { type: "SELECT" }
      );

      jsonData[table] = rows;

      console.log(`✔ Loaded ${rows.length} rows from ${table}`);

      // If exporting SQL
      if (formats.includes("sql")) {
        const structure = await this.getTableStructure(schemaName, table);

        sqlDump += `
-- ---------------------------------------------
-- TABLE: ${schemaName}.${table}
-- ---------------------------------------------
DROP TABLE IF EXISTS "${schemaName}"."${table}" CASCADE;
${structure};
`;

        if (rows.length) {
          sqlDump += `\n-- Insert Data\n`;
          rows.forEach(row => {
            const columns = Object.keys(row).map(c => `"${c}"`).join(", ");
            const values = Object.values(row).map(v =>
              v === null ? "NULL" : `'${String(v).replace(/'/g, "''")}'`
            );
            sqlDump += `INSERT INTO "${schemaName}"."${table}" (${columns}) VALUES (${values.join(", ")});\n`;
          });
        }

        sqlDump += `\n`;
      }
    }

    // -------------------------------------------------------------------------
    // STEP 3: GENERATE FILES BASED ON FORMAT SELECTED
    // -------------------------------------------------------------------------

    if (formats.includes("json")) {
      fs.writeFileSync(path.join(tempDir, `${schemaName}.json`), JSON.stringify(jsonData, null, 2));
      console.log(`📄 JSON created`);
    }

    if (formats.includes("excel")) {
      const workbook = new ExcelJS.Workbook();

      for (const table of Object.keys(jsonData)) {
        const sheet = workbook.addWorksheet(table);
        const rows = jsonData[table];

        let columns = rows.length ? Object.keys(rows[0]) : await this.getTableColumns(schemaName, table);

        sheet.columns = columns.map(col => ({ header: col, key: col, width: 20 }));

        rows.forEach(row => sheet.addRow({ ...row }));
      }

      await workbook.xlsx.writeFile(path.join(tempDir, `${schemaName}.xlsx`));
      console.log(`📊 Excel created`);
    }

    if (formats.includes("sql")) {
      fs.writeFileSync(path.join(tempDir, `${schemaName}.sql`), sqlDump);
      console.log(`🛠 SQL created`);
    }

    // -------------------------------------------------------------------------
    // STEP 4: ZIP
    // -------------------------------------------------------------------------
    const finalZip = path.join(exportFolder, `${schemaName}_${timestamp}.zip`);
    await this.createZip(tempDir, finalZip);

    fs.rmSync(tempDir, { recursive: true });

    console.log(`🎉 Export complete → ${finalZip}`);
    return finalZip;
  }


  private async getTableStructure(schema: string, table: string): Promise<string> {
    const rows = await sequelize.query<any>(
      `
      SELECT column_name, data_type, is_nullable, column_default 
      FROM information_schema.columns
      WHERE table_schema = :schema AND table_name = :table
      ORDER BY ordinal_position ASC
      `,
      { replacements: { schema, table }, type: "SELECT" as any }
    );

    let sql = `CREATE TABLE "${schema}"."${table}" (\n`;

    sql += rows.map(col => {
      let line = `  "${col.column_name}" ${col.data_type}`;
      if (col.column_default) line += ` DEFAULT ${col.column_default}`;
      if (col.is_nullable === "NO") line += " NOT NULL";
      return line;
    }).join(",\n");

    sql += `\n);`;

    return sql;
  }

  private async getTableColumns(schema: string, table: string): Promise<string[]> {
    const cols = await sequelize.query<{ column_name: string }>(
      `
      SELECT column_name FROM information_schema.columns
      WHERE table_schema = :schema AND table_name = :table
      ORDER BY ordinal_position ASC
      `,
      { replacements: { schema, table }, type: "SELECT" as any }
    );
    return cols.map(c => c.column_name);
  }

  private createZip(source: string, dest: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const output = fs.createWriteStream(dest);
      const archive = archiver("zip", { zlib: { level: 9 } });

      archive.pipe(output);
      archive.directory(source, false);
      archive.finalize();
      archive.on("error", reject);
      output.on("close", resolve);
    });
  }
};
