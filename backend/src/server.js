import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import api from './routes/api.js';
import Timetable from './models/Timetable.js';
import fs from 'fs/promises';

const app = express();
const PORT = Number(process.env.PORT || 5000);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors({ origin: process.env.FRONTEND_ORIGIN?.split(',').map(x => x.trim()) || true }));
app.use(express.json({ limit: '1mb' }));
app.use('/api', api);

const frontendPath = path.resolve(__dirname, '../../frontend');
app.use(express.static(frontendPath));
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/')) return next();
  res.sendFile(path.join(frontendPath, 'index.html'));
});

async function start() {
  if (process.env.DEMO_MODE !== 'true') {
    if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI is required when DEMO_MODE=false');
    await mongoose.connect(process.env.MONGODB_URI);
    const existing = await Timetable.countDocuments({ session: '2026-27' });
    if (!existing) {
      const seedPath = path.resolve(__dirname, '../data/timetable.json');
      const seed = JSON.parse(await fs.readFile(seedPath, 'utf8'));
      await Timetable.insertMany(seed);
      console.log('Seeded 2026-27 timetable into MongoDB');
    }
    console.log('Connected to MongoDB');
  } else {
    console.log('Running in DEMO_MODE using backend/data/*.json');
  }
  app.listen(PORT, () => console.log(`OAV Sorada app running on http://localhost:${PORT}`));
}

start().catch(err => { console.error(err); process.exit(1); });
