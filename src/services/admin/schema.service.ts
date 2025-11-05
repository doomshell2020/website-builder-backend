import sequelize from '../../../config/database.config';

export const createSchema = async (name: string) => {
  try {
    const sql = `CREATE SCHEMA IF NOT EXISTS "${name}";`;
    await sequelize.query(sql);
    return {
      status: true,
      message: ` Schema '${name}' created successfully.`,
    };
  } catch (error: any) {
    console.error('Schema creation error:', error);
    return {
      status: false,
      message: ' Failed to create schema.',
      error: error.message,
    };
  }
};

export const renameSchema = async (oldName: string, newName: string) => {
  try {
    if (!oldName || !newName) throw new Error("Schema names are required");

    // Check if schema exists first
    const [exists] = await sequelize.query(
      `SELECT schema_name FROM information_schema.schemata WHERE schema_name = :oldName`,
      { replacements: { oldName } }
    );

    if (!exists.length) {
      throw new Error(`Schema "${oldName}" does not exist`);
      // throw new Error(`Schema "${oldName}" does not exist`);
    }

    // Rename schema
    await sequelize.query(`ALTER SCHEMA "${oldName}" RENAME TO "${newName}"`);

    console.log(`✅ Schema renamed from ${oldName} to ${newName}`);
    return { success: true, message: `Schema renamed successfully` };
  } catch (error: any) {
    console.error("❌ Error renaming schema:", error);
    throw error;
  }
};

export const cloneSchemaService = async (oldSchema: string, newSchema: string,) => {

  const syncWithDataTables = [
    "cms_seos",
    "cms_banners",
    "cms_country",
    "cms_enquiry",
    "cms_sliders",
    "cms_statics",
    "cms_testimonials",
  ];

  try {
    const cloneTablesSql = `
      DO $$
      DECLARE
          obj record;
      BEGIN
          FOR obj IN
              SELECT tablename FROM pg_tables WHERE schemaname = '${oldSchema}'
          LOOP
              IF obj.tablename = ANY (ARRAY[${syncWithDataTables.map(t => `'${t}'`).join(',')}]) THEN
                EXECUTE format(
                    'CREATE TABLE IF NOT EXISTS %I.%I AS TABLE %I.%I WITH DATA',
                    '${newSchema}', obj.tablename, '${oldSchema}', obj.tablename
                );
              ELSE
                EXECUTE format(
                    'CREATE TABLE IF NOT EXISTS %I.%I (LIKE %I.%I INCLUDING ALL)',
                    '${newSchema}', obj.tablename, '${oldSchema}', obj.tablename
                );
              END IF;
          END LOOP;
      END $$;
    `;
    await sequelize.query(cloneTablesSql);

    return {
      status: true,
      message: `Schema '${oldSchema}' cloned to '${newSchema}' with selected tables containing data.`,
    };

  } catch (error: any) {
    console.error('Schema clone error:', error);
    return {
      status: false,
      message: 'Failed to clone schema or insert users.',
      error: error.message,
    };
  }
};

export const createAndCloneSchema = async (oldSchema: string, newSchema: string) => {
  const syncWithDataTables = [
    "cms_seos",
    "cms_banners",
    "cms_country",
    "cms_enquiry",
    "cms_sliders",
    "cms_statics",
    "cms_testimonials",
  ];

  try {
    // 1️⃣ Create the new schema if it doesn't exist
    await sequelize.query(`CREATE SCHEMA IF NOT EXISTS "${newSchema}"`);

    // 2️⃣ Clone tables and adjust id columns
    const cloneTablesSql = `
DO $$
DECLARE
    obj record;
    seqName text;
BEGIN
    FOR obj IN
        SELECT tablename FROM pg_tables WHERE schemaname = '${oldSchema}'
    LOOP
        -- Clone table structure + data or structure only
        IF obj.tablename = ANY (ARRAY[${syncWithDataTables.map(t => `'${t}'`).join(',')}]) THEN
            EXECUTE format(
                'CREATE TABLE IF NOT EXISTS %I.%I AS TABLE %I.%I WITH DATA',
                '${newSchema}', obj.tablename, '${oldSchema}', obj.tablename
            );
        ELSE
            EXECUTE format(
                'CREATE TABLE IF NOT EXISTS %I.%I (LIKE %I.%I INCLUDING ALL)',
                '${newSchema}', obj.tablename, '${oldSchema}', obj.tablename
            );
        END IF;

        -- Adjust id column if it exists
        IF EXISTS (
            SELECT 1
            FROM information_schema.columns
            WHERE table_schema = '${newSchema}'
              AND table_name = obj.tablename
              AND column_name = 'id'
        ) THEN
            seqName := obj.tablename || '_id_seq';

            -- Create sequence if it doesn't exist in the schema
            IF NOT EXISTS (
                SELECT 1
                FROM pg_class c
                JOIN pg_namespace n ON n.oid = c.relnamespace
                WHERE c.relname = seqName
                  AND n.nspname = '${newSchema}'
            ) THEN
                EXECUTE format('CREATE SEQUENCE %I.%I', '${newSchema}', seqName);
            END IF;

            -- Set default to nextval(sequence)
            EXECUTE format(
                'ALTER TABLE %I.%I ALTER COLUMN id SET DEFAULT nextval(''%I.%I'')',
                '${newSchema}', obj.tablename, '${newSchema}', seqName
            );

            -- Set NOT NULL
            EXECUTE format(
                'ALTER TABLE %I.%I ALTER COLUMN id SET NOT NULL',
                '${newSchema}', obj.tablename
            );

            -- Add primary key if not exists
            IF NOT EXISTS (
                SELECT 1
                FROM information_schema.table_constraints
                WHERE table_schema = '${newSchema}'
                  AND table_name = obj.tablename
                  AND constraint_type = 'PRIMARY KEY'
            ) THEN
                EXECUTE format(
                    'ALTER TABLE %I.%I ADD PRIMARY KEY (id)',
                    '${newSchema}', obj.tablename
                );
            END IF;

            -- Sync sequence with max(id)
            EXECUTE format(
                'SELECT setval(''%I.%I'', COALESCE((SELECT MAX(id)+1 FROM %I.%I),1), false)',
                '${newSchema}', seqName, '${newSchema}', obj.tablename
            );
        END IF;

    END LOOP;
END $$;
`;

    await sequelize.query(cloneTablesSql);

    return {
      status: true,
      message: `Schema '${oldSchema}' cloned to '${newSchema}' and all id columns set to SERIAL PRIMARY KEY NOT NULL.`,
    };
  } catch (error: any) {
    console.error('Schema clone error:', error);
    return {
      status: false,
      message: 'Failed to clone schema or adjust IDs.',
      error: error.message,
    };
  }
};

export const deleteSchema = async (schemaName: string) => {
  try {
    if (!schemaName) {
      throw new Error("Schema name is required");
    }

    // Optional: restrict schema names to alphanumeric + underscore to avoid SQL injection
    if (!/^[a-zA-Z0-9_]+$/.test(schemaName)) {
      throw new Error("Invalid schema name");
    }

    // Drop schema if exists and cascade to delete all tables
    const dropSchemaSql = `DROP SCHEMA IF EXISTS "${schemaName}" CASCADE;`;
    await sequelize.query(dropSchemaSql);

    return {
      status: true,
      message: `Schema '${schemaName}' deleted successfully.`,
    };

  } catch (error: any) {
    console.error("❌ Schema deletion error:", error);
    return {
      status: false,
      message: `Failed to delete schema '${schemaName}'.`,
      error: error.message,
    };
  }
};

interface DynamicField {
  name: string;
  type: string;
  notNull?: boolean;
  default?: string;
  references?: string; // e.g. cms_faq_categories(id)
  onDelete?: string; // e.g. CASCADE | SET NULL
}

export const addDynamicTableToAllSchemas = async (
  tableName: string,
  fields: DynamicField[],
  extraExclusions: string[] = [] // 🆕 optional dynamic exclusions
) => {
  try {
    // ✅ Base excluded schemas (system & internal)
    const excludedSchemas = [
      "pg_catalog",
      "information_schema",
      "public",
      "extensions",
      "auth",
      "graphql",
      "graphql_public",
      "pgbouncer",
      "realtime",
      "storage",
      "vault",
      "doomshell",
      "daac",
      "pg_toast",
      "pg_toast_temp_1",
      "pg_temp_1",
      ...extraExclusions // 🆕 dynamically exclude schemas
    ];

    const excludedList = excludedSchemas.map((s) => `'${s}'`).join(", ");

    // 🔍 Fetch all valid schemas
    const [schemas]: any = await sequelize.query(`
      SELECT schema_name
      FROM information_schema.schemata
      WHERE schema_name NOT IN (${excludedList})
        AND schema_name NOT LIKE 'pg_%';
    `);

    const baseFields = `
      id SERIAL PRIMARY KEY,
      "createdAt" TIMESTAMP DEFAULT NOW(),
      "updatedAt" TIMESTAMP DEFAULT NOW()
    `;

    for (const { schema_name } of schemas) {
      const customFieldSql = fields
        .map((field) => {
          const { name, type, notNull, default: def, references, onDelete } =
            field;
          let sql = `"${name}" ${type}`;
          if (notNull) sql += " NOT NULL";
          if (def) sql += ` DEFAULT ${def}`;
          if (references)
            sql += ` REFERENCES "${schema_name}".${references}${onDelete ? ` ON DELETE ${onDelete}` : ""
              }`;
          return sql;
        })
        .join(",\n");

      const createTableSql = `
        CREATE TABLE IF NOT EXISTS "${schema_name}"."${tableName}" (
          ${[baseFields, customFieldSql].join(",\n")}
        );
      `;

      await sequelize.query(createTableSql);
      console.log(`✅ Created ${tableName} in schema: ${schema_name}`);
    }

    return {
      status: true,
      message: `✅ Table "${tableName}" created successfully in all schemas (except excluded ones).`,
    };
  } catch (error: any) {
    console.error("❌ Dynamic Table Creation Error:", error);
    return {
      status: false,
      message: "❌ Failed to create table in all schemas",
      error: error.message,
    };
  }


  //   Example to input 
  //   {
  //   "table_name": "cms_faqs",
  //   "exclude_schemas": ["demo_client", "staging_tenant"], 
  //   "fields": [
  //     {
  //       "name": "category_id",
  //       "type": "INT",
  //       "references": "cms_faq_categories(id)",
  //       "onDelete": "SET NULL"
  //     },
  //     { "name": "question", "type": "TEXT", "notNull": true },
  //     { "name": "answer", "type": "TEXT", "notNull": true },
  //     { "name": "slug", "type": "TEXT" },
  //     { "name": "status", "type": "status_enum", "default": "'Y'" },
  //     { "name": "deleted", "type": "delete_enum", "default": "'N'" }
  //   ]
  // }

};

interface DeleteOptions {
  tableName: string;
  excludeSchemas?: string[]; // schemas to skip
  includeSchemas?: string[]; // if provided, only delete in these schemas
  cascade?: boolean;         // drop dependent objects too
}

export const deleteTableFromAllSchemas = async ({
  tableName,
  excludeSchemas = [],
  includeSchemas,
  cascade = false
}: DeleteOptions) => {
  try {
    // Default system/internal schemas to exclude
    const systemSchemas = [
      "pg_catalog",
      "information_schema",
      "public",
      "extensions",
      "auth",
      "graphql",
      "graphql_public",
      "pgbouncer",
      "realtime",
      "storage",
      "vault",
      "doomshell",
      "daac",
      "pg_toast",
      "pg_toast_temp_1",
      "pg_temp_1"
    ];

    // Merge default system schemas with user-defined excluded schemas
    const excludedSchemaList = [...systemSchemas, ...excludeSchemas]
      .map(s => `'${s}'`)
      .join(", ");

    // Fetch all schemas except excluded ones
    const [schemas]: any = await sequelize.query(`
      SELECT schema_name
      FROM information_schema.schemata
      WHERE schema_name NOT IN (${excludedSchemaList})
        AND schema_name NOT LIKE 'pg_%';
    `);

    for (const { schema_name } of schemas) {
      // Skip if includeSchemas is provided and schema_name not in it
      if (includeSchemas && !includeSchemas.includes(schema_name)) {
        console.log(`🚫 Skipped schema "${schema_name}" (not in include list)`);
        continue;
      }

      const dropSql = `DROP TABLE IF EXISTS "${schema_name}"."${tableName}" ${cascade ? "CASCADE" : ""};`;
      await sequelize.query(dropSql);
      console.log(`✅ Dropped table "${tableName}" in schema "${schema_name}"`);
    }

    return {
      status: true,
      message: `Table "${tableName}" processed for deletion with schema include/exclude rules.`,
    };

  } catch (error: any) {
    console.error("❌ Table deletion error:", error);
    return { status: false, message: "Failed to delete table", error: error.message };
  }
};

export const addColumnToAllSchemas = async (tableName: string, columnName: string, columnType: string) => {
  try {
    if (!tableName || !columnName || !columnType) {
      throw new Error("Table name, column name, and column type are required");
    }

    const excludedSchemas = [
      'pg_catalog', 'information_schema', 'public', 'extensions', 'auth',
      'graphql', 'graphql_public', 'pgbouncer', 'realtime', 'storage',
      'vault', 'doomshell', 'tenantdemo', 'demo', 'daac',
      'pg_toast', 'pg_toast_temp_1', 'pg_temp_1' // <-- Add these
    ];

    const excludedList = excludedSchemas.map(s => `'${s}'`).join(', ');

    const [schemas]: any = await sequelize.query(`
  SELECT schema_name
  FROM information_schema.schemata
  WHERE schema_name NOT IN (${excludedList})
    AND schema_name NOT LIKE 'pg_%';
`);


    for (const { schema_name } of schemas) {
      const alterSql = `
        ALTER TABLE "${schema_name}"."${tableName}"
        ADD COLUMN IF NOT EXISTS "${columnName}" ${columnType};
      `;
      await sequelize.query(alterSql);
      console.log(`✅ Column added in schema: ${schema_name}`);
    }

    return { status: true, message: `Column '${columnName}' added to all schemas successfully` };
  } catch (error: any) {
    console.error("❌ Column addition error:", error);
    return { status: false, message: "Failed to add column in all schemas", error: error.message };
  }
};

export const deleteColumnFromAllSchemas = async (tableName: string, columnName: string) => {
  try {
    if (!tableName || !columnName) {
      throw new Error("Table name and column name are required");
    }

    const excludedSchemas = [
      'pg_catalog', 'information_schema', 'public', 'extensions', 'auth',
      'graphql', 'graphql_public', 'pgbouncer', 'realtime', 'storage',
      'vault', 'doomshell', 'tenantdemo', 'demo', 'daac',
      'pg_toast', 'pg_toast_temp_1', 'pg_temp_1'
    ];

    const excludedList = excludedSchemas.map(s => `'${s}'`).join(', ');

    const [schemas]: any = await sequelize.query(`
  SELECT schema_name
  FROM information_schema.schemata
  WHERE schema_name NOT IN (${excludedList})
    AND schema_name NOT LIKE 'pg_%';
`);


    for (const { schema_name } of schemas) {
      const alterSql = `
        ALTER TABLE "${schema_name}"."${tableName}"
        DROP COLUMN IF EXISTS "${columnName}" CASCADE;
      `;
      await sequelize.query(alterSql);
      console.log(`🗑️  Column '${columnName}' deleted from schema: ${schema_name}`);
    }

    return { status: true, message: `Column '${columnName}' deleted from all schemas successfully` };
  } catch (error: any) {
    console.error("❌ Column deletion error:", error);
    return { status: false, message: "Failed to delete column from all schemas", error: error.message };
  }
};

export const getAllSchemas = async (page = 1, limit = 10) => {
  try {
    const offset = (page - 1) * limit;

    // Schemas to exclude
    const excludedSchemas = [
      'pg_catalog', 'information_schema', 'public', 'extensions', 'auth', 'graphql',
      'graphql_public', 'pgbouncer', 'realtime', 'storage', 'vault', 'doomshell', 'tenantdemo', 'demo'
    ];

    const [countResult]: any = await sequelize.query(`
      SELECT COUNT(*) AS total
      FROM information_schema.schemata
      WHERE schema_name NOT IN (${excludedSchemas.map(s => `'${s}'`).join(',')})
        AND schema_name NOT LIKE 'pg_toast%'
        AND schema_name NOT LIKE 'pg_temp%';
    `);
    const total = parseInt(countResult[0].total, 10);

    const [schemasResult]: any = await sequelize.query(`
      SELECT schema_name
      FROM information_schema.schemata
      WHERE schema_name NOT IN (${excludedSchemas.map(s => `'${s}'`).join(',')})
        AND schema_name NOT LIKE 'pg_toast%'
        AND schema_name NOT LIKE 'pg_temp%'
      ORDER BY schema_name
      LIMIT ${limit} OFFSET ${offset};
    `);

    const schemas = [];

    for (const row of schemasResult) {
      const schemaName = row.schema_name;

      const [tablesResult]: any = await sequelize.query(`
        SELECT 
          relname AS table_name,
          reltuples::BIGINT AS estimated_rows
        FROM pg_class
        JOIN pg_namespace ON pg_namespace.oid = pg_class.relnamespace
        WHERE pg_namespace.nspname = '${schemaName}'
          AND pg_class.relkind = 'r';
      `);

      const [usersResult]: any = await sequelize.query(`
        SELECT id, name, email, mobile_no, "createdAt"
        FROM public.cms_users
        WHERE company_name = '${schemaName}'
      `);

      schemas.push({
        schemaName,
        createdAt: null,
        tables: tablesResult.map((tbl: any) => ({
          tableName: tbl.table_name,
          rowCount: parseInt(tbl.estimated_rows, 10),
        })),
        users: usersResult,
      });
    }

    return {
      schemas,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error: any) {
    console.error('Error fetching schemas:', error);
    throw new Error('Failed to fetch schemas');
  }
};
