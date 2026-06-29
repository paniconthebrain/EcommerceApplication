let app;
try {
  app = require('../src/index.js');
} catch (err) {
  console.error('CRASH loading app:', err);
  app = (req, res) => res.status(500).json({ crash: err.message, stack: err.stack });
}
module.exports = app;
