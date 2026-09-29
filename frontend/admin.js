const API=(window.APP_CONFIG?.API_BASE_URL||'http://localhost:5000/api').replace(/\/$/,'');
const loginCard=document.getElementById('loginCard'),panel=document.getElementById('adminPanel');
const loginMsg=document.getElementById('loginMessage'), uploadMsg=document.getElementById('uploadMessage');
const show=(el,t)=>{el.hidden=false;el.textContent=t};
function token(){return sessionStorage.getItem('oav_admin_token')}
async function loadStats(){const r=await fetch(`${API}/admin/stats`,{headers:{Authorization:`Bearer ${token()}`}});if(r.ok){const d=await r.json();document.getElementById('stats').textContent=`Students: ${d.students} • Classes: ${d.classes.join(', ')||'-'} • Sections: ${d.sections.join(', ')||'-'}`}}
function openPanel(){loginCard.hidden=true;panel.hidden=false;loadStats()}
if(token())openPanel();
document.getElementById('loginForm').addEventListener('submit',async e=>{e.preventDefault();loginMsg.hidden=true;try{const r=await fetch(`${API}/admin/login`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username:username.value,password:password.value})});const d=await r.json();if(!r.ok)throw Error(d.message);sessionStorage.setItem('oav_admin_token',d.token);openPanel()}catch(err){show(loginMsg,err.message)}});
document.getElementById('uploadForm').addEventListener('submit',async e=>{e.preventDefault();uploadMsg.hidden=true;const f=document.getElementById('excelFile').files[0];if(!f)return;const fd=new FormData();fd.append('file',f);try{const r=await fetch(`${API}/admin/import-excel`,{method:'POST',headers:{Authorization:`Bearer ${token()}`},body:fd});const d=await r.json();if(!r.ok)throw Error(d.message);show(uploadMsg,d.message);loadStats()}catch(err){show(uploadMsg,err.message)}});
document.getElementById('logout').onclick=()=>{sessionStorage.removeItem('oav_admin_token');location.reload()};
