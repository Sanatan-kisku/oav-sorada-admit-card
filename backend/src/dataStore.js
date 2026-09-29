import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import Student from './models/Student.js';
import Timetable from './models/Timetable.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.resolve(__dirname, '../data');
const studentsFile = path.join(dataDir, 'students.json');
const timetableFile = path.join(dataDir, 'timetable.json');

async function readJson(file, fallback) {
  try { return JSON.parse(await fs.readFile(file, 'utf8')); }
  catch { return fallback; }
}

export async function getStudents() {
  if (process.env.DEMO_MODE === 'true') return readJson(studentsFile, []);
  return Student.find({}).lean();
}

export async function replaceStudents(records) {
  if (process.env.DEMO_MODE === 'true') {
    await fs.mkdir(dataDir, { recursive: true });
    await fs.writeFile(studentsFile, JSON.stringify(records, null, 2));
    return records.length;
  }
  await Student.deleteMany({});
  if (records.length) await Student.insertMany(records, { ordered: false });
  return records.length;
}

export async function getTimetable() {
  if (process.env.DEMO_MODE === 'true') return readJson(timetableFile, []);
  return Timetable.find({ session: '2026-27' }).sort({ date: 1 }).lean();
}
