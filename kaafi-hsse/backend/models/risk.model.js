const db = require('../config/db');

async function createRiskAssessmentsTable() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS risk_assessments (
      id SERIAL PRIMARY KEY,
      jsa_id INTEGER NOT NULL REFERENCES jsa_documents(id) ON DELETE CASCADE,
      hazard TEXT NOT NULL,
      risks JSONB NOT NULL DEFAULT '[]'::jsonb,
      controls JSONB NOT NULL DEFAULT '[]'::jsonb,
      likelihood INTEGER NOT NULL CHECK (likelihood BETWEEN 1 AND 5),
      severity INTEGER NOT NULL CHECK (severity BETWEEN 1 AND 5),
      risk_score INTEGER NOT NULL,
      created_by INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
  await db.query(`
    ALTER TABLE risk_assessments
    ADD COLUMN IF NOT EXISTS risks JSONB NOT NULL DEFAULT '[]'::jsonb;
  `);
  await db.query(`
    ALTER TABLE risk_assessments
    ADD COLUMN IF NOT EXISTS controls JSONB NOT NULL DEFAULT '[]'::jsonb;
  `);
}

async function createRiskAssessment({ jsaId, hazard, risks, controls, likelihood, severity, riskScore, createdBy }) {
  const result = await db.query(
    `INSERT INTO risk_assessments (jsa_id, hazard, risks, controls, likelihood, severity, risk_score, created_by)
     VALUES ($1, $2, $3::jsonb, $4::jsonb, $5, $6, $7, $8)
     RETURNING id, jsa_id, hazard, risks, controls, likelihood, severity, risk_score, created_by, created_at`,
    [jsaId, hazard, JSON.stringify(risks), JSON.stringify(controls), likelihood, severity, riskScore, createdBy],
  );

  return result.rows[0];
}

async function listRiskAssessments() {
  const result = await db.query(
    `SELECT id, jsa_id, hazard, risks, controls, likelihood, severity, risk_score, created_by, created_at
     FROM risk_assessments
     ORDER BY created_at DESC`,
  );

  return result.rows;
}

async function findRiskAssessmentById(id) {
  const result = await db.query(
    `SELECT id, jsa_id, hazard, risks, controls, likelihood, severity, risk_score, created_by, created_at
     FROM risk_assessments
     WHERE id = $1`,
    [id],
  );

  return result.rows[0] || null;
}

module.exports = {
  createRiskAssessmentsTable,
  createRiskAssessment,
  listRiskAssessments,
  findRiskAssessmentById,
};
