import express from 'express';

const app = express();
const port = process.env.PORT || 8080;

// Static assets route mimicking Next.js static path
app.use('/_next/static', express.static('public', { immutable: true, maxAge: '365d' }));

app.get('/healthz', (req, res) => res.status(200).send('ok'));

// Basic SSR placeholder (no PHI): renders a minimal HTML shell
app.get('*', (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  res.send(`<!doctype html>
  <html lang="en">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>IHEP Web (${process.env.NODE_ENV || 'dev'})</title>
      <meta http-equiv="X-Content-Type-Options" content="nosniff" />
      <meta http-equiv="Referrer-Policy" content="no-referrer" />
    </head>
    <body>
      <main>
        <h1>IHEP SSR Placeholder</h1>
        <p>Workspace: ${process.env.NODE_ENV || 'dev'}</p>
      </main>
    </body>
  </html>`);
});

app.listen(port, () => {
  console.log(`Server listening on ${port}`);
});

