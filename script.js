const body = document.body;
const themeToggle = document.getElementById('themeToggle');
const moonIcon = document.getElementById('moonIcon');
const sunIcon = document.getElementById('sunIcon');
const mobileBtn = document.getElementById('mobileMenuBtn');
const mobileClose = document.getElementById('mobileClose');
const mobilePanel = document.getElementById('mobile-panel');
const mobileOverlay = document.getElementById('mobile-overlay');
const hamburger = document.getElementById('hamburger');
let isDark = localStorage.getItem('theme') !== 'light';

function applyTheme() {
  if (isDark) { body.classList.remove('light'); body.classList.add('dark'); moonIcon.classList.remove('hidden'); sunIcon.classList.add('hidden'); }
  else { body.classList.remove('dark'); body.classList.add('light'); sunIcon.classList.remove('hidden'); moonIcon.classList.add('hidden'); }
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
}
applyTheme();
themeToggle.addEventListener('click', () => { isDark = !isDark; applyTheme(); });

function openMobile() { mobilePanel.classList.add('open'); mobileOverlay.classList.add('open'); hamburger.classList.add('active'); document.body.style.overflow = 'hidden'; }
function closeMobile() { mobilePanel.classList.remove('open'); mobileOverlay.classList.remove('open'); hamburger.classList.remove('active'); document.body.style.overflow = ''; }
window.closeMobile = closeMobile;
mobileBtn.addEventListener('click', openMobile);
mobileOverlay.addEventListener('click', closeMobile);
document.querySelectorAll('#mobile-panel a').forEach(l => l.addEventListener('click', closeMobile));

function updateActiveLink() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');
  let current = '';
  sections.forEach(s => { const top = s.offsetTop - 120; if (window.scrollY >= top) current = s.id; });
  navLinks.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + current));
}

window.addEventListener('scroll', () => {
  document.getElementById('navbar').classList.toggle('scrolled', window.scrollY > 60);
  updateActiveLink();
});
updateActiveLink();

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      entry.target.querySelectorAll('.skill-bar-fill').forEach(bar => { bar.style.width = bar.dataset.w; });
    }
  });
}, { threshold: 0.15 });
document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));

const c = document.createElement('canvas');
const ctx = c.getContext('2d');
document.getElementById('particles').appendChild(c);
c.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:0;';
let pts = [];
function resize() { c.width = window.innerWidth; c.height = window.innerHeight; }
window.addEventListener('resize', resize);
resize();
for (let i = 0; i < 50; i++) pts.push({ x: Math.random() * c.width, y: Math.random() * c.height, r: Math.random() * 1.5 + 0.5, dx: (Math.random() - 0.5) * 0.2, dy: (Math.random() - 0.5) * 0.2 });
(function() {
  const el = document.getElementById('heroName');
  if (!el) return;
  const lines = el.querySelectorAll('span');
  let idx = 0;
  lines.forEach(line => {
    const text = line.textContent;
    line.textContent = '';
    [...text].forEach(ch => {
      const s = document.createElement('span');
      s.className = 'char-reveal'; s.textContent = ch; s.dataset.idx = idx;
      line.appendChild(s); idx++;
    });
  });
  el.querySelectorAll('.char-reveal').forEach(s => {
    setTimeout(() => s.classList.add('show'), parseInt(s.dataset.idx) * 120);
  });
  el.style.opacity = '1';
})();

function anim() {
  ctx.clearRect(0, 0, c.width, c.height);
  const dm = body.classList.contains('dark');
  ctx.fillStyle = dm ? 'rgba(99,102,241,0.3)' : 'rgba(79,70,229,0.2)';
  pts.forEach(p => { p.x += p.dx; p.y += p.dy; if (p.x < 0 || p.x > c.width) p.dx *= -1; if (p.y < 0 || p.y > c.height) p.dy *= -1; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill(); });
  for (let i = 0; i < pts.length; i++) for (let j = i + 1; j < pts.length; j++) { const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y, d = Math.sqrt(dx * dx + dy * dy); if (d < 100) { ctx.strokeStyle = dm ? `rgba(99,102,241,${0.06 * (1 - d / 100)})` : `rgba(79,70,229,${0.04 * (1 - d / 100)})`; ctx.lineWidth = 0.5; ctx.beginPath(); ctx.moveTo(pts[i].x, pts[i].y); ctx.lineTo(pts[j].x, pts[j].y); ctx.stroke(); } }
  requestAnimationFrame(anim);
}
anim();
