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

    const existing = await readJson(studentsFile, []);

    const studentMap = new Map();

    for (const student of existing) {
      const key = [
        student.className,
        student.section,
        student.rollNo,
        student.dob
      ].map(v => String(v ?? '').trim().toUpperCase()).join('|');

      studentMap.set(key, student);
    }

    for (const student of records) {
      const key = [
        student.className,
        student.section,
        student.rollNo,
        student.dob
      ].map(v => String(v ?? '').trim().toUpperCase()).join('|');

      studentMap.set(key, student);
    }

    const merged = [...studentMap.values()];

    await fs.writeFile(
      studentsFile,
      JSON.stringify(merged, null, 2)
    );

    return records.length;
  }

  const operations = records.map(student => ({
    updateOne: {
      filter: {
        className: student.className,
        section: student.section,
        rollNo: student.rollNo,
        dob: student.dob
      },
      update: {
        $set: student
      },
      upsert: true
    }
  }));

  if (operations.length) {
    await Student.bulkWrite(operations, { ordered: false });
  }

  return records.length;
}

export async function getTimetable() {
  if (process.env.DEMO_MODE === 'true') return readJson(timetableFile, []);
  return Timetable.find({ session: '2026-27' }).sort({ date: 1 }).lean();
}
