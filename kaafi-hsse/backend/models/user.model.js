const db = require('../config/db');

const VALID_ROLES = ['Admin', 'Supervisor', 'Worker'];

async function createUsersTable() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      role VARCHAR(50) NOT NULL CHECK (role IN ('Admin', 'Supervisor', 'Worker')),
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

async function createUser({ email, passwordHash, role }) {
  const result = await db.query(
    `INSERT INTO users (email, password_hash, role)
     VALUES ($1, $2, $3)
     RETURNING id, email, role, created_at`,
    [email, passwordHash, role],
  );

  return result.rows[0];
}

async function findUserByEmail(email) {
  const result = await db.query(
    `SELECT id, email, password_hash, role, created_at
     FROM users
     WHERE email = $1`,
    [email],
  );

  return result.rows[0] || null;
}

module.exports = {
  VALID_ROLES,
  createUsersTable,
  createUser,
  findUserByEmail,
};
