export default () => ({
  port: parseInt(process.env.PORT || '8500', 10),
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME || 'bloguser',
    password: process.env.DB_PASSWORD || 'blogpass',
    database: process.env.DB_NAME || 'blogdb',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'supersecret',
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
  },
});
