const deepseek = require('./models/deepseek.model');
const mistral = require('./models/mistral.model');
const gemma = require('./models/gemma.model');
const phi3 = require('./models/phi3.model');

function getAvailableModels() {
  return [deepseek.modelName, mistral.modelName, gemma.modelName, phi3.modelName];
}

module.exports = {
  getAvailableModels,
  models: {
    deepseek,
    mistral,
    gemma,
    phi3,
  },
};
