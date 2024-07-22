const express = require('express');
const path = require('path');
const app = express();

// Middleware to handle redirects
app.use((req, res, next) => {
  const host = req.headers.host;
  const protocol = req.headers['x-forwarded-proto'];

  // Redirect from www to non-www and from HTTP to HTTPS
  if (protocol !== 'https' || host.startsWith('www.')) {
    const newHost = host.startsWith('www.') ? host.slice(4) : host;
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
