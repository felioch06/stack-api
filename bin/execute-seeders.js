const fs = require('fs');
const path = require('path');
const { camelCase } = require('typeorm/util/StringUtils');
const mysql = require('mysql');

const main = async () => {
  const seedersPath = path.resolve(
    process.env.PWD,
    'src',
    'database',
    'seeders'
  );

  const fileNames = fs.readdirSync(seedersPath);

  const schemaStructure = fileNames.map(fileName => {
    const tableName = fileName.replace('.json', '').replace(/\-/g, '_');

    const filePath = path.join(seedersPath, fileName);
    const fileContents = JSON.parse(fs.readFileSync(filePath).toString());

    const tableFields = Object.keys(fileContents[0]);

    const tableValues = fileContents.map(o => Object.values(o));

    return {
      [tableName]: {
        fields: tableFields,
        values: tableValues,
      },
    };
  });

  const mysqlConnection = mysql.createConnection({
    database: process.env.DB_DATABASE,
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
    debug: true,
  });

  const query = (query, values) => {
    return new Promise((resolve, reject) => {
      mysqlConnection.query(query, values, (err, res) => {
        if (err) {
          reject(err);
        }

        resolve(res);
      });
    });
  };

  await query('SET FOREIGN_KEY_CHECKS=0');

  for (const schema of schemaStructure) {
    const tableName = Object.keys(schema)[0];
    const tableFields = schema[tableName].fields.join(',');
    const tableValues = schema[tableName].values
      .map(val => val.map(v => mysqlConnection.escape(v)))
      .map(vals => `(${vals.join(',')})`)
      .join(',');

    await query(`truncate table ${tableName}`);

    await query(
      `
      insert into ${tableName} (${tableFields})
        values ${tableValues}
    `
    );
  }

  await query('SET FOREIGN_KEY_CHECKS=1');

  process.exit(0);
};

main();
