const express = require('express');
const path = require('path');
const app = express();

// Serve static files from the current directory
app.use(express.static(__dirname));

// Serve staff files
app.use('/staff', express.static(path.join(__dirname, 'staff')));

// Main route - serve index.html for root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Use middleware to serve index.html for all other routes (SPA fallback)
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

const PORT = process.env.PORT || 3002;

app.listen(PORT, () => {
  console.log(`✓ GoGO Pantry Staff App running on http://localhost:${PORT}`);
});
