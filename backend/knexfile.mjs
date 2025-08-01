import 'dotenv/config';
/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */
const config = {
  development: {
      client: 'mysql2',
      connection: {
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT),
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
      },
      migrations: {
        directory: './database/migrations',
        loadExtensions: ['.js', '.mjs'] // Support both .js and .mjs extensions
      },
      seeds: {
        directory: './database/seeds'
      }
    },
    production: {
      client: 'mysql2',
      connection: {
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT),
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
      },
      migrations: {
        directory: './database/migrations',
        loadExtensions: ['.js', '.mjs'] // Support both .js and .mjs extensions
      },
      seeds: {
        directory: './database/seeds'
      }
    }
  };
export default config;
