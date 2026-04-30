const db = require('../config/db');

async function countTable(tableName) {
  const result = await db.query(`SELECT COUNT(*)::int AS total FROM ${tableName}`);
  return result.rows[0].total;
}

async function getRecentRows(tableName, columns) {
  const result = await db.query(
    `SELECT ${columns.join(', ')}
     FROM ${tableName}
     ORDER BY created_at DESC
     LIMIT 5`,
  );

  return result.rows;
}

async function getDashboardSummary() {
  const [totalJsa, totalRisks, totalPtw, recentJsa, recentRisks, recentPtw] = await Promise.all([
    countTable('jsa_documents'),
    countTable('risk_assessments'),
    countTable('ptw_permits'),
    getRecentRows('jsa_documents', [
      'id',
      'title',
      'description',
      'location',
      'created_by',
      'status',
      'created_at',
    ]),
    getRecentRows('risk_assessments', [
      'id',
      'jsa_id',
      'hazard',
      'likelihood',
      'severity',
      'risk_score',
      'created_by',
      'created_at',
    ]),
    getRecentRows('ptw_permits', [
      'id',
      'jsa_id',
      'risk_id',
      'permit_type',
      'description',
      'start_time',
      'end_time',
      'status',
      'created_by',
      'created_at',
    ]),
  ]);

  return {
    total_jsa: totalJsa,
    total_risks: totalRisks,
    total_ptw: totalPtw,
    recent_jsa: recentJsa,
    recent_risks: recentRisks,
    recent_ptw: recentPtw,
  };
}

module.exports = {
  getDashboardSummary,
};
