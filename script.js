// ---------- storage keys ----------
const KEY = 'bdm_donors_v1';
const AUTH = 'bdm_auth_v1';

// ---------- helpers ----------
function nowY(){
  const el = document.getElementById('yr');
  if(el) el.textContent = new Date().getFullYear();
}
nowY();

function loadAllDonors(){
  try{
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  }catch(e){ return []; }
}
function saveAllDonors(list){
  localStorage.setItem(KEY, JSON.stringify(list));
}

// ---------- carousel (only on home) ----------
let slideIndex = 0;
let slideTimer = null;

function showSlide(i){
  const slides = document.querySelectorAll('.slide');
  if(!slides.length) return;
  slides.forEach(s=>{
    s.classList.add('hidden');
    s.classList.remove('visible');
  });
  const sel = document.querySelector('.slide[data-i="'+i+'"]');
  if(sel){
    sel.classList.add('visible');
    sel.classList.remove('hidden');
  }
  document.querySelectorAll('.dot').forEach(d=>d.classList.remove('active'));
  document.querySelectorAll('.dot[data-i="'+i+'"]').forEach(d=>d.classList.add('active'));
  slideIndex = i;
}
function nextSlide(){
  const slides = document.querySelectorAll('.slide');
  if(!slides.length) return;
  const n = slides.length;
  slideIndex = (slideIndex + 1) % n;
  showSlide(slideIndex);
}
function goToSlide(i){
  showSlide(i);
  resetCarousel();
}
function startCarousel(){
  if(!document.querySelector('.carousel')) return;
  showSlide(slideIndex);
  resetCarousel();
}
function resetCarousel(){
  if(slideTimer) clearInterval(slideTimer);
  slideTimer = setInterval(nextSlide, 4200);
}

// ---------- auth helpers ----------
function currentUser(){
  const phone = localStorage.getItem(AUTH);
  if(!phone) return null;
  const donors = loadAllDonors();
  return donors.find(d=>d.phone === phone) || null;
}
function logout(){
  localStorage.removeItem(AUTH);
  alert('Logged out');
  window.location.href = 'index.html';
}

// ---------- register ----------
function handleRegister(e){
  e.preventDefault();

  const name = document.getElementById('r-name').value.trim();
  const phone = document.getElementById('r-phone').value.trim();
  const blood = document.getElementById('r-blood').value;
  const last = document.getElementById('r-last').value;
  const location = document.getElementById('r-location').value.trim();
  const available = document.getElementById('r-available').value;
  const photo = document.getElementById('r-photo').value.trim();
  const pass = document.getElementById('r-pass').value;

  if(!/^(01)[0-9]{9}$/.test(phone)){
    showRegMsg('ফোন (01XXXXXXXXX) সঠিক দিন', true);
    return false;
  }
  if(pass.length < 6){
    showRegMsg('পাসওয়ার্ড অন্তত 6 অক্ষর হওয়া উচিত', true);
    return false;
  }

  const donors = loadAllDonors();
  if(donors.some(d=>d.phone === phone)){
    showRegMsg('এই ফোন নম্বর দিয়ে আগে থেকে আছে — লগইন করুন অথবা অন্য নম্বর দিন', true);
    return false;
  }

  const record = {name, phone, blood, last, location, available, photo, pass};
  donors.unshift(record);
  saveAllDonors(donors);
  localStorage.setItem(AUTH, phone); // auto login

  showRegMsg('রেজিস্ট্রেশন সফল — Dashboard এ নিয়ে যাওয়া হবে', false);

  setTimeout(()=> {
    window.location.href = 'dashboard.html';
  }, 900);

  e.target.reset();
  return false;
}

function showRegMsg(txt, err=false){
  const el = document.getElementById('reg-msg');
  if(!el) return;
  el.style.color = err ? '#b91c1c' : 'green';
  el.textContent = txt;
  setTimeout(()=> el.textContent = '', 3000);
}

function prefillRegister(){
  if(document.getElementById('r-name')){
    document.getElementById('r-name').value = 'Demo User';
    document.getElementById('r-phone').value = '01710000011';
    document.getElementById('r-blood').value = 'O+';
    document.getElementById('r-last').value = '';
    document.getElementById('r-location').value = 'Dhaka';
    document.getElementById('r-available').value = 'Available';
    document.getElementById('r-photo').value = '';
    document.getElementById('r-pass').value = 'password';
    showRegMsg('Demo তথ্য পুরণ করা হয়েছে', false);
  }
}

// ---------- login ----------
function handleLogin(e){
  e.preventDefault();
  const phone = document.getElementById('l-phone').value.trim();
  const pass = document.getElementById('l-pass').value;
  const donors = loadAllDonors();
  const user = donors.find(d=>d.phone === phone && d.pass === pass);
  const msg = document.getElementById('login-msg');

  if(!user){
    if(msg){
      msg.textContent = 'অবৈধ ফোন/পাসওয়ার্ড';
      setTimeout(()=> msg.textContent='', 3000);
    }
    return false;
  }

  localStorage.setItem(AUTH, phone);
  window.location.href = 'dashboard.html';
  return false;
}

// ---------- forgot password ----------
function handleForgotPassword(e){
  e.preventDefault();
  const phone = document.getElementById('fp-phone').value.trim();
  const newPass = document.getElementById('fp-pass').value;
  const msg = document.getElementById('fp-msg');

  if(!/^(01)[0-9]{9}$/.test(phone)){
    showFpMsg('ফোন (01XXXXXXXXX) সঠিক দিন', true);
    return false;
  }
  if(newPass.length < 6){
    showFpMsg('নতুন পাসওয়ার্ড অন্তত 6 অক্ষর হওয়া উচিত', true);
    return false;
  }

  const donors = loadAllDonors();
  const idx = donors.findIndex(d=>d.phone === phone);
  if(idx === -1){
    showFpMsg('এই ফোন নম্বর দিয়ে কোনো একাউন্ট পাওয়া যায়নি', true);
    return false;
  }

  donors[idx].pass = newPass;
  saveAllDonors(donors);
  showFpMsg('পাসওয়ার্ড আপডেট হয়েছে — এখন নতুন পাসওয়ার্ড দিয়ে লগইন করুন', false);

  setTimeout(()=> {
    window.location.href = 'login.html';
  }, 1200);

  e.target.reset();
  return false;
}

function showFpMsg(txt, err=false){
  const el = document.getElementById('fp-msg');
  if(!el) return;
  el.style.color = err ? '#b91c1c' : 'green';
  el.textContent = txt;
  setTimeout(()=> el.textContent = '', 4000);
}

// ---------- dashboard ----------
function renderDashboard(){
  const u = currentUser();
  if(!u){
    window.location.href = 'login.html';
    return;
  }

  const av = document.getElementById('dash-avatar');
  if(av) av.textContent = u.blood || (u.name ? u.name.split(' ').map(n=>n[0]).slice(0,2).join('') : '--');

  const n = document.getElementById('dash-name');
  if(n) n.textContent = u.name;

  const b = document.getElementById('dash-blood');
  if(b) b.textContent = u.blood + ' · ' + (u.available || '');

  const ph = document.getElementById('dash-phone');
  if(ph) ph.textContent = 'Phone: ' + u.phone;

  const loc = document.getElementById('dash-loc');
  if(loc) loc.textContent = 'Location: ' + (u.location || '');

  const last = document.getElementById('dash-last');
  if(last) last.textContent = 'Last Donate: ' + (u.last || 'Not provided');
}

// menu
function toggleMenu(){
  const m = document.getElementById('threeMenu');
  if(m) m.classList.toggle('show');
}

window.addEventListener('click', function(e){
  const btn = document.getElementById('threeBtn');
  const menu = document.getElementById('threeMenu');
  if(!btn || !menu) return;
  if(!btn.contains(e.target) && !menu.contains(e.target)){
    menu.classList.remove('show');
  }
});

function openEdit(){
  const u = currentUser();
  if(!u){ alert('প্রথমে লগইন করুন'); return; }
  const modal = document.getElementById('editModal');
  if(modal) modal.style.display = 'block';
  document.getElementById('e-name').value = u.name;
  document.getElementById('e-phone').value = u.phone;
  document.getElementById('e-blood').value = u.blood;
  document.getElementById('e-loc').value = u.location;
}
function closeEdit(){
  const modal = document.getElementById('editModal');
  if(modal) modal.style.display = 'none';
}
function saveEdit(e){
  e.preventDefault();
  const name = document.getElementById('e-name').value.trim();
  const phone = document.getElementById('e-phone').value.trim();
  const blood = document.getElementById('e-blood').value;
  const location = document.getElementById('e-loc').value.trim();

  const donors = loadAllDonors();
  const cur = currentUser();
  if(!cur){
    alert('No user');
    return false;
  }

  if(phone !== cur.phone && donors.some(d=>d.phone === phone)){
    alert('এই ফোন নম্বর অন্য অ্যাকাউন্টে ব্যবহৃত আছে');
    return false;
  }

  const idx = donors.findIndex(d=>d.phone === cur.phone);
  if(idx === -1) return false;

  donors[idx].name = name;
  donors[idx].phone = phone;
  donors[idx].blood = blood;
  donors[idx].location = location;
  saveAllDonors(donors);

  localStorage.setItem(AUTH, phone);
  closeEdit();
  renderDashboard();
  alert('Profile updated');
  return false;
}

// ---------- share profile ----------
function shareProfile(){
  const u = currentUser();
  if(!u){ alert('প্রথমে লগইন করুন'); return; }
  const text = `Donor: ${u.name}\nBlood: ${u.blood}\nPhone: ${u.phone}\nLocation: ${u.location}`;
  if(navigator.share){
    navigator.share({title:'Donor Profile', text}).then(()=>{}).catch(()=>{});
  } else {
    const fb = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(location.href)}&quote=${encodeURIComponent(text)}`;
    const wa = `https://wa.me/?text=${encodeURIComponent(text)}`;
    const mail = `mailto:?subject=${encodeURIComponent('Donor Profile')}&body=${encodeURIComponent(text)}`;
    const html = `<div style="padding:10px;font-size:14px">Share via: <br/><a href="${fb}" target="_blank">Facebook</a> · <a href="${wa}" target="_blank">WhatsApp</a> · <a href="${mail}" target="_blank">Email</a></div>`;
    const w = window.open('', '_blank', 'width=420,height=220');
    w.document.write(html);
  }
}

function copyProfileLink(){
  const u = currentUser();
  if(!u){ alert('প্রথমে লগইন করুন'); return; }
  const payload = btoa(JSON.stringify({
    name:u.name,
    blood:u.blood,
    phone:u.phone,
    location:u.location
  }));
  const link = location.origin + location.pathname + '#profile='+payload;
  navigator.clipboard?.writeText(link)
    .then(()=> alert('Profile link copied to clipboard'),
          ()=> alert('Copy failed'));
}

// hash profile quick view
(function handleHashProfile(){
  const h = location.hash || '';
  if(h.startsWith('#profile=')){
    try{
      const data = JSON.parse(atob(h.replace('#profile=','')));
      alert('Profile:\n' +
        `Name: ${data.name}\nBlood: ${data.blood}\nPhone: ${data.phone}\nLocation: ${data.location}`);
    }catch(e){}
  }
})();

// ---------- utils ----------
function escapeHtml(s){
  return String(s||'').replace(/[&<>"']/g, c =>
    ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])
  );
}
function escapeJS(s){
  return (s||'').replace(/"/g,'\\"').replace(/'/g,"\\'");
}

// ---------- sidebar search (home) ----------
function sideSearch(){
  const sb = document.getElementById('sblood');
  const sl = document.getElementById('sloc');
  if(!sb || !sl) return;

  const blood = sb.value;
  const loc = sl.value.trim().toLowerCase();
  const list = loadAllDonors().filter(d=>{
    const matchB = !blood || d.blood === blood;
    const matchL = !loc || (d.location || '').toLowerCase().includes(loc);
    return matchB && matchL;
  });
  renderSideResults(list);
}
function loadAll(){
  renderSideResults(loadAllDonors());
}
function renderSideResults(list){
  const cont = document.getElementById('side-results');
  if(!cont) return;
  cont.innerHTML = '';
  if(!list || list.length === 0){
    cont.innerHTML = '<div style="color:var(--muted)">কোনো রেজাল্ট পাওয়া যায়নি</div>';
    return;
  }
  list.forEach(d=>{
    const el = document.createElement('div');
    el.className = 'donor-card';
    el.innerHTML = `
      <div style="font-weight:800;color:var(--red);width:44px;text-align:center">${d.blood}</div>
      <div style="flex:1">
        <div style="font-weight:700">${escapeHtml(d.name)}</div>
        <div style="color:var(--muted);font-size:13px">
          ${escapeHtml(d.location)} · ${escapeHtml(d.phone)}
        </div>
      </div>
      <div>
        <button class="btn light" onclick='prefillToLogin("${d.phone}")'>Login as</button>
      </div>`;
    cont.appendChild(el);
  });
}

function prefillToLogin(phone){
  window.location.href = 'login.html';
  alert('Login ফর্মে এই ফোন নম্বর ব্যবহার করুন: ' + phone);
}

// ---------- demo / clear ----------
function seedDemo(){
  const demo = [
    {name:'Rana Ahmed', phone:'01710000001', blood:'A+', last:'2025-06-20', location:'Dhaka', available:'Available', photo:'', pass:'pass01'},
    {name:'Sadia Akter', phone:'01710000002', blood:'O+', last:'2025-03-10', location:'Chittagong', available:'Available', photo:'', pass:'pass02'},
    {name:'Tariq Rahman', phone:'01710000003', blood:'B+', last:'2025-02-02', location:'Dhaka', available:'Busy / Not available', photo:'', pass:'pass03'},
    {name:'Mitra Hossain', phone:'01710000004', blood:'AB+', last:'2024-11-11', location:'Khulna', available:'Available', photo:'', pass:'pass04'},
  ];
  saveAllDonors(demo);
  alert('Demo data লোড হয়েছে');
  loadAll();
}
function clearData(){
  if(confirm('সত্যিই সমস্ত ডেমো ডাটা মুছে ফেলো? (localStorage থেকে)')){
    localStorage.removeItem(KEY);
    localStorage.removeItem(AUTH);
    loadAll();
    alert('ডাটা মুছে দেওয়া হয়েছে');
  }
}

// ---------- page-specific init ----------
document.addEventListener('DOMContentLoaded', ()=>{
  const page = document.body.dataset.page;

  if(page === 'home'){
    startCarousel();
    loadAll();
  }

  if(page === 'register'){
    const f = document.getElementById('register-form');
    if(f) f.addEventListener('submit', handleRegister);
  }

  if(page === 'login'){
    const f = document.getElementById('login-form');
    if(f) f.addEventListener('submit', handleLogin);
  }

  if(page === 'dashboard'){
    renderDashboard();
  }

  if(page === 'forgot'){
    const f = document.getElementById('fp-form');
    if(f) f.addEventListener('submit', handleForgotPassword);
  }
});