const Jsa = require('../models/jsa.model');

const VALID_STATUSES = ['draft', 'approved'];

function normalizeStatus(status) {
  if (!status) return 'draft';
  if (!VALID_STATUSES.includes(status)) {
    const error = new Error('Status must be draft or approved');
    error.statusCode = 400;
    throw error;
  }
  return status;
}

function validateRequiredFields({ title, description, location }) {
  if (!title || !description || !location) {
    const error = new Error('Title, description, and location are required');
    error.statusCode = 400;
    throw error;
  }
}

async function createJsa(userId, { title, description, location, status }) {
  validateRequiredFields({ title, description, location });

  return Jsa.createJsaDocument({
    title: title.trim(),
    description: description.trim(),
    location: location.trim(),
    status: normalizeStatus(status),
    createdBy: userId,
  });
}

async function listJsa() {
  return Jsa.listJsaDocuments();
}

async function getJsaById(id) {
  const jsa = await Jsa.findJsaDocumentById(id);
  if (!jsa) {
    const error = new Error('JSA document not found');
    error.statusCode = 404;
    throw error;
  }

  return jsa;
}

module.exports = {
  createJsa,
  listJsa,
  getJsaById,
};
