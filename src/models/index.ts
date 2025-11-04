import { Sequelize, DataTypes, Model, ModelStatic } from 'sequelize';
import glob from 'glob';
import path from 'path';

export const schemaModelMap = new Map<string, Record<string, ModelStatic<Model>>>();

const loadModels = (sequelize: Sequelize): Record<string, ModelStatic<Model>> => {
  const models: Record<string, ModelStatic<Model>> = {};
  const modelsPath = path.join(__dirname);
  const modelFiles = glob.sync(path.join(modelsPath, '**/*.model.ts'));

  for (const file of modelFiles) {
    const modelModule = require(file);
    const modelFactory = modelModule.default || modelModule;
    const model = modelFactory(sequelize, DataTypes);
    models[model.name] = model;
  }

  Object.values(models).forEach((model: any) => {
    if (typeof model.associate === 'function') {
      model.associate(models);
    }
  });

  return models;
};

// Load base models once
const baseModels = loadModels(require('../../config/database.config').default);

export default baseModels;


// {/** To separate the user.model.ts  */}

// import { Sequelize, DataTypes, Model, ModelStatic } from 'sequelize';
// import glob from 'glob';
// import path from 'path';

// export const schemaModelMap = new Map<string, Record<string, ModelStatic<Model>>>();

// const loadModels = (sequelize: Sequelize): Record<string, ModelStatic<Model>> => {
//   const models: Record<string, ModelStatic<Model>> = {};
//   const modelsPath = path.join(__dirname);

//   // Exclude user.model.ts
//   const modelFiles = glob.sync(path.join(modelsPath, '**/*.model.ts')).filter(
//     (file) => !file.endsWith('user.model.ts')
//   );

//   for (const file of modelFiles) {
//     const modelModule = require(file);
//     const modelFactory = modelModule.default || modelModule;
//     const model = modelFactory(sequelize, DataTypes);
//     models[model.name] = model;
//   }

//   // Run associations if defined
//   Object.values(models).forEach((model: any) => {
//     if (typeof model.associate === 'function') {
//       model.associate(models);
//     }
//   });

//   return models;
// };

// // Load base models once
// const baseModels = loadModels(require('../../config/database.config').default);

// export default baseModels;
