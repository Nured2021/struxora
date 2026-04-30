const db = require('../config/db');

async function createPtwPermitsTable() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS ptw_permits (
      id SERIAL PRIMARY KEY,
      jsa_id INTEGER NOT NULL REFERENCES jsa_documents(id) ON DELETE CASCADE,
      risk_id INTEGER NOT NULL REFERENCES risk_assessments(id) ON DELETE CASCADE,
      permit_type VARCHAR(50) NOT NULL,
      description TEXT NOT NULL,
      start_time TIMESTAMPTZ NOT NULL,
      end_time TIMESTAMPTZ NOT NULL,
      status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
      created_by INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
}

async function createPtwPermit({
  jsaId,
  riskId,
  permitType,
  description,
  startTime,
  endTime,
  createdBy,
}) {
  const result = await db.query(
    `INSERT INTO ptw_permits
       (jsa_id, risk_id, permit_type, description, start_time, end_time, status, created_by)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING id, jsa_id, risk_id, permit_type, description, start_time, end_time, status, created_by, created_at`,
    [jsaId, riskId, permitType, description, startTime, endTime, 'pending', createdBy],
  );

  return result.rows[0];
}

async function listPtwPermits() {
  const result = await db.query(
    `SELECT id, jsa_id, risk_id, permit_type, description, start_time, end_time, status, created_by, created_at
     FROM ptw_permits
     ORDER BY created_at DESC`,
  );

  return result.rows;
}

async function findPtwPermitById(id) {
  const result = await db.query(
    `SELECT id, jsa_id, risk_id, permit_type, description, start_time, end_time, status, created_by, created_at
     FROM ptw_permits
     WHERE id = $1`,
    [id],
  );

  return result.rows[0] || null;
}

module.exports = {
  createPtwPermitsTable,
  createPtwPermit,
  listPtwPermits,
  findPtwPermitById,
};
