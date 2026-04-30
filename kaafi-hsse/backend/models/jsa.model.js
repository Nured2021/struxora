const db = require('../config/db');

async function createJsaDocumentsTable() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS jsa_documents (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      description TEXT NOT NULL,
      location VARCHAR(255),
      created_by INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'approved')),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
}

async function createJsaDocument({ title, description, location, createdBy, status }) {
  const result = await db.query(
    `INSERT INTO jsa_documents (title, description, location, created_by, status)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, title, description, location, created_by, status, created_at`,
    [title, description, location || null, createdBy, status],
  );

  return result.rows[0];
}

async function listJsaDocuments() {
  const result = await db.query(
    `SELECT id, title, description, location, created_by, status, created_at
     FROM jsa_documents
     ORDER BY created_at DESC`,
  );

  return result.rows;
}

async function findJsaDocumentById(id) {
  const result = await db.query(
    `SELECT id, title, description, location, created_by, status, created_at
     FROM jsa_documents
     WHERE id = $1`,
    [id],
  );

  return result.rows[0] || null;
}

module.exports = {
  createJsaDocumentsTable,
  createJsaDocument,
  listJsaDocuments,
  findJsaDocumentById,
};
