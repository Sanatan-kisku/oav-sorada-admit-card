import express from 'express';
import multer from 'multer';
import * as XLSX from 'xlsx';
import { signAdminToken, requireAdmin } from '../auth.js';
import { getStudents, replaceStudents, getTimetable } from '../dataStore.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

const clean = (v) => String(v ?? '').trim();
const normalizeDob = (value) => {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return `${String(value.getDate()).padStart(2, '0')}-${String(value.getMonth() + 1).padStart(2, '0')}-${value.getFullYear()}`;
  }
  let s = clean(value).replace(/\//g, '-').replace(/\./g, '-');
  const parts = s.split('-').filter(Boolean);
  if (parts.length === 3) {
    if (parts[0].length === 4) return `${parts[2].padStart(2, '0')}-${parts[1].padStart(2, '0')}-${parts[0]}`;
    return `${parts[0].padStart(2, '0')}-${parts[1].padStart(2, '0')}-${parts[2].length === 2 ? `20${parts[2]}` : parts[2]}`;
  }
  return s;
};

function mapRow(row) {
  return {
    admissionNo: clean(row['ADMISSION_NO'] || row['Adm No']),
    name: clean(row['STUDENT_NAME'] || row['Name']),
    className: clean(row['CLASS_NAME'] || row['Class']),
    section: clean(row['SECTION_NAME'] || row['Section']).toUpperCase(),
    rollNo: clean(row['ROLL_NO'] || row['Roll']),
    gender: clean(row['GENDER'] || row['Gender']),
    dob: normalizeDob(row['BIRTH_DATE'] || row['Date of Birth']),

    fatherName: clean(
      row['FATHERS_NAME'] ||
      row['FATHER_NAME'] ||
      row['FATHER'] ||
      row['Father'] ||
      row['Father Name']
    ),

    motherName: clean(
      row['MOTHERS_NAME'] ||
      row['MOTHER_NAME'] ||
      row['MOTHER'] ||
      row['Mother'] ||
      row['Mother Name']
    ),

    houseName: clean(
      row['HOUSE_NAME'] ||
      row['House Name']
    )
  };
}

router.get('/health', async (_req, res) => res.json({ ok: true, service: 'OAV Sorada Admit Card API' }));

router.post('/student/verify', async (req, res) => {
  const { className, section, rollNo, dob } = req.body || {};
  if (!className || !section || !rollNo || !dob) return res.status(400).json({ message: 'Class, section, roll number and date of birth are required.' });
  const wantedDob = normalizeDob(dob);
  const students = await getStudents();
  const student = students.find(s =>
    clean(s.className).toUpperCase() === clean(className).toUpperCase() &&
    clean(s.section).toUpperCase() === clean(section).toUpperCase() &&
    clean(s.rollNo) === clean(rollNo) &&
    normalizeDob(s.dob) === wantedDob
  );
  if (!student) return res.status(404).json({ message: 'No matching student record found. Check the details and try again.' });
  const { admissionNo, ...publicStudent } = student;
  res.json({ student: publicStudent, timetable: await getTimetable() });
});

router.get('/timetable', async (_req, res) => res.json(await getTimetable()));

router.post('/admin/login', (req, res) => {
  const { username, password } = req.body || {};
  if (username !== process.env.ADMIN_USERNAME || password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ message: 'Incorrect username or password.' });
  }
  res.json({ token: signAdminToken() });
});

router.post('/admin/import-excel', requireAdmin, upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'Please select an Excel file.' });
  try {
    const workbook = XLSX.read(req.file.buffer, { type: 'buffer', cellDates: true });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });
    const records = rows.map(mapRow).filter(s => s.name && s.className && s.section && s.rollNo && s.dob);
    if (!records.length) return res.status(400).json({ message: 'No usable student records were found. Check the Excel headers.' });
    const count = await replaceStudents(records);
    res.json({ message: `Imported ${count} student records successfully.`, count });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Excel import failed.' });
  }
});

router.get('/admin/stats', requireAdmin, async (_req, res) => {
  const students = await getStudents();
  res.json({ students: students.length, classes: [...new Set(students.map(s => s.className))].sort(), sections: [...new Set(students.map(s => s.section))].sort() });
});

export default router;
