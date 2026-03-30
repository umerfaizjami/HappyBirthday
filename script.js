/* ═══════════════════════════════════════════
   1. CUSTOM CURSOR
═══════════════════════════════════════════ */
const dot  = document.getElementById('cur-dot');
const ring = document.getElementById('cur-ring');
let mx = window.innerWidth / 2,
    my = window.innerHeight / 2,
    rx = mx, ry = my;

document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });

(function moveCursor() {
  dot.style.left = mx + 'px';
  dot.style.top  = my + 'px';
  rx += (mx - rx) * 0.11;
  ry += (my - ry) * 0.11;
  ring.style.left = rx + 'px';
  ring.style.top  = ry + 'px';
  requestAnimationFrame(moveCursor);
})();


/* ═══════════════════════════════════════════
   2. GOLD DUST PARTICLES
═══════════════════════════════════════════ */
const cvs = document.getElementById('cvs');
const ctx = cvs.getContext('2d');
let W, H;

function resize() {
  W = cvs.width  = window.innerWidth;
  H = cvs.height = window.innerHeight;
}
resize();
window.addEventListener('resize', resize);

/* Mouse / touch influence */
let pointer = { x: W / 2, y: H / 2, active: false };
document.addEventListener('mousemove', e => {
  pointer.x = e.clientX; pointer.y = e.clientY; pointer.active = true;
});
document.addEventListener('touchmove', e => {
  pointer.x = e.touches[0].clientX;
  pointer.y = e.touches[0].clientY;
  pointer.active = true;
}, { passive: true });
document.addEventListener('touchend', () => { pointer.active = false; });

/* Palette */
const PAL = [
  [212, 175,  55],   // gold
  [240, 208,  96],   // bright gold
  [245, 237, 216],   // cream
  [225, 184, 153],   // rose gold
];

class Dust {
  constructor(fromPointer) {
    this.reset(fromPointer);
  }
  reset(fromPointer) {
    if (fromPointer && pointer.active) {
      this.x = pointer.x + (Math.random() - 0.5) * 40;
      this.y = pointer.y + (Math.random() - 0.5) * 40;
    } else {
      this.x = Math.random() * W;
      this.y = Math.random() * H;
    }
    this.baseX  = this.x;
    this.baseY  = this.y;
    this.vx     = (Math.random() - 0.5) * 0.25;
    this.vy     = -(Math.random() * 0.18 + 0.05);
    this.r      = Math.random() * 1.4 + 0.3;
    this.alpha  = 0;
    this.maxAlpha = Math.random() * 0.55 + 0.15;
    this.fadeIn = true;
    this.life   = 0;
    this.maxLife = Math.random() * 380 + 220;
    this.col    = PAL[Math.floor(Math.random() * PAL.length)];
    this.twinkle = Math.random() * Math.PI * 2;
  }

  update() {
    /* pointer pull */
    if (pointer.active) {
      const dx = pointer.x - this.x;
      const dy = pointer.y - this.y;
      const dist = Math.sqrt(dx*dx + dy*dy);
      if (dist < 120) {
        const force = (120 - dist) / 120 * 0.008;
        this.vx += dx * force;
        this.vy += dy * force;
      }
    }

    /* dampen */
    this.vx *= 0.97;
    this.vy *= 0.97;
    this.x  += this.vx;
    this.y  += this.vy;

    /* twinkle alpha */
    this.twinkle += 0.03;
    const tw = (Math.sin(this.twinkle) + 1) * 0.5;

    this.life++;
    if (this.fadeIn) {
      this.alpha += 0.006;
      if (this.alpha >= this.maxAlpha) this.fadeIn = false;
    } else {
      this.alpha -= 0.0028;
    }
    this.drawAlpha = Math.max(0, this.alpha) * (0.6 + 0.4 * tw);

    if (this.alpha <= 0 || this.life > this.maxLife ||
        this.y < -10 || this.y > H + 10) {
      this.reset(false);
    }
  }

  draw() {
    const [r, g, b] = this.col;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${r},${g},${b},${this.drawAlpha})`;
    ctx.fill();
  }
}

/* Init pool */
const POOL = 110;
const pool = Array.from({ length: POOL }, () => {
  const p = new Dust(false);
  p.life  = Math.random() * p.maxLife;
  p.alpha = Math.random() * p.maxAlpha;
  return p;
});

/* Pointer burst pool */
const BURST_POOL = 30;
const burst = Array.from({ length: BURST_POOL }, () => {
  const p = new Dust(false);
  p.alpha = 0; p.life = p.maxLife;
  return p;
});

let lastBX = -999, lastBY = -999;
function spawnBurst(x, y) {
  const dx = x - lastBX, dy = y - lastBY;
  if (dx*dx + dy*dy < 400) return;
  lastBX = x; lastBY = y;
  let spawned = 0;
  for (const p of burst) {
    if (p.alpha <= 0 && spawned < 4) {
      p.x = x + (Math.random() - 0.5) * 20;
      p.y = y + (Math.random() - 0.5) * 20;
      p.vx = (Math.random() - 0.5) * 0.8;
      p.vy = -(Math.random() * 0.6 + 0.2);
      p.alpha = 0.6;
      p.maxAlpha = 0.6;
      p.fadeIn = false;
      p.life = 0;
      p.maxLife = 120;
      p.r = Math.random() * 1.6 + 0.4;
      spawned++;
    }
  }
}

document.addEventListener('mousemove', e => spawnBurst(e.clientX, e.clientY));
document.addEventListener('touchmove', e => {
  spawnBurst(e.touches[0].clientX, e.touches[0].clientY);
}, { passive: true });

(function tick() {
  ctx.clearRect(0, 0, W, H);
  for (const p of pool)  { p.update(); p.draw(); }
  for (const p of burst) { p.update(); p.draw(); }
  requestAnimationFrame(tick);
})();
