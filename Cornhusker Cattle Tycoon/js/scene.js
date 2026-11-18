/* Cornhusker Cattle Tycoon — the rolling Sandhills backdrop (SVG) */
(function () {
  const OL = '#3b2614';
  const W = 1200, H = 520;

  const SKY = {
    dawn:      ['#6c7bd0', '#f6a68e', '#ffe2a2'],
    midday:    ['#3b98e8', '#79c6f5', '#d2f0ff'],
    afternoon: ['#4b93d4', '#f3be78', '#ffe4a8'],
    evening:   ['#1d1546', '#873e78', '#f48a52'],
  };
  // far, mid, near, sand blowout — per season
  const LAND = [
    ['#b9bf8f', '#a5b06d', '#8fa052', '#ead8a6'], // spring (still brown-green)
    ['#a8d47b', '#86c157', '#69a941', '#eddcae'], // May
    ['#b4cf6a', '#93b847', '#76a035', '#f0dca8'], // July
    ['#dcc47f', '#cba85c', '#b48c45', '#f2e0b2'], // October
  ];
  const TINT = {
    dawn: 'rgba(255,150,110,0.13)',
    midday: 'rgba(0,0,0,0)',
    afternoon: 'rgba(255,185,80,0.12)',
    evening: 'rgba(35,18,85,0.40)',
  };
  const TREE = ['#9cbf5f', '#6fae46', '#5b9b38', '#e8b53a'];

  const FAR = { base: 292, offs: [12, -28, 0, -44, -8, -34, 6, -24, -4] };
  const MID = { base: 348, offs: [4, -18, 10, -24, -4, -28, 0, -14, 10] };
  const NEAR = { base: 428, offs: [0, -16, -4, -24, 0, -10, -20, 0, -10] };

  function hillPath(h) {
    const n = h.offs.length, step = W / (n - 1);
    const P = h.offs.map((o, i) => [i * step, h.base + o]);
    let d = `M -20 ${H + 10} L -20 ${P[0][1]} L ${P[0][0]} ${P[0][1]} `;
    for (let i = 1; i < n - 1; i++) {
      const mx = (P[i][0] + P[i + 1][0]) / 2, my = (P[i][1] + P[i + 1][1]) / 2;
      d += `Q ${P[i][0]} ${P[i][1]} ${mx} ${my} `;
    }
    d += `L ${P[n - 1][0]} ${P[n - 1][1]} L ${W + 20} ${P[n - 1][1]} L ${W + 20} ${H + 10} Z`;
    return d;
  }
  // approximate ground height on a hill at x (follows the curve through the midpoints)
  function yAt(h, x) {
    const n = h.offs.length, step = W / (n - 1);
    const pts = [[0, h.base + h.offs[0]]];
    for (let i = 1; i < n - 1; i++) pts.push([(i + 0.5) * step, h.base + (h.offs[i] + h.offs[i + 1]) / 2]);
    pts.push([W, h.base + h.offs[n - 1]]);
    for (let i = 0; i < pts.length - 1; i++) {
      if (x >= pts[i][0] && x <= pts[i + 1][0]) {
        const f = (x - pts[i][0]) / (pts[i + 1][0] - pts[i][0]);
        // bulge toward the control point a little
        const ctrl = h.base + h.offs[Math.min(n - 1, i)];
        const lin = pts[i][1] * (1 - f) + pts[i + 1][1] * f;
        return lin + (ctrl - lin) * 0.5 * Math.sin(Math.PI * f) * (i === 0 ? 0 : 1);
      }
    }
    return h.base;
  }

  function cow(x, y, s, flip, breed, graze) {
    const body = breed === 'hereford' ? '#a8492a' : '#272727';
    const face = breed === 'angus' ? '#272727' : '#fffaf0';
    const sw = (2.4 / s).toFixed(2);
    return `<g transform="translate(${x} ${y}) scale(${flip ? -s : s} ${s})"${graze ? ' class="cow-graze"' : ''}>
      <g stroke="${OL}" stroke-width="${sw}" stroke-linejoin="round">
        <path d="M-29 -8 Q-38 0 -34 14" fill="none"/>
        <circle cx="-34" cy="15" r="3" fill="${body}"/>
        <rect x="-23" y="4" width="7" height="22" rx="3" fill="${body}"/>
        <rect x="-12" y="4" width="7" height="22" rx="3" fill="${body}"/>
        <rect x="9" y="4" width="7" height="22" rx="3" fill="${body}"/>
        <rect x="19" y="4" width="7" height="22" rx="3" fill="${body}"/>
        <rect x="-30" y="-18" width="60" height="30" rx="15" fill="${body}"/>
        <ellipse cx="${graze ? 30 : 27}" cy="${graze ? -3 : -22}" rx="7" ry="3.5" fill="${body}" transform="rotate(-25 27 -22)"/>
        <ellipse cx="${graze ? 36 : 33}" cy="${graze ? 4 : -13}" rx="12" ry="11" fill="${face}"/>
        <ellipse cx="${graze ? 44 : 41}" cy="${graze ? 9 : -8}" rx="7" ry="6" fill="#e9a79a"/>
      </g>
      <circle cx="${graze ? 37 : 35}" cy="${graze ? 1 : -16}" r="2.2" fill="#111"/>
    </g>`;
  }

  function windmill(x, y) {
    const top = y - 150, cx = x - 2;
    let braces = '';
    for (let k = 1; k <= 4; k++) {
      const yy = y - k * 32, w = 26 - 20 * (k * 32) / 150;
      const yy2 = yy + 32, w2 = 26 - 20 * ((k - 1) * 32) / 150;
      braces += `<path d="M${x - w} ${yy} L${x + w} ${yy} M${x - w2} ${yy2} L${x + w} ${yy} M${x + w2} ${yy2} L${x - w} ${yy}" stroke="${OL}" stroke-width="2"/>`;
    }
    let blades = '';
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * Math.PI * 2;
      const p = (r, da) => `${(cx + Math.cos(a + da) * r).toFixed(1)} ${(top + Math.sin(a + da) * r).toFixed(1)}`;
      blades += `<path d="M${p(9, -0.1)} L${p(42, -0.12)} L${p(42, 0.12)} L${p(9, 0.1)} Z" fill="#dfe3e6" stroke="${OL}" stroke-width="1.6"/>`;
    }
    return `<g>
      <path d="M${x - 26} ${y} L${x - 6} ${top} M${x + 26} ${y} L${x + 6} ${top}" stroke="${OL}" stroke-width="5" stroke-linecap="round"/>
      ${braces}
      <path d="M${x + 4} ${top} L${x + 62} ${top - 3}" stroke="${OL}" stroke-width="4"/>
      <path d="M${x + 50} ${top - 22} L${x + 80} ${top - 17} L${x + 80} ${top + 10} L${x + 50} ${top + 8} Z" fill="#c8102e" stroke="${OL}" stroke-width="2.5"/>
      <rect x="${x - 10}" y="${top - 7}" width="20" height="14" rx="3" fill="#9aa3a8" stroke="${OL}" stroke-width="2.5"/>
      <g class="wm-wheel" style="transform-origin:${cx}px ${top}px">
        ${blades}
        <circle cx="${cx}" cy="${top}" r="42" fill="none" stroke="${OL}" stroke-width="2.5"/>
        <circle cx="${cx}" cy="${top}" r="8" fill="#6c757a" stroke="${OL}" stroke-width="2.5"/>
      </g>
    </g>`;
  }

  function tank(x, y, frozen) {
    let ribs = '';
    for (let i = 1; i < 8; i++) ribs += `<path d="M${x + i * 10} ${y - 22} L${x + i * 10} ${y}" stroke="#7d8a92" stroke-width="2"/>`;
    return `<g stroke="${OL}" stroke-width="2.5">
      <rect x="${x}" y="${y - 22}" width="80" height="24" rx="4" fill="#aab5bc"/>
      ${ribs}
      <ellipse cx="${x + 40}" cy="${y - 22}" rx="40" ry="8" fill="${frozen ? '#e6f4ff' : '#4aa3e8'}"/>
    </g>`;
  }

  function barn(x, y) {
    return `<g stroke="${OL}" stroke-width="3" stroke-linejoin="round">
      <rect x="${x}" y="${y - 72}" width="124" height="74" fill="#c0392b"/>
      <path d="M${x - 9} ${y - 70} L${x + 12} ${y - 106} L${x + 62} ${y - 124} L${x + 112} ${y - 106} L${x + 133} ${y - 70} Z" fill="#6e3a2a"/>
      <rect x="${x + 40}" y="${y - 52}" width="44" height="54" fill="#a8321f"/>
      <path d="M${x + 40} ${y - 52} L${x + 84} ${y + 2} M${x + 84} ${y - 52} L${x + 40} ${y + 2}" stroke="#fff6e8" stroke-width="3"/>
      <rect x="${x + 40}" y="${y - 52}" width="44" height="54" fill="none" stroke="#fff6e8" stroke-width="3"/>
      <rect x="${x + 52}" y="${y - 100}" width="20" height="18" fill="#fff1d6"/>
    </g>`;
  }

  function house(x, y, lit) {
    const win = lit ? '#ffd86b' : '#bfe3f5';
    return `<g stroke="${OL}" stroke-width="3" stroke-linejoin="round">
      <rect x="${x + 70}" y="${y - 104}" width="14" height="30" fill="#8b5a3c"/>
      <rect x="${x}" y="${y - 62}" width="104" height="64" fill="#fbf6ea"/>
      <path d="M${x - 10} ${y - 60} L${x + 52} ${y - 100} L${x + 114} ${y - 60} Z" fill="#5d6770"/>
      <rect x="${x + 12}" y="${y - 46}" width="22" height="20" fill="${win}"/>
      <rect x="${x + 70}" y="${y - 46}" width="22" height="20" fill="${win}"/>
      <rect x="${x + 42}" y="${y - 34}" width="20" height="36" fill="#c8102e"/>
      <path d="M${x - 4} ${y - 18} L${x + 108} ${y - 18}" stroke-width="3"/>
    </g>`;
  }

  function tree(x, y, color) {
    return `<g stroke="${OL}" stroke-width="3">
      <path d="M${x - 7} ${y} L${x - 4} ${y - 52} L${x + 4} ${y - 52} L${x + 8} ${y} Z" fill="#7a4e2d"/>
      <circle cx="${x - 24}" cy="${y - 62}" r="24" fill="${color}"/>
      <circle cx="${x + 22}" cy="${y - 66}" r="26" fill="${color}"/>
      <circle cx="${x}" cy="${y - 88}" r="30" fill="${color}"/>
    </g>`;
  }

  function yucca(x, y, s, bloom) {
    let leaves = '';
    for (let i = -5; i <= 5; i++) {
      const a = -Math.PI / 2 + i * 0.23;
      leaves += `<path d="M${x} ${y} L${(x + Math.cos(a) * 26 * s).toFixed(1)} ${(y + Math.sin(a) * 26 * s).toFixed(1)}" />`;
    }
    const stalk = bloom
      ? `<path d="M${x} ${y} L${x} ${y - 50 * s}" stroke="#6d8a3a" stroke-width="3"/>
         <g fill="#fffbe0" stroke="${OL}" stroke-width="1.5">
           <circle cx="${x - 4}" cy="${y - 40 * s}" r="4"/><circle cx="${x + 4}" cy="${y - 46 * s}" r="4"/><circle cx="${x - 3}" cy="${y - 52 * s}" r="4"/><circle cx="${x + 4}" cy="${y - 34 * s}" r="4"/>
         </g>`
      : '';
    return `<g stroke="#4f6b34" stroke-width="3.2" stroke-linecap="round">${leaves}</g>${stalk}`;
  }

  function cloud(x, y, s, fill, cls) {
    return `<g class="cloud ${cls || ''}"><g transform="translate(${x} ${y}) scale(${s})" fill="${fill}" stroke="${OL}" stroke-width="2.5">
      <path d="M-60 10 Q-66 -10 -42 -12 Q-36 -36 -8 -30 Q8 -50 32 -32 Q60 -34 58 -8 Q74 6 54 14 Z"/>
    </g></g>`;
  }

  // deterministic pseudo-random
  function rng(seed) { return () => ((seed = (seed * 9301 + 49297) % 233280) / 233280); }

  function render(el, o) {
    const slot = o.slot || 'midday';
    const week = Math.max(0, Math.min(3, o.week || 0));
    const sky = SKY[slot], land = LAND[week];
    const snowy = o.weather === 'snow';
    const evening = slot === 'evening';
    const r = rng(7 + week * 13);

    let s = `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMax slice" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Rolling Sandhills ranch scene">
      <defs>
        <linearGradient id="skyG" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="${sky[0]}"/><stop offset=".62" stop-color="${sky[1]}"/><stop offset="1" stop-color="${sky[2]}"/>
        </linearGradient>
        <radialGradient id="sunG"><stop offset="0" stop-color="#fff6c2"/><stop offset=".55" stop-color="${evening ? '#ff9a4a' : '#ffd23f'}"/><stop offset="1" stop-color="${evening ? '#ff7a3a' : '#ffb21f'}" stop-opacity="0"/></radialGradient>
      </defs>
      <rect width="${W}" height="${H}" fill="url(#skyG)"/>`;

    // stars + moon in the evening
    if (evening) {
      for (let i = 0; i < 40; i++) {
        const x = r() * W, y = r() * 170;
        s += `<circle class="twinkle" style="animation-delay:${(r() * 2).toFixed(2)}s" cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="${(1 + r() * 1.6).toFixed(1)}" fill="#fff8d8"/>`;
      }
      s += `<circle cx="210" cy="86" r="30" fill="#fff4cc" stroke="${OL}" stroke-width="2.5"/><circle cx="224" cy="78" r="27" fill="${sky[0]}"/>`;
    }

    // sun
    const sun = { dawn: [170, 268, 64], midday: [640, 82, 52], afternoon: [960, 165, 56], evening: [1040, 296, 70] }[slot];
    s += `<circle cx="${sun[0]}" cy="${sun[1]}" r="${sun[2] * 1.9}" fill="url(#sunG)" opacity=".75"/>
          <circle cx="${sun[0]}" cy="${sun[1]}" r="${sun[2] * 0.62}" fill="${evening ? '#ff8c42' : slot === 'dawn' ? '#ffb347' : '#ffd93b'}" stroke="${OL}" stroke-width="3"/>`;

    // clouds
    const cfill = evening ? '#f2b5c8' : slot === 'dawn' ? '#ffe3d8' : '#ffffff';
    s += cloud(180, 80, 1.1, cfill, '') + cloud(620, 130, 0.8, cfill, 'slow') + cloud(980, 70, 1.25, cfill, '');
    if (o.weather === 'rain' || snowy) s += cloud(420, 60, 1.6, '#c9ced6', 'slow') + cloud(860, 90, 1.5, '#c9ced6', '');

    // sandhill cranes in spring mornings and evenings
    if (week === 0 && (slot === 'dawn' || evening)) {
      let birds = '';
      for (let i = 0; i < 9; i++) {
        const bx = i * 28 + (i % 2) * 10, by = 120 + Math.abs(i - 4) * 9;
        birds += `<path d="M${bx - 8} ${by - 4} Q${bx - 3} ${by - 7} ${bx} ${by} Q${bx + 3} ${by - 7} ${bx + 8} ${by - 4}" fill="none" stroke="${OL}" stroke-width="2.4" stroke-linecap="round"/>`;
      }
      s += `<g class="cranes">${birds}</g>`;
    }

    // far hills + blowouts
    s += `<path d="${hillPath(FAR)}" fill="${land[0]}" stroke="${OL}" stroke-width="3"/>`;
    s += `<ellipse cx="420" cy="${yAt(FAR, 420) + 18}" rx="46" ry="12" fill="${land[3]}"/>`;
    s += `<ellipse cx="1080" cy="${yAt(FAR, 1080) + 16}" rx="38" ry="10" fill="${land[3]}"/>`;

    // mid hills
    s += `<path d="${hillPath(MID)}" fill="${land[1]}" stroke="${OL}" stroke-width="3"/>`;
    s += `<path d="M560 ${yAt(MID, 560) + 22} q 30 -14 70 -4 q 30 10 10 18 q -50 8 -80 -14 z" fill="${land[3]}" stroke="${OL}" stroke-width="2"/>`;
    // homestead on mid hill
    s += windmill(250, yAt(MID, 250) + 8);
    s += tank(282, yAt(MID, 300) + 10, snowy);
    s += tree(790, yAt(MID, 790) + 8, TREE[week]);
    s += house(840, yAt(MID, 880) + 8, evening || slot === 'dawn');
    s += barn(990, yAt(MID, 1050) + 8);

    // near hills
    s += `<path d="${hillPath(NEAR)}" fill="${land[2]}" stroke="${OL}" stroke-width="3"/>`;

    // cattle
    const spots = [[120, 0, 'angus'], [215, 1, 'baldy'], [330, 0, 'angus'], [440, 1, 'hereford'], [520, 0, 'angus'], [610, 1, 'angus'],
      [700, 0, 'baldy'], [790, 1, 'angus'], [880, 0, 'hereford'], [960, 1, 'angus'], [1050, 0, 'angus'], [1130, 1, 'baldy']];
    const herd = o.herd || { cows: 0, calves: 0, yearlings: 0 };
    const total = herd.cows + herd.yearlings;
    const shown = total > 0 ? Math.min(12, Math.max(1, Math.ceil(total / 4))) : 0;
    const calfShown = herd.calves > 0 ? Math.min(6, Math.max(1, Math.ceil(herd.calves / 3))) : 0;
    const order = [2, 7, 4, 10, 0, 5, 8, 1, 11, 3, 9, 6];
    order.slice(0, shown).forEach((idx, k) => {
      const [x, flip, breed] = spots[idx];
      const y = yAt(NEAR, x) + 12 + (k % 3) * 9;
      s += cow(x, y, 0.72 + (k % 3) * 0.06, !!flip, breed, k % 2 === 0);
      if (k < calfShown) s += cow(x + (flip ? -46 : 46), y + 8, 0.36, !!flip, breed, false);
    });

    // foreground fence and yucca
    const fy = 486;
    let fence = `<path d="M-10 ${fy - 26} Q600 ${fy - 34} 1210 ${fy - 24} M-10 ${fy - 12} Q600 ${fy - 20} 1210 ${fy - 10}" stroke="#5b4636" stroke-width="2" fill="none"/>`;
    for (let x = 30; x < W; x += 110) fence += `<rect x="${x}" y="${fy - 40}" width="10" height="46" rx="2" fill="#8a5a36" stroke="${OL}" stroke-width="2.5"/>`;
    s += fence;
    s += yucca(70, 512, 1.1, week === 1 || week === 2) + yucca(560, 516, 0.9, false) + yucca(1150, 510, 1.2, week === 1);

    if (snowy) s += `<rect width="${W}" height="${H}" fill="rgba(255,255,255,0.28)"/>`;
    s += `<rect width="${W}" height="${H}" fill="${TINT[slot]}" style="mix-blend-mode:multiply"/>`;
    s += `</svg>`;
    el.innerHTML = s;
  }

  window.Scene = { render };
})();
