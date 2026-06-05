const express = require('express');
const path = require('path');
const app = express();

// Serve static files from the current directory
app.use(express.static(__dirname));

// Serve customer files
app.use('/customer', express.static(path.join(__dirname, 'customer')));

// Main route - serve index.html for root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Use middleware to serve index.html for all other routes (SPA fallback)
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`✓ GoGO Pantry Customer App running on http://localhost:${PORT}`);
});
