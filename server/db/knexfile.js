export default {
  test: {
    client: 'pg',
    connection: process.env.PG_CONNECTION_STRING,
  },
  development: {
    client: 'pg',
    connection: process.env.PG_CONNECTION_STRING,
  },
};
