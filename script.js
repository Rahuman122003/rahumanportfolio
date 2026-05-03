/* ============================================================
   RAHUMAN PORTFOLIO  ·  AWWWARDS-CALIBER MOTION
   GSAP + ScrollTrigger + Lenis + WebAudio (scroll-driven)
   ============================================================ */

gsap.registerPlugin(ScrollTrigger);

/* ─── LENIS SMOOTH SCROLL ────────────────────────────────────── */
const lenis = new Lenis({
  duration: 1.25,
  easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  smoothWheel: true,
  smoothTouch: false,
  touchMultiplier: 1.6,
});
gsap.ticker.add(t => lenis.raf(t * 1000));
gsap.ticker.lagSmoothing(0);
lenis.on('scroll', ScrollTrigger.update);

/* ─── SCROLL PROGRESS ────────────────────────────────────────── */
const scrollFill = document.getElementById('scrollFill');
lenis.on('scroll', ({ progress }) => {
  scrollFill.style.width = (progress * 100) + '%';
});

/* ─── CUSTOM CURSOR ──────────────────────────────────────────── */
const curO = document.getElementById('cursorOuter');
const curI = document.getElementById('cursorInner');
const curL = document.getElementById('cursorLabel');
let mx = innerWidth / 2, my = innerHeight / 2;
let ox = mx, oy = my;
addEventListener('mousemove', e => {
  mx = e.clientX; my = e.clientY;
  gsap.set(curI, { x: mx, y: my });
  gsap.set(curL, { x: mx, y: my - 38 });
});
(function loop() {
  ox += (mx - ox) * 0.18;
  oy += (my - oy) * 0.18;
  gsap.set(curO, { x: ox, y: oy });
  requestAnimationFrame(loop);
})();
const hoverSel = 'a, button, .pcard, .sg-item, .ams, .stat-card, .nm-item, .cl-soc, input, textarea, #audioBtn, #themeToggle';
document.querySelectorAll(hoverSel).forEach(el => {
  el.addEventListener('mouseenter', () => document.body.classList.add('cur-hover'));
  el.addEventListener('mouseleave', () => document.body.classList.remove('cur-hover'));
});
document.querySelectorAll('input, textarea').forEach(el => {
  el.addEventListener('mouseenter', () => document.body.classList.add('cur-text'));
  el.addEventListener('mouseleave', () => document.body.classList.remove('cur-text'));
});
document.querySelectorAll('[data-cur]').forEach(el => {
  el.addEventListener('mouseenter', () => {
    curL.textContent = el.dataset.cur;
    document.body.classList.add('cur-label');
  });
  el.addEventListener('mouseleave', () => document.body.classList.remove('cur-label'));
});

/* ─── PRELOADER ──────────────────────────────────────────────── */
const preFill = document.getElementById('preFill');
const prePct  = document.getElementById('prePct');
let pct = 0;
const preTick = setInterval(() => {
  pct += Math.random() * 9 + 3;
  if (pct >= 100) { pct = 100; clearInterval(preTick); }
  preFill.style.width = pct + '%';
  prePct.textContent  = Math.floor(pct) + '%';
}, 80);

window.addEventListener('load', () => {
  const wait = setInterval(() => {
    if (pct >= 100) {
      clearInterval(wait);
      const tl = gsap.timeline({
        onComplete: () => {
          document.getElementById('preloader').style.display = 'none';
          initHero();
        }
      });
      tl.to('#preFill, .pre-bar', { opacity: 0, duration: .35 })
        .to('#prePct, #preJp, #preEn, .pre-corner', {
          opacity: 0, y: -16, duration: .55, stagger: .04, ease: 'power2.in'
        }, '<')
        .to('#preloader', { yPercent: -100, duration: 1.05, ease: 'expo.inOut' }, '+=.1');
    }
  }, 100);
});

/* ─── HERO ENTRANCE ──────────────────────────────────────────── */
function initHero() {
  const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
  tl.from('#heroStamp', { y: 30, opacity: 0, duration: 1 }, 0)
    .to('.h1w', { y: 0, opacity: 1, duration: 1.2, stagger: .12 }, .15)
    .to('.hero-ticker-wrap', { opacity: 1, duration: 1 }, .9)
    .to('.hero-actions', { opacity: 1, y: 0, duration: 1 }, 1.05)
    .to('.hero-scroll-cue', { opacity: 1, duration: 1 }, 1.3);

  // hero parallax via mouse — background orbs only, content stays fixed
  document.getElementById('hero').addEventListener('mousemove', e => {
    const rx = (e.clientX / innerWidth - .5) * 2;
    const ry = (e.clientY / innerHeight - .5) * 2;
    gsap.to('.hbg-orb.o1', { x: rx * -36, y: ry * -22, duration: 1.6, ease: 'power2.out' });
    gsap.to('.hbg-orb.o2', { x: rx *  28, y: ry *  18, duration: 1.6, ease: 'power2.out' });
  });

  // hero bg scroll parallax
  gsap.to('#heroBg', {
    yPercent: 18, ease: 'none',
    scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: true }
  });
}

/* ═════════════════════════════════════════════════════════════
   CROWD CANVAS — Walking peeps in the hero
   Inspired by https://codepen.io/zadvorsky/pen/xxwbBQV
   Illustration by https://www.openpeeps.com/
   ═════════════════════════════════════════════════════════════ */
(function initCrowdCanvas() {
  const canvas = document.getElementById('crowdCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const CONFIG = {
    src: 'open-peeps-sheet.png',
    rows: 15,
    cols: 7,
  };

  // UTILS
  const randomRange = (min, max) => min + Math.random() * (max - min);
  const randomIndex = (arr) => randomRange(0, arr.length) | 0;
  const removeFromArray = (arr, i) => arr.splice(i, 1)[0];
  const removeItemFromArray = (arr, item) => removeFromArray(arr, arr.indexOf(item));
  const removeRandomFromArray = (arr) => removeFromArray(arr, randomIndex(arr));
  const getRandomFromArray = (arr) => arr[randomIndex(arr) | 0];

  // TWEEN FACTORIES
  const resetPeep = (stage, peep) => {
    const direction = Math.random() > 0.5 ? 1 : -1;
    const offsetY = 100 - 250 * gsap.parseEase('power2.in')(Math.random());
    const startY = stage.height - peep.height + offsetY;
    let startX, endX;

    if (direction === 1) {
      startX = -peep.width;
      endX = stage.width;
      peep.scaleX = 1;
    } else {
      startX = stage.width + peep.width;
      endX = 0;
      peep.scaleX = -1;
    }

    peep.x = startX;
    peep.y = startY;
    peep.anchorY = startY;

    return { startX, startY, endX };
  };

  const normalWalk = (peep, props) => {
    const { startY, endX } = props;
    const xDuration = 10;
    const yDuration = 0.25;
    const tl = gsap.timeline();
    tl.timeScale(randomRange(0.5, 1.5));
    tl.to(peep, { duration: xDuration, x: endX, ease: 'none' }, 0);
    tl.to(peep, { duration: yDuration, repeat: xDuration / yDuration, yoyo: true, y: startY - 10 }, 0);
    return tl;
  };

  const walks = [normalWalk];

  // FACTORY
  const createPeep = (image, rect) => {
    const peep = {
      image,
      rect: [],
      width: 0,
      height: 0,
      x: 0,
      y: 0,
      anchorY: 0,
      scaleX: 1,
      walk: null,
      setRect(r) {
        peep.rect = r;
        peep.width = r[2];
        peep.height = r[3];
      },
      render(c) {
        c.save();
        c.translate(peep.x, peep.y);
        c.scale(peep.scaleX, 1);
        c.drawImage(peep.image, peep.rect[0], peep.rect[1], peep.rect[2], peep.rect[3], 0, 0, peep.width, peep.height);
        c.restore();
      },
    };
    peep.setRect(rect);
    return peep;
  };

  // STATE
  const img = new Image();
  const stage = { width: 0, height: 0 };
  const allPeeps = [];
  const availablePeeps = [];
  const crowd = [];

  const createPeeps = () => {
    const { rows, cols } = CONFIG;
    const { naturalWidth: w, naturalHeight: h } = img;
    const total = rows * cols;
    const rw = w / rows;
    const rh = h / cols;
    for (let i = 0; i < total; i++) {
      allPeeps.push(createPeep(img, [
        (i % rows) * rw,
        ((i / rows) | 0) * rh,
        rw,
        rh,
      ]));
    }
  };

  const initCrowd = () => {
    while (availablePeeps.length) {
      addPeepToCrowd().walk.progress(Math.random());
    }
  };

  const addPeepToCrowd = () => {
    const peep = removeRandomFromArray(availablePeeps);
    const walk = getRandomFromArray(walks)(peep, resetPeep(stage, peep))
      .eventCallback('onComplete', () => {
        removePeepFromCrowd(peep);
        addPeepToCrowd();
      });
    peep.walk = walk;
    crowd.push(peep);
    crowd.sort((a, b) => a.anchorY - b.anchorY);
    return peep;
  };

  const removePeepFromCrowd = (peep) => {
    removeItemFromArray(crowd, peep);
    availablePeeps.push(peep);
  };

  const render = () => {
    canvas.width = stage.width * devicePixelRatio;
    canvas.height = stage.height * devicePixelRatio;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.scale(devicePixelRatio, devicePixelRatio);
    crowd.forEach(p => p.render(ctx));
    ctx.restore();
  };

  const resize = () => {
    stage.width = canvas.clientWidth;
    stage.height = canvas.clientHeight;
    crowd.forEach(p => { if (p.walk) p.walk.kill(); });
    crowd.length = 0;
    availablePeeps.length = 0;
    availablePeeps.push(...allPeeps);
    initCrowd();
  };

  const init = () => {
    createPeeps();
    resize();
    gsap.ticker.add(render);
  };

  img.onload = init;
  img.src = CONFIG.src;

  window.addEventListener('resize', resize);
})();

/* ─── NAV STATE ──────────────────────────────────────────────── */
ScrollTrigger.create({
  start: 'top -60', end: 99999,
  onUpdate: s => document.getElementById('nav').classList.toggle('scrolled', s.progress > 0)
});

/* ─── MOBILE MENU ────────────────────────────────────────────── */
const burger = document.getElementById('burger');
const overlay = document.getElementById('mobileOverlay');
burger.addEventListener('click', () => {
  document.body.classList.toggle('menu-open');
  overlay.classList.toggle('open');
});
overlay.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
  document.body.classList.remove('menu-open');
  overlay.classList.remove('open');
}));

/* ─── REVEALS ────────────────────────────────────────────────── */
gsap.utils.toArray('.reveal').forEach(el => {
  gsap.to(el, {
    opacity: 1, y: 0, duration: 1, ease: 'expo.out',
    scrollTrigger: { trigger: el, start: 'top 88%' }
  });
});
gsap.utils.toArray('.reveal-line').forEach((el, i) => {
  gsap.to(el, {
    y: 0, opacity: 1, duration: 1.1, ease: 'expo.out', delay: i * .08,
    scrollTrigger: { trigger: el, start: 'top 90%' }
  });
});

/* ─── ABOUT IMAGE PARALLAX ───────────────────────────────────── */
gsap.to('#aboutPhoto', {
  yPercent: -8, ease: 'none',
  scrollTrigger: { trigger: '#about', start: 'top bottom', end: 'bottom top', scrub: 1.5 }
});

/* ─── STATS COUNTERS ─────────────────────────────────────────── */
gsap.utils.toArray('.sbn').forEach(el => {
  const target = parseInt(el.dataset.t, 10);
  ScrollTrigger.create({
    trigger: el, start: 'top 85%', once: true,
    onEnter: () => {
      gsap.to({ v: 0 }, {
        v: target, duration: 2.2, ease: 'power2.out',
        onUpdate() { el.textContent = Math.round(this.targets()[0].v); }
      });
    }
  });
});

/* ─── SKILL BARS ─────────────────────────────────────────────── */
gsap.utils.toArray('.sr-fill').forEach(bar => {
  ScrollTrigger.create({
    trigger: bar, start: 'top 90%', once: true,
    onEnter: () => { bar.style.width = bar.dataset.w + '%'; }
  });
});

/* ─── PROJECTS DRAG SCROLL ───────────────────────────────────── */
const projOuter = document.getElementById('projOuter');
let down = false, sx = 0, sl = 0;
projOuter.addEventListener('mousedown', e => {
  down = true; sx = e.pageX - projOuter.offsetLeft; sl = projOuter.scrollLeft;
  projOuter.classList.add('grabbing');
  document.body.classList.add('cur-drag');
});
['mouseleave', 'mouseup'].forEach(ev => projOuter.addEventListener(ev, () => {
  down = false; projOuter.classList.remove('grabbing');
  document.body.classList.remove('cur-drag');
}));
projOuter.addEventListener('mousemove', e => {
  if (!down) return;
  e.preventDefault();
  const x = e.pageX - projOuter.offsetLeft;
  projOuter.scrollLeft = sl - (x - sx) * 1.7;
});
projOuter.addEventListener('wheel', e => {
  if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
    projOuter.scrollLeft += e.deltaY;
  }
}, { passive: true });
// touch
projOuter.addEventListener('touchstart', e => {
  sx = e.touches[0].pageX; sl = projOuter.scrollLeft;
}, { passive: true });
projOuter.addEventListener('touchmove', e => {
  projOuter.scrollLeft = sl - (e.touches[0].pageX - sx) * 1.3;
}, { passive: true });

gsap.from('.pcard', {
  opacity: 0, y: 60, stagger: .08, duration: 1, ease: 'expo.out',
  scrollTrigger: { trigger: '.proj-inner', start: 'top 80%' }
});

/* ─── ROLE WATERMARK PARALLAX ────────────────────────────────── */
gsap.to('.role-watermark', {
  yPercent: -22, ease: 'none',
  scrollTrigger: { trigger: '#role', start: 'top bottom', end: 'bottom top', scrub: 2 }
});

/* ─── BUTTONS (static — no magnetic follow) ──────────────────── */
/* Magnetic follow removed — buttons stay fixed in place */

/* ─── ANCHOR SMOOTH SCROLL ───────────────────────────────────── */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const t = document.querySelector(a.getAttribute('href'));
    if (t) { e.preventDefault(); lenis.scrollTo(t, { offset: -70, duration: 1.4 }); }
  });
});

/* ─── CONTACT FORM ───────────────────────────────────────────── */
document.getElementById('cForm').addEventListener('submit', e => {
  e.preventDefault();
  const span = e.target.querySelector('.btn-submit span');
  const orig = span.textContent;
  span.textContent = 'SENT ✦';
  gsap.fromTo(e.target.querySelector('.btn-submit'),
    { scale: .94 }, { scale: 1, duration: .5, ease: 'back.out(2)' });
  setTimeout(() => { span.textContent = orig; }, 2600);
});

/* ─── THEME TOGGLE ───────────────────────────────────────────── */
const html = document.documentElement;
const themeToggle = document.getElementById('themeToggle');
const themeIcon  = document.getElementById('themeIcon');
const themeLabel = document.getElementById('themeLabel');

function applyTheme(t) {
  html.dataset.theme = t;
  if (t === 'light') { themeIcon.textContent = '☾'; themeLabel.textContent = 'DARK'; }
  else               { themeIcon.textContent = '☀'; themeLabel.textContent = 'LIGHT'; }
  try { localStorage.setItem('theme', t); } catch(e){}
}
applyTheme((() => { try { return localStorage.getItem('theme') || 'dark'; } catch(e){ return 'dark'; } })());

themeToggle.addEventListener('click', () => {
  const next = html.dataset.theme === 'light' ? 'dark' : 'light';
  // sweep transition
  const sweep = document.createElement('div');
  Object.assign(sweep.style, {
    position: 'fixed', inset: 0, background: '#F25623',
    zIndex: 9995, pointerEvents: 'none', transformOrigin: 'left center'
  });
  document.body.appendChild(sweep);
  gsap.fromTo(sweep,
    { scaleX: 0 },
    {
      scaleX: 1, duration: .55, ease: 'expo.inOut',
      onComplete: () => {
        applyTheme(next);
        gsap.to(sweep, {
          scaleX: 0, transformOrigin: 'right center',
          duration: .55, ease: 'expo.inOut',
          onComplete: () => sweep.remove()
        });
      }
    });
});

/* ═════════════════════════════════════════════════════════════
   SCROLL-DRIVEN AMBIENT AUDIO (WebAudio synth)
   - Pad drone + perc tick driven by scroll velocity
   - Volume + filter cutoff modulated by scroll speed
   ═════════════════════════════════════════════════════════════ */
const audioBtn  = document.getElementById('audioBtn');
const audioLbl  = audioBtn.querySelector('.audio-label');
let audioCtx = null;
let audioOn  = false;
let masterGain, filter, padA, padB, padC, lfo, lfoGain;

function buildAudioGraph() {
  audioCtx = new (window.AudioContext || window.webkitAudioContext)();

  masterGain = audioCtx.createGain();
  masterGain.gain.value = 0;
  masterGain.connect(audioCtx.destination);

  filter = audioCtx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 600;
  filter.Q.value = 0.8;
  filter.connect(masterGain);

  // Reverb-ish: short delay feedback
  const delay = audioCtx.createDelay();
  delay.delayTime.value = 0.42;
  const fb = audioCtx.createGain(); fb.gain.value = 0.32;
  const wet = audioCtx.createGain(); wet.gain.value = 0.45;
  delay.connect(fb).connect(delay);
  delay.connect(wet).connect(filter);

  // Three detuned oscillators -> ambient pad in A minor
  const freqs = [110, 164.81, 220]; // A2, E3, A3
  [padA, padB, padC] = freqs.map(f => {
    const o = audioCtx.createOscillator();
    o.type = 'sine';
    o.frequency.value = f;
    const g = audioCtx.createGain();
    g.gain.value = 0.18;
    o.connect(g); g.connect(filter); g.connect(delay);
    o.start();
    return o;
  });
  // subtle saw layer
  const saw = audioCtx.createOscillator();
  saw.type = 'sawtooth';
  saw.frequency.value = 55;
  saw.detune.value = 6;
  const sg = audioCtx.createGain(); sg.gain.value = 0.04;
  saw.connect(sg).connect(filter);
  saw.start();

  // LFO drifting filter
  lfo = audioCtx.createOscillator();
  lfo.frequency.value = 0.07;
  lfoGain = audioCtx.createGain();
  lfoGain.gain.value = 220;
  lfo.connect(lfoGain).connect(filter.frequency);
  lfo.start();
}

function setAudio(on) {
  audioOn = on;
  if (on) {
    if (!audioCtx) buildAudioGraph();
    audioCtx.resume();
    gsap.to(masterGain.gain, { value: 0.18, duration: 1.4, ease: 'power2.out' });
    audioBtn.classList.add('playing');
    audioLbl.textContent = 'SOUND ON';
  } else {
    if (masterGain) gsap.to(masterGain.gain, { value: 0, duration: 0.8, ease: 'power2.out' });
    audioBtn.classList.remove('playing');
    audioLbl.textContent = 'SOUND OFF';
  }
}
audioBtn.addEventListener('click', () => setAudio(!audioOn));

/* Scroll-velocity tracker → drives filter cutoff & extra gain */
let lastScroll = 0, vel = 0, smoothVel = 0;
lenis.on('scroll', ({ scroll }) => {
  vel = Math.abs(scroll - lastScroll);
  lastScroll = scroll;
});
function audioTick() {
  smoothVel += (vel - smoothVel) * 0.08;
  vel *= 0.85;
  if (audioOn && audioCtx && filter && masterGain) {
    // map velocity (0..50) → cutoff (500..3500), gain bump (0..0.12)
    const v = Math.min(smoothVel / 50, 1);
    const cutoff = 500 + v * 3000;
    const targetGain = 0.18 + v * 0.14;
    filter.frequency.setTargetAtTime(cutoff, audioCtx.currentTime, 0.15);
    masterGain.gain.setTargetAtTime(targetGain, audioCtx.currentTime, 0.25);

    // pitch shimmer with scroll
    const detune = v * 18;
    [padA, padB, padC].forEach((o, i) => {
      o.detune.setTargetAtTime(detune * (i % 2 ? -1 : 1), audioCtx.currentTime, 0.2);
    });
  }
  requestAnimationFrame(audioTick);
}
audioTick();

/* Pause audio when tab is hidden */
document.addEventListener('visibilitychange', () => {
  if (document.hidden && audioCtx) audioCtx.suspend();
  else if (audioOn && audioCtx) audioCtx.resume();
});

/* ═════════════════════════════════════════════════════════════
   CLIENTS GRID — staggered tile reveal (rows + columns)
   ═════════════════════════════════════════════════════════════ */
const clientsGrid = document.getElementById('clientsGrid');
if (clientsGrid) {
  const tiles = gsap.utils.toArray('#clientsGrid .cl-tile');
  ScrollTrigger.batch(tiles, {
    start: 'top 90%',
    onEnter: batch => {
      gsap.to(batch, {
        opacity: 1, y: 0,
        duration: .9, ease: 'expo.out',
        stagger: { each: .04, from: 'start', grid: 'auto' },
        overwrite: true
      });
    }
  });

  // Magnetic tilt on each tile
  tiles.forEach(tile => {
    tile.addEventListener('mousemove', e => {
      const r = tile.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width  - .5;
      const y = (e.clientY - r.top)  / r.height - .5;
      gsap.to(tile, {
        rotateY: x * 8,
        rotateX: -y * 8,
        transformPerspective: 700,
        duration: .5, ease: 'power2.out'
      });
    });
    tile.addEventListener('mouseleave', () => {
      gsap.to(tile, { rotateX: 0, rotateY: 0, duration: .8, ease: 'elastic.out(1,.5)' });
    });
  });
}

/* ═════════════════════════════════════════════════════════════
   TESTIMONIALS — pinned horizontal scroll with progress bar
   ═════════════════════════════════════════════════════════════ */
const testiTrack = document.getElementById('testiTrack');
const testiPin   = document.getElementById('testiPin');
const tpFill     = document.getElementById('tpFill');

if (testiTrack && testiPin && window.matchMedia('(min-width: 721px)').matches) {
  const getDistance = () => testiTrack.scrollWidth - window.innerWidth + 80;

  const horiz = gsap.to(testiTrack, {
    x: () => -getDistance(),
    ease: 'none',
    scrollTrigger: {
      trigger: testiPin,
      start: 'top top',
      end: () => '+=' + getDistance(),
      pin: true,
      scrub: 1,
      invalidateOnRefresh: true,
      anticipatePin: 1,
      onUpdate: self => {
        if (tpFill) tpFill.style.width = (self.progress * 100) + '%';
      }
    }
  });

  // Cards parallax-fade as they cross center
  gsap.utils.toArray('.tcard').forEach((card, i) => {
    gsap.fromTo(card,
      { y: i % 2 ? 60 : -60, rotate: i % 2 ? 1.2 : -1.2 },
      {
        y: 0, rotate: 0,
        ease: 'none',
        scrollTrigger: {
          trigger: card,
          containerAnimation: horiz,
          start: 'left right',
          end: 'right left',
          scrub: 1,
        }
      }
    );
  });

  // 3D tilt on hover (desktop)
  document.querySelectorAll('.tcard').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width  - .5;
      const y = (e.clientY - r.top)  / r.height - .5;
      gsap.to(card, {
        rotateY: x * 10, rotateX: -y * 10,
        transformPerspective: 900,
        duration: .5, ease: 'power2.out'
      });
    });
    card.addEventListener('mouseleave', () => {
      gsap.to(card, { rotateX: 0, rotateY: 0, duration: .9, ease: 'elastic.out(1,.5)' });
    });
  });

  // Refresh on resize
  window.addEventListener('resize', () => ScrollTrigger.refresh());
}

/* ═════════════════════════════════════════════════════════════
   SECTION HEADING SPLIT-LETTER REVEAL
   (split into WORDS first so headings can wrap naturally)
   ═════════════════════════════════════════════════════════════ */
gsap.utils.toArray('.sec-h, .testi-h, .contact-h').forEach(h => {
  const lineSpans = h.querySelectorAll(':scope > span');
  const letters = [];
  lineSpans.forEach(line => {
    if (line.dataset.split) return;
    line.dataset.split = '1';
    const text = line.textContent;
    line.textContent = '';
    const words = text.split(/(\s+)/);
    words.forEach(w => {
      if (/^\s+$/.test(w)) {
        line.appendChild(document.createTextNode(' '));
        return;
      }
      const wordWrap = document.createElement('span');
      wordWrap.className = 'sw';
      [...w].forEach(ch => {
        const c = document.createElement('span');
        c.className = 'sl';
        c.textContent = ch;
        wordWrap.appendChild(c);
        letters.push(c);
      });
      line.appendChild(wordWrap);
    });
  });
  if (letters.length) {
    gsap.from(letters, {
      yPercent: 110, opacity: 0,
      duration: 1, ease: 'expo.out',
      stagger: .012,
      scrollTrigger: { trigger: h, start: 'top 88%' }
    });
  }
});

/* ═════════════════════════════════════════════════════════════
   IMAGE MASK REVEAL (about photo, project images)
   ═════════════════════════════════════════════════════════════ */
gsap.utils.toArray('.about-imgbox, .pc-imgw').forEach(box => {
  gsap.fromTo(box,
    { clipPath: 'inset(0 0 100% 0)' },
    {
      clipPath: 'inset(0 0 0% 0)',
      duration: 1.2, ease: 'expo.out',
      scrollTrigger: { trigger: box, start: 'top 85%' }
    }
  );
});

/* ─── PAUSE LENIS WHEN TAB HIDDEN ─────────────────────────────── */
document.addEventListener('visibilitychange', () => {
  if (document.hidden) lenis.stop(); else lenis.start();
});
