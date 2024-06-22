import { registerAs } from '@nestjs/config';

export default registerAs('jwt', () => ({
  secret: process.env.JWT_SECRET || 'temp secret',
  salt: process.env.DEFAULT_SALT || 10,
  lifetime: process.env.JWT_LIFETIME || '1d',
  refreshLifetime: process.env.JWT_REFRESH_LIFETIME || '7d',
}));
