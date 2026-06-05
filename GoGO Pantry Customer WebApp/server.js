const express = require('express');
const path = require('path');
const helmet = require('helmet');

const app = express();

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc:  ["'self'", "https://unpkg.com", "'unsafe-inline'"],
      styleSrc:   ["'self'", "'unsafe-inline'"],
      connectSrc: ["'self'", "http://localhost:3000"],
      imgSrc:     ["'self'", "data:"],
    },
  },
}));

// Only expose the customer/ subfolder and index.html
app.use('/customer', express.static(path.join(__dirname, 'customer')));

app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));
app.use((req, res) => res.sendFile(path.join(__dirname, 'index.html')));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`✓ GoGO Pantry Customer App running on http://localhost:${PORT}`);
});
