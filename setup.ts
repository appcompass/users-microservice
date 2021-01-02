import * as Joi from 'joi';
import * as vault from 'node-vault';
import { createConnection } from 'typeorm';

const arg = process.argv[process.argv.length - 1].trim();
const parsedArg = Object.fromEntries([arg.split(':')]);

const validator = Joi.object({
  generate: Joi.string().valid('secrets'),
  schema: Joi.string().valid('create', 'drop', 'reset')
});

const { error } = validator.validate({ ...parsedArg });

if (error) {
  throw new Error(`validation error: ${error.message}`);
}

const queryRunner = (query) =>
  import('./src/db/cli-config').then((config) =>
    createConnection({ ...config, synchronize: false, migrationsRun: false })
      .then((connection) => connection.query(query(config)).then(() => connection.close()))
      .catch(console.log)
  );

const commands = {
  'generate:secrets': async () => {
    const client = vault({
      token: process.env.VAULT_ADMIN_TOKEN
    });

    await Promise.all([
      client
        .write('secret/service/shared/usersServiceHost', {
          value: '0.0.0.0'
        })
        .catch(console.error),
      client
        .write('secret/service/shared/usersServicePort', {
          value: 3001
        })
        .catch(console.error),
      client
        .write('secret/service/users/dbType', {
          value: 'postgres'
        })
        .catch(console.error),
      client
        .write('secret/service/users/dbHost', {
          value: process.env.DB_HOST
        })
        .catch(console.error),
      client
        .write('secret/service/users/dbPort', {
          value: process.env.DB_PORT
        })
        .catch(console.error),
      client
        .write('secret/service/users/dbSchema', {
          value: process.env.DB_SCHEMA
        })
        .catch(console.error),
      client
        .write('secret/service/users/dbUser', {
          value: process.env.DB_USER
        })
        .catch(console.error),
      client
        .write('secret/service/users/dbPassword', {
          value: process.env.DB_PASSWORD
        })
        .catch(console.error),
      client
        .write('secret/service/users/dbName', {
          value: process.env.DB_NAME
        })
        .catch(console.error),
      client
        .write('secret/service/users/dbSyncronize', {
          value: process.env.DB_SYNCHRONIZE
        })
        .catch(console.error),
      client
        .write('secret/service/users/natsQueue', {
          value: 'users'
        })
        .catch(console.error)
    ]).then(() => console.log('secrets set'));
  },
  'schema:create': () => queryRunner((config) => `create schema if not exists ${config.schema};`),
  'schema:drop': () => queryRunner((config) => `drop schema if exists ${config.schema} cascade;`),
  'schema:reset': () =>
    queryRunner(
      (config) => `create schema if not exists ${config.schema}; drop schema if exists ${config.schema} cascade;`
    )
};

commands[arg]();
