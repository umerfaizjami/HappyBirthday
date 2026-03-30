/* ── 1. DATE REVEAL ─────────────────────────────── */
const revealScreen = document.getElementById('dateReveal');
const mainEl       = document.getElementById('main');

function dismissReveal() {
  revealScreen.classList.add('dismiss');
  mainEl.classList.add('visible');
}

revealScreen.addEventListener('click', dismissReveal);
revealScreen.addEventListener('touchend', dismissReveal, { passive: true });
// Auto-dismiss after 3.5s
setTimeout(dismissReveal, 3500);


/* ── 2. CURSOR ─────────────────────────────────── */
const dot  = document.getElementById('cursor-dot');
const ring = document.getElementById('cursor-ring');
let mx = 0, my = 0, rx = 0, ry = 0;

document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });

(function tickCursor() {
  dot.style.left  = mx + 'px';
  dot.style.top   = my + 'px';
  rx += (mx - rx) * 0.10;
  ry += (my - ry) * 0.10;
  ring.style.left = rx + 'px';
  ring.style.top  = ry + 'px';
  requestAnimationFrame(tickCursor);
})();


/* ── 3. LIQUID GOLD SPARKLES ───────────────────── */
const sc  = document.getElementById('sparkle-canvas');
const sctx = sc.getContext('2d');

sc.width  = window.innerWidth;
sc.height = window.innerHeight;
window.addEventListener('resize', () => {
  sc.width  = window.innerWidth;
  sc.height = window.innerHeight;
});

const GOLD_COLORS = [
  'rgba(212,175,55,',
  'rgba(240,208,96,',
  'rgba(225,184,153,',
  'rgba(238,217,138,',
];

class Spark {
  constructor(x, y) {
    this.x  = x + (Math.random() - 0.5) * 16;
    this.y  = y + (Math.random() - 0.5) * 16;
    this.vx = (Math.random() - 0.5) * 1.2;
    this.vy = (Math.random() - 0.5) * 1.2 - 0.4;
    this.r  = Math.random() * 1.8 + 0.4;
    this.alpha = 0.7 + Math.random() * 0.3;
    this.decay  = 0.018 + Math.random() * 0.012;
    this.color  = GOLD_COLORS[Math.floor(Math.random() * GOLD_COLORS.length)];
    this.rotate = Math.random() * Math.PI * 2;
    this.shape  = Math.random() > 0.6 ? 'diamond' : 'circle';
  }
  update() {
    this.x     += this.vx;
    this.y     += this.vy;
    this.vy    += 0.015; // gravity
    this.alpha -= this.decay;
    this.rotate += 0.08;
  }
  draw(ctx) {
    if (this.alpha <= 0) return;
    ctx.save();
    ctx.globalAlpha = Math.max(0, this.alpha);
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotate);
    ctx.fillStyle = this.color + this.alpha + ')';
    if (this.shape === 'diamond') {
      const s = this.r * 1.8;
      ctx.beginPath();
      ctx.moveTo(0, -s);
      ctx.lineTo(s, 0);
      ctx.lineTo(0, s);
      ctx.lineTo(-s, 0);
      ctx.closePath();
    } else {
      ctx.beginPath();
      ctx.arc(0, 0, this.r, 0, Math.PI * 2);
    }
    ctx.fill();
    ctx.restore();
  }
  get dead() { return this.alpha <= 0; }
}

let sparks = [];
let lastSpawnX = -999, lastSpawnY = -999;

document.addEventListener('mousemove', e => {
  const dx = e.clientX - lastSpawnX;
  const dy = e.clientY - lastSpawnY;
  if (dx*dx + dy*dy > 200) {
    const count = 3 + Math.floor(Math.random() * 3);
    for (let i = 0; i < count; i++) sparks.push(new Spark(e.clientX, e.clientY));
    lastSpawnX = e.clientX; lastSpawnY = e.clientY;
  }
});

(function tickSparks() {
  sctx.clearRect(0, 0, sc.width, sc.height);
  sparks = sparks.filter(s => !s.dead);
  sparks.forEach(s => { s.update(); s.draw(sctx); });
  requestAnimationFrame(tickSparks);
})();


/* ── 4. PARALLAX ───────────────────────────────── */
const parallaxEl = document.querySelector('[data-parallax]');
let ticking = false;

window.addEventListener('scroll', () => {
  if (!ticking) {
    requestAnimationFrame(() => {
      const sy    = window.scrollY;
      const speed = parseFloat(parallaxEl.dataset.parallax);
      parallaxEl.style.transform = `translateY(${sy * speed}px)`;
      ticking = false;
    });
    ticking = true;
  }
});


/* ── 5. INTERSECTION OBSERVER REVEALS ─────────── */
const revealEls = document.querySelectorAll('.r');
const io = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('in');
      io.unobserve(e.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -48px 0px' });

revealEls.forEach(el => io.observe(el));