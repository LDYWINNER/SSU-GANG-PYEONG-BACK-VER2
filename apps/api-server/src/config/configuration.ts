export default () => ({
  ENVIRONMENT: process.env.ENVIRONMENT,
  DB_HOST: process.env.DB_HOST,
  DB_PORT: process.env.DB_PORT,
  DB_NAME: process.env.DB_NAME,
  DB_USERNAME: process.env.DB_USERNAME,
  DB_PASSWORD: process.env.DB_PASSWORD,
  DEFAULT_SALT: process.env.DEFAULT_SALT,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_LIFETIME: process.env.JWT_LIFETIME,
  JWT_REFRESH_LIFETIME: process.env.JWT_REFRESH_LIFETIME,
  SENTRY_DSN: process.env.SENTRY_DSN,
  SLACK_WEBHOOK_URL: process.env.SLACK_WEBHOOK_URL,
});
