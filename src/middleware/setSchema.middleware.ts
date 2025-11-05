import { Request, Response, NextFunction } from 'express';
import sequelize from '../../config/database.config';
import baseModels, { schemaModelMap } from '../models';

declare module 'express-serve-static-core' {
  interface Request {
    schema?: string;
  }
}

export const setSchema = async (req: Request, res: Response, next: NextFunction) => {
  const schema = req.headers['x-schema'] as string;

  if (!schema) {
    return res.status(400).json({ message: '❌ Schema header is missing' });
  }

  try {
    const [schemas] = await sequelize.query(
      `SELECT schema_name FROM information_schema.schemata WHERE schema_name = :schema`,
      { replacements: { schema } }
    );

    if ((schemas as any[]).length === 0) {
      return res.status(404).json({ message: `❌ Schema '${schema}' not found in database.` });
    }
    // Attach schema to request
    req.schema = schema;

    // Dynamically apply schema to all models
    if (!schemaModelMap.has(schema)) {
      const clonedModels: any = {};

      for (const [name, model] of Object.entries(baseModels)) {
        // Clone the model into the schema
        clonedModels[name] = model.schema(schema);
      }

      schemaModelMap.set(schema, clonedModels);
    }

    // 🔥 Inject into baseModels directly — override model pointers
    const schemaModels = schemaModelMap.get(schema)!;
    for (const key in schemaModels) {
      (baseModels as any)[key] = schemaModels[key];
    }

    return next();
  } catch (error: any) {
    return res.status(500).json({ message: '❌ Schema validation failed', error: error.message });
  }
};