const express = require('express');
const path = require('path');
const app = express();

// Middleware to handle redirects
app.use((req, res, next) => {
  const host = req.headers.host;
  const protocol = req.headers['x-forwarded-proto'];

  if (protocol !== 'https') {
    // Redirect HTTP to HTTPS
    return res.redirect(301, `https://${host}${req.url}`);
  }

  if (host.startsWith('www.')) {
    // Redirect www to non-www
    const newHost = host.slice(4);
    return res.redirect(301, `https://${newHost}${req.url}`);
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
