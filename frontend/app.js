const API = 'https://oav-sorada-admit-card.onrender.com/api';
const form = document.getElementById('verifyForm');
const msg = document.getElementById('message');
const result = document.getElementById('result');
const searchCard = document.getElementById('searchCard');
const showMsg = (text) => { msg.hidden = false; msg.textContent = text; };
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[c]));
const prettyDob = s => { if (!s) return ''; const p = String(s).split('-'); return p.length === 3 ? `${p[0].padStart(2, '0')}-${p[1].padStart(2, '0')}-${p[2]}` : s; };
function render(student, timetable) {
  document.getElementById('outName').textContent = student.name;
  document.getElementById('outFather').textContent = student.fatherName || '-';
  document.getElementById('outMother').textContent = student.motherName || '-';
  document.getElementById('outClass').textContent = student.className;
  document.getElementById('outSection').textContent = student.section;
  document.getElementById('outRoll').textContent = student.rollNo;
  document.getElementById('outDob').textContent = prettyDob(student.dob);
  document.getElementById('outGender').textContent = student.gender || '-';
  const rows = timetable.filter(r => r.subjects?.[student.className] && r.subjects[student.className] !== '-');
  document.getElementById('scheduleBody').innerHTML = rows.map(r => `<tr><td>${esc(r.date)}</td><td>${esc(r.day)}</td><td><b>${esc(r.subjects[student.className])}</b></td></tr>`).join('');
  searchCard.hidden = true; result.hidden = false; window.scrollTo({ top: 0, behavior: 'smooth' });
}
form.addEventListener('submit', async e => { e.preventDefault(); msg.hidden = true; const payload = { className: document.getElementById('className').value, section: document.getElementById('section').value.trim().toUpperCase(), rollNo: document.getElementById('rollNo').value.trim(), dob: document.getElementById('dob').value }; try { const r = await fetch(`${API}/student/verify`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }); const d = await r.json(); if (!r.ok) throw new Error(d.message || 'Verification failed'); render(d.student, d.timetable) } catch (err) { showMsg(err.message) } });
document.getElementById('printBtn').onclick = () => { const old = document.title; document.title = 'OAV Sorada - Admit Card'; window.print(); setTimeout(() => document.title = old, 500); };
document.getElementById('backBtn').onclick = () => { result.hidden = true; searchCard.hidden = false; window.scrollTo({ top: 0, behavior: 'smooth' }) };
