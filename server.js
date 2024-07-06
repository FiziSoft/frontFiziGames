const express = require('express');
const path = require('path');
const app = express();

// Middleware to redirect www to non-www or vice versa
app.use((req, res, next) => {
  const host = req.headers.host;
  if (host.startsWith('www.')) {
    return res.redirect(301, `https://${host.slice(4)}${req.url}`);
  }
  next();
});

// Middleware to redirect HTTP to HTTPS
app.use((req, res, next) => {
  if (req.headers['x-forwarded-proto'] !== 'https') {
    return res.redirect(`https://${req.headers.host}${req.url}`);
  }
  next();
});

// Serve static files from the dist directory
app.use(express.static(path.join(__dirname, 'dist')));

// Send all requests to index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
