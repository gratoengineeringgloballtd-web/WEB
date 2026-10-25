// Local API server for development: `npm run dev:api` (Vite proxies /api here).
import 'dotenv/config';
import app from './app.js';

const port = Number(process.env.API_PORT || 3001);
app.listen(port, () => console.log(`Grato API on http://localhost:${port}`));
