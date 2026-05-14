/**
 * ArbiLearn - app.js
 * Shared utilities: navbar, particles, scroll animations
 */

/* ── Navbar active link ── */
function setActiveNav() {
  const page = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a, .mobile-menu a').forEach(a => {
    a.classList.toggle('active', a.getAttribute('href') === page);
  });
}

/* ── Hamburger menu ── */
function initHamburger() {
  const btn  = document.getElementById('hamburger');
  const menu = document.getElementById('mobile-menu');
  if (!btn || !menu) return;
  btn.addEventListener('click', () => {
    btn.classList.toggle('open');
    menu.classList.toggle('open');
  });
  // close on link click
  menu.querySelectorAll('a').forEach(a =>
    a.addEventListener('click', () => {
      btn.classList.remove('open');
      menu.classList.remove('open');
    })
  );
}

/* ── Animated particles background ── */
function initParticles() {
  const container = document.getElementById('particles-bg');
  if (!container) return;

  const colors = ['#7c3aed', '#3b82f6', '#06b6d4', '#a855f7', '#60a5fa'];
  const count  = window.innerWidth < 768 ? 20 : 40;

  for (let i = 0; i < count; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    const size = Math.random() * 6 + 2;
    p.style.cssText = `
      width:${size}px; height:${size}px;
      left:${Math.random() * 100}%;
      background:${colors[Math.floor(Math.random() * colors.length)]};
      animation-duration:${Math.random() * 15 + 10}s;
      animation-delay:${Math.random() * 10}s;
    `;
    container.appendChild(p);
  }
}

/* ── Scroll reveal ── */
function initScrollReveal() {
  const els = document.querySelectorAll('.reveal');
  if (!els.length) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        observer.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });

  els.forEach(el => observer.observe(el));
}

/* ── Init all ── */
document.addEventListener('DOMContentLoaded', () => {
  setActiveNav();
  initHamburger();
  initParticles();
  initScrollReveal();
});
