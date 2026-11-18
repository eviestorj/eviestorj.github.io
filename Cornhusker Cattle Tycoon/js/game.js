/* Cornhusker Cattle Tycoon — core game */
(function () {
  const SAVE_KEY = 'cornhusker-cattle-tycoon-v1';
  const $ = (id) => document.getElementById(id);
  const R = (a, b) => a + Math.random() * (b - a);
  const RI = (a, b) => Math.floor(R(a, b + 1));
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const money = (n) => (n < 0 ? '-$' : '$') + Math.abs(Math.round(n)).toLocaleString();
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  /* ---------------- Data ---------------- */
  const SLOTS = [
    { id: 'dawn', name: 'Early Morning', clock: '5:30 AM', icon: '🌅', sub: 'Coffee\'s hot and the sun is just peeking over the dunes. Chores come first.' },
    { id: 'midday', name: 'Midday', clock: '11:30 AM', icon: '☀️', sub: 'The sun is high over the Sandhills. Time for the big jobs.' },
    { id: 'afternoon', name: 'Afternoon', clock: '3:30 PM', icon: '🌤️', sub: 'Long shadows on the grass. A few more hours of daylight.' },
    { id: 'evening', name: 'Evening', clock: '7:45 PM', icon: '🌙', sub: 'Supper\'s on the table, but the herd still needs looking after.' },
  ];

  const SEASONS = [
    { name: 'Spring Calving', month: 'March', start: 3, icon: '🌱',
      text: 'Calving season in the Sandhills. Newborn calves are hitting the ground, late blizzards can still roll in, and the cows need hay every day until the grass greens up.' },
    { name: 'Branding Season', month: 'May', start: 12, icon: '🤠',
      text: 'The grass is finally green. Neighbors trade help to brand and vaccinate calves, and the cow-calf pairs head out to summer pasture. Cattle can graze instead of eating hay now.' },
    { name: 'Summer Haying', month: 'July', start: 14, icon: '🌾',
      text: 'Hot days on the hay meadows. The wet valleys between the dunes grow the hay that will carry your herd through winter. Put up as much as you can — and watch for hail and lightning.' },
    { name: 'Fall Shipping', month: 'October', start: 6, icon: '🍂',
      text: 'The calves are weaned and heavy. Sale barns are busy and buyers are bidding. The grass is going dormant, so it\'s back to feeding hay. Make the last bank payment and finish the year strong!' },
  ];

  const PAYMENTS = [4000, 5000, 6000, 9000];
  const DAILY_COST = 120;

  const TASKS = {
    feed: { slots: ['dawn'], icon: '🚚', title: 'Feed the Herd', game: 'feed',
      desc: 'Haul hay and range cake out to the feed bunks.', helps: ['Health'],
      hint: (s) => `Uses ${hayNeed(s)} bales of hay (you have ${s.hay})`,
      avail: (s) => (s.hay > 0 ? true : 'Out of hay! Buy some in the Ranch Office.') },
    calves: { slots: ['dawn'], weeks: [0, 1], icon: '🍼', title: 'Calving Check', game: 'calves',
      desc: 'Glass the pasture with binoculars and tag the newborn calves.', helps: ['Calves'],
      hint: (s) => (s.pending > 0 ? `${s.pending} new calf${s.pending > 1 ? 'ves' : ''} born overnight!` : 'No new calves last night'),
      avail: (s) => (s.pending > 0 ? true : 'No new calves to find today.') },
    tank: { slots: ['dawn', 'midday'], icon: '💧', title: 'Windmill & Stock Tank', game: 'tank',
      desc: 'Pump water from the windmill and keep the stock tank full.', helps: ['Water'],
      hint: (s) => `Water is at ${Math.round(s.water)}%` },
    roundup: { slots: ['midday', 'afternoon'], icon: '🐎', title: 'Move to Fresh Pasture', game: 'roundup',
      desc: 'Saddle up and push the herd into the next pasture.', helps: ['Grass', 'Health'],
      hint: (s) => `Grass is at ${Math.round(s.grass)}%`,
      avail: (s) => (herdTotal(s) > 0 ? true : 'No cattle to move.') },
    hay: { slots: ['midday', 'afternoon'], weeks: [2], icon: '🌾', title: 'Put Up Hay', game: 'hay',
      desc: 'Bale the meadow hay to feed the herd this winter.', helps: ['Hay'],
      hint: (s) => `You have ${s.hay} bales stored` },
    fence: { slots: ['midday', 'afternoon'], icon: '🔨', title: 'Mend Fence', game: 'fence',
      desc: 'Splice the snapped barbed wire before cattle wander off.', helps: ['Fence'],
      hint: (s) => `Fence is at ${Math.round(s.fence)}%` },
    sale: { slots: ['afternoon'], icon: '🔔', title: 'Sale Barn', game: 'sale',
      desc: 'Haul cattle to the livestock auction and sell for cash.', helps: ['Cash'],
      hint: (s) => `Market is ${marketWord(s.market)} (${s.market.toFixed(2)}×)`,
      avail: (s) => (herdTotal(s) + s.calves > 0 ? true : 'Nothing to sell.') },
    vet: { slots: ['evening'], icon: '🩺', title: 'Herd Health Check', game: 'vet',
      desc: 'Walk the herd, spot sick cattle and pick the right treatment.', helps: ['Health'],
      hint: (s) => `Herd health is ${Math.round(s.health)}%` },
    coyote: { slots: ['evening'], icon: '🐺', title: 'Coyote Watch', game: 'coyote',
      desc: 'Sit up with the spotlight and keep coyotes away from the calves.', helps: ['Calves'],
      hint: (s) => (s.calves > 0 ? `${s.calves} calves to protect` : 'No calves on the ranch yet') },
  };

  const EVENTS = [
    { id: 'calm', w: [4, 5, 4, 4], icon: '🌤️', title: 'Clear Skies', text: 'A calm, beautiful day in the Sandhills. Meadowlarks are singing on the fence posts.' },
    { id: 'blizzard', w: [3, 0, 0, 1], icon: '❄️', title: 'Sandhills Blizzard', weather: 'snow',
      text: 'A late-season blizzard roared in overnight. The stock tank froze over and the cattle are cold and hungry.',
      apply: (s) => { s.water -= 25; s.health -= 4; }, mods: { wind: -70, snow: true } },
    { id: 'rain', w: [2, 4, 2, 1], icon: '🌧️', title: 'Good Soaking Rain', weather: 'rain',
      text: 'A slow, soaking rain. Every rancher in the county is smiling — the grass will love this.',
      apply: (s) => { s.grass += 12; s.water += 15; } },
    { id: 'wind', w: [2, 1, 1, 2], icon: '💨', title: 'High Wind Warning',
      text: 'Forty-mile-an-hour gusts are rattling the windmill and loosening fence staples.',
      apply: (s) => { s.fence -= 8; }, mods: { wind: 55 } },
    { id: 'cranes', w: [3, 0, 0, 1], icon: '🕊️', title: 'Sandhill Cranes Overhead',
      text: 'Thousands of sandhill cranes are passing over on their spring migration. A birdwatching group pays to visit your hilltop. (+$250)',
      apply: (s) => { s.cash += 250; } },
    { id: 'branding', w: [0, 3, 0, 0], icon: '🔥', title: "Neighbors' Branding Day",
      text: 'The neighbors showed up to help brand and vaccinate. Many hands make light work! (+5 Health, +10 Fence)',
      apply: (s) => { s.health += 5; s.fence += 10; } },
    { id: 'hail', w: [0, 2, 2, 0], icon: '🧊', title: 'Hailstorm',
      text: 'Golf-ball-sized hail pounded the pasture and knocked down a stretch of fence.',
      apply: (s) => { s.fence -= 15; s.grass -= 5; s.health -= 2; }, weather: 'rain' },
    { id: 'heat', w: [0, 0, 3, 0], icon: '🥵', title: 'Heat Wave',
      text: 'It\'s 102°F in the shade — if you can find any shade. The herd is drinking twice as much water.',
      apply: (s) => { s.water -= 20; s.grass -= 6; }, mods: { heat: true } },
    { id: 'drought', w: [0, 0, 2, 1], icon: '🏜️', title: 'Dry Spell',
      text: 'No rain in weeks. The grass is crunchy and the blowouts are getting bigger.',
      apply: (s) => { s.grass -= 10; s.water -= 8; } },
    { id: 'fire', w: [0, 0, 1, 2], icon: '🔥', title: 'Prairie Fire',
      text: 'Lightning sparked a grass fire on the north pasture. The volunteer fire department and your neighbors knocked it down, but you lost grass and fence.',
      apply: (s) => { s.grass -= 18; s.fence -= 12; } },
    { id: 'rally', w: [1, 1, 1, 2], icon: '📈', title: 'Cattle Market Rally',
      text: 'Cattle prices jumped on the radio market report this morning. Good day to sell!',
      apply: (s) => { s.market *= 1.08; } },
    { id: 'slump', w: [1, 1, 1, 1], icon: '📉', title: 'Market Slump',
      text: 'Cattle futures dropped overnight. Buyers at the sale barn will be stingy.',
      apply: (s) => { s.market *= 0.93; } },
    { id: 'husker', w: [0, 0, 0, 3], icon: '🏈', title: 'Husker Game Day',
      text: 'The Huskers won! The whole county is in a great mood, and buyers are bidding strong. GO BIG RED!',
      apply: (s) => { s.market *= 1.05; } },
  ];

  const QUIZ = [
    { q: 'Cow #214 is limping. Her foot is swollen between the toes and it smells foul.', a: ['Foot rot', 'Pinkeye', 'Bloat', 'Grass tetany'], c: 0,
      why: 'Foot rot is a bacterial infection between the claws. It\'s treated with antibiotics, and keeping cattle out of mud helps prevent it.' },
    { q: 'A calf has a watery, cloudy eye and keeps squinting in the bright sun. Face flies are everywhere.', a: ['Lumpy jaw', 'Pinkeye', 'Ringworm', 'Scours'], c: 1,
      why: 'Pinkeye is spread by face flies. Fly control, eye patches and antibiotics help it heal.' },
    { q: 'A cow got into lush alfalfa. Her left side is swollen up high like a drum and she\'s uncomfortable.', a: ['Foot rot', 'Hardware disease', 'Bloat', 'Pinkeye'], c: 2,
      why: 'Bloat happens when gas gets trapped in the rumen (on the cow\'s left side). It can be an emergency — call the vet!' },
    { q: 'A week-old calf has watery diarrhea, sunken eyes, and is too weak to stand.', a: ['Scours — give electrolytes', 'Pinkeye — patch the eye', 'Bloat — walk it around', 'Nothing — it will be fine'], c: 0,
      why: 'Scours dehydrates young calves fast. Electrolyte fluids are the most important treatment.' },
    { q: 'In early spring, a cow on short new grass is staggering, twitching and acting nervous.', a: ['Ringworm', 'Grass tetany', 'Lumpy jaw', 'Shipping fever'], c: 1,
      why: 'Grass tetany is caused by low magnesium. Feeding a high-magnesium mineral in spring helps prevent it.' },
    { q: 'A freshly weaned calf is coughing, has a runny nose, droopy ears and a fever after the truck ride.', a: ['Foot rot', 'Bloat', 'Bovine respiratory disease', 'Grass tetany'], c: 2,
      why: 'Bovine respiratory disease ("shipping fever") is common after stress like weaning and hauling. Vaccines and low-stress handling help.' },
    { q: 'A calf was born in a blizzard. It\'s cold, shivering and won\'t nurse. What do you do first?', a: ['Leave it with its mother', 'Warm it up and get colostrum in it', 'Sell it at the sale barn', 'Give it a bath'], c: 1,
      why: 'Warm the calf (warming box, truck heater, or kitchen!) and get colostrum into it — the first milk is full of antibodies.' },
    { q: 'A cow stands with her back arched, grunting and off feed. She\'s been grazing near some old baling wire.', a: ['Hardware disease', 'Pinkeye', 'Ringworm', 'Scours'], c: 0,
      why: 'Hardware disease happens when a cow swallows metal. Ranchers give cattle a magnet that stays in the stomach to catch it.' },
    { q: 'Several yearlings have crusty, gray, circular bald patches around their eyes.', a: ['Foot rot', 'Ringworm', 'Bloat', 'Lumpy jaw'], c: 1,
      why: 'Ringworm is a fungus, common in winter. It usually clears up in sunshine, but it\'s contagious — to people, too!' },
    { q: 'Why do Nebraska ranchers brand their calves?', a: ['It keeps flies away', 'Permanent proof of who owns the animal', 'It makes them grow faster', 'Tradition only'], c: 1,
      why: 'A registered brand is permanent proof of ownership. In western Nebraska, cattle are brand-inspected when they\'re sold.' },
    { q: 'Where does your Sandhills windmill pull its water from?', a: ['The Platte River', 'Lake McConaughy', 'The Ogallala Aquifer', 'Rainwater barrels'], c: 2,
      why: 'The Ogallala Aquifer lies under the Sandhills — that\'s why a windmill can reach good water almost anywhere out here.' },
    { q: 'Why move cattle between pastures (rotational grazing)?', a: ['To give the grass time to recover', 'Cows get bored', 'It\'s the law', 'To make them tired'], c: 0,
      why: 'Resting pastures lets grass regrow. Overgrazed Sandhills grass can turn into blowouts, where the wind scoops out the bare sand.' },
  ];

  const FACTS = [
    'The Sandhills are the largest sand dune formation in the Western Hemisphere — and they\'re almost all covered in grass.',
    'Nebraska has about three head of cattle for every person in the state.',
    'The Ogallala Aquifer lies under the Sandhills, which is why windmills can find water almost anywhere.',
    'A "blowout" is a bare spot where the wind has scooped sand out of a dune after the grass wore away.',
    'Hundreds of thousands of sandhill cranes stop along Nebraska\'s Platte River every spring.',
    'In the brand inspection area of western Nebraska, cattle are checked for brands whenever they\'re sold.',
    'Rotational grazing — moving cattle between pastures — keeps Sandhills grass healthy and the dunes in place.',
    'Many Sandhills ranches put up hay from wet "subirrigated" meadows in the valleys between the dunes.',
  ];

  /* ---------------- Helpers ---------------- */
  let S = null;
  const weekOf = (s) => clamp(Math.floor((s.day - 1) / 7), 0, 3);
  const herdTotal = (s) => s.cows + s.yearlings;
  const allHead = (s) => s.cows + s.yearlings + s.calves;
  const hayNeed = (s) => Math.max(1, Math.ceil(allHead(s) / 8));
  const marketWord = (m) => (m > 1.08 ? 'hot 🔥' : m > 1.0 ? 'steady' : m > 0.92 ? 'soft' : 'weak 🥶');
  const dateStr = (s) => { const w = weekOf(s); return `${SEASONS[w].month} ${SEASONS[w].start + ((s.day - 1) % 7)}`; };
  const paymentDue = (s) => Math.round(PAYMENTS[weekOf(s)] * (1 + 0.25 * (s.year - 1)));
  const daysToPay = (s) => 7 - ((s.day - 1) % 7);

  function price(type, s) {
    const w = weekOf(s);
    const base = { cow: 1450, yearling: [1700, 1850, 1950, 2050][w], calf: [500, 850, 1200, 1700][w] }[type];
    return Math.round(base * s.market * (0.7 + 0.3 * (s.health / 100)));
  }
  function netWorth(s) { return s.cash + s.cows * price('cow', s) + s.yearlings * price('yearling', s) + s.calves * price('calf', s) + s.hay * 60; }

  function newState(name) {
    return {
      v: 1, ranch: name || 'Rolling Hills Ranch', year: 1, day: 1, slot: 0,
      cash: 8000, cows: 30, yearlings: 10, calves: 0, pending: 0, bornThisYear: 0,
      hay: 60, water: 70, grass: 55, fence: 70, health: 80, market: 1.0,
      done: {}, fedToday: false, coyoteWatch: false, bought: {}, event: null,
      log: [], stats: { sold: 0, revenue: 0, lost: 0, born: 0, tasks: 0, stars: 0, startWorth: 0 },
      phase: 'play',
    };
  }
  function tidy(s) {
    ['water', 'grass', 'fence', 'health'].forEach((k) => (s[k] = clamp(Math.round(s[k]), 0, 100)));
    s.market = clamp(s.market, 0.78, 1.3);
    ['cows', 'yearlings', 'calves', 'pending', 'hay'].forEach((k) => (s[k] = Math.max(0, Math.round(s[k]))));
  }
  function save() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(S)); } catch (e) { /* storage unavailable */ } }
  function load() { try { const t = localStorage.getItem(SAVE_KEY); return t ? JSON.parse(t) : null; } catch (e) { return null; } }
  function clearSave() { try { localStorage.removeItem(SAVE_KEY); } catch (e) { /* ignore */ } }
  function log(text) { S.log.unshift({ d: `Day ${S.day}`, t: text }); S.log = S.log.slice(0, 8); }

  /* ---------------- Modal ---------------- */
  const modal = $('modal'), card = $('modalCard');
  function openModal(html, cls) {
    card.className = 'modal-card ' + (cls || '');
    card.innerHTML = html;
    modal.classList.remove('hidden');
    modal.scrollTop = 0;
    const f = card.querySelector('[autofocus], .btn-red, .btn');
    if (f) setTimeout(() => f.focus(), 30);
    return card;
  }
  function closeModal() { modal.classList.add('hidden'); card.innerHTML = ''; }
  function linesHTML(lines) {
    return `<ul class="lines">${lines.map((l) => `<li class="${l[1] || ''}">${l[0]}</li>`).join('')}</ul>`;
  }

  /* ---------------- Rendering ---------------- */
  function meter(label, v, color) {
    return `<div class="meter"><div class="lbl"><span>${label}</span><span>${Math.round(v)}%</span></div><div class="bar"><i style="width:${clamp(v, 0, 100)}%;background:${v < 30 ? '#e2533f' : color}"></i></div></div>`;
  }
  function render() {
    if (!S) return;
    const w = weekOf(S), slot = SLOTS[Math.min(S.slot, 3)];
    $('hud').innerHTML = `
      <div class="hud-top">
        <div class="brand">Cornhusker Cattle Tycoon<small>${esc(S.ranch)} · Year ${S.year}</small></div>
        <span class="chip">📅 Day ${S.day} · ${dateStr(S)}</span>
        <span class="chip">${SEASONS[w].icon} ${SEASONS[w].name}</span>
        <span class="chip due">🏦 ${money(paymentDue(S))} due in ${daysToPay(S)} day${daysToPay(S) > 1 ? 's' : ''}</span>
        <span class="chip cash ${S.cash < 0 ? 'neg' : ''}">💵 ${money(S.cash)}</span>
      </div>
      <div class="hud-stats">
        <div class="count">🐄 Cows <b>${S.cows}</b></div>
        <div class="count">🐮 Calves <b>${S.calves}</b></div>
        <div class="count">🐂 Yearlings <b>${S.yearlings}</b></div>
        <div class="count">🌾 Hay <b>${S.hay}</b> bales</div>
        <div class="count">📈 Market <b>${S.market.toFixed(2)}×</b></div>
        ${meter('❤️ Health', S.health, '#e05a7a')}
        ${meter('💧 Water', S.water, '#3d9be9')}
        ${meter('🌱 Grass', S.grass, '#6aa84f')}
        ${meter('🔨 Fence', S.fence, '#c98a4b')}
      </div>`;

    const ev = S.event && EVENTS.find((e) => e.id === S.event);
    const sceneEl = $('scene');
    sceneEl.classList.toggle('snow', !!(ev && ev.weather === 'snow' && S.slot < 2));
    sceneEl.classList.toggle('rain', !!(ev && ev.weather === 'rain' && S.slot < 2));
    Scene.render($('sceneSvg'), { slot: slot.id, week: w, weather: ev && S.slot < 2 ? ev.weather : null, herd: { cows: S.cows, calves: S.calves, yearlings: S.yearlings } });
    $('sceneClock').innerHTML = `${slot.icon} ${slot.clock}<small>${slot.name}</small>`;
    $('sceneEvent').innerHTML = ev && ev.id !== 'calm' ? `${ev.icon} ${ev.title}` : '';

    $('slotTitle').textContent = `${slot.icon} ${slot.name} — what's the plan, boss?`;
    $('slotSub').textContent = slot.sub;
    $('slotTrack').innerHTML = SLOTS.map((sl, i) => `<li class="${i < S.slot ? 'past' : i === S.slot ? 'now' : ''}">${sl.icon} ${sl.name}</li>`).join('');

    const tasks = Object.entries(TASKS).filter(([, t]) => t.slots.includes(slot.id) && (!t.weeks || t.weeks.includes(w)));
    let html = tasks.map(([id, t]) => {
      const done = S.done[id];
      const av = done ? 'Already done today.' : t.avail ? t.avail(S) : true;
      const ok = av === true;
      return `<button class="task" data-task="${id}" type="button" ${ok ? '' : 'disabled'}>
        <span class="t-icon">${t.icon}</span>
        <span class="t-title">${t.title}</span>
        <span class="t-desc">${t.desc}</span>
        <span class="t-tags">${t.helps.map((h) => `<span>+ ${h}</span>`).join('')}</span>
        <span class="t-hint ${ok ? '' : 'warn'}">${ok ? (t.hint ? t.hint(S) : '') : av}</span>
      </button>`;
    }).join('');
    const rest = slot.id === 'evening'
      ? ['📻', 'Supper & Husker Radio', 'Call it a night. Listen to the game and rest up for tomorrow.']
      : ['☕', 'Take a Breather', 'Skip ahead to the next part of the day.'];
    html += `<button class="task rest" data-task="rest" type="button"><span class="t-icon">${rest[0]}</span><span class="t-title">${rest[1]}</span><span class="t-desc">${rest[2]}</span></button>`;
    $('tasks').innerHTML = html;

    $('journal').innerHTML = S.log.length ? S.log.map((l) => `<li><b>${l.d}</b>${l.t}</li>`).join('') : '<li>Your story on the ranch starts today.</li>';
  }

  /* ---------------- Day flow ---------------- */
  function rollEvent(w) {
    const pool = EVENTS.filter((e) => e.w[w] > 0);
    let r = Math.random() * pool.reduce((a, e) => a + e.w[w], 0);
    for (const e of pool) { r -= e.w[w]; if (r <= 0) return e; }
    return pool[0];
  }

  function startDay() {
    const s = S, w = weekOf(s);
    s.slot = 0; s.done = {}; s.fedToday = false; s.coyoteWatch = false; s.bought = {};
    // overnight births
    let births = 0;
    if (w <= 1) {
      births = s.day === 1 && s.year === 1 ? 3 : w === 0 ? RI(1, 3) : RI(0, 1);
      births = Math.min(births, Math.max(0, s.cows - s.bornThisYear));
    }
    s.pending += births; s.bornThisYear += births;
    // event
    const ev = s.day === 1 && s.year === 1 ? EVENTS[0] : rollEvent(w);
    s.event = ev.id;
    if (ev.apply) ev.apply(s);
    tidy(s);
    if (ev.id !== 'calm') log(`${ev.icon} ${ev.title}`);
    save(); render();

    const lines = [];
    if (births) lines.push([`🍼 ${births} calf${births > 1 ? 'ves were' : ' was'} born overnight! Find and tag them with a Calving Check.`, 'good']);
    if (s.water < 30) lines.push(['💧 The stock tanks are running low.', 'bad']);
    if (s.grass < 30) lines.push(['🌱 The pasture is grazed short. Move the herd to fresh grass.', 'bad']);
    if (s.fence < 40) lines.push(['🔨 The fence is in rough shape — cattle could get out.', 'bad']);
    if (s.health < 45) lines.push(['❤️ The herd is looking poorly. Feed them and do a health check.', 'bad']);
    if (daysToPay(s) <= 2) lines.push([`🏦 The bank wants ${money(paymentDue(s))} in ${daysToPay(s)} day${daysToPay(s) > 1 ? 's' : ''}. You have ${money(s.cash)}.`, s.cash >= paymentDue(s) ? '' : 'bad']);

    openModal(`
      <h2>☀️ Day ${s.day} · ${dateStr(s)}</h2>
      <p><b>${SEASONS[w].icon} ${SEASONS[w].name}</b> · Year ${s.year} on ${esc(s.ranch)}</p>
      <div class="event-card"><span class="e-icon">${ev.icon}</span><div><h3>${ev.title}</h3><p>${ev.text}</p></div></div>
      ${lines.length ? linesHTML(lines) : ''}
      <div class="modal-actions"><button class="btn btn-red btn-big" id="goDay" type="button">Pull on your boots 🥾</button></div>`, 'narrow');
    $('goDay').onclick = closeModal;
  }

  function nextSlot() {
    S.slot++;
    if (S.slot >= 4) { endDay(); return; }
    save(); render();
  }

  function endDay() {
    const s = S, w = weekOf(s), ev = EVENTS.find((e) => e.id === s.event) || {};
    const lines = [];
    s.cash -= DAILY_COST; lines.push([`⛽ Fuel, mineral & upkeep: −${money(DAILY_COST)}`]);

    // food
    const grazeOk = s.grass >= 40 && (w === 1 || w === 2);
    if (!s.fedToday) {
      if (grazeOk) lines.push(['🌱 The cattle grazed green grass all day — no hay needed.', 'good']);
      else { s.health -= 7; lines.push([w === 1 || w === 2 ? '🍽️ The grass is too short to graze and nobody fed the herd. (−7 Health)' : '🍽️ Nobody fed the herd today and there\'s no green grass yet. (−7 Health)', 'bad']); }
    }
    // water
    const thirst = [16, 18, 26, 18][w] + (ev.mods && ev.mods.heat ? 8 : 0);
    s.water -= thirst;
    if (s.water < 25) { s.health -= 8; lines.push(['💧 The stock tank ran nearly dry. Thirsty cattle! (−8 Health)', 'bad']); }
    // grass
    const grow = [1, 6, 1, -2][w], graze = allHead(s) * 0.09;
    s.grass += grow - graze;
    if (s.grass < 20) { s.health -= 4; lines.push(['🌱 The pasture is grazed down to sand. (−4 Health)', 'bad']); }
    // fence
    s.fence -= 4;
    if (s.fence < 35 && herdTotal(s) > 0 && Math.random() < 0.4 + (35 - s.fence) / 50) {
      const n = Math.min(herdTotal(s), RI(1, 2));
      for (let i = 0; i < n; i++) { if (s.yearlings > 0 && Math.random() < 0.5) s.yearlings--; else if (s.cows > 0) s.cows--; else s.yearlings--; }
      s.stats.lost += n;
      lines.push([`🚧 ${n} head pushed through the broken fence and are long gone. Fix that fence!`, 'bad']);
      log(`🚧 Lost ${n} head through a bad fence`);
    }
    // coyotes
    if (!s.coyoteWatch && s.calves > 0 && Math.random() < [0.4, 0.3, 0.12, 0.08][w]) {
      s.calves--; s.stats.lost++;
      lines.push(['🐺 Coyotes got a calf overnight. A Coyote Watch could have stopped them.', 'bad']);
      log('🐺 Coyotes took a calf');
    }
    // unchecked newborns
    if (s.pending > 0) {
      let lost = 0, ok = 0;
      for (let i = 0; i < s.pending; i++) (Math.random() < 0.3 ? lost++ : ok++);
      s.calves += ok; s.stats.born += ok; s.stats.lost += lost; s.pending = 0;
      lines.push([`🍼 ${ok} untagged calf${ok === 1 ? '' : 'ves'} made it on their own${lost ? `, but ${lost} didn't survive the night` : ''}.`, lost ? 'bad' : '']);
      if (lost) log(`🍼 Lost ${lost} newborn calf${lost > 1 ? 'ves' : ''}`);
    }
    // sickness
    if (s.health < 35 && herdTotal(s) > 0 && Math.random() < 0.6) {
      if (s.cows > 0) s.cows--; else s.yearlings--;
      s.stats.lost++;
      lines.push(['☠️ A sick cow died overnight. Herd health is dangerously low!', 'bad']);
      log('☠️ Lost a cow to sickness');
    }
    // recovery
    if ((s.fedToday || grazeOk) && s.water >= 25 && s.grass >= 20) { s.health += 2; lines.push(['❤️ Fed, watered and on good grass — the herd is content. (+2 Health)', 'good']); }
    // market
    s.market *= 1 + R(-0.045, 0.045);
    tidy(s);

    // weekly bank note
    let payHTML = '';
    if (s.day % 7 === 0) {
      const due = paymentDue(s);
      if (s.cash >= due) {
        s.cash -= due;
        payHTML = `<div class="event-card"><span class="e-icon">🏦</span><div><h3>Bank note paid!</h3><p>You made the ${money(due)} payment on Dad's ranch loan. The banker tips his cap.</p></div></div>`;
        log(`🏦 Paid the ${money(due)} bank note`);
      } else {
        // forced sale
        let short = due - s.cash, sold = [];
        const order = [['yearling', 'yearlings'], ['cow', 'cows'], ['calf', 'calves']];
        for (const [type, key] of order) {
          const p = Math.round(price(type, s) * 0.75);
          let n = 0;
          while (short > 0 && s[key] > 0) { s[key]--; s.cash += p; short -= p; n++; }
          if (n) sold.push(`${n} ${key}`);
        }
        if (s.cash >= due) {
          s.cash -= due;
          payHTML = `<div class="event-card"><span class="e-icon">😬</span><div><h3>Forced sale</h3><p>You were short for the ${money(due)} bank note, so the bank made you sell ${sold.join(', ')} at a discount. Ouch.</p></div></div>`;
          log(`😬 Forced to sell ${sold.join(', ')} to pay the bank`);
        } else {
          s.phase = 'over'; s.overReason = `You couldn't make the ${money(due)} bank payment, even after selling every head of cattle.`;
        }
      }
      tidy(s);
    }
    if (s.phase !== 'over' && allHead(s) === 0) { s.phase = 'over'; s.overReason = 'There are no cattle left on the ranch.'; }
    save(); render();

    openModal(`
      <h2>🌙 Sundown Report — Day ${s.day}</h2>
      <p>The sun slips behind the dunes. Here's how ${esc(s.ranch)} fared today.</p>
      ${linesHTML(lines)}
      ${payHTML}
      <div class="modal-actions"><button class="btn btn-red btn-big" id="sleep" type="button">${s.phase === 'over' ? 'Uh oh…' : 'Get some sleep 😴'}</button></div>`, 'narrow');
    $('sleep').onclick = () => {
      if (s.phase === 'over') return gameOver();
      if (s.day >= 28) return yearEnd();
      const oldW = weekOf(s);
      s.day++;
      save();
      if (weekOf(s) !== oldW) seasonIntro(() => startDay()); else startDay();
    };
  }

  function seasonIntro(then) {
    const w = weekOf(S), se = SEASONS[w];
    render();
    openModal(`
      <h2>${se.icon} ${se.name}</h2>
      <p><b>${se.month}, Year ${S.year}.</b> ${se.text}</p>
      <div class="event-card"><span class="e-icon">🏦</span><div><h3>This week's bank note: ${money(paymentDue(S))}</h3><p>Due at sundown on day ${S.day + 6}. You have ${money(S.cash)}.</p></div></div>
      <p class="fact">🌾 Did you know? ${FACTS[(w + S.year) % FACTS.length]}</p>
      <div class="modal-actions"><button class="btn btn-red btn-big" id="goSeason" type="button">Let's ranch!</button></div>`, 'narrow');
    $('goSeason').onclick = then;
  }

  /* ---------------- Running tasks ---------------- */
  function runTask(id) {
    if (id === 'rest') {
      if (SLOTS[S.slot].id === 'evening') log('📻 Listened to the Huskers on the radio');
      nextSlot(); return;
    }
    const ev = EVENTS.find((e) => e.id === S.event) || {};
    const mods = ev.mods || {};
    if (id === 'sale') return saleSetup();
    if (id === 'vet') return vetQuiz();
    const params = {
      feed: { wind: mods.wind || 0, snow: !!mods.snow },
      calves: { count: S.pending },
      tank: { heat: !!mods.heat },
      roundup: { n: clamp(Math.ceil(herdTotal(S) / 5), 4, 9) },
      hay: {}, fence: {}, coyote: {},
    }[id];
    const c = openModal('', 'wide');
    MiniGames.start(id, params, c, (res) => finishTask(id, res));
  }

  function stars(score) { return score >= 0.85 ? 3 : score >= 0.5 ? 2 : score > 0.05 ? 1 : 0; }

  function finishTask(id, res) {
    const s = S, lines = [];
    s.done[id] = true; s.stats.tasks++;
    const st = stars(res.score); s.stats.stars += st;
    switch (id) {
      case 'feed': {
        const need = hayNeed(s), used = Math.min(s.hay, need), q = res.score * (used / need);
        s.hay -= used;
        const h = Math.round(1 + 7 * q);
        s.health += h; s.fedToday = q >= 0.3;
        lines.push([`🥣 Filled ${res.filled} of 6 feed bunks.`], [`🌾 Fed out ${used} bales of hay.`], [`❤️ Herd health +${h}`, 'good']);
        if (used < need) lines.push(['⚠️ You ran short of hay! Buy more in the Ranch Office.', 'bad']);
        if (!s.fedToday) lines.push(['😟 Most of the herd is still hungry.', 'bad']);
        break;
      }
      case 'calves': {
        const f = Math.min(res.found, s.pending);
        s.calves += f; s.pending -= f; s.stats.born += f;
        lines.push([`🏷️ Tagged ${f} new calf${f === 1 ? '' : 'ves'}. They're safe and nursing.`, f ? 'good' : '']);
        if (s.pending > 0) lines.push([`🌾 ${s.pending} calf${s.pending === 1 ? ' is' : 'ves are'} still out there untagged. Fingers crossed for tonight.`, 'bad']);
        if (f) log(`🍼 Tagged ${f} newborn calf${f > 1 ? 'ves' : ''}`);
        break;
      }
      case 'tank': {
        const before = s.water;
        s.water = Math.max(s.water, Math.round(35 + 65 * res.score));
        lines.push([`💧 Water ${Math.round(before)}% → ${Math.round(s.water)}%`, 'good']);
        break;
      }
      case 'roundup': {
        const g = Math.round(8 + 27 * res.score), h = Math.round(4 * res.score);
        s.grass += g; s.health += h;
        lines.push([`🐄 Pushed ${res.penned} bunches of cattle through the gate.`], [`🌱 Fresh pasture: Grass +${g}`, 'good']);
        if (h) lines.push([`❤️ Happy cows on new grass: Health +${h}`, 'good']);
        break;
      }
      case 'hay': {
        s.hay += res.bales;
        lines.push([`🟡 Put up ${res.bales} round bales. Hay stored: ${s.hay + 0} bales.`, res.bales ? 'good' : '']);
        if (res.bales) log(`🌾 Baled ${res.bales} round bales`);
        break;
      }
      case 'fence': {
        const g = Math.round(10 + 45 * res.score);
        s.fence += g;
        lines.push([`🔨 Spliced ${res.fixed} breaks.`], [`🚧 Fence +${g}`, 'good']);
        if (res.escapes) lines.push([`🐄 ${res.escapes} cow${res.escapes > 1 ? 's' : ''} slipped out, but you chased them home. Took a while!`]);
        break;
      }
      case 'coyote': {
        s.coyoteWatch = true;
        const lost = Math.min(s.calves, Math.floor(res.reached / 2));
        s.calves -= lost; s.stats.lost += lost;
        lines.push([`🔦 Scared off ${res.scared} coyote${res.scared === 1 ? '' : 's'}.`, 'good']);
        lines.push(lost ? [`🐺 Coyotes made off with ${lost} calf${lost > 1 ? 'ves' : ''}.`, 'bad'] : ['🌙 Every calf made it through the night.', 'good']);
        if (lost) log(`🐺 Lost ${lost} calf${lost > 1 ? 'ves' : ''} to coyotes`);
        break;
      }
    }
    tidy(s); save(); render();
    showResult(TASKS[id], st, lines);
  }

  function showResult(t, st, lines) {
    const msg = ['Rough go of it…', 'Not bad, rookie.', 'Good work!', 'Dad would be proud! 🤠'][st];
    openModal(`
      <h2>${t.icon} ${t.title}</h2>
      <div class="stars">${[0, 1, 2].map((i) => `<span class="${i < st ? '' : 'off'}">⭐</span>`).join('')}</div>
      <p style="text-align:center"><b>${msg}</b></p>
      ${linesHTML(lines)}
      <div class="modal-actions"><button class="btn btn-red btn-big" id="cont" type="button">Continue ➜</button></div>`, 'narrow');
    $('cont').onclick = () => { closeModal(); nextSlot(); };
  }

  /* ---------------- Sale barn ---------------- */
  function saleSetup() {
    const s = S;
    const types = [['cow', 'cows', '🐄 Cows', 'Mother cows. Selling them means fewer calves next year.'],
      ['yearling', 'yearlings', '🐂 Yearlings', 'Last year\'s calves, ready for the feedlot.'],
      ['calf', 'calves', '🐮 Calves', weekOf(s) === 3 ? 'Weaned and heavy — top of the market!' : 'Still light. They\'re worth much more in the fall.']];
    const sel = { cow: 0, yearling: 0, calf: 0 };
    const c = openModal(`
      <h2>🔔 Haul to the Sale Barn</h2>
      <p>Pick which cattle to load on the trailer. Prices shown are today's estimate per head — your timing in the auction ring decides the final price. The sale barn keeps a 2.5% commission.</p>
      <div id="sellRows">${types.map(([t, k, l, d]) => `
        <div class="sell-row"><div><b>${l}</b> <span>(${s[k]} on hand · ~${money(price(t, s))}/hd)</span><small>${d}</small></div>
          <div class="stepper"><button class="btn" data-t="${t}" data-d="-1" type="button" aria-label="fewer">−</button><output id="n_${t}">0</output><button class="btn" data-t="${t}" data-d="1" type="button" aria-label="more">+</button></div></div>`).join('')}</div>
      <p class="sell-total" id="sellTotal"></p>
      <div class="modal-actions">
        <button class="btn btn-plain" id="saleBack" type="button">Never mind</button>
        <button class="btn btn-red btn-big" id="saleGo" type="button">Load the trailer 🚛</button>
      </div>`, 'narrow');
    const upd = () => {
      const tot = sel.cow * price('cow', s) + sel.yearling * price('yearling', s) + sel.calf * price('calf', s);
      Object.keys(sel).forEach((t) => ($('n_' + t).textContent = sel[t]));
      $('sellTotal').innerHTML = tot ? `Estimated: <b>${money(tot)}</b>` : 'Choose some cattle to sell.';
      $('saleGo').disabled = !tot;
    };
    c.querySelectorAll('[data-t]').forEach((b) => (b.onclick = () => {
      const t = b.dataset.t, key = { cow: 'cows', yearling: 'yearlings', calf: 'calves' }[t];
      const step = b.dataset.d === '1' ? 1 : -1;
      sel[t] = clamp(sel[t] + step, 0, s[key]);
      upd();
    }));
    $('saleBack').onclick = closeModal;
    $('saleGo').onclick = () => {
      const names = { cow: 'cows', yearling: 'yearlings', calf: 'calves' };
      const lots = Object.keys(sel).filter((t) => sel[t] > 0).map((t) => ({ type: t, count: sel[t], base: price(t, s), label: `${sel[t]} ${names[t]}` }));
      const box = openModal('', 'wide');
      MiniGames.start('sale', { lots }, box, (res) => finishSale(res));
    };
    upd();
  }

  function finishSale(res) {
    const s = S, lines = [];
    let gross = 0;
    const key = { cow: 'cows', yearling: 'yearlings', calf: 'calves' };
    res.sales.forEach((r) => {
      const per = Math.round((r.base * r.ratio) / 5) * 5, amt = per * r.count;
      gross += amt; s[key[r.type]] -= r.count; s.stats.sold += r.count;
      lines.push([`🔨 ${r.count} ${key[r.type]} sold at ${money(per)}/head = <b>${money(amt)}</b>`, r.ratio >= 1 ? 'good' : '']);
    });
    const fee = Math.round(gross * 0.025), net = gross - fee;
    s.cash += net; s.stats.revenue += net;
    lines.push([`🧾 Commission: −${money(fee)}`], [`💵 Check from the sale barn: <b>${money(net)}</b>`, 'good']);
    log(`🔔 Sale barn check for ${money(net)}`);
    s.done.sale = true; s.stats.tasks++;
    const st = stars(res.score); s.stats.stars += st;
    tidy(s); save(); render();
    showResult(TASKS.sale, st, lines);
  }

  /* ---------------- Vet quiz ---------------- */
  function vetQuiz() {
    const qs = [...QUIZ].sort(() => Math.random() - 0.5).slice(0, 4);
    let i = 0, right = 0;
    const intro = openModal(`
      <div class="mg-top"><span class="mg-icon">🩺</span><div><h2>Herd Health Check</h2><p>Walk through the herd and figure out what's wrong. Each correct call treats the animal (+4 Health, $40 in vet supplies).</p></div></div>
      <div id="quizBox"></div>`);
    const box = intro.querySelector('#quizBox');
    function show() {
      const q = qs[i];
      box.innerHTML = `
        <div class="quiz-q"><span class="q-tag">Case ${i + 1} of ${qs.length}</span><h3>${q.q}</h3></div>
        <div class="quiz-opts">${q.a.map((a, k) => [a, k]).sort(() => Math.random() - 0.5).map(([a, k], n) => `<button class="btn" data-k="${k}" type="button">${String.fromCharCode(65 + n)}. ${a}</button>`).join('')}</div>
        <div id="quizAfter"></div>`;
      box.querySelectorAll('[data-k]').forEach((b) => (b.onclick = () => answer(+b.dataset.k)));
    }
    function answer(k) {
      const q = qs[i], ok = k === q.c;
      if (ok) right++;
      box.querySelectorAll('[data-k]').forEach((b) => {
        b.disabled = true;
        const kk = +b.dataset.k;
        if (kk === q.c) b.classList.add('right'); else if (kk === k) b.classList.add('wrong');
      });
      box.querySelector('#quizAfter').innerHTML = `
        <div class="quiz-explain"><b>${ok ? '✅ Right!' : '❌ Not quite.'}</b> ${q.why}</div>
        <div class="modal-actions"><button class="btn btn-red" id="qNext" type="button">${i + 1 < qs.length ? 'Next case ➜' : 'Finish rounds'}</button></div>`;
      const nb = $('qNext'); nb.focus();
      nb.onclick = () => { i++; if (i < qs.length) show(); else done(); };
    }
    function done() {
      const s = S;
      s.health += right * 4; s.cash -= right * 40;
      s.done.vet = true; s.stats.tasks++;
      const st = stars(right / qs.length); s.stats.stars += st;
      tidy(s); save(); render();
      showResult(TASKS.vet, st, [
        [`🩺 You made the right call on ${right} of ${qs.length} cases.`, right >= 3 ? 'good' : ''],
        [`❤️ Herd health +${right * 4}`, right ? 'good' : ''],
        [`💉 Vet supplies: −${money(right * 40)}`],
      ]);
    }
    show();
  }

  /* ---------------- Ranch office ---------------- */
  function office() {
    const s = S;
    const items = [
      { id: 'hay', icon: '🌾', name: 'Buy 10 bales of hay', cost: 800, note: 'Delivered from a neighbor\'s meadow. $80 a bale.', fn: () => { s.hay += 10; return '+10 bales of hay'; }, repeat: true },
      { id: 'vax', icon: '💉', name: 'Mineral & vaccine program', cost: 450, note: '+8 Herd Health. Once per day.', fn: () => { s.health += 8; return '+8 Health'; } },
      { id: 'hand', icon: '🧑‍🌾', name: 'Hire the neighbor kid', cost: 350, note: 'They\'ll fix fence for the day. +20 Fence. Once per day.', fn: () => { s.fence += 20; return '+20 Fence'; } },
      { id: 'cow', icon: '🐄', name: 'Buy a bred cow', cost: 2100, note: 'More cows means more calves next spring.', fn: () => { s.cows += 1; return '+1 cow'; }, repeat: true },
    ];
    const due = paymentDue(s);
    const c = openModal(`
      <h2>🏠 Ranch Office</h2>
      <p>Dad's old roll-top desk, a stack of feed bills and a coffee can of pencils. Buying here doesn't use up any time.</p>
      <div class="shop">${items.map((it) => {
        const used = !it.repeat && s.bought[it.id];
        return `<div class="shop-item"><span class="s-icon">${it.icon}</span><b>${it.name}</b><small>${it.note}</small>
          <button class="btn btn-gold" data-buy="${it.id}" type="button" ${used || s.cash < it.cost ? 'disabled' : ''}>${used ? 'Done today' : money(it.cost)}</button></div>`;
      }).join('')}</div>
      <p id="buyMsg" style="text-align:center;min-height:1.4em"></p>
      <h3>📒 Ledger</h3>
      <table class="ledger">
        <tr><td>Cash on hand</td><td>${money(s.cash)}</td></tr>
        <tr><td>${s.cows} cows × ~${money(price('cow', s))}</td><td>${money(s.cows * price('cow', s))}</td></tr>
        <tr><td>${s.yearlings} yearlings × ~${money(price('yearling', s))}</td><td>${money(s.yearlings * price('yearling', s))}</td></tr>
        <tr><td>${s.calves} calves × ~${money(price('calf', s))}</td><td>${money(s.calves * price('calf', s))}</td></tr>
        <tr><td>${s.hay} bales of hay × $60</td><td>${money(s.hay * 60)}</td></tr>
        <tr class="total"><td>Ranch net worth</td><td>${money(netWorth(s))}</td></tr>
      </table>
      <p style="margin-top:10px">🏦 Next bank note: <b>${money(due)}</b> at sundown in ${daysToPay(s)} day${daysToPay(s) > 1 ? 's' : ''}. Remaining notes this year: ${PAYMENTS.slice(weekOf(s)).map((p) => money(Math.round(p * (1 + 0.25 * (s.year - 1))))).join(' → ')}</p>
      <p class="fact">💡 Tip: calves are worth the most in the fall, but yearlings and cull cows can be sold any time to cover a bank note.</p>
      <div class="modal-actions"><button class="btn btn-red" id="offClose" type="button">Back to work</button></div>`);
    c.querySelectorAll('[data-buy]').forEach((b) => (b.onclick = () => {
      const it = items.find((x) => x.id === b.dataset.buy);
      if (s.cash < it.cost) return;
      s.cash -= it.cost; s.bought[it.id] = true;
      const msg = it.fn();
      log(`🏠 Bought: ${it.name}`);
      tidy(s); save(); render(); office();
      $('buyMsg').textContent = `✅ ${it.name}: ${msg}`;
    }));
    $('offClose').onclick = closeModal;
  }

  /* ---------------- End states ---------------- */
  function summaryTable(s) {
    return `<table class="ledger">
      <tr><td>Calves born & raised</td><td>${s.stats.born}</td></tr>
      <tr><td>Cattle sold</td><td>${s.stats.sold}</td></tr>
      <tr><td>Sale barn income</td><td>${money(s.stats.revenue)}</td></tr>
      <tr><td>Cattle lost</td><td>${s.stats.lost}</td></tr>
      <tr><td>Chores done · stars earned</td><td>${s.stats.tasks} · ${s.stats.stars} ⭐</td></tr>
      <tr class="total"><td>Ranch net worth</td><td>${money(netWorth(s))}</td></tr>
    </table>`;
  }

  function yearEnd() {
    const s = S, nw = netWorth(s), start = s.stats.startWorth || 70000;
    const pct = (nw - start) / start;
    const grade = pct > 0.15 ? ['🏆', 'Cattle Baron of the Sandhills!', 'Your ranch is worth a lot more than when Dad left it. The whole county is talking about you.']
      : pct > 0 ? ['🤠', 'Dad Would Be Proud', 'You kept the ranch running and grew it a little. That\'s a real rancher.']
      : pct > -0.15 ? ['👍', 'Hanging On', 'It was a tough year, but the ranch is still in the family.']
      : ['😅', 'Survived… Barely', 'The ranch made it through the year, but it\'s smaller than when you started.'];
    s.phase = 'yearEnd'; save();
    openModal(`
      <div class="title-card">
        <div style="font-size:3.5rem">${grade[0]}</div>
        <h2>${grade[1]}</h2>
        <p>You made it through a full year on ${esc(s.ranch)} and paid every bank note. ${grade[2]}</p>
      </div>
      ${summaryTable(s)}
      <div class="modal-actions">
        <button class="btn btn-red btn-big" id="yearTwo" type="button">Ranch another year ➜</button>
        <button class="btn btn-plain" id="restart" type="button">Start a new ranch</button>
      </div>`, 'narrow');
    $('yearTwo').onclick = () => {
      s.year++; s.day = 1; s.phase = 'play'; s.bornThisYear = 0;
      s.yearlings += s.calves; s.calves = 0; s.pending = 0;
      s.stats.startWorth = netWorth(s);
      log(`🎉 Year ${s.year} begins. Last year's calves are now yearlings.`);
      save();
      seasonIntro(() => startDay());
    };
    $('restart').onclick = () => { clearSave(); titleScreen(); };
  }

  function gameOver() {
    const s = S;
    openModal(`
      <div class="title-card">
        <div style="font-size:3.5rem">🏚️</div>
        <h2>The Ranch Is Sold</h2>
        <p>${esc(s.overReason || '')} After ${s.day} days, ${esc(s.ranch)} goes on the auction block. Dad's old windmill keeps turning for somebody new.</p>
      </div>
      ${summaryTable(s)}
      <p class="fact">💡 Tip: sell yearlings before a note comes due, keep the herd fed and watered, and save your calves for the fall market.</p>
      <div class="modal-actions"><button class="btn btn-red btn-big" id="again" type="button">Try again 🤠</button></div>`, 'narrow');
    $('again').onclick = () => { clearSave(); titleScreen(); };
  }

  function help() {
    openModal(`
      <h2>❓ How to Play</h2>
      <p><b>Goal:</b> Keep Dad's ranch in business for one full year — four seasons, one week each. At sundown on the last day of every week, the bank wants a loan payment.</p>
      ${linesHTML([
        ['⏰ Every day has four parts: <b>Early Morning, Midday, Afternoon and Evening</b>. Pick one chore in each — each chore is a mini-game.'],
        ['❤️ <b>Health</b> drops if the herd goes hungry or thirsty. Low health makes cattle sell for less — and sick cattle can die.'],
        ['🚚 Cattle need <b>hay</b> in spring and fall. In May and July they can graze if the <b>grass</b> is above 40%.'],
        ['💧 <b>Water</b> drops every day — more in summer. Pump it with the windmill.'],
        ['🌱 <b>Grass</b> gets grazed down. Move the herd to fresh pasture to bring it back.'],
        ['🔨 A weak <b>fence</b> means cattle escape overnight.'],
        ['🍼 In spring, new calves are born overnight. Tag them with a Calving Check, and guard them with Coyote Watch.'],
        ['🔔 Sell cattle at the <b>Sale Barn</b>. Calves bring the most money in October.'],
        ['🏠 The <b>Ranch Office</b> lets you buy hay, vaccines and help any time without using up the clock.'],
      ])}
      <div class="modal-actions"><button class="btn btn-red" id="helpClose" type="button">Got it!</button></div>`, 'narrow');
    $('helpClose').onclick = closeModal;
  }

  function titleScreen() {
    const saved = load();
    S = null;
    Scene.render($('sceneSvg'), { slot: 'dawn', week: 0, herd: { cows: 30, calves: 3, yearlings: 10 } });
    $('scene').classList.remove('snow', 'rain');
    $('sceneClock').innerHTML = '🌅 5:30 AM<small>A new day</small>';
    $('sceneEvent').innerHTML = '';
    $('hud').innerHTML = '<div class="hud-top"><div class="brand">Cornhusker Cattle Tycoon<small>A Sandhills ranching game</small></div></div>';
    $('tasks').innerHTML = ''; $('journal').innerHTML = '';
    $('slotTitle').textContent = 'Welcome to the Sandhills'; $('slotSub').textContent = ''; $('slotTrack').innerHTML = '';
    const canContinue = saved && saved.v === 1 && saved.phase !== 'over';
    openModal(`
      <div class="title-card">
        <div class="title-logo">Cornhusker<span>Cattle Tycoon</span></div>
        <div class="story">
          <p>📞 The phone call came on a gray winter morning. Dad was gone — and the ranch was yours.</p>
          <p>Four thousand acres of rolling Sandhills grass in Western Nebraska. Thirty mother cows, ten yearling steers, a creaky windmill, a red barn — and a loan at the bank in town.</p>
          <p>Dad ran this place for forty years. Now it's up to you to keep it in the family. Work the ranch from sunup to sundown, make every bank payment, and see it through one full year.</p>
        </div>
        <div class="name-row">
          <label for="ranchName"><b>Name your ranch:</b></label>
          <input id="ranchName" maxlength="28" value="Rolling Hills Ranch" autocomplete="off">
        </div>
        <div class="modal-actions">
          <button class="btn btn-red btn-big" id="newGame" type="button">Start ranching 🤠</button>
          ${canContinue ? `<button class="btn btn-gold btn-big" id="contGame" type="button">Continue: ${esc(saved.ranch)} (Day ${saved.day})</button>` : ''}
        </div>
        <p class="fact">🌾 ${FACTS[Math.floor(Math.random() * FACTS.length)]}</p>
      </div>`, 'narrow');
    $('newGame').onclick = () => {
      const name = ($('ranchName').value || '').trim() || 'Rolling Hills Ranch';
      S = newState(name);
      S.stats.startWorth = netWorth(S);
      log(`🤠 You took over ${name}.`);
      save();
      seasonIntro(() => startDay());
    };
    if (canContinue) $('contGame').onclick = () => {
      S = saved;
      closeModal(); render();
      if (S.phase === 'yearEnd') yearEnd();
    };
  }

  /* ---------------- Wire up ---------------- */
  $('tasks').addEventListener('click', (e) => {
    const b = e.target.closest('[data-task]');
    if (!b || b.disabled || !S) return;
    runTask(b.dataset.task);
  });
  $('officeBtn').onclick = () => S && office();
  $('helpBtn').onclick = help;
  $('newBtn').onclick = () => {
    if (!S) return;
    openModal(`<h2>Start over?</h2><p>This will give up on ${esc(S.ranch)} and start a brand-new ranch.</p>
      <div class="modal-actions"><button class="btn btn-plain" id="nNo" type="button">Keep ranching</button><button class="btn btn-red" id="nYes" type="button">Start over</button></div>`, 'narrow');
    $('nNo').onclick = closeModal;
    $('nYes').onclick = () => { clearSave(); titleScreen(); };
  };

  titleScreen();
})();
