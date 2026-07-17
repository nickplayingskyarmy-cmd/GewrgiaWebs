/* ====================================================================
   ΓΕΩΡΓΙΑ — PORTFOLIO · Κύριο JavaScript
   --------------------------------------------------------------------
   Περιεχόμενα:
     1. Ρυθμίσεις gallery (εικόνες, φάκελοι)
     2. Scroll animations (fade-up)
     3. Navbar (scroll, μενού κινητού, ενεργός σύνδεσμος)
     4. Marquee (κινούμενες λωρίδες)
     5. Αυτόματη φόρτωση πορτρέτου
     6. Αυτόματα galleries από φακέλους
     7. Lightbox (προβολή με πλοήγηση)
     8. Διάφορα (πίσω στην κορυφή, έτος)
   ==================================================================== */

'use strict';

/* --------------------------------------------------------------------
   1. ΡΥΘΜΙΣΕΙΣ GALLERY
   --------------------------------------------------------------------
   📸 Οι εικόνες κάθε κατηγορίας διαβάζονται ΑΥΤΟΜΑΤΑ από τον φάκελό
      της (π.χ. images/fastfood/) αρκεί να ονομάζονται με αριθμούς:
      1.jpg, 2.jpg, 3.jpg ... μέχρι 10.jpg
      Υποστηριζόμενες καταλήξεις: .jpg, .jpeg, .png, .webp
   -------------------------------------------------------------------- */
const IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp']; // καταλήξεις που ελέγχονται
const MAX_IMAGES = 10;                                    // μέγιστες εικόνες ανά κατηγορία

/* Αποθήκη δεδομένων για το lightbox: key → { title, items } */
const galleries = {};

/* ====================================================================
   2. SCROLL ANIMATIONS — στοιχεία με κλάση .reveal εμφανίζονται
      απαλά καθώς μπαίνουν στην οθόνη
   ==================================================================== */
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const revealObserver = reduceMotion
  ? null
  : new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

/* Καταχωρεί ένα στοιχείο για fade-up animation (με προαιρετική καθυστέρηση) */
function registerReveal(el, delay) {
  if (delay) el.style.setProperty('--reveal-delay', `${delay}ms`);
  el.classList.add('reveal');
  if (!revealObserver) {
    el.classList.add('is-visible');
    return;
  }
  revealObserver.observe(el);
}

/* Αρχικά στοιχεία της σελίδας (με προαιρετικό data-delay) */
function initReveals() {
  document.querySelectorAll('.reveal').forEach((el) => {
    const delay = el.dataset.delay;
    if (delay) el.style.setProperty('--reveal-delay', `${delay}ms`);
    if (!revealObserver) {
      el.classList.add('is-visible');
    } else {
      revealObserver.observe(el);
    }
  });
}

/* ====================================================================
   3. NAVBAR — εφέ scroll, μενού κινητού, ενεργός σύνδεσμος
   ==================================================================== */
function initNav() {
  const nav = document.getElementById('site-nav');
  const progress = document.getElementById('scroll-progress');
  const toTop = document.getElementById('to-top');
  const menuToggle = document.getElementById('menu-toggle');
  const mobileMenu = document.getElementById('mobile-menu');

  /* — Εφέ κατά την κύλιση (glass φόντο, μπάρα προόδου, κουμπί κορυφής) — */
  let ticking = false;
  const onScroll = () => {
    const y = window.scrollY;
    nav.classList.toggle('is-scrolled', y > 24);
    toTop.classList.toggle('show', y > 640);

    const max = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.width = `${max > 0 ? (y / max) * 100 : 0}%`;
    ticking = false;
  };
  window.addEventListener('scroll', () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(onScroll);
    }
  }, { passive: true });
  onScroll();

  /* — Μενού κινητού — */
  const setMenu = (open) => {
    document.body.classList.toggle('menu-open', open);
    menuToggle.setAttribute('aria-expanded', String(open));
    menuToggle.setAttribute('aria-label', open ? 'Κλείσιμο μενού' : 'Άνοιγμα μενού');
    mobileMenu.setAttribute('aria-hidden', String(!open));
  };
  menuToggle.addEventListener('click', () => setMenu(!document.body.classList.contains('menu-open')));
  mobileMenu.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && document.body.classList.contains('menu-open')) setMenu(false);
  });

  /* — Υπογράμμιση του ενεργού συνδέσμου ανάλογα με την ενότητα — */
  const links = document.querySelectorAll('.nav-link[data-target]');
  const sections = [...links].map((l) => document.getElementById(l.dataset.target)).filter(Boolean);

  const activeObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        links.forEach((l) => l.classList.toggle('active', l.dataset.target === entry.target.id));
      }
    });
  }, { rootMargin: '-40% 0px -55% 0px' });
  sections.forEach((s) => activeObserver.observe(s));
}

/* ====================================================================
   4. MARQUEE — αδιάκοπη κινούμενη λωρίδα (κορδέλα & επιχειρήσεις)
   ==================================================================== */
function setupMarquee(marquee) {
  const track = marquee.querySelector('.marquee-track');
  const baseGroup = track ? track.querySelector('.marquee-group') : null;
  if (!track || !baseGroup) return;

  /* Γέμισμα μέχρι το περιεχόμενο να καλύπτει το πλάτος του container */
  let safety = 0;
  while (track.scrollWidth < marquee.offsetWidth && safety++ < 10) {
    const clone = baseGroup.cloneNode(true);
    clone.setAttribute('aria-hidden', 'true');
    track.appendChild(clone);
  }

  /* Διπλασιασμός ολόκληρου του σετ → το translateX(-50%) κάνει τέλειο loop */
  [...track.children].forEach((group) => {
    const clone = group.cloneNode(true);
    clone.setAttribute('aria-hidden', 'true');
    track.appendChild(clone);
  });

  /* Σταθερή ταχύτητα ανεξαρτήτως πλάτους */
  const duration = Math.max(18, Math.round(track.scrollWidth / 2 / 55));
  track.style.animationDuration = `${duration}s`;
}

function initMarquees() {
  const run = () => document.querySelectorAll('[data-marquee]').forEach(setupMarquee);
  /* Περιμένουμε τις γραμματοσειρές για σωστή μέτρηση πλάτους */
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(run).catch(run);
  } else {
    run();
  }
}

/* ====================================================================
   5. ΕΛΕΓΧΟΣ ΥΠΑΡΞΗΣ ΕΙΚΟΝΩΝ + ΠΟΡΤΡΕΤΟ
   ==================================================================== */

/* Δοκιμάζει να φορτώσει μια εικόνα (fallback για file:// ή περίεργους servers) */
function probeImage(url) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = url;
  });
}

/* Ελέγχει αν υπάρχει αρχείο — με ελαφρύ HEAD request όπου γίνεται */
async function urlExists(url) {
  if (location.protocol === 'file:') return probeImage(url);
  try {
    const res = await fetch(url, { method: 'HEAD' });
    if (res.ok) return true;
    if (res.status === 405 || res.status === 501) return probeImage(url); // server χωρίς HEAD
    return false;
  } catch {
    return probeImage(url);
  }
}

/* Βρίσκει την εικόνα «index» σε έναν φάκελο, δοκιμάζοντας όλες τις καταλήξεις */
async function findImage(folder, name) {
  for (const ext of IMAGE_EXTENSIONS) {
    const url = `${folder}/${name}.${ext}`;
    if (await urlExists(url)) return url;
  }
  return null;
}

/* Μαζεύει όλες τις εικόνες ενός φακέλου (1.jpg, 2.jpg, ...) */
async function collectImages(folder) {
  const found = [];
  let misses = 0;
  for (let i = 1; i <= MAX_IMAGES; i++) {
    const url = await findImage(folder, i);
    if (url) {
      found.push(url);
      misses = 0;
    } else {
      misses++;
      /* Άδειος φάκελος; Σταματάμε νωρίς για να μη γίνονται περιττά requests */
      if (found.length === 0 && misses >= 3) break;
    }
  }
  return found;
}

/* 📸 Πορτρέτο hero: ψάχνει αυτόματα το images/profile/georgia.jpg (κ.ά.) */
async function initHeroPortrait() {
  const img = document.getElementById('hero-photo');
  const placeholder = document.getElementById('hero-photo-placeholder');
  if (!img || !placeholder) return;

  for (const name of ['georgia', 'profile', 'portrait']) {
    const url = await findImage('images/profile', name);
    if (url) {
      img.src = url;
      img.classList.remove('hidden');
      placeholder.classList.add('hidden');
      return;
    }
  }
}

/* ====================================================================
   6. GALLERIES — αυτόματη δημιουργία των grids κάθε κατηγορίας
   ==================================================================== */

const pad2 = (n) => String(n).padStart(2, '0');

/* Κοινό overlay hover (μεγεθυντικός φακός + ετικέτα) */
function buildOverlay(label) {
  const overlay = document.createElement('div');
  overlay.className = 'card-overlay';
  overlay.innerHTML = `
    <span class="zoom-badge"><svg class="w-5 h-5" aria-hidden="true"><use href="#i-zoom"/></svg></span>
    <span class="card-label"></span>`;
  overlay.querySelector('.card-label').textContent = label;
  return overlay;
}

/* Κάρτα-placeholder (εμφανίζεται όσο δεν υπάρχουν πραγματικές εικόνες) */
function buildPlaceholderCard(title, index, interactive) {
  const variant = ['ph-a', 'ph-b', 'ph-c'][index % 3];
  const card = document.createElement('figure');
  card.className = `gallery-card ph-card ${variant}`;
  card.innerHTML = `
    <svg class="ph-star" aria-hidden="true"><use href="#i-spark"/></svg>
    <span class="ph-cat"></span>
    <span class="ph-num">${pad2(index + 1)}</span>
    <span class="ph-tag">${index % 3 === 2 ? 'TikTok Post' : 'Instagram Post'}</span>`;
  card.querySelector('.ph-cat').textContent = title;

  if (interactive) {
    card.appendChild(buildOverlay(`${title} · ${pad2(index + 1)}`));
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    card.setAttribute('aria-label', `Προβολή: ${title} — Δημοσίευση ${index + 1}`);
  }
  return card;
}

/* Κάρτα πραγματικής εικόνας */
function buildImageCard(src, index, title) {
  const card = document.createElement('figure');
  card.className = 'gallery-card';
  card.setAttribute('role', 'button');
  card.setAttribute('tabindex', '0');
  card.setAttribute('aria-label', `Προβολή: ${title} — Δημοσίευση ${index + 1}`);

  const img = document.createElement('img');
  img.src = src;
  img.alt = `${title} — Δημοσίευση ${index + 1}`;
  img.loading = 'lazy';      /* 🚀 Lazy loading εικόνων */
  img.decoding = 'async';
  card.appendChild(img);
  card.appendChild(buildOverlay(`${title} · ${pad2(index + 1)}`));
  return card;
}

/* Σύνδεση κάρτας με το lightbox (κλικ + πληκτρολόγιο) */
function bindCardToLightbox(card, key, index) {
  card.addEventListener('click', () => Lightbox.open(key, index));
  card.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      Lightbox.open(key, index);
    }
  });
}

/* Γεμίζει ένα grid με κάρτες (placeholders ή εικόνες) */
function renderGrid(grid, key, title, items) {
  grid.innerHTML = '';
  items.forEach((item, i) => {
    const card = item.type === 'image'
      ? buildImageCard(item.src, i, title)
      : buildPlaceholderCard(title, i, true);
    bindCardToLightbox(card, key, i);
    registerReveal(card, (i % 4) * 70); /* διαδοχική εμφάνιση ανά σειρά */
    grid.appendChild(card);
  });
}

/* Στήνει μία κατηγορία: πρώτα placeholders, μετά ψάχνει πραγματικές εικόνες */
async function setupGallery(grid) {
  const folder = grid.dataset.folder;                       /* π.χ. images/fastfood   */
  const title = grid.dataset.title || 'Portfolio';          /* π.χ. Fast Food         */
  const phCount = Math.min(parseInt(grid.dataset.placeholders || '8', 10), MAX_IMAGES);
  const key = folder;

  /* 1) Άμεσα placeholders ώστε το layout να είναι πάντα γεμάτο */
  galleries[key] = {
    title,
    items: Array.from({ length: phCount }, () => ({ type: 'placeholder' }))
  };
  renderGrid(grid, key, title, galleries[key].items);

  /* 2) Αναζήτηση πραγματικών εικόνων στον φάκελο */
  const found = await collectImages(folder);
  if (found.length > 0) {
    galleries[key].items = found.map((src) => ({ type: 'image', src }));
    renderGrid(grid, key, title, galleries[key].items);
  }
}

function initGalleries() {
  document.querySelectorAll('.gallery-grid').forEach((grid) => {
    setupGallery(grid); /* όλες οι κατηγορίες φορτώνουν παράλληλα */
  });
}

/* ====================================================================
   7. LIGHTBOX — προβολή εικόνων με πλοήγηση επόμενο/προηγούμενο
   ==================================================================== */
const Lightbox = {
  el: null,
  content: null,
  titleEl: null,
  counterEl: null,
  prevBtn: null,
  nextBtn: null,
  key: null,
  index: 0,
  lastFocus: null,

  init() {
    this.el = document.getElementById('lightbox');
    this.content = document.getElementById('lb-content');
    this.titleEl = document.getElementById('lb-title');
    this.counterEl = document.getElementById('lb-counter');
    this.prevBtn = document.getElementById('lb-prev');
    this.nextBtn = document.getElementById('lb-next');

    /* Κλείσιμο: κουμπί Χ + κλικ στο φόντο */
    this.el.querySelectorAll('[data-lb-close]').forEach((btn) =>
      btn.addEventListener('click', () => this.close())
    );

    /* Πλοήγηση με κουμπιά */
    this.prevBtn.addEventListener('click', () => this.step(-1));
    this.nextBtn.addEventListener('click', () => this.step(1));

    /* Πλοήγηση με πληκτρολόγιο */
    document.addEventListener('keydown', (e) => {
      if (!this.isOpen()) return;
      if (e.key === 'Escape') this.close();
      if (e.key === 'ArrowLeft') this.step(-1);
      if (e.key === 'ArrowRight') this.step(1);
    });

    /* Πλοήγηση με swipe σε οθόνες αφής */
    let touchX = 0, touchY = 0;
    this.el.addEventListener('touchstart', (e) => {
      touchX = e.changedTouches[0].clientX;
      touchY = e.changedTouches[0].clientY;
    }, { passive: true });
    this.el.addEventListener('touchend', (e) => {
      const dx = e.changedTouches[0].clientX - touchX;
      const dy = e.changedTouches[0].clientY - touchY;
      if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy)) {
        this.step(dx < 0 ? 1 : -1);
      }
    }, { passive: true });
  },

  isOpen() {
    return this.el.classList.contains('open');
  },

  open(key, index) {
    if (!galleries[key]) return;
    this.key = key;
    this.index = index;
    this.lastFocus = document.activeElement;
    this.render();
    this.el.classList.add('open');
    this.el.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    this.el.querySelector('.lb-close').focus();
  },

  close() {
    this.el.classList.remove('open');
    this.el.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (this.lastFocus) this.lastFocus.focus();
  },

  /* Μετακίνηση μπρος/πίσω με «κύκλωμα» στα άκρα */
  step(direction) {
    const items = galleries[this.key].items;
    this.index = (this.index + direction + items.length) % items.length;
    this.render();
  },

  render() {
    const { title, items } = galleries[this.key];
    const item = items[this.index];

    this.content.innerHTML = '';
    if (item.type === 'image') {
      const img = document.createElement('img');
      img.src = item.src;
      img.alt = `${title} — Δημοσίευση ${this.index + 1}`;
      this.content.appendChild(img);

      /* Προφόρτωση γειτονικών εικόνων για αστραπιαία πλοήγηση */
      [1, -1].forEach((d) => {
        const neighbor = items[(this.index + d + items.length) % items.length];
        if (neighbor && neighbor.type === 'image') new Image().src = neighbor.src;
      });
    } else {
      this.content.appendChild(buildPlaceholderCard(title, this.index, false));
    }

    this.titleEl.textContent = title;
    this.counterEl.textContent = `${this.index + 1} / ${items.length}`;

    /* Απόκρυψη βελών όταν υπάρχει μόνο μία εικόνα */
    const showNav = items.length > 1;
    this.prevBtn.style.display = showNav ? '' : 'none';
    this.nextBtn.style.display = showNav ? '' : 'none';
  }
};

/* ====================================================================
   8. ΔΙΑΦΟΡΑ — πίσω στην κορυφή, τρέχον έτος
   ==================================================================== */
function initMisc() {
  /* Κουμπί «πίσω στην κορυφή» */
  document.getElementById('to-top').addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
  });

  /* Αυτόματο έτος στο copyright */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
}

/* ====================================================================
   ΕΚΚΙΝΗΣΗ
   ==================================================================== */
document.addEventListener('DOMContentLoaded', () => {
  initReveals();
  initNav();
  initMarquees();
  Lightbox.init();
  initGalleries();
  initHeroPortrait();
  initMisc();
});
