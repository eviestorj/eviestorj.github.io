/* Cornhusker Cattle Tycoon — mini-games (canvas) */
(function () {
  const W = 800, H = 450;
  const OL = '#3b2614';
  const R = (a, b) => a + Math.random() * (b - a);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const dist = (ax, ay, bx, by) => Math.hypot(ax - bx, ay - by);
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

  /* ================= Drawing helpers ================= */
  function rr(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }
  function fs(ctx, fill, lw) {
    if (fill) { ctx.fillStyle = fill; ctx.fill(); }
    if (lw !== 0) { ctx.strokeStyle = OL; ctx.stroke(); }
  }
  function ell(ctx, x, y, rx, ry, rot) { ctx.beginPath(); ctx.ellipse(x, y, rx, ry, rot || 0, 0, Math.PI * 2); }

  function sky(ctx, top, bottom) {
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, top); g.addColorStop(1, bottom);
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  }
  function hillBand(ctx, base, amp, freq, phase, color) {
    ctx.beginPath();
    ctx.moveTo(-10, H + 10);
    for (let x = -10; x <= W + 10; x += 10) {
      const y = base + Math.sin(x * freq + phase) * amp + Math.sin(x * freq * 2.3 + phase * 1.7) * amp * 0.35;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(W + 10, H + 10); ctx.closePath();
    ctx.lineWidth = 3; fs(ctx, color);
  }
  function sideBackdrop(ctx, opts) {
    const o = Object.assign({ top: '#5fb4f0', bottom: '#d8f1ff', far: '#a6c977', mid: '#86b956', ground: '#7aac4a', horizon: 200 }, opts);
    sky(ctx, o.top, o.bottom);
    if (o.sun !== false) { ell(ctx, 680, 70, 34, 34); ctx.lineWidth = 3; fs(ctx, '#ffd93b'); }
    hillBand(ctx, o.horizon - 40, 18, 0.008, 1, o.far);
    hillBand(ctx, o.horizon - 10, 14, 0.011, 3, o.mid);
    ctx.fillStyle = o.ground; ctx.fillRect(0, o.horizon + 10, W, H);
    hillBand(ctx, o.horizon + 8, 6, 0.014, 5, o.ground);
  }

  function drawCow(ctx, x, y, s, o) {
    o = o || {};
    const dir = o.dir || 1;
    const breed = o.breed || 'angus';
    const body = breed === 'hereford' ? '#a8492a' : '#272727';
    const face = breed === 'angus' ? '#272727' : '#fffaf0';
    const lp = o.legPhase || 0;
    ctx.save();
    ctx.translate(x, y); ctx.scale(s * dir, s);
    ctx.lineWidth = 2.6 / s; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    // tail
    ctx.beginPath(); ctx.moveTo(-28, -8); ctx.quadraticCurveTo(-38, 0, -34, 14); ctx.strokeStyle = OL; ctx.stroke();
    ell(ctx, -34, 15, 3, 3); fs(ctx, body);
    // legs
    [-20, -9, 10, 20].forEach((lx, i) => {
      const sw = Math.sin(lp + (i % 2 ? Math.PI : 0)) * 4;
      rr(ctx, lx - 3.5 + sw, 4, 7, 22, 3); fs(ctx, body);
    });
    // body
    rr(ctx, -30, -18, 60, 30, 15); fs(ctx, body);
    if (o.tag) { rr(ctx, -8, -14, 14, 9, 3); fs(ctx, '#ffd23f'); }
    // head
    const hd = o.headDown ? 16 : 0;
    const hx = 32, hy = -14 + hd;
    ell(ctx, hx - 7, hy - 9, 7, 3.5, -0.4); fs(ctx, body);
    ell(ctx, hx, hy, 12, 11); fs(ctx, face);
    ell(ctx, hx + 9, hy + 4, 7, 6); fs(ctx, '#e9a79a');
    ctx.fillStyle = '#111'; ell(ctx, hx + 2, hy - 3, 2.3, 2.3); ctx.fill();
    ctx.fillStyle = '#fff'; ell(ctx, hx + 2.8, hy - 3.8, 0.8, 0.8); ctx.fill();
    if (o.tag) { rr(ctx, hx - 12, hy - 12, 6, 7, 2); fs(ctx, '#ffd23f'); }
    ctx.restore();
  }

  function drawRider(ctx, x, y, s, dir, phase) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s * dir, s);
    ctx.lineWidth = 2.6 / s; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    const horse = '#8b5a2b';
    // tail
    ctx.beginPath(); ctx.moveTo(-28, -14); ctx.quadraticCurveTo(-44, -4, -38, 12); ctx.lineWidth = 6 / s; ctx.strokeStyle = '#3a2412'; ctx.stroke();
    ctx.lineWidth = 2.6 / s;
    [-20, -10, 12, 22].forEach((lx, i) => {
      const sw = Math.sin(phase + (i % 2 ? Math.PI : 0)) * 6;
      rr(ctx, lx - 3.5 + sw, -2, 7, 26, 3); fs(ctx, horse);
    });
    ell(ctx, 0, -10, 31, 15); fs(ctx, horse);
    // neck + head
    ctx.beginPath(); ctx.moveTo(18, -20); ctx.lineTo(34, -42); ctx.lineTo(44, -36); ctx.lineTo(30, -8); ctx.closePath(); fs(ctx, horse);
    ell(ctx, 44, -40, 12, 7, 0.4); fs(ctx, horse);
    ctx.beginPath(); ctx.moveTo(20, -22); ctx.lineTo(33, -44); ctx.lineWidth = 5 / s; ctx.strokeStyle = '#3a2412'; ctx.stroke();
    ctx.lineWidth = 2.6 / s;
    ctx.fillStyle = '#111'; ell(ctx, 45, -43, 1.8, 1.8); ctx.fill();
    // rider
    rr(ctx, -3, -26, 8, 20, 3); fs(ctx, '#3d5a99');
    rr(ctx, -8, -50, 16, 24, 5); fs(ctx, '#c8102e');
    ell(ctx, 0, -58, 7.5, 7.5); fs(ctx, '#f2c39b');
    ell(ctx, 0, -64, 14, 3.5); fs(ctx, '#c8a165');
    rr(ctx, -7, -75, 14, 11, 4); fs(ctx, '#c8a165');
    ctx.restore();
  }

  function drawCoyote(ctx, x, y, s, dir, phase, snarl) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s * dir, s);
    ctx.lineWidth = 2.4 / s; ctx.lineJoin = 'round';
    const fur = '#7d6c55', dark = '#4e4233';
    // bushy tail
    ctx.beginPath(); ctx.moveTo(-26, -10); ctx.quadraticCurveTo(-52, -14, -56, 6); ctx.quadraticCurveTo(-38, 4, -24, -2); ctx.closePath(); fs(ctx, dark);
    // legs (lean and long)
    [-16, -8, 12, 20].forEach((lx, i) => { const sw = Math.sin(phase + (i % 2 ? Math.PI : 0)) * 7; rr(ctx, lx - 2.5 + sw, 0, 5, 22, 2); fs(ctx, fur); });
    // body with raised, spiky hackles
    ell(ctx, 0, -6, 29, 11); fs(ctx, fur);
    ctx.beginPath(); ctx.moveTo(-14, -15);
    for (let i = 0; i < 6; i++) { ctx.lineTo(-10 + i * 5, -25 - (i % 2) * 4); ctx.lineTo(-7 + i * 5, -16); }
    ctx.closePath(); fs(ctx, dark);
    // head, pinned-back ears
    ctx.beginPath(); ctx.moveTo(20, -14); ctx.lineTo(24, -32); ctx.lineTo(32, -18); ctx.closePath(); fs(ctx, dark);
    ctx.beginPath(); ctx.moveTo(28, -18); ctx.lineTo(34, -34); ctx.lineTo(40, -16); ctx.closePath(); fs(ctx, dark);
    ell(ctx, 32, -12, 11, 9); fs(ctx, fur);
    // snout: upper jaw + open lower jaw when snarling
    ctx.beginPath(); ctx.moveTo(34, -18); ctx.lineTo(58, -10); ctx.lineTo(36, -6); ctx.closePath(); fs(ctx, '#9a8a6d');
    if (snarl) {
      ctx.beginPath(); ctx.moveTo(36, -5); ctx.lineTo(54, 2); ctx.lineTo(34, 2); ctx.closePath(); fs(ctx, '#8a1d1d');
      ctx.fillStyle = '#fffbea';
      for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.moveTo(40 + i * 4, -8); ctx.lineTo(42 + i * 4, -3); ctx.lineTo(44 + i * 4, -8); ctx.fill(); }
      for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.moveTo(40 + i * 4, 2); ctx.lineTo(42 + i * 4, -3); ctx.lineTo(44 + i * 4, 2); ctx.fill(); }
    }
    ctx.fillStyle = '#111'; ell(ctx, 58, -10, 2.5, 2.5); ctx.fill();
    // angry glowing eye + brow
    ctx.fillStyle = '#ff3b1f'; ell(ctx, 36, -15, 3, 3); ctx.fill();
    ctx.beginPath(); ctx.moveTo(30, -21); ctx.lineTo(42, -17); ctx.lineWidth = 3 / s; ctx.strokeStyle = '#1a120a'; ctx.stroke();
    ctx.restore();
  }

  function drawTruck(ctx, x, y, wheelA) {
    ctx.save(); ctx.translate(x, y); ctx.lineWidth = 3; ctx.lineJoin = 'round';
    rr(ctx, -70, -40, 92, 22, 4); fs(ctx, '#8d969c');          // flatbed
    rr(ctx, -62, -66, 46, 28, 5); fs(ctx, '#f2b43c');          // cake feeder
    ctx.fillStyle = OL; ctx.font = '900 11px Nunito, sans-serif'; ctx.textAlign = 'center'; ctx.fillText('CAKE', -39, -48);
    rr(ctx, 20, -64, 44, 44, 8); fs(ctx, '#c8102e');            // cab
    rr(ctx, 30, -58, 28, 18, 4); fs(ctx, '#bfe6ff');
    rr(ctx, 58, -40, 34, 22, 6); fs(ctx, '#c8102e');            // hood
    rr(ctx, -74, -24, 168, 8, 3); fs(ctx, '#5d5d5d');
    [[-40, 0], [62, 0]].forEach(([wx]) => {
      ell(ctx, wx, -8, 15, 15); fs(ctx, '#2a2a2a');
      ell(ctx, wx, -8, 6, 6); fs(ctx, '#bbb');
      ctx.beginPath(); ctx.moveTo(wx + Math.cos(wheelA) * 12, -8 + Math.sin(wheelA) * 12); ctx.lineTo(wx - Math.cos(wheelA) * 12, -8 - Math.sin(wheelA) * 12); ctx.strokeStyle = '#888'; ctx.stroke();
    });
    ctx.restore();
  }

  function drawTuft(ctx, x, y, s, color) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    ctx.beginPath();
    ctx.moveTo(-22, 2);
    const blades = [-18, -12, -6, 0, 6, 12, 18];
    blades.forEach((bx, i) => { ctx.quadraticCurveTo(bx - 3, -10, bx + (i % 2 ? 4 : -4), -26 - (i % 3) * 6); ctx.quadraticCurveTo(bx + 2, -8, bx + 4, 2); });
    ctx.lineTo(22, 2); ctx.closePath();
    ctx.lineWidth = 2.2 / s; fs(ctx, color || '#7fae4b');
    ctx.restore();
  }

  function drawYucca(ctx, x, y, s) {
    ctx.save(); ctx.strokeStyle = '#4f6b34'; ctx.lineWidth = 3 * s; ctx.lineCap = 'round';
    for (let i = -5; i <= 5; i++) {
      const a = -Math.PI / 2 + i * 0.24;
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.cos(a) * 24 * s, y + Math.sin(a) * 24 * s); ctx.stroke();
    }
    ctx.restore();
  }

  function drawWindmill(ctx, x, y, s, angle) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    const top = -220;
    ctx.strokeStyle = OL; ctx.lineWidth = 6;
    ctx.beginPath(); ctx.moveTo(-36, 0); ctx.lineTo(-8, top); ctx.moveTo(36, 0); ctx.lineTo(8, top); ctx.stroke();
    ctx.lineWidth = 2.5;
    for (let k = 1; k <= 5; k++) {
      const yy = -k * 42, w = 36 - 28 * (k * 42) / 220, w2 = 36 - 28 * ((k - 1) * 42) / 220;
      ctx.beginPath(); ctx.moveTo(-w, yy); ctx.lineTo(w, yy); ctx.moveTo(-w2, yy + 42); ctx.lineTo(w, yy); ctx.moveTo(w2, yy + 42); ctx.lineTo(-w, yy); ctx.stroke();
    }
    ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(4, top); ctx.lineTo(84, top - 4); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(68, top - 30); ctx.lineTo(112, top - 24); ctx.lineTo(112, top + 14); ctx.lineTo(68, top + 10); ctx.closePath(); ctx.lineWidth = 3; fs(ctx, '#c8102e');
    ctx.fillStyle = '#fff'; ctx.font = '900 13px Nunito, sans-serif'; ctx.textAlign = 'center'; ctx.fillText('N', 90, top - 2);
    rr(ctx, -14, top - 10, 28, 20, 4); fs(ctx, '#9aa3a8');
    ctx.save(); ctx.translate(-4, top); ctx.rotate(angle);
    for (let i = 0; i < 18; i++) {
      const a = (i / 18) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(Math.cos(a - 0.09) * 12, Math.sin(a - 0.09) * 12);
      ctx.lineTo(Math.cos(a - 0.12) * 60, Math.sin(a - 0.12) * 60);
      ctx.lineTo(Math.cos(a + 0.12) * 60, Math.sin(a + 0.12) * 60);
      ctx.lineTo(Math.cos(a + 0.09) * 12, Math.sin(a + 0.09) * 12);
      ctx.closePath(); ctx.lineWidth = 2; fs(ctx, '#dfe3e6');
    }
    ell(ctx, 0, 0, 60, 60); ctx.lineWidth = 3; ctx.stroke();
    ell(ctx, 0, 0, 11, 11); fs(ctx, '#6c757a');
    ctx.restore();
    ctx.restore();
  }

  function drawBale(ctx, x, y, r) {
    ell(ctx, x, y, r, r); ctx.lineWidth = 2.5; fs(ctx, '#e8c25a');
    ctx.beginPath();
    for (let a = 0; a < Math.PI * 6; a += 0.3) {
      const rad = r * (1 - a / (Math.PI * 6.4));
      const px = x + Math.cos(a) * rad, py = y + Math.sin(a) * rad;
      a === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
    }
    ctx.strokeStyle = '#b38b2a'; ctx.lineWidth = 1.5; ctx.stroke();
  }

  // a dark overlay with a soft hole (binoculars / spotlight)
  let darkCanvas = null;
  function darkness(ctx, cx, cy, radius, color) {
    if (!darkCanvas) { darkCanvas = document.createElement('canvas'); darkCanvas.width = W; darkCanvas.height = H; }
    const d = darkCanvas.getContext('2d');
    d.globalCompositeOperation = 'source-over';
    d.clearRect(0, 0, W, H);
    d.fillStyle = color; d.fillRect(0, 0, W, H);
    d.globalCompositeOperation = 'destination-out';
    const g = d.createRadialGradient(cx, cy, radius * 0.6, cx, cy, radius);
    g.addColorStop(0, 'rgba(0,0,0,1)'); g.addColorStop(1, 'rgba(0,0,0,0)');
    d.fillStyle = g; d.beginPath(); d.arc(cx, cy, radius, 0, Math.PI * 2); d.fill();
    ctx.drawImage(darkCanvas, 0, 0, W, H);
  }

  function label(ctx, text, x, y, opts) {
    const o = Object.assign({ size: 18, fill: '#fffaf0', color: OL, align: 'left', pad: 8 }, opts);
    ctx.font = `900 ${o.size}px Nunito, sans-serif`;
    const w = ctx.measureText(text).width + o.pad * 2, h = o.size + o.pad * 1.2;
    let bx = x; if (o.align === 'center') bx = x - w / 2; else if (o.align === 'right') bx = x - w;
    rr(ctx, bx, y, w, h, h / 2); ctx.lineWidth = 2.5; fs(ctx, o.fill);
    ctx.fillStyle = o.color; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    ctx.fillText(text, bx + o.pad, y + h / 2 + 1);
    ctx.textBaseline = 'alphabetic';
  }

  /* ================= Framework ================= */
  const defs = {};

  let active = null; // only one mini-game may listen for input at a time
  function start(id, params, host, onDone, onExit) {
    if (active) active();
    const def = defs[id];
    host.innerHTML = `
      <div class="mg">
        <div class="mg-top"><span class="mg-icon">${def.icon}</span><div><h2>${def.title}</h2><p>${def.blurb}</p></div>
          <div class="mg-tools">
            <button class="btn mg-pause" type="button" disabled>⏸ Pause</button>
            <button class="btn mg-exit" type="button">✖ Exit</button>
          </div>
        </div>
        <div class="mg-stage">
          <canvas class="mg-canvas"></canvas>
          <div class="mg-start"><div class="mg-start-card">
            <h3>How to play</h3>
            <p>${def.howto}</p>
            <p class="mg-controls">🎮 ${def.controls} · ⏸ P or Esc pauses</p>
            <button class="btn btn-red btn-big mg-go" type="button">Let's go!</button>
          </div></div>
          <div class="mg-start mg-pausebox hidden"><div class="mg-start-card">
            <h3 class="mg-pause-title">⏸ Paused</h3>
            <p class="mg-pause-msg">Take a breather. The clock is stopped.</p>
            <div class="modal-actions">
              <button class="btn btn-red btn-big mg-resume" type="button">▶ Resume</button>
              <button class="btn btn-plain mg-quit" type="button">✖ Exit chore</button>
            </div>
          </div></div>
        </div>
      </div>`;
    const canvas = host.querySelector('canvas');
    const ctx = canvas.getContext('2d');
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = W * dpr; canvas.height = H * dpr;

    const g = {
      W, H, t: 0, dur: def.duration || 30, params: params || {},
      pointer: { x: W / 2, y: H / 2, down: false, active: false },
      keys: {}, running: false, over: false, fx: [],
      pop(text, x, y, color) { g.fx.push({ text, x, y, color: color || '#fffaf0', life: 1.1 }); },
    };
    def.init(g);

    function paint() {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.save(); def.draw(g, ctx); ctx.restore();
      g.fx.forEach((f) => {
        ctx.globalAlpha = clamp(f.life, 0, 1);
        label(ctx, f.text, f.x, f.y - (1.1 - f.life) * 40, { align: 'center', size: 16, fill: f.color });
        ctx.globalAlpha = 1;
      });
      if (def.hud) label(ctx, def.hud(g), 10, 10, { size: 16 });
      if (!def.noTimer && g.running) {
        const left = Math.max(0, g.dur - g.t);
        label(ctx, `⏱ ${Math.ceil(left)}s`, W - 10, 10, { align: 'right', size: 16, fill: left < 5 ? '#ffb8ad' : '#fffaf0' });
        rr(ctx, 10, H - 14, W - 20, 6, 3); ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.fill();
        rr(ctx, 10, H - 14, (W - 20) * (left / g.dur), 6, 3); ctx.fillStyle = left < 5 ? '#ff6b5a' : '#ffd23f'; ctx.fill();
      }
    }

    let raf = 0, last = 0;
    function frame(ts) {
      if (!g.running) return;
      const dt = Math.min(0.05, (ts - (last || ts)) / 1000);
      last = ts;
      g.t += dt;
      def.update(g, dt);
      g.fx.forEach((f) => (f.life -= dt));
      g.fx = g.fx.filter((f) => f.life > 0);
      if (!def.noTimer && g.t >= g.dur) g.end();
      paint();
      if (g.running) raf = requestAnimationFrame(frame);
    }

    function local(e) {
      const r = canvas.getBoundingClientRect();
      return { x: ((e.clientX - r.left) * W) / r.width, y: ((e.clientY - r.top) * H) / r.height };
    }
    const onDown = (e) => {
      if (!g.running) return;
      e.preventDefault();
      const p = local(e);
      Object.assign(g.pointer, p, { down: true, active: true });
      def.down && def.down(g, p.x, p.y);
    };
    const onMove = (e) => {
      const p = local(e);
      Object.assign(g.pointer, p, { active: true });
      if (g.running && def.move) def.move(g, p.x, p.y);
    };
    const onUp = () => { g.pointer.down = false; if (g.running && def.up) def.up(g); };
    const onLeave = () => { if (e_isMouse) g.pointer.active = false; };
    let e_isMouse = true;
    const onType = (e) => { e_isMouse = e.pointerType === 'mouse'; };
    const onKey = (e) => {
      if ((e.key === 'Escape' || e.key === 'p' || e.key === 'P') && !g.over && g.started) {
        e.preventDefault();
        if (g.paused) resume(); else pause();
        return;
      }
      if (!g.running) return;
      const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      if ([' ', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(k)) e.preventDefault();
      if (!g.keys[k] && def.key) def.key(g, k);
      g.keys[k] = true;
    };
    const onKeyUp = (e) => { const k = e.key.length === 1 ? e.key.toLowerCase() : e.key; g.keys[k] = false; };

    canvas.addEventListener('pointerdown', onType);
    canvas.addEventListener('pointerdown', onDown);
    canvas.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    canvas.addEventListener('pointerleave', onLeave);
    window.addEventListener('keydown', onKey);
    window.addEventListener('keyup', onKeyUp);
    const onHide = () => { if (document.hidden && g.running) pause(); };
    document.addEventListener('visibilitychange', onHide);

    const pauseBox = host.querySelector('.mg-pausebox');
    const pauseBtn = host.querySelector('.mg-pause');
    function pause(msg) {
      if (g.over || !g.started) return;
      g.paused = true; g.running = false;
      cancelAnimationFrame(raf);
      g.keys = {}; g.pointer.down = false;
      host.querySelector('.mg-pause-title').textContent = msg ? '✖ Leave this chore?' : '⏸ Paused';
      host.querySelector('.mg-pause-msg').textContent = msg || 'Take a breather. The clock is stopped.';
      pauseBox.classList.remove('hidden');
      pauseBtn.textContent = '▶ Resume';
      host.querySelector(msg ? '.mg-quit' : '.mg-resume').focus();
    }
    function resume() {
      if (g.over || !g.paused) return;
      g.paused = false; g.running = true; last = 0;
      pauseBox.classList.add('hidden');
      pauseBtn.textContent = '⏸ Pause';
      pauseBtn.blur();
      raf = requestAnimationFrame(frame);
    }
    function exit() {
      if (g.over) return;
      g.over = true; g.running = false;
      cancelAnimationFrame(raf);
      detach();
      if (onExit) onExit();
    }
    pauseBtn.addEventListener('click', () => (g.paused ? resume() : pause()));
    host.querySelector('.mg-resume').addEventListener('click', resume);
    host.querySelector('.mg-quit').addEventListener('click', exit);
    host.querySelector('.mg-exit').addEventListener('click', () => {
      if (!g.started) return exit();
      pause("You won't earn anything from this chore, but this part of the day won't be used up either.");
    });

    active = () => { g.over = true; g.running = false; cancelAnimationFrame(raf); detach(); };
    function detach() {
      if (active) active = null;
      document.removeEventListener('visibilitychange', onHide);
      canvas.removeEventListener('pointerdown', onType);
      canvas.removeEventListener('pointerdown', onDown);
      canvas.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      canvas.removeEventListener('pointerleave', onLeave);
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('keyup', onKeyUp);
    }

    g.end = () => {
      if (g.over) return;
      g.over = true; g.running = false;
      cancelAnimationFrame(raf);
      detach();
      host.querySelectorAll('.mg-tools .btn').forEach((b) => (b.disabled = true));
      paint();
      const res = def.result(g);
      res.score = clamp(res.score, 0, 1);
      label(ctx, def.doneText ? def.doneText(g) : "Time's up!", W / 2, H / 2 - 24, { align: 'center', size: 30, fill: '#ffd23f', pad: 16 });
      setTimeout(() => onDone(res), 1100);
    };

    paint();
    const go = host.querySelector('.mg-go');
    go.focus();
    go.addEventListener('click', () => {
      go.closest('.mg-start').remove();
      go.blur();
      pauseBtn.disabled = false;
      g.started = true; g.running = true; last = 0;
      raf = requestAnimationFrame(frame);
    });
  }

  /* ================= 1. Feed the Herd ================= */
  defs.feed = {
    icon: '🚚', title: 'Feed the Herd', duration: 30,
    blurb: 'Roll across the pasture and drop range cake into the feed bunks.',
    howto: 'Your pickup drives along the ridge. Drop a sack of cake so it lands in an <b>empty bunk</b>. The truck is moving, so drop a little early!',
    controls: 'Click / tap or press SPACE to drop a sack',
    init(g) {
      const breeds = ['angus', 'baldy', 'hereford'];
      g.bunks = [...Array(6)].map((_, i) => ({ x: 92 + i * 123, filled: false, breed: pick(breeds), dir: i % 2 ? -1 : 1, munch: 0 }));
      g.truck = { x: -110, speed: 140, pass: 0, wheel: 0 };
      g.sacks = 11; g.drops = []; g.wind = g.params.wind || 0;
      g.flakes = g.params.snow ? [...Array(70)].map(() => ({ x: R(0, W), y: R(0, H), s: R(1.5, 3.5) })) : [];
    },
    drop(g) {
      const tr = g.truck;
      if (g.sacks <= 0 || tr.x < 0 || tr.x > W) return;
      g.sacks--;
      g.drops.push({ x: tr.x - 40, y: 150, vx: tr.speed * 0.5, vy: -70, rot: 0 });
    },
    down(g) { this.drop(g); },
    key(g, k) { if (k === ' ' || k === 'Enter') this.drop(g); },
    update(g, dt) {
      const tr = g.truck;
      tr.x += tr.speed * dt; tr.wheel += tr.speed * dt / 15;
      if (tr.x > W + 130) { tr.x = -130; tr.pass++; tr.speed = 140 + tr.pass * 32; }
      g.drops.forEach((d) => {
        d.vy += 900 * dt; d.x += (d.vx + g.wind) * dt; d.y += d.vy * dt; d.rot += dt * 6;
        if (d.y >= 352 && !d.done) {
          d.done = true;
          const b = g.bunks.find((b) => Math.abs(d.x - b.x) < 44);
          if (b && !b.filled) { b.filled = true; g.pop('Moo! 😋', b.x, 300, '#c9f2b0'); }
          else if (b) g.pop('Already fed', b.x, 300);
          else g.pop('Missed!', d.x, 330, '#ffb8ad');
        }
      });
      g.drops = g.drops.filter((d) => !d.done);
      g.bunks.forEach((b) => { if (b.filled) b.munch += dt; });
      g.flakes.forEach((f) => { f.y += 60 * dt * f.s; f.x += (g.wind * 0.8 + 20) * dt; if (f.y > H) { f.y = -5; f.x = R(-50, W); } if (f.x > W) f.x = 0; });
      if (g.bunks.every((b) => b.filled)) g.end();
      else if (g.sacks === 0 && g.drops.length === 0) g.end();
    },
    draw(g, ctx) {
      const snow = !!g.params.snow;
      sideBackdrop(ctx, snow
        ? { top: '#9fb3c8', bottom: '#e8eef4', far: '#e9eef2', mid: '#dfe8ee', ground: '#cfd9c0', horizon: 190, sun: false }
        : { top: '#f6a68e', bottom: '#ffe8b8', far: '#b9bf8f', mid: '#a5b06d', ground: '#9fb062', horizon: 190 });
      // ridge road
      ctx.fillStyle = snow ? '#e6dccd' : '#d9c38f'; ctx.fillRect(0, 186, W, 14);
      ctx.strokeStyle = OL; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(0, 186); ctx.lineTo(W, 186); ctx.moveTo(0, 200); ctx.lineTo(W, 200); ctx.stroke();
      drawTruck(ctx, g.truck.x, 196, g.truck.wheel);
      // cows behind bunks
      g.bunks.forEach((b) => {
        const eat = b.filled ? Math.sin(b.munch * 8) * 2 : 0;
        drawCow(ctx, b.x - b.dir * 22, 340 + eat, 0.95, { dir: b.dir, breed: b.breed, headDown: b.filled });
        if (!b.filled) { ctx.font = '20px serif'; ctx.textAlign = 'center'; ctx.fillText('💭', b.x - b.dir * 6, 270); }
      });
      // bunks
      g.bunks.forEach((b) => {
        rr(ctx, b.x - 46, 352, 92, 26, 6); ctx.lineWidth = 3; fs(ctx, '#9c6b3f');
        ctx.beginPath(); ctx.moveTo(b.x - 46, 365); ctx.lineTo(b.x + 46, 365); ctx.strokeStyle = '#6e4a2a'; ctx.lineWidth = 2; ctx.stroke();
        rr(ctx, b.x - 40, 378, 8, 18, 2); fs(ctx, '#7a4e2d'); rr(ctx, b.x + 32, 378, 8, 18, 2); fs(ctx, '#7a4e2d');
        if (b.filled) { ell(ctx, b.x, 353, 36, 7); ctx.lineWidth = 2; fs(ctx, '#c79a4f'); }
      });
      // falling sacks
      g.drops.forEach((d) => {
        ctx.save(); ctx.translate(d.x, d.y); ctx.rotate(d.rot);
        rr(ctx, -10, -13, 20, 26, 5); ctx.lineWidth = 2.5; fs(ctx, '#f3e2b6');
        ctx.fillStyle = '#c8102e'; ctx.fillRect(-6, -3, 12, 5);
        ctx.restore();
      });
      g.flakes.forEach((f) => { ctx.fillStyle = '#fff'; ell(ctx, f.x, f.y, f.s, f.s); ctx.fill(); });
      // sacks remaining
      for (let i = 0; i < g.sacks; i++) { rr(ctx, W - 24 - i * 16, 46, 12, 16, 3); ctx.lineWidth = 2; fs(ctx, '#f3e2b6'); }
      if (g.wind) label(ctx, g.wind > 0 ? 'Wind ➜' : '⬅ Wind', W / 2, 46, { align: 'center', size: 14, fill: '#dfefff' });
    },
    hud(g) { return `🥣 Bunks fed: ${g.bunks.filter((b) => b.filled).length}/6`; },
    doneText(g) { return g.bunks.every((b) => b.filled) ? 'Everybody ate! 🐄' : 'Feeding done!'; },
    result(g) { const n = g.bunks.filter((b) => b.filled).length; return { score: n / 6, filled: n }; },
  };

  /* ================= 2. Calving Check ================= */
  defs.calves = {
    icon: '🍼', title: 'Calving Check', duration: 30,
    blurb: 'Scan the pasture with your binoculars and ear-tag the new calves.',
    howto: 'Newborn calves are tucked down in the tall Sandhills grass. They pop up now and then — <b>click a calf</b> to tag it. Mama cows are a good clue! Wrong clicks cost 1.5 seconds.',
    controls: 'Move the mouse to look · click / tap a calf to tag it',
    init(g) {
      const n = clamp(g.params.count || 3, 1, 8);
      g.n = n; g.found = 0; g.calves = []; g.mamas = []; g.tufts = [];
      const spots = [];
      for (let tries = 0; spots.length < n && tries < 500; tries++) {
        const p = { x: R(70, 730), y: R(230, 415) };
        if (spots.every((q) => dist(p.x, p.y, q.x, q.y) > 110)) spots.push(p);
      }
      const breeds = ['angus', 'baldy', 'hereford'];
      spots.forEach((p) => {
        const breed = pick(breeds);
        g.calves.push({ x: p.x, y: p.y, phase: R(0, 6), sp: R(0.9, 1.6), vis: 0, found: false, breed, dir: Math.random() < 0.5 ? -1 : 1 });
        if (Math.random() < 0.7) g.mamas.push({ x: clamp(p.x + R(-90, 90), 40, 760), y: p.y - R(20, 40), breed, dir: Math.random() < 0.5 ? -1 : 1 });
      });
      for (let i = 0; i < 50; i++) g.tufts.push({ x: R(0, W), y: R(205, H), s: R(0.7, 1.3) });
      g.pointer.x = W / 2; g.pointer.y = H / 2;
    },
    update(g) {
      g.calves.forEach((c) => { c.vis = c.found ? 1 : clamp(0.35 + Math.sin(g.t * c.sp + c.phase) * 0.9, 0, 1); });
    },
    down(g, x, y) {
      const hit = g.calves.find((c) => !c.found && c.vis > 0.2 && dist(x, y, c.x, c.y - 12) < 38);
      if (hit) {
        hit.found = true; g.found++;
        g.pop('Tagged! 🏷️', hit.x, hit.y - 60, '#c9f2b0');
        if (g.found >= g.n) g.end();
      } else {
        g.t += 1.5; g.pop('Just grass… -1.5s', x, y - 30, '#ffb8ad');
      }
    },
    draw(g, ctx) {
      sideBackdrop(ctx, { top: '#7488d6', bottom: '#ffd7a0', far: '#b9bf8f', mid: '#a5b06d', ground: '#9aa85a', horizon: 190 });
      const items = [];
      g.mamas.forEach((m) => items.push({ y: m.y, f: () => drawCow(ctx, m.x, m.y, 0.85, { dir: m.dir, breed: m.breed }) }));
      g.calves.forEach((c) => items.push({
        y: c.y, f: () => {
          const off = (1 - c.vis) * 34;
          drawCow(ctx, c.x, c.y - 6 + off, 0.5, { dir: c.dir, breed: c.breed, tag: c.found });
          drawTuft(ctx, c.x - 14, c.y + 12, 1.4, '#86a64a');
          drawTuft(ctx, c.x + 16, c.y + 14, 1.3, '#7f9e44');
          if (c.found) { ctx.font = '22px serif'; ctx.textAlign = 'center'; ctx.fillText('💛', c.x, c.y - 42); }
        },
      }));
      g.tufts.forEach((t) => items.push({ y: t.y, f: () => drawTuft(ctx, t.x, t.y, t.s, '#8fae52') }));
      items.sort((a, b) => a.y - b.y).forEach((i) => i.f());
      darkness(ctx, g.pointer.x, g.pointer.y, 110, 'rgba(25,35,20,0.6)');
      ctx.lineWidth = 5; ctx.strokeStyle = '#1b1b1b';
      ell(ctx, g.pointer.x, g.pointer.y, 96, 96); ctx.stroke();
      ctx.lineWidth = 1.5; ctx.strokeStyle = 'rgba(0,0,0,.5)';
      ctx.beginPath(); ctx.moveTo(g.pointer.x - 12, g.pointer.y); ctx.lineTo(g.pointer.x + 12, g.pointer.y); ctx.moveTo(g.pointer.x, g.pointer.y - 12); ctx.lineTo(g.pointer.x, g.pointer.y + 12); ctx.stroke();
    },
    hud(g) { return `🏷️ Calves tagged: ${g.found}/${g.n}`; },
    doneText(g) { return g.found >= g.n ? 'All calves tagged! 🍼' : "Time's up!"; },
    result(g) { return { score: g.found / g.n, found: g.found }; },
  };

  /* ================= 3. Windmill & Stock Tank ================= */
  defs.tank = {
    icon: '💧', title: 'Windmill & Stock Tank', duration: 25,
    blurb: 'The old windmill pulls water up from the Ogallala Aquifer. Keep the tank just right.',
    howto: '<b>Hold</b> to engage the pump. More wind = faster pumping. Thirsty cows drink it down. Keep the water level inside the <b>green zone</b> as long as you can — and don\'t overflow!',
    controls: 'Hold mouse / finger, or hold SPACE, to pump',
    init(g) {
      g.level = 40; g.wind = 0.5; g.windT = 0.6; g.nextGust = 1.5; g.angle = 0; g.inBand = 0;
      g.drinkers = 0; g.nextHerd = 3; g.overflowT = 0;
      g.heat = g.params.heat ? 1.4 : 1;
      g.cows = [{ x: 470, dir: 1, breed: 'angus' }, { x: 715, dir: -1, breed: 'hereford' }, { x: 440, dir: 1, breed: 'baldy' }];
    },
    band(g) { const c = 64 + Math.sin(g.t * 0.45) * 12; return [c - 11, c + 11]; },
    update(g, dt) {
      g.nextGust -= dt;
      if (g.nextGust <= 0) { g.windT = R(0.12, 1); g.nextGust = R(1.2, 2.8); if (g.windT > 0.85) g.pop('Big gust! 💨', 200, 70, '#dfefff'); }
      g.wind += (g.windT - g.wind) * Math.min(1, dt * 2);
      const pumping = g.pointer.down || g.keys[' '];
      g.angle += g.wind * (pumping ? 10 : 6) * dt;
      if (pumping) g.level += 30 * g.wind * dt;
      g.nextHerd -= dt;
      if (g.nextHerd <= 0) { g.drinkers = g.drinkers ? 0 : 3; g.nextHerd = g.drinkers ? R(2.5, 4) : R(2, 4); if (g.drinkers) g.pop('Thirsty cows! 🐄', 590, 210, '#dfefff'); }
      g.level -= (4 + g.drinkers * 3.2) * g.heat * dt;
      if (g.level > 100) { g.level = 100; g.overflowT += dt; if (g.overflowT > 0.6) { g.overflowT = 0; g.pop('Overflowing! 💦', 590, 250, '#ffb8ad'); } }
      g.level = Math.max(0, g.level);
      const [lo, hi] = this.band(g);
      if (g.level >= lo && g.level <= hi) g.inBand += dt;
    },
    draw(g, ctx) {
      sideBackdrop(ctx, g.params.heat
        ? { top: '#77b7ea', bottom: '#fff1c4', far: '#c6c27a', mid: '#adb05c', ground: '#a6a659', horizon: 230 }
        : { top: '#4fa7ec', bottom: '#d6f0ff', far: '#a8d47b', mid: '#86c157', ground: '#79ad48', horizon: 230 });
      drawWindmill(ctx, 200, 400, 1.05, g.angle);
      // pipe to tank
      ctx.strokeStyle = OL; ctx.lineWidth = 9; ctx.beginPath(); ctx.moveTo(206, 380); ctx.lineTo(500, 380); ctx.lineTo(500, 330); ctx.stroke();
      ctx.strokeStyle = '#8b959b'; ctx.lineWidth = 5; ctx.stroke();
      if ((g.pointer.down || g.keys[' ']) && g.wind > 0.15) {
        ctx.fillStyle = '#4aa3e8'; for (let i = 0; i < 4; i++) { ell(ctx, 506 + i * 3, 336 + ((g.t * 140 + i * 10) % 30), 3, 4); ctx.fill(); }
      }
      // cows drinking
      g.cows.forEach((c, i) => { if (i < g.drinkers) drawCow(ctx, c.x, 370, 0.9, { dir: c.dir, breed: c.breed, headDown: true }); });
      // tank cutaway
      const tx = 500, ty = 300, tw = 190, th = 100;
      rr(ctx, tx, ty, tw, th, 10); ctx.lineWidth = 4; fs(ctx, '#aab5bc');
      const wh = (th - 10) * (g.level / 100);
      rr(ctx, tx + 6, ty + th - 5 - wh, tw - 12, wh, 6); ctx.fillStyle = '#4aa3e8'; ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,.35)'; ctx.fillRect(tx + 12, ty + th - 5 - wh, tw - 24, 4);
      for (let i = 1; i < 9; i++) { ctx.beginPath(); ctx.moveTo(tx + i * 21, ty + 4); ctx.lineTo(tx + i * 21, ty + 10); ctx.strokeStyle = '#7d8a92'; ctx.lineWidth = 2; ctx.stroke(); }
      ell(ctx, tx + tw / 2, ty, tw / 2, 10); ctx.lineWidth = 3; fs(ctx, 'rgba(170,181,188,.4)');
      // gauge
      const gx = 740, gy = 70, gh = 330;
      rr(ctx, gx, gy, 34, gh, 12); ctx.lineWidth = 3; fs(ctx, '#fffaf0');
      const [lo, hi] = this.band(g);
      const yOf = (v) => gy + gh - 6 - (gh - 12) * (v / 100);
      ctx.fillStyle = '#9fe08a'; ctx.fillRect(gx + 4, yOf(hi), 26, yOf(lo) - yOf(hi));
      ctx.fillStyle = '#4aa3e8'; ctx.beginPath(); ctx.moveTo(gx - 4, yOf(g.level)); ctx.lineTo(gx - 18, yOf(g.level) - 9); ctx.lineTo(gx - 18, yOf(g.level) + 9); ctx.closePath(); ctx.lineWidth = 2.5; fs(ctx, '#4aa3e8');
      ctx.fillStyle = OL; ctx.font = '900 12px Nunito'; ctx.textAlign = 'center'; ctx.fillText('LEVEL', gx + 17, gy + gh + 16);
      // wind meter
      label(ctx, `Wind ${'💨'.repeat(1 + Math.round(g.wind * 3))}`, 10, 46, { size: 14, fill: '#dfefff' });
      const inb = g.level >= lo && g.level <= hi;
      label(ctx, inb ? 'Just right! 👍' : g.level > hi ? 'Too full!' : 'Too low!', 595, 260, { align: 'center', size: 16, fill: inb ? '#c9f2b0' : '#ffd8b0' });
    },
    hud(g) { return `💧 In the zone: ${Math.round((g.inBand / g.dur) * 100)}%`; },
    doneText() { return 'Tank checked! 💧'; },
    result(g) { return { score: g.inBand / (g.dur * 0.8) }; },
  };

  /* ================= 4. Move to Fresh Pasture (herding) ================= */
  defs.roundup = {
    icon: '🐎', title: 'Move to Fresh Pasture', duration: 45,
    blurb: 'Saddle up and push the herd through the gate into the next pasture.',
    howto: 'Cows move <b>away</b> from your horse. Ride around behind them and push them through the <b>gate</b> on the right. Rotating pastures lets the Sandhills grass grow back!',
    controls: 'Mouse / finger steers your horse · or arrow keys / WASD',
    init(g) {
      g.pen = { x: 615, y: 100, w: 165, h: 270, gy0: 165, gy1: 305 };
      const breeds = ['angus', 'angus', 'baldy', 'hereford'];
      g.n = g.params.n || 8;
      g.cows = [...Array(g.n)].map(() => ({ x: R(70, 470), y: R(90, 410), vx: 0, vy: 0, wa: R(0, 6), penned: false, breed: pick(breeds), dir: 1, lp: R(0, 6) }));
      g.rider = { x: 60, y: 240, vx: 0, vy: 0, dir: 1, phase: 0 };
      g.penned = 0;
      g.blow = [...Array(5)].map(() => ({ x: R(40, 560), y: R(80, 420), rx: R(30, 60), ry: R(12, 22) }));
      g.yucca = [...Array(9)].map(() => ({ x: R(20, 580), y: R(70, 430) }));
      g.pointer.active = false;
    },
    update(g, dt) {
      const r = g.rider, P = g.pen;
      let ax = 0, ay = 0;
      if (g.keys.ArrowLeft || g.keys.a) ax -= 1;
      if (g.keys.ArrowRight || g.keys.d) ax += 1;
      if (g.keys.ArrowUp || g.keys.w) ay -= 1;
      if (g.keys.ArrowDown || g.keys.s) ay += 1;
      const sp = 240;
      if (ax || ay) { const m = Math.hypot(ax, ay); r.vx = (ax / m) * sp; r.vy = (ay / m) * sp; }
      else if (g.pointer.active) {
        const dx = g.pointer.x - r.x, dy = g.pointer.y - r.y, d = Math.hypot(dx, dy);
        if (d > 8) { const s = Math.min(sp, d * 4); r.vx = (dx / d) * s; r.vy = (dy / d) * s; } else { r.vx = r.vy = 0; }
      } else { r.vx *= 0.8; r.vy *= 0.8; }
      r.x = clamp(r.x + r.vx * dt, 20, W - 20); r.y = clamp(r.y + r.vy * dt, 60, H - 20);
      if (Math.abs(r.vx) > 5) r.dir = r.vx > 0 ? 1 : -1;
      r.phase += Math.hypot(r.vx, r.vy) * dt * 0.08;

      const inP = (x, y) => x > P.x && x < P.x + P.w && y > P.y && y < P.y + P.h;
      const free = g.cows.filter((c) => !c.penned);
      const hx = free.reduce((a, c) => a + c.x, 0) / (free.length || 1), hy = free.reduce((a, c) => a + c.y, 0) / (free.length || 1);
      const gx = P.x + 30, gy = (P.gy0 + P.gy1) / 2;
      g.cows.forEach((c) => {
        let fx = 0, fy = 0;
        if (!c.penned) {
          const dx = c.x - r.x, dy = c.y - r.y, d = Math.hypot(dx, dy) || 1;
          if (d < 150) { const f = (1 - d / 150) * 520; fx += (dx / d) * f; fy += (dy / d) * f; }
          // herd instinct: stay bunched, and drift through an open gate once close
          fx += (hx - c.x) * 0.25; fy += (hy - c.y) * 0.25;
          const gd = Math.hypot(gx - c.x, gy - c.y) || 1;
          if (c.x < P.x && gd < 230) { const f = 90 * (1 - gd / 230) + 25; fx += ((gx - c.x) / gd) * f; fy += ((gy - c.y) / gd) * f; }
        }
        c.wa += R(-2, 2) * dt;
        fx += Math.cos(c.wa) * 22; fy += Math.sin(c.wa) * 22;
        g.cows.forEach((o) => {
          if (o === c) return;
          const dx = c.x - o.x, dy = c.y - o.y, d = Math.hypot(dx, dy) || 1;
          if (d < 36) { fx += (dx / d) * 260 * (1 - d / 36); fy += (dy / d) * 260 * (1 - d / 36); }
        });
        c.vx += fx * dt; c.vy += fy * dt;
        const damp = Math.max(0, 1 - 2.4 * dt); c.vx *= damp; c.vy *= damp;
        const spd = Math.hypot(c.vx, c.vy), max = c.penned ? 30 : 165;
        if (spd > max) { c.vx *= max / spd; c.vy *= max / spd; }
        let nx = c.x + c.vx * dt, ny = c.y + c.vy * dt;
        if (c.penned) {
          nx = clamp(nx, P.x + 22, P.x + P.w - 22); ny = clamp(ny, P.y + 26, P.y + P.h - 14);
        } else {
          if (nx < 25 || nx > W - 25) { c.vx *= -0.5; nx = clamp(nx, 25, W - 25); }
          if (ny < 70 || ny > H - 18) { c.vy *= -0.5; ny = clamp(ny, 70, H - 18); }
          const wasIn = inP(c.x, c.y), isIn = inP(nx, ny);
          if (!wasIn && isIn) {
            if (c.x <= P.x && ny > P.gy0 + 6 && ny < P.gy1 - 6) {
              c.penned = true; g.penned++;
              g.pop('Through the gate! ✅', P.x + 60, P.y - 20, '#c9f2b0');
              if (g.penned >= g.n) g.end();
            } else { nx = c.x; ny = c.y; c.vx *= -0.4; c.vy *= -0.4; }
          }
        }
        c.x = nx; c.y = ny;
        if (Math.abs(c.vx) > 4) c.dir = c.vx > 0 ? 1 : -1;
        c.lp += Math.hypot(c.vx, c.vy) * dt * 0.12;
      });
    },
    draw(g, ctx) {
      const P = g.pen;
      ctx.fillStyle = '#89bb57'; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = '#9dcc69'; ctx.fillRect(P.x - 8, 0, W, H);
      g.blow.forEach((b) => { ell(ctx, b.x, b.y, b.rx, b.ry); ctx.lineWidth = 2; fs(ctx, '#ecd9a8'); });
      g.yucca.forEach((y) => drawYucca(ctx, y.x, y.y, 0.7));
      // pen fence
      ctx.lineWidth = 5; ctx.strokeStyle = '#7a4e2d'; ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(P.x, P.gy0); ctx.lineTo(P.x, P.y); ctx.lineTo(P.x + P.w, P.y); ctx.lineTo(P.x + P.w, P.y + P.h); ctx.lineTo(P.x, P.y + P.h); ctx.lineTo(P.x, P.gy1);
      ctx.stroke();
      const posts = [[P.x, P.y], [P.x + P.w, P.y], [P.x + P.w, P.y + P.h], [P.x, P.y + P.h], [P.x, P.gy0], [P.x, P.gy1], [P.x + P.w / 2, P.y], [P.x + P.w / 2, P.y + P.h], [P.x + P.w, P.y + P.h / 2]];
      posts.forEach(([x, y]) => { rr(ctx, x - 5, y - 5, 10, 10, 2); ctx.lineWidth = 2; fs(ctx, '#5a381d'); });
      label(ctx, 'GATE ➜', P.x - 20, (P.gy0 + P.gy1) / 2 - 14, { align: 'right', size: 14, fill: '#ffd23f' });
      label(ctx, 'Fresh grass', P.x + P.w / 2, P.y + P.h + 8, { align: 'center', size: 13, fill: '#c9f2b0' });
      // actors sorted by y
      const actors = g.cows.map((c) => ({ y: c.y, f: () => {
        ell(ctx, c.x, c.y + 14, 22, 6); ctx.fillStyle = 'rgba(0,0,0,.18)'; ctx.fill();
        drawCow(ctx, c.x, c.y - 4, 0.62, { dir: c.dir, breed: c.breed, legPhase: c.lp });
      } }));
      const r = g.rider;
      actors.push({ y: r.y, f: () => {
        ell(ctx, r.x, r.y + 14, 26, 7); ctx.fillStyle = 'rgba(0,0,0,.2)'; ctx.fill();
        drawRider(ctx, r.x, r.y - 6, 0.7, r.dir, r.phase);
      } });
      actors.sort((a, b) => a.y - b.y).forEach((a) => a.f());
    },
    hud(g) { return `🐄 Through the gate: ${g.penned}/${g.n}`; },
    doneText(g) { return g.penned >= g.n ? 'Whole herd moved! 🤠' : "Time's up!"; },
    result(g) { return { score: g.penned / g.n, penned: g.penned }; },
  };

  /* ================= 5. Put Up Hay ================= */
  defs.hay = {
    icon: '🌾', title: 'Put Up Hay', duration: 30,
    blurb: 'Bale the hay on the subirrigated meadows between the dunes.',
    howto: 'Steer the tractor over the golden <b>windrows</b> to fill the baler. Every full baler pops out a round bale. Dodge <b>gopher mounds, rocks and yucca</b> or the baler jams!',
    controls: '← → arrow keys / A D · or tap the left / right side',
    init(g) {
      g.lanes = [270, 400, 530]; g.lane = 1; g.x = 400; g.items = []; g.spawn = 0.4; g.meter = 0; g.bales = 0;
      g.scroll = 0; g.jam = 0; g.ejected = [];
    },
    move(g, dir) { g.lane = clamp(g.lane + dir, 0, 2); },
    key(g, k) { if (k === 'ArrowLeft' || k === 'a') this.move(g, -1); if (k === 'ArrowRight' || k === 'd') this.move(g, 1); },
    down(g, x) { this.move(g, x < g.x ? -1 : 1); },
    update(g, dt) {
      const speed = (230 + g.t * 5) * (g.jam > 0 ? 0.25 : 1);
      g.jam = Math.max(0, g.jam - dt);
      g.scroll = (g.scroll + speed * dt) % 80;
      g.x += (g.lanes[g.lane] - g.x) * Math.min(1, dt * 12);
      g.spawn -= dt;
      if (g.spawn <= 0) {
        g.spawn = R(0.32, 0.55);
        const lane = Math.floor(R(0, 3));
        const kind = Math.random() < 0.68 ? 'hay' : pick(['gopher', 'rock', 'yucca']);
        g.items.push({ lane, x: g.lanes[lane], y: -40, kind });
      }
      g.items.forEach((it) => {
        it.y += speed * dt;
        if (!it.hit && it.y > 330 && it.y < 400 && Math.abs(it.x - g.x) < 50) {
          it.hit = true;
          if (it.kind === 'hay') {
            g.meter += 34; it.gone = true;
            if (g.meter >= 100) { g.meter -= 100; g.bales++; g.ejected.push({ x: g.x, y: 440 }); g.pop('Bale! 🟡', g.x, 300, '#ffe9a0'); }
          } else {
            g.jam = 0.8; g.meter = Math.max(0, g.meter - 25);
            g.pop(it.kind === 'gopher' ? 'Gopher mound! Jammed!' : it.kind === 'rock' ? 'Rock! Jammed!' : 'Yucca! Jammed!', g.x, 290, '#ffb8ad');
          }
        }
      });
      g.items = g.items.filter((it) => it.y < H + 50 && !it.gone);
      g.ejected.forEach((b) => (b.y += speed * dt * 0.9));
      g.ejected = g.ejected.filter((b) => b.y < H + 40);
    },
    draw(g, ctx) {
      ctx.fillStyle = '#93b847'; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = '#b8cf6a';
      for (let y = -80 + g.scroll; y < H; y += 80) ctx.fillRect(195, y, 410, 40);
      // meadow edges with dunes
      ctx.fillStyle = '#7da23a'; ctx.fillRect(0, 0, 195, H); ctx.fillRect(605, 0, 195, H);
      for (let i = 0; i < 6; i++) {
        const y = ((i * 90 + g.scroll * 1.0) % 540) - 60;
        drawTuft(ctx, 60 + (i % 2) * 70, y, 1.2, '#6c9235'); drawTuft(ctx, 690 + (i % 2) * 60, y + 40, 1.2, '#6c9235');
      }
      ctx.strokeStyle = OL; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(195, 0); ctx.lineTo(195, H); ctx.moveTo(605, 0); ctx.lineTo(605, H); ctx.stroke();
      g.items.forEach((it) => {
        if (it.kind === 'hay') {
          ell(ctx, it.x, it.y, 26, 34); ctx.lineWidth = 2.5; fs(ctx, '#e8c25a');
          ctx.strokeStyle = '#b38b2a'; ctx.lineWidth = 1.5;
          for (let k = -2; k <= 2; k++) { ctx.beginPath(); ctx.moveTo(it.x + k * 7, it.y - 26); ctx.lineTo(it.x + k * 6, it.y + 26); ctx.stroke(); }
        } else if (it.kind === 'gopher') {
          ell(ctx, it.x, it.y, 28, 18); ctx.lineWidth = 2.5; fs(ctx, '#8a6239'); ell(ctx, it.x, it.y - 3, 9, 6); ctx.fillStyle = '#3a2412'; ctx.fill();
        } else if (it.kind === 'rock') {
          ctx.beginPath(); ctx.moveTo(it.x - 24, it.y + 12); ctx.lineTo(it.x - 16, it.y - 14); ctx.lineTo(it.x + 8, it.y - 18); ctx.lineTo(it.x + 24, it.y + 2); ctx.lineTo(it.x + 12, it.y + 16); ctx.closePath(); ctx.lineWidth = 2.5; fs(ctx, '#9b9a94');
        } else { drawYucca(ctx, it.x, it.y + 10, 1.1); }
      });
      g.ejected.forEach((b) => drawBale(ctx, b.x, b.y, 22));
      // tractor + baler (top-down)
      const x = g.x + (g.jam > 0 ? Math.sin(g.t * 60) * 3 : 0), y = 360;
      rr(ctx, x - 30, y + 30, 60, 46, 8); ctx.lineWidth = 3; fs(ctx, '#f2b43c');
      ctx.fillStyle = OL; ctx.font = '900 10px Nunito'; ctx.textAlign = 'center'; ctx.fillText('BALER', x, y + 57);
      rr(ctx, x - 4, y + 18, 8, 16, 2); fs(ctx, '#555');
      rr(ctx, x - 36, y - 6, 16, 34, 5); fs(ctx, '#2a2a2a'); rr(ctx, x + 20, y - 6, 16, 34, 5); fs(ctx, '#2a2a2a');
      rr(ctx, x - 26, y - 46, 12, 18, 4); fs(ctx, '#2a2a2a'); rr(ctx, x + 14, y - 46, 12, 18, 4); fs(ctx, '#2a2a2a');
      rr(ctx, x - 18, y - 52, 36, 72, 10); fs(ctx, '#c8102e');
      rr(ctx, x - 16, y - 2, 32, 24, 5); fs(ctx, '#fffaf0');
      // meter
      rr(ctx, 620, 380, 160, 20, 10); ctx.lineWidth = 3; fs(ctx, '#fffaf0');
      rr(ctx, 622, 382, 156 * (g.meter / 100), 16, 8); ctx.fillStyle = '#e8c25a'; ctx.fill();
      label(ctx, 'Baler fill', 700, 350, { align: 'center', size: 13 });
      if (g.jam > 0) label(ctx, 'JAMMED!', 400, 200, { align: 'center', size: 22, fill: '#ffb8ad' });
    },
    hud(g) { return `🟡 Round bales: ${g.bales}`; },
    doneText(g) { return `${g.bales} bales put up! 🌾`; },
    result(g) { return { score: g.bales / 10, bales: g.bales }; },
  };

  /* ================= 6. Mend Fence ================= */
  defs.fence = {
    icon: '🔨', title: 'Mend Fence', duration: 30,
    blurb: 'Barbed wire keeps snapping along the north line. Splice it before the cattle wander off.',
    howto: 'When a wire <b>snaps</b>, a curious cow heads for the gap. <b>Click the broken section 3 times</b> to splice it before she slips through!',
    controls: 'Click / tap a broken section (3 taps fixes it)',
    init(g) {
      g.posts = []; for (let x = 40; x <= 760; x += 80) g.posts.push(x);
      g.segs = g.posts.slice(0, -1).map((x, i) => ({ x0: x, x1: g.posts[i + 1], broken: false, taps: 0 }));
      const breeds = ['angus', 'baldy', 'hereford'];
      g.cows = [...Array(5)].map((_, i) => ({ x: 90 + i * 150, y: 228, tx: null, seg: null, state: 'graze', dir: 1, breed: pick(breeds), lp: 0, wanderT: R(1, 3) }));
      g.next = 1.4; g.fixed = 0; g.escapes = 0;
    },
    update(g, dt) {
      g.next -= dt;
      if (g.next <= 0) {
        g.next = Math.max(1.1, 2.6 - g.t * 0.05);
        const ok = g.segs.filter((s) => !s.broken);
        if (ok.length) { const s = pick(ok); s.broken = true; s.taps = 0; g.pop('SNAP! ⚡', (s.x0 + s.x1) / 2, 185, '#ffe9a0'); }
      }
      g.segs.forEach((s) => {
        if (!s.broken) return;
        if (!g.cows.some((c) => c.seg === s)) {
          const free = g.cows.filter((c) => c.state === 'graze');
          if (free.length) {
            const mid = (s.x0 + s.x1) / 2;
            free.sort((a, b) => Math.abs(a.x - mid) - Math.abs(b.x - mid));
            free[0].state = 'seek'; free[0].seg = s; free[0].tx = mid; free[0].notice = 0;
          }
        }
      });
      g.cows.forEach((c) => {
        if (c.state === 'graze') {
          c.wanderT -= dt;
          if (c.wanderT <= 0) { c.wanderT = R(1.5, 3.5); c.tx = clamp(c.x + R(-90, 90), 50, 750); }
          if (c.tx != null) { const d = c.tx - c.x; if (Math.abs(d) > 3) { c.x += Math.sign(d) * 18 * dt; c.dir = Math.sign(d); c.lp += dt * 4; } }
        } else if (c.state === 'seek') {
          if (!c.seg.broken) { c.state = 'graze'; c.seg = null; c.tx = null; return; }
          // she takes a moment to notice the gap, then ambles over slowly
          c.notice = (c.notice || 0) + dt;
          if (c.notice < 1.8) return;
          const d = c.tx - c.x;
          if (Math.abs(d) > 4) { c.x += Math.sign(d) * 26 * dt; c.dir = Math.sign(d); c.lp += dt * 4; }
          else if (c.notice < 4) return; // she sniffs at the gap before pushing through
          else { c.state = 'escape'; g.escapes++; g.pop('She got out! 🐄💨', c.x, 170, '#ffb8ad'); }
        } else if (c.state === 'escape') {
          c.y += 90 * dt; c.lp += dt * 9;
          if (c.y > H + 40) { Object.assign(c, { state: 'graze', y: 228, x: Math.random() < 0.5 ? -40 : W + 40, tx: R(100, 700), seg: null }); }
        }
      });
    },
    down(g, x, y) {
      if (y < 150 || y > 340) return;
      const s = g.segs.find((s) => x >= s.x0 && x <= s.x1);
      if (!s || !s.broken) return;
      s.taps++;
      if (s.taps >= 3) { s.broken = false; g.fixed++; g.pop('Spliced! ✅', (s.x0 + s.x1) / 2, 200, '#c9f2b0'); }
      else g.pop('🔨', x, y - 20);
    },
    draw(g, ctx) {
      sideBackdrop(ctx, { top: '#4fa7ec', bottom: '#dff3ff', far: '#a8d47b', mid: '#93c565', ground: '#86bb52', horizon: 175 });
      ctx.fillStyle = '#76a944'; ctx.fillRect(0, 290, W, H);
      ctx.strokeStyle = OL; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(0, 290); ctx.lineTo(W, 290); ctx.stroke();
      const behind = g.cows.filter((c) => c.state !== 'escape' || c.y < 280);
      behind.forEach((c) => drawCow(ctx, c.x, c.y, 0.85, { dir: c.dir, breed: c.breed, legPhase: c.lp }));
      // wires
      g.segs.forEach((s) => {
        [222, 242, 262].forEach((wy, k) => {
          ctx.strokeStyle = '#4d4d4d'; ctx.lineWidth = 2;
          if (!s.broken) {
            ctx.beginPath(); ctx.moveTo(s.x0, wy); ctx.quadraticCurveTo((s.x0 + s.x1) / 2, wy + 5, s.x1, wy); ctx.stroke();
            for (let bx = s.x0 + 12; bx < s.x1; bx += 16) { ctx.beginPath(); ctx.moveTo(bx - 3, wy - 3); ctx.lineTo(bx + 3, wy + 3); ctx.moveTo(bx + 3, wy - 3); ctx.lineTo(bx - 3, wy + 3); ctx.stroke(); }
          } else {
            ctx.beginPath(); ctx.moveTo(s.x0, wy); ctx.quadraticCurveTo(s.x0 + 20, wy + 30, s.x0 + 14 + k * 4, wy + 40 + k * 4); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(s.x1, wy); ctx.quadraticCurveTo(s.x1 - 20, wy + 30, s.x1 - 16 - k * 3, wy + 36 + k * 5); ctx.stroke();
          }
        });
        if (s.broken) {
          const mx = (s.x0 + s.x1) / 2;
          const blink = Math.sin(g.t * 10) > 0;
          label(ctx, blink ? '❗ FIX' : '❗', mx, 150, { align: 'center', size: 14, fill: '#ffd23f' });
          for (let i = 0; i < 3; i++) { ell(ctx, mx - 12 + i * 12, 300, 4, 4); ctx.lineWidth = 2; fs(ctx, i < s.taps ? '#6aa84f' : '#fffaf0'); }
        }
      });
      g.posts.forEach((x) => { rr(ctx, x - 6, 205, 12, 92, 3); ctx.lineWidth = 2.5; fs(ctx, '#8a5a36'); });
      g.cows.filter((c) => c.state === 'escape' && c.y >= 280).forEach((c) => drawCow(ctx, c.x, c.y, 0.85, { dir: c.dir, breed: c.breed, legPhase: c.lp }));
      drawYucca(ctx, 120, 420, 1); drawYucca(ctx, 660, 430, 1.2);
    },
    hud(g) { return `🔨 Spliced: ${g.fixed} · Got out: ${g.escapes}`; },
    doneText(g) { return g.escapes === 0 ? 'Not one got out! 🔨' : 'Fence work done!'; },
    result(g) {
      const open = g.segs.filter((s) => s.broken).length;
      const tot = g.fixed + g.escapes + open * 0.5;
      return { score: tot ? g.fixed / tot : 1, fixed: g.fixed, escapes: g.escapes };
    },
  };

  /* ================= 7. Sale Barn ================= */
  defs.sale = {
    icon: '🔔', title: 'Sale Barn Auction', noTimer: true, duration: 999,
    blurb: 'Your cattle are in the ring. Listen to the chant and bang the gavel at the right moment.',
    howto: 'The bid climbs while buyers keep their cards up. When bidders start <b>dropping out</b>, the price is near its peak — then it starts falling. Hit <b>SOLD!</b> at the top of the market.',
    controls: 'Click / tap anywhere or press SPACE to sell',
    init(g) {
      g.lots = g.params.lots.map((l) => Object.assign({}, l));
      g.li = 0; g.results = []; this.startLot(g);
    },
    startLot(g) {
      const L = g.lots[g.li];
      L.start = g.t; L.tp = R(3, 6.5); L.peak = R(1.03, 1.16); L.ratio = 0.8; L.state = 'bidding'; L.bidT = 0; L.soldT = 0;
    },
    sell(g) {
      const L = g.lots[g.li];
      if (!L || L.state !== 'bidding' || g.t - L.start < 0.5) return;
      L.state = 'sold'; L.soldT = g.t;
      g.results.push({ ratio: L.ratio, peak: L.peak, count: L.count, type: L.type, base: L.base });
      const q = (L.ratio - 0.8) / (L.peak - 0.8);
      g.pop(q > 0.9 ? 'Top dollar! 🤑' : q > 0.6 ? 'Good sale! 👍' : 'Sold cheap… 😬', 400, 250, q > 0.6 ? '#c9f2b0' : '#ffd8b0');
    },
    down(g) { this.sell(g); },
    key(g, k) { if (k === ' ' || k === 'Enter') this.sell(g); },
    update(g, dt) {
      const L = g.lots[g.li];
      if (!L) return;
      const lt = g.t - L.start;
      if (L.state === 'bidding') {
        let target;
        if (lt < L.tp) { const f = lt / L.tp; target = 0.8 + (L.peak - 0.8) * (1 - Math.pow(1 - f, 2)); }
        else target = L.peak - (lt - L.tp) * 0.07;
        L.bidT -= dt;
        if (L.bidT <= 0) { L.bidT = 0.18; L.ratio = Math.max(0.78, target + R(-0.004, 0.004)); }
        if (lt > L.tp + 3.4) { this.sell(g); }
      } else if (g.t - L.soldT > 1.5) {
        g.li++;
        if (g.li >= g.lots.length) g.end(); else this.startLot(g);
      }
    },
    draw(g, ctx) {
      // barn interior
      ctx.fillStyle = '#7a4e2d'; ctx.fillRect(0, 0, W, H);
      for (let x = 0; x < W; x += 40) { ctx.fillStyle = x % 80 ? '#845634' : '#7a4e2d'; ctx.fillRect(x, 0, 40, 260); }
      ctx.strokeStyle = 'rgba(0,0,0,.25)'; ctx.lineWidth = 2;
      for (let x = 0; x < W; x += 40) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 260); ctx.stroke(); }
      // ring
      ell(ctx, 400, 300, 330, 85); ctx.lineWidth = 4; fs(ctx, '#e7cf98');
      ctx.fillStyle = 'rgba(160,120,60,.25)'; for (let i = 0; i < 60; i++) { ctx.fillRect(100 + ((i * 97) % 600), 240 + ((i * 53) % 110), 4, 2); }
      // auctioneer booth
      rr(ctx, 300, 40, 200, 90, 10); ctx.lineWidth = 4; fs(ctx, '#c8102e');
      ell(ctx, 400, 62, 15, 15); fs(ctx, '#f2c39b');
      ell(ctx, 400, 50, 26, 6); fs(ctx, '#fffaf0'); rr(ctx, 388, 30, 24, 18, 6); fs(ctx, '#fffaf0');
      rr(ctx, 384, 76, 32, 26, 6); fs(ctx, '#3d5a99');
      rr(ctx, 300, 96, 200, 34, 6); fs(ctx, '#8f0b20');
      ctx.fillStyle = '#ffd23f'; ctx.font = '900 16px Nunito'; ctx.textAlign = 'center'; ctx.fillText('SANDHILLS LIVESTOCK', 400, 119);
      const L = g.lots[g.li] || g.lots[g.lots.length - 1];
      // cattle in ring
      const n = Math.min(5, L.count);
      for (let i = 0; i < n; i++) {
        const x = 250 + i * 75 + Math.sin(g.t * 1.5 + i) * 8;
        const breed = ['angus', 'baldy', 'hereford'][i % 3];
        drawCow(ctx, x, 290 + (i % 2) * 18, L.type === 'calf' ? 0.65 : 0.9, { dir: i % 2 ? -1 : 1, breed, legPhase: g.t * 4 + i });
      }
      // price board
      const per = Math.round((L.base * L.ratio) / 5) * 5;
      rr(ctx, 30, 30, 240, 104, 12); ctx.lineWidth = 4; fs(ctx, '#1d2a1d');
      ctx.fillStyle = '#9ff27a'; ctx.font = '900 13px Nunito'; ctx.textAlign = 'left';
      ctx.fillText(`LOT ${g.li + 1 > g.lots.length ? g.lots.length : g.li + 1} of ${g.lots.length} · ${L.label}`, 44, 54);
      ctx.font = '900 38px Nunito'; ctx.fillText(`$${per.toLocaleString()}`, 44, 98);
      ctx.font = '800 13px Nunito'; ctx.fillText('per head', 44, 120);
      // bidders
      const lt = g.t - L.start;
      const bidding = L.state === 'bidding';
      const active = bidding ? (lt < L.tp ? Math.max(1, Math.round(6 * (1 - lt / L.tp) + 0.4)) : 0) : 0;
      for (let i = 0; i < 8; i++) {
        const bx = 60 + i * 97, by = 420;
        ell(ctx, bx, by + 30, 30, 26); ctx.lineWidth = 3; fs(ctx, ['#3d5a99', '#6a8f3a', '#c98a4b', '#7d5ba6'][i % 4]);
        ell(ctx, bx, by - 6, 15, 15); fs(ctx, '#f2c39b');
        ell(ctx, bx, by - 16, 24, 5); fs(ctx, i % 2 ? '#c8a165' : '#fffaf0'); rr(ctx, bx - 11, by - 32, 22, 16, 5); fs(ctx, i % 2 ? '#c8a165' : '#fffaf0');
        if (i < active) {
          ctx.beginPath(); ctx.moveTo(bx + 18, by + 10); ctx.lineTo(bx + 30, by - 30); ctx.lineWidth = 6; ctx.strokeStyle = '#f2c39b'; ctx.stroke(); ctx.lineWidth = 3;
          rr(ctx, bx + 18, by - 58, 30, 26, 4); fs(ctx, '#fffaf0');
          ctx.fillStyle = OL; ctx.font = '900 13px Nunito'; ctx.textAlign = 'center'; ctx.fillText(String(100 + i * 17), bx + 33, by - 40);
        }
      }
      // chant
      const chants = ['Hey bid-a-dollar now…', 'Who\'ll gimme…', 'Now-a-bid, now…', 'Yep! Got it!', 'Hey! Hep!'];
      let say = chants[Math.floor(g.t * 2.2) % chants.length];
      if (bidding && lt >= L.tp) say = lt > L.tp + 1.8 ? 'Going twice…!' : 'Going once…';
      if (L.state === 'sold') say = 'SOLD! 🔨';
      label(ctx, `🗣️ "${say}"`, 520, 52, { size: 16 });
      label(ctx, `Bidders: ${'🙋'.repeat(active) || '—'}`, 520, 92, { size: 15, fill: active <= 1 && bidding ? '#ffd8b0' : '#fffaf0' });
      if (bidding) { label(ctx, '🔨 SOLD!', W - 16, 180, { align: 'right', size: 22, fill: '#ffd23f', pad: 14 }); }
      if (L.state === 'sold') {
        ctx.save(); ctx.translate(400, 230); ctx.rotate(-0.12);
        label(ctx, `SOLD $${per.toLocaleString()}/hd`, 0, -20, { align: 'center', size: 30, fill: '#ffd23f', pad: 16 });
        ctx.restore();
      }
    },
    hud() { return '🔔 Watch the bidders!'; },
    doneText() { return 'Sale complete! 💵'; },
    result(g) {
      const q = g.results.map((r) => clamp((r.ratio - 0.8) / (r.peak - 0.8), 0, 1));
      return { score: q.reduce((a, b) => a + b, 0) / Math.max(1, q.length), sales: g.results };
    },
  };

  /* ================= 8. Coyote Watch ================= */
  defs.coyote = {
    icon: '🐺', title: 'Coyote Watch', duration: 30,
    blurb: 'Coyotes slip in after dark looking for young calves. Keep watch with your spotlight.',
    howto: 'Glowing red eyes in the dark mean the pack is closing in on the herd — and once they\'re close, they <b>rush</b>. Sweep your <b>spotlight</b> and <b>click a coyote</b> to scare it off before it reaches the calves.',
    controls: 'Move the mouse to aim the spotlight · click / tap coyotes',
    init(g) {
      g.coyotes = []; g.next = 0.8; g.scared = 0; g.reached = 0; g.flash = 0; g.shake = 0; g.danger = 0;
      g.stars = [...Array(50)].map(() => ({ x: R(0, W), y: R(0, 180), r: R(0.8, 2) }));
      g.pointer.x = 400; g.pointer.y = 300;
    },
    spawn(g) {
      const left = Math.random() < 0.5;
      g.coyotes.push({ x: left ? -30 : W + 30, y: R(235, 335), sp: R(58, 82) + g.t * 1.4, state: 'creep', dir: left ? 1 : -1, lp: 0, blink: R(0, 5), snarl: false });
      if (Math.random() < 0.45) g.pop(pick(['Aooooo! 🌕', 'Yip-yip-yip!', '*growl*']), left ? 90 : W - 90, R(170, 230), '#c9b8ff');
    },
    update(g, dt) {
      g.next -= dt;
      if (g.next <= 0) {
        g.next = Math.max(0.75, 1.7 - g.t * 0.035);
        this.spawn(g);
        if (g.t > 10 && Math.random() < 0.3) this.spawn(g); // the pack starts working together
      }
      g.flash = Math.max(0, g.flash - dt * 1.6); g.shake = Math.max(0, g.shake - dt);
      let danger = 0;
      g.coyotes.forEach((c) => {
        if (c.state === 'creep') {
          const dx = 400 - c.x, dy = 360 - c.y, d = Math.hypot(dx, dy);
          c.snarl = d < 190;
          const lunge = c.snarl ? 1.6 : 1; // they rush in once they're close
          c.x += (dx / d) * c.sp * lunge * dt; c.y += (dy / d) * c.sp * lunge * dt; c.dir = dx > 0 ? 1 : -1; c.lp += dt * (c.snarl ? 12 : 7);
          danger = Math.max(danger, 1 - d / 320);
          if (d < 75) { c.state = 'flee'; c.dir *= -1; g.reached++; g.flash = 1; g.shake = 0.35; g.pop('A coyote got in! 😱', c.x, c.y - 70, '#ffb8ad'); }
        } else { c.x += c.dir * 280 * dt; c.lp += dt * 16; }
      });
      g.danger += (Math.max(0, danger) - g.danger) * Math.min(1, dt * 4);
      g.coyotes = g.coyotes.filter((c) => c.x > -80 && c.x < W + 80);
    },
    down(g, x, y) {
      const c = g.coyotes.find((c) => c.state === 'creep' && dist(x, y, c.x + c.dir * 10, c.y - 10) < 56);
      if (c) { c.state = 'flee'; c.snarl = false; c.dir = c.x < 400 ? -1 : 1; g.scared++; g.pop('Yelp! Scram! 🔦', c.x, c.y - 60, '#c9f2b0'); }
    },
    draw(g, ctx) {
      ctx.save();
      if (g.shake) ctx.translate(R(-6, 6) * g.shake * 3, R(-6, 6) * g.shake * 3);
      sky(ctx, '#05060f', '#1a1236');
      g.stars.forEach((s) => { ctx.fillStyle = '#fff8d8'; ell(ctx, s.x, s.y, s.r, s.r); ctx.fill(); });
      // blood-orange moon behind a drifting cloud
      ell(ctx, 680, 80, 34, 34); ctx.lineWidth = 3; fs(ctx, '#f4a259');
      ctx.fillStyle = 'rgba(20,16,40,.85)'; ell(ctx, 650 + Math.sin(g.t * 0.3) * 30, 92, 60, 14); ctx.fill();
      hillBand(ctx, 200, 18, 0.008, 1, '#141c16');
      hillBand(ctx, 240, 12, 0.012, 4, '#1c2a1d');
      ctx.fillStyle = '#243522'; ctx.fillRect(0, 255, W, H);
      // nervous herd: they tremble when coyotes get close
      const j = () => (g.danger > 0.35 ? R(-1.5, 1.5) * g.danger * 2 : 0);
      drawCow(ctx, 340 + j(), 365, 0.9, { dir: 1, breed: 'angus' });
      drawCow(ctx, 470 + j(), 360, 0.9, { dir: -1, breed: 'baldy' });
      drawCow(ctx, 400 + j(), 390, 0.55, { dir: 1, breed: 'angus' });
      drawCow(ctx, 445 + j(), 400, 0.5, { dir: -1, breed: 'hereford' });
      drawCow(ctx, 360 + j(), 405, 0.5, { dir: 1, breed: 'baldy' });
      g.coyotes.forEach((c) => drawCoyote(ctx, c.x, c.y, 1.05, c.dir, c.lp, c.snarl));
      darkness(ctx, g.pointer.x + R(-1, 1), g.pointer.y + R(-1, 1), 115, 'rgba(2,3,12,0.92)');
      // glowing red eyes on top of the dark — they burn brighter as they get closer
      g.coyotes.forEach((c) => {
        if (c.state !== 'creep') return;
        if (Math.sin(g.t * 3 + c.blink) > 0.95) return;
        const d = dist(c.x, c.y, 400, 360), r = 3 + clamp(1 - d / 400, 0, 1) * 2.5;
        const ex = c.x + c.dir * 38, ey = c.y - 15;
        ctx.fillStyle = c.snarl ? '#ff2a12' : '#ff8a1f'; ctx.shadowColor = '#ff3b1f'; ctx.shadowBlur = 16;
        ell(ctx, ex, ey, r, r * 0.8); ctx.fill(); ell(ctx, ex - c.dir * 9, ey, r, r * 0.8); ctx.fill();
        ctx.shadowBlur = 0;
      });
      ctx.strokeStyle = 'rgba(255,240,180,.5)'; ctx.lineWidth = 2; ell(ctx, g.pointer.x, g.pointer.y, 95, 95); ctx.stroke();
      ctx.restore();
      // red danger vignette and a flash when one gets through
      if (g.danger > 0.2 || g.flash) {
        const a = Math.max(g.danger * 0.35 * (0.75 + 0.25 * Math.sin(g.t * 9)), g.flash * 0.45);
        const v = ctx.createRadialGradient(W / 2, H / 2, H * 0.35, W / 2, H / 2, W * 0.65);
        v.addColorStop(0, 'rgba(200,0,0,0)'); v.addColorStop(1, `rgba(200,0,0,${a.toFixed(3)})`);
        ctx.fillStyle = v; ctx.fillRect(0, 0, W, H);
      }
    },
    hud(g) { return `🔦 Scared off: ${g.scared} · Got in: ${g.reached}`; },
    doneText(g) { return g.reached === 0 ? 'Calves are safe! 🌙' : 'Night watch over'; },
    result(g) { const tot = g.scared + g.reached; return { score: tot ? g.scared / tot : 1, scared: g.scared, reached: g.reached }; },
  };

  window.MiniGames = { start, defs };
})();
