require('dotenv').config();

const useSsl = process.env.DB_SSL !== 'false';
const rejectUnauthorized = process.env.DB_SSL_REJECT_UNAUTHORIZED === 'true';
const ca = process.env.DB_SSL_CA_BASE64
  ? Buffer.from(process.env.DB_SSL_CA_BASE64, 'base64').toString('utf8')
  : undefined;

const dialectOptions = useSsl
  ? {
      ssl: {
        require: true,
        rejectUnauthorized,
        ...(ca ? { ca } : {}),
      },
    }
  : {};

const envVar = process.env.DATABASE_URL
  ? 'DATABASE_URL'
  : process.env.DB_URL
    ? 'DB_URL'
    : null;

const common = {
  dialect: 'postgres',
  dialectOptions,
};

const urlConfig = envVar
  ? {
      use_env_variable: envVar,
      ...common,
    }
  : null;

const discreteConfig = {
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  ...common,
};

module.exports = {
  development: urlConfig || discreteConfig,
  production: urlConfig || discreteConfig,
};
