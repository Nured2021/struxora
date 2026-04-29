require('dotenv').config();

const jwtSecret = process.env.JWT_SECRET || 'change-this-development-secret';

module.exports = {
  jwtSecret,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1h',
};
