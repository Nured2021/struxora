const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth.routes');
const jsaRoutes = require('./routes/jsa.routes');
const riskRoutes = require('./routes/risk.routes');
const ptwRoutes = require('./routes/ptw.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const { createUsersTable } = require('./models/user.model');
const { createJsaDocumentsTable } = require('./models/jsa.model');
const { createRiskAssessmentsTable } = require('./models/risk.model');
const { createPtwPermitsTable } = require('./models/ptw.model');

const app = express();
const port = Number(process.env.PORT || 4000);

app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'kaafi-hsse-backend' });
});

app.use('/auth', authRoutes);
app.use('/jsa', jsaRoutes);
app.use('/risk', riskRoutes);
app.use('/ptw', ptwRoutes);
app.use('/dashboard', dashboardRoutes);

app.use((err, _req, res, _next) => {
  const status = err.statusCode || err.status || 500;
  res.status(status).json({
    message: err.message || 'Internal server error',
  });
});

async function start() {
  await createUsersTable();
  await createJsaDocumentsTable();
  await createRiskAssessmentsTable();
  await createPtwPermitsTable();
  app.listen(port, () => {
    console.log(`KAAFI HSSE backend running on port ${port}`);
  });
}

if (require.main === module) {
  start().catch((error) => {
    console.error('Failed to start KAAFI HSSE backend:', error);
    process.exit(1);
  });
}

module.exports = app;
