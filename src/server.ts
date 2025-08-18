import Koa from 'koa';
import Router from '@koa/router';
import cors from '@koa/cors';
import serve from 'koa-static';
import { koaBody } from 'koa-body';
import { initializeDatabase } from './database/connection.js';
import { authMiddleware } from './middleware/auth.js';
import apiRouter from './routes/api.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = new Koa();
const router = new Router();

// Initialize database
await initializeDatabase();

// Middleware
app.use(cors());
app.use(koaBody({ json: true, text: true }));
app.use(authMiddleware);

// API routes
app.use(apiRouter.routes());
app.use(apiRouter.allowedMethods());

// Serve static files
app.use(serve(path.join(__dirname, 'public')));

// SPA fallback - serve index.html for all non-API routes
router.get('/(.*)', async (ctx) => {
  const indexPath = path.join(__dirname, 'public', 'index.html');
  ctx.type = 'html';
  
  try {
    const fs = await import('fs');
    ctx.body = fs.readFileSync(indexPath, 'utf-8');
  } catch (error) {
    // Fallback HTML if index.html doesn't exist
    ctx.body = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Jim Simon - Software Engineer</title>
    <link rel="stylesheet" href="/css/styles.css">
    <script type="module" src="/js/app.js"></script>
</head>
<body>
    <div id="app">
        <jim-app></jim-app>
    </div>
</body>
</html>`;
  }
});

app.use(router.routes());
app.use(router.allowedMethods());

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

export default app;