const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const events = require('events');

// Increase the maximum number of listeners to prevent warnings
events.EventEmitter.defaultMaxListeners = 30;

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer((req, res) => {
    // Be sure to pass `true` as the second argument to `url.parse`.
    // This tells it to parse the query portion of the URL.
    const parsedUrl = parse(req.url, true);
    
    // Handle connection reset errors gracefully
    req.on('error', (err) => {
      if (err.code === 'ECONNRESET') {
        console.log('Connection reset by client');
        res.end();
        return;
      }
      console.error('Request error:', err);
    });
    
    res.on('error', (err) => {
      console.error('Response error:', err);
    });
    
    handle(req, res, parsedUrl);
  }).listen(3000, (err) => {
    if (err) throw err;
    console.log('> Ready on http://localhost:3000');
  });
});
