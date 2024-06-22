export default () => ({
  STAGE: process.env.STAGE,
  DEFAULT_SALT: process.env.DEFAULT_SALT,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_LIFETIME: process.env.JWT_LIFETIME,
  JWT_REFRESH_LIFETIME: process.env.JWT_REFRESH_LIFETIME,
  SENTRY_DSN: process.env.SENTRY_DSN,
  SLACK_WEBHOOK: process.env.SLACK_WEBHOOK,
  EMAIL_USER: process.env.EMAIL_USER,
  EMAIL_PASS: process.env.EMAIL_PASS,
});
