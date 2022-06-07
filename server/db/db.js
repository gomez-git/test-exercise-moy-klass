import knex from 'knex';
import knexfile from './knexfile.js';

const enviroment = process.env.NODE_ENV ?? 'development';

export default knex(knexfile[enviroment]);
