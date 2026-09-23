/* LEmandi — sitewide effects.
   One rAF loop drives Lenis plus every scroll-linked effect, all reading
   live getBoundingClientRect so layout shifts never desync anything.
   Every block is null-safe: the same script runs on all pages. */

(() => {
  document.documentElement.classList.add('js');
  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const clamp01 = v => Math.max(0, Math.min(1, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const easeIO = t => (t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

  /* ── Lenis smooth scroll (matches the reference: lerp .1, wheel only) ── */
  let lenis = null;
  try { lenis = new Lenis({ lerp: 0.1, smoothWheel: true, syncTouch: false }); } catch (e) {}

  /* ── per-character headline split (hero + page heroes) ──
     chars are grouped per word so narrow viewports never break mid-word */
  let charIndex = 0;
  $$('.js-chars').forEach(line => {
    const words = line.textContent.split(' ');
    line.textContent = '';
    words.forEach((word, wi) => {
      const w = document.createElement('span');
      w.className = 'word';
      for (const ch of word) {
        const s = document.createElement('span');
        s.className = 'ch';
        s.style.setProperty('--i', charIndex++);
        s.textContent = ch;
        w.appendChild(s);
      }
      line.appendChild(w);
      if (wi < words.length - 1) {
        const sp = document.createElement('span');
        sp.className = 'ch ch--sp';
        sp.style.setProperty('--i', charIndex++);
        sp.textContent = ' ';
        line.appendChild(sp);
      }
    });
  });
  /* fonts.ready can stall on slow hosts; never hold the intro hostage */
  const intro = $('.hero') || $('.phero');
  if (intro) {
    Promise.race([document.fonts.ready, new Promise(res => setTimeout(res, 1200))])
      .then(() => requestAnimationFrame(() => intro.classList.add('is-in')));
  }

  /* ── odometer counters ── */
  $$('.odo').forEach(o => {
    const val = o.dataset.val;
    const suffix = o.dataset.suffix || '';
    o.innerHTML = '';
    [...val].forEach((digit, i) => {
      const col = document.createElement('span');
      col.className = 'odo-d';
      const strip = document.createElement('span');
      strip.className = 'odo-strip';
      strip.dataset.target = digit;
      strip.style.transitionDelay = (i * 120) + 'ms';
      for (let loop = 0; loop < 2; loop++) {
        for (let n = 0; n <= 9; n++) {
          const b = document.createElement('b');
          b.textContent = n;
          strip.appendChild(b);
        }
      }
      col.appendChild(strip);
      o.appendChild(col);
    });
    if (suffix) {
      const s = document.createElement('span');
      s.className = 'odo-suf';
      s.textContent = suffix;
      o.appendChild(s);
    }
    o.setAttribute('role', 'img');
    o.setAttribute('aria-label', val + suffix);
    [...o.children].forEach(c => c.setAttribute('aria-hidden', 'true'));
  });
  let statsDone = false;

  /* ── word split for the scroll-fill headings ── */
  $$('.js-fill').forEach(el => {
    const words = el.textContent.trim().split(/\s+/);
    el.textContent = '';
    words.forEach((w, i) => {
      const s = document.createElement('span');
      s.className = 'w';
      s.textContent = w;
      el.appendChild(s);
      if (i < words.length - 1) el.appendChild(document.createTextNode(' '));
    });
  });

  /* ── titled category carousel (client: "carousel with title in every cell") ── */
  $$('[data-csl]').forEach(csl => {
    const track   = $('.csl2__track', csl);
    const cells   = $$('.csl2__cell', csl);
    const prev    = $('.csl2__arw--prev', csl);
    const next    = $('.csl2__arw--next', csl);
    const dotsBox = $('.csl2__dots', csl);
    if (!track || cells.length < 2) return;

    let page = 0, timer = null, hovered = false;
    const perView = () => (innerWidth < 860 ? 1 : innerWidth < 1081 ? 2 : 3);
    const pageCount = () => Math.max(1, Math.ceil(cells.length / perView()));

    const buildDots = () => {
      if (!dotsBox) return;
      dotsBox.innerHTML = '';
      for (let i = 0; i < pageCount(); i++) {
        const b = document.createElement('button');
        b.setAttribute('aria-label', 'Go to slide ' + (i + 1));
        b.addEventListener('click', () => go(i, true));
        dotsBox.appendChild(b);
      }
    };
    const paint = () => {
      if (dotsBox) $$('button', dotsBox).forEach((d, i) => d.classList.toggle('on', i === page));
    };
    function go(i, manual) {
      const n = pageCount();
      page = (i + n) % n;
      const step = cells[0].getBoundingClientRect().width +
                   (parseFloat(getComputedStyle(track).columnGap || getComputedStyle(track).gap) || 0);
      track.style.transform = 'translateX(' + (-step * perView() * page) + 'px)';
      paint();
      if (manual) restart();
    }
    function restart() {
      clearInterval(timer);
      if (!hovered && !document.hidden) timer = setInterval(() => go(page + 1), 4500);
    }
    if (prev) prev.addEventListener('click', () => go(page - 1, true));
    if (next) next.addEventListener('click', () => go(page + 1, true));
    csl.addEventListener('mouseenter', () => { hovered = true; clearInterval(timer); });
    csl.addEventListener('mouseleave', () => { hovered = false; restart(); });
    document.addEventListener('visibilitychange', restart);

    let rt = null, lastPV = perView();
    addEventListener('resize', () => {
      clearTimeout(rt);
      rt = setTimeout(() => {
        if (perView() !== lastPV) { lastPV = perView(); buildDots(); page = 0; }
        go(page);
      }, 140);
    });

    buildDots();
    go(0);
    restart();
  });

  /* ── accordions ──
     max-height goes to 'none' once open so resizes/rotation can't clip it */
  $$('.acc__item').forEach(item => {
    const head = item.querySelector('.acc__head');
    const body = item.querySelector('.acc__body');
    if (!head || !body) return;
    body.addEventListener('transitionend', () => {
      if (item.classList.contains('open')) body.style.maxHeight = 'none';
    });
    head.addEventListener('click', () => {
      const open = item.classList.toggle('open');
      head.setAttribute('aria-expanded', open);
      if (open) {
        body.style.maxHeight = body.scrollHeight + 'px';
      } else {
        body.style.maxHeight = body.scrollHeight + 'px';
        body.offsetHeight;
        body.style.maxHeight = '0px';
      }
    });
  });

  /* ── burger menu (small screens): dropdown panel over a scrim ── */
  const burger = $('.burger');
  const menuEl = $('.menu');
  const closeMenu = () => {
    document.documentElement.classList.remove('menu-open');
    if (menuEl) menuEl.setAttribute('aria-hidden', 'true');
    if (burger) burger.setAttribute('aria-expanded', 'false');
    if (lenis) lenis.start();
  };
  if (burger) {
    burger.addEventListener('click', () => {
      const open = document.documentElement.classList.toggle('menu-open');
      burger.setAttribute('aria-expanded', open);
      if (menuEl) menuEl.setAttribute('aria-hidden', !open);
      if (lenis) open ? lenis.stop() : lenis.start();
    });
    $$('.menu__nav a').forEach(a => a.addEventListener('click', closeMenu));
    /* tapping the dark layer under the panel closes the menu */
    if (menuEl) menuEl.addEventListener('click', e => { if (e.target === menuEl) closeMenu(); });
  }

  /* ── back to top ── */
  const toTop = $('.totop');
  if (toTop) {
    toTop.addEventListener('click', () => {
      if (lenis) lenis.scrollTo(0, { duration: 1.1 });
      else window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ── product page: gallery thumbs, quantity stepper, variant pills ── */
  const pgMain = $('.pg__main img');
  if (pgMain) {
    $$('.pg__thumbs button').forEach(t => {
      t.addEventListener('click', () => {
        $$('.pg__thumbs button').forEach(x => x.classList.remove('on'));
        t.classList.add('on');
        pgMain.src = t.dataset.img;
        const ti = t.querySelector('img');
        if (ti) pgMain.alt = ti.alt;
      });
    });
  }
  /* whatsapp CTA carries the product name + page link in the message */
  const waProduct = $('.js-waproduct');
  if (waProduct) {
    const name = ($('.pg__buy h1') || {}).textContent || document.title;
    const msg = 'Hi LEmandi! I would like to ask about: ' + name.trim() + ' — ' + location.href;
    waProduct.href = 'https://wa.me/60183278180?text=' + encodeURIComponent(msg);
  }
  $$('.variants').forEach(v => {
    v.addEventListener('click', e => {
      const b = e.target.closest('button');
      if (!b) return;
      $$('button', v).forEach(x => x.classList.remove('on'));
      b.classList.add('on');
    });
  });

  /* ── phone-size carousel for the advantages cards ──
     one card per view, auto-advances every 2s, arrows + dot nav */
  $$('.adv--csl').forEach(section => {
    const track = section.querySelector('.adv__cards');
    const cards = track ? $$('.advcard', track) : [];
    if (!track || cards.length < 2) return;

    /* the arrows sit on the left and right edges of the strip, so the track
       needs a non-scrolling parent to anchor them (client wireframe #16) */
    const wrap = document.createElement('div');
    wrap.className = 'csl__wrap';
    track.parentNode.insertBefore(wrap, track);
    wrap.appendChild(track);

    const ui = document.createElement('div');
    ui.className = 'csl__ui';
    const dots = document.createElement('div');
    dots.className = 'csl__dots';
    const nav = document.createElement('div');
    nav.className = 'csl__nav';
    const prev = document.createElement('button');
    prev.textContent = '←'; prev.setAttribute('aria-label', 'Previous');
    const next = document.createElement('button');
    next.textContent = '→'; next.setAttribute('aria-label', 'Next');
    nav.append(prev, next);
    wrap.appendChild(nav);
    ui.append(dots);
    wrap.after(ui);

    let idx = 0, timer = null, holdOff = null;
    cards.forEach((_, i) => {
      const d = document.createElement('button');
      d.setAttribute('aria-label', 'Card ' + (i + 1));
      d.addEventListener('click', () => go(i, true));
      dots.appendChild(d);
    });
    const dbs = $$('button', dots);
    const isMobile = () => matchMedia('(max-width:859px)').matches;

    function paint() { dbs.forEach((d, n) => d.classList.toggle('on', n === idx)); }
    function go(i, manual) {
      idx = (i + cards.length) % cards.length;
      const c = cards[idx];
      track.scrollTo({ left: c.offsetLeft - track.offsetLeft - (track.clientWidth - c.offsetWidth) / 2,
                       behavior: 'smooth' });
      paint();
      if (manual) pause(5000);
    }
    function tickOver() { if (isMobile() && !document.hidden) go(idx + 1); }
    function play() { clearInterval(timer); timer = setInterval(tickOver, 2000); }
    function pause(ms) {
      clearInterval(timer);
      clearTimeout(holdOff);
      holdOff = setTimeout(play, ms);
    }
    prev.addEventListener('click', () => go(idx - 1, true));
    next.addEventListener('click', () => go(idx + 1, true));
    track.addEventListener('touchstart', () => pause(4500), { passive: true });
    let sTimer = null;
    track.addEventListener('scroll', () => {
      clearTimeout(sTimer);
      sTimer = setTimeout(() => {
        const mid = track.scrollLeft + track.clientWidth / 2;
        let best = 0, bd = Infinity;
        cards.forEach((c, i) => {
          const cc = c.offsetLeft - track.offsetLeft + c.offsetWidth / 2;
          if (Math.abs(cc - mid) < bd) { bd = Math.abs(cc - mid); best = i; }
        });
        if (best !== idx) { idx = best; paint(); }
      }, 90);
    }, { passive: true });
    document.addEventListener('visibilitychange', () => { if (!document.hidden) play(); });
    paint();
    play();
  });

  /* ── shop page: live filters and sorting on the mock catalogue ── */
  const shop = $('.shop');
  if (shop) {
    /* client #20: on tablet and phone the panel stays hidden behind a dropdown */
    const filterBtn = $('.shop__filterbtn');
    if (filterBtn) {
      filterBtn.addEventListener('click', () => {
        const open = shop.classList.toggle('filters-open');
        filterBtn.setAttribute('aria-expanded', open);
      });
    }
    const grid = shop.querySelector('.pgrid');
    const cardsAll = $$('.pcard', grid);
    const count = shop.querySelector('.shop__count');
    const searchIn = shop.querySelector('.js-shop-search');
    const priceIn = shop.querySelector('.js-shop-price');
    const priceOut = shop.querySelector('.js-shop-pricemax');
    const catBoxes = $$('.js-shop-cats input');
    const sortSel = shop.querySelector('.js-shop-sort');
    const CATS = {
      'sanitary ware & water closets': 'sanitary',
      'basins & vanities': 'basins',
      'bathroom fittings, showers & faucets': 'fittings',
      'kitchen appliances & sinks': 'kitchen',
      'lighting & ceiling fans': 'lighting',
      'water heaters & ventilation': 'water',
    };
    const meta = cardsAll.map(card => ({
      card,
      title: (card.querySelector('h3') || {}).textContent.toLowerCase(),
      cat: CATS[((card.querySelector('.pcard__cat') || {}).textContent || '').trim().toLowerCase()] || '',
      price: parseFloat((((card.querySelector('.pcard__price') || {}).firstChild || {}).textContent || '')
        .replace(/[^\d.]/g, '')) || 0,
    }));

    function apply() {
      const q = (searchIn && searchIn.value || '').trim().toLowerCase();
      const max = priceIn ? +priceIn.value : Infinity;
      const cats = catBoxes.filter(c => c.checked).map(c => c.value);
      let shown = 0;
      meta.forEach(m => {
        const ok = (!q || m.title.includes(q)) && m.price <= max && (!cats.length || cats.includes(m.cat));
        m.card.style.display = ok ? '' : 'none';
        if (ok) shown++;
      });
      if (count) count.textContent = 'Showing ' + shown + (shown === 1 ? ' product' : ' products');
      if (priceOut) priceOut.textContent = 'RM ' + max.toLocaleString('en-MY');
    }
    function resort() {
      if (!sortSel) return;
      const mode = sortSel.value;
      const order = [...meta];
      if (mode === 'Price, low to high') order.sort((a, b) => a.price - b.price);
      else if (mode === 'Price, high to low') order.sort((a, b) => b.price - a.price);
      else if (mode === 'Newest') order.reverse();
      order.forEach(m => grid.appendChild(m.card));
    }
    if (searchIn) searchIn.addEventListener('input', apply);
    if (priceIn) priceIn.addEventListener('input', apply);
    catBoxes.forEach(c => c.addEventListener('change', apply));
    if (sortSel) sortSel.addEventListener('change', resort);
    $$('.swatches button', shop).forEach(b => b.addEventListener('click', () => b.classList.toggle('on')));
    apply();
  }

  /* ── open-now chip (contact page) — KL time, client-approved hours ── */
  const chip = $('.openchip');
  if (chip) {
    const tickChip = () => {
      try {
        const hr = +new Date().toLocaleString('en-US', { timeZone: 'Asia/Kuala_Lumpur', hour12: false, hour: '2-digit' });
        const open = hr >= 9 && hr < 18;
        chip.classList.toggle('closed', !open);
        chip.innerHTML = '<i></i>' + (open ? 'Open now, closes 6:00 PM' : 'Closed now, opens 9:00 AM daily');
      } catch (e) { /* no IANA tz data: keep the static markup fallback */ }
    };
    tickChip();
    setInterval(tickChip, 60000);
  }

  /* ── scroll-linked pieces, evaluated every frame ── */
  const rvEls   = $$('[data-rv]');
  const hdLogo = $('.hd__logo');
  const DARK_SEL = '.hero,.phero,.band,.adv,.ft,.stack__panel--ink,.scard--dark';
  let probeTick = 0;
  const fillEls = $$('.js-fill');
  const scaleImgs = $$('.frame--scale img');
  const statsEl = $('[data-stats]');
  const gal = $('.gal');
  const galSticky = $('.gal__sticky');
  const galCard = $('.gal__card');
  const galA = $('.gal__copy');
  const galB = $('.gal__b');
  const zoomImgs = $$('.js-zoom img');
  const paraFrames = $$('.para');
  const faqRail = $('.faqrail');
  const faqPairs = (faqRail ? $$('a', faqRail) : [])
    .map(a => [a, document.querySelector(a.getAttribute('href'))])
    .filter(p => p[1]);

  const CARD_W0 = 560, CARD_H0 = 400;

  function render() {
    const vh = innerHeight, vw = innerWidth;

    for (const el of rvEls) {
      if (el.classList.contains('on')) continue;
      if (el.getBoundingClientRect().top < vh * 0.86) el.classList.add('on');
    }

    if (!statsDone && statsEl && statsEl.getBoundingClientRect().top < vh * 0.8) {
      statsDone = true;
      $$('.odo-strip', statsEl).forEach(strip => {
        strip.style.transform = 'translateY(-' + (10 + (+strip.dataset.target)) + 'em)';
      });
    }

    for (const el of fillEls) {
      const r = el.getBoundingClientRect();
      const p = clamp01((vh * 0.9 - r.top) / (vh * 0.55));
      const words = el.children;
      const n = Math.round(p * words.length);
      for (let i = 0; i < words.length; i++) words[i].classList.toggle('on', i < n);
    }

    for (const img of scaleImgs) {
      const r = img.parentElement.getBoundingClientRect();
      const p = easeIO(clamp01((vh - r.top) / (vh * 0.75)));
      img.style.transform = 'scale(' + (0.8 + 0.2 * p) + ')';
    }

    /* gallery scrub: tilted card grows to full-bleed
       (sticky height measured, not innerHeight — iOS toolbars differ) */
    if (gal && galSticky && galCard) {
      const r = gal.getBoundingClientRect();
      if (r.bottom > 0 && r.top < vh) {
        const sh = galSticky.getBoundingClientRect().height;
        const p = clamp01(-r.top / (r.height - sh));
        const e = easeIO(p);
        const isMobile = vw < 860;
        const w0 = isMobile ? vw * 0.78 : Math.min(CARD_W0, vw * 0.42);
        const h0 = isMobile ? vw * 0.52 : CARD_H0;
        galCard.style.width = lerp(w0, vw, e) + 'px';
        galCard.style.height = lerp(h0, sh, e) + 'px';
        galCard.style.top = lerp(58, 50, e) + '%';
        galCard.style.borderRadius = lerp(16, 0, e) + 'px';
        galCard.style.transform = 'translate(-50%,-50%) rotate(' + lerp(-9, 0, e) + 'deg)';
        /* the copy stays on top of the growing card for the whole scrub;
           the image simply becomes its background */
        if (galA) galA.style.opacity = 1;
        if (galB) galB.style.opacity = clamp01((p - 0.2) / 0.22);
      }
    }

    /* about: parallax image grid */
    for (const f of paraFrames) {
      const r = f.getBoundingClientRect();
      if (r.bottom < 0 || r.top > vh) continue;
      const p = (r.top + r.height / 2 - vh / 2) / vh;
      f.style.transform = 'translateY(' + (p * parseFloat(f.dataset.speed || 30)) + 'px)';
    }

    /* product: slow zoom on the gallery as it scrolls */
    for (const img of zoomImgs) {
      const r = img.parentElement.getBoundingClientRect();
      if (r.bottom < 0 || r.top > vh) continue;
      const p = clamp01((vh - r.top) / (vh + r.height));
      img.style.transform = 'scale(' + (1 + p * 0.07) + ')';
    }

    /* faq: scrollspy rail */
    if (faqPairs.length) {
      let act = 0;
      faqPairs.forEach(([, g], i) => { if (g.getBoundingClientRect().top < vh * 0.55) act = i; });
      faqPairs.forEach(([a], i) => a.classList.toggle('on', i === act));
    }

    /* header: gains a background once scrolled; content flips white over dark art */
    if (++probeTick % 4 === 0) {
      const de = document.documentElement;
      const solid = scrollY > 40;
      de.classList.toggle('hd-solid', solid);
      let invert = false;
      if (!solid && hdLogo && document.elementsFromPoint) {
        const r = hdLogo.getBoundingClientRect();
        const stack = document.elementsFromPoint(
          Math.round(r.left + r.width / 2), Math.round(r.top + r.height / 2));
        for (const el of stack) {
          if (el.closest('.hd')) continue;
          invert = !!el.closest(DARK_SEL);
          break;
        }
      }
      de.classList.toggle('hd-invert', invert);
    }

    /* back to top: reveal past the first screen */
    if (toTop) toTop.classList.toggle('on', scrollY > vh * 0.7);

  }

  function loop(t) {
    try {
      if (lenis) lenis.raf(t);
      render();
    } catch (e) {
      if (!window.__fxerr) {
        window.__fxerr = String(e && e.message || e);
        console.error('fx loop error:', e);
      }
    }
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
  window.__lenis = lenis;
})();
