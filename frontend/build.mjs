import fs from 'fs/promises';
import path from 'path';

const dir = new URL('.', import.meta.url).pathname;
const out = path.join(dir, 'dist');
await fs.rm(out, { recursive: true, force: true });
await fs.mkdir(out, { recursive: true });
for (const file of ['index.html','admin.html','styles.css','app.js','admin.js','favicon.svg','_redirects']) {
  await fs.copyFile(path.join(dir, file), path.join(out, file));
}
const api = process.env.API_BASE_URL || 'http://localhost:5000/api';
await fs.writeFile(path.join(out, 'config.js'), `window.APP_CONFIG = ${JSON.stringify({API_BASE_URL: api})};\n`);
console.log(`Built frontend for API: ${api}`);
