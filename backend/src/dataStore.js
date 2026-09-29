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
  try {
    return JSON.parse(await fs.readFile(file, 'utf8'));
  } catch {
    return fallback;
  }
}

function studentKey(student) {
  return [
    student.className,
    student.section,
    student.rollNo,
    student.dob
  ]
    .map(v => String(v ?? '').trim().toUpperCase())
    .join('|');
}

export async function getStudents() {
  if (process.env.DEMO_MODE === 'true') {
    return readJson(studentsFile, []);
  }

  return Student.find({}).lean();
}

export async function replaceStudents(records) {
  // DEMO MODE
  if (process.env.DEMO_MODE === 'true') {
    await fs.mkdir(dataDir, { recursive: true });

    const existing = await readJson(studentsFile, []);
    const studentMap = new Map();

    for (const student of existing) {
      studentMap.set(studentKey(student), student);
    }

    for (const student of records) {
      studentMap.set(studentKey(student), student);
    }

    const merged = [...studentMap.values()];

    await fs.writeFile(
      studentsFile,
      JSON.stringify(merged, null, 2)
    );

    return records.length;
  }

  // MONGODB MODE
  const operations = records.map(student => ({
    updateOne: {
      filter: {
        className: String(student.className).trim(),
        section: String(student.section).trim().toUpperCase(),
        rollNo: String(student.rollNo).trim(),
        dob: String(student.dob).trim()
      },
      update: {
        $set: {
          ...student,
          className: String(student.className).trim(),
          section: String(student.section).trim().toUpperCase(),
          rollNo: String(student.rollNo).trim(),
          dob: String(student.dob).trim()
        }
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
  if (process.env.DEMO_MODE === 'true') {
    return readJson(timetableFile, []);
  }

  return Timetable
    .find({ session: '2026-27' })
    .sort({ date: 1 })
    .lean();
}