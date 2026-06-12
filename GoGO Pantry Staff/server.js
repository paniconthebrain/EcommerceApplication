const express = require('express');
const path = require('path');
const helmet = require('helmet');

const app = express();

// Security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "https://unpkg.com", "'unsafe-inline'"],
      styleSrc:  ["'self'", "'unsafe-inline'"],
      connectSrc: ["'self'", "http://localhost:3000"],
      imgSrc:    ["'self'", "data:", "http://localhost:3000"],
    },
  },
}));

// Only serve the staff/ subfolder and index.html — NOT the whole project directory
app.use('/staff', express.static(path.join(__dirname, 'staff')));

// Serve index.html explicitly for root and SPA fallback
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));
app.use((req, res) => res.sendFile(path.join(__dirname, 'index.html')));

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`✓ GoGO Pantry Staff App running on http://localhost:${PORT}`);
});
