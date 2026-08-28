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

  /* ── category reel: hover (desktop) or auto-cycle to swipe the title ── */
  const reel = $('.reel');
  if (reel) {
    const titleBox = $('.reel__title', reel);
    const items = $$('.reel__set:not(.reel__set--dup) .reel__item', reel);
    const allItems = $$('.reel__item', reel);
    const viewport = $('.reel__viewport', reel);
    const titles = items.map(a => a.dataset.title);
    let idx = 0, autoTimer = null, hovering = false;

    const swipeTo = (t) => {
      const cur = titleBox.querySelector('.reel__word:not(.reel__word--out)');
      if (cur && cur.textContent === t) return;
      if (cur) {
        cur.classList.add('reel__word--out');
        setTimeout(() => cur.remove(), 700);
      }
      const next = document.createElement('span');
      next.className = 'reel__word reel__word--in';
      next.textContent = t;
      titleBox.appendChild(next);
      next.offsetHeight; /* force reflow so the transition actually runs */
      next.classList.remove('reel__word--in');
    };

    const isMobile = () => innerWidth < 860;

    const advance = () => {
      idx = (idx + 1) % titles.length;
      swipeTo(titles[idx]);
      if (isMobile() && viewport && items[idx]) {
        viewport.scrollTo({ left: items[idx].offsetLeft - (viewport.clientWidth - items[idx].offsetWidth) / 2,
                            behavior: 'smooth' });
      }
    };
    const startAuto = () => { clearInterval(autoTimer); autoTimer = setInterval(advance, 3200); };
    const stopAuto = () => clearInterval(autoTimer);

    /* desktop: hovering an image takes over the title */
    allItems.forEach(a => {
      a.addEventListener('mouseenter', () => {
        if (isMobile()) return;
        hovering = true; stopAuto();
        const i = titles.indexOf(a.dataset.title);
        if (i > -1) idx = i;
        swipeTo(a.dataset.title);
      });
    });
    reel.addEventListener('mouseleave', () => { hovering = false; if (!document.hidden) startAuto(); });

    /* mobile: swiping the slider updates the title too */
    if (viewport) {
      let sTimer = null;
      viewport.addEventListener('scroll', () => {
        if (!isMobile()) return;
        clearTimeout(sTimer);
        sTimer = setTimeout(() => {
          const mid = viewport.scrollLeft + viewport.clientWidth / 2;
          let best = 0, bd = Infinity;
          items.forEach((it, i) => {
            const c = it.offsetLeft + it.offsetWidth / 2;
            if (Math.abs(c - mid) < bd) { bd = Math.abs(c - mid); best = i; }
          });
          if (best !== idx) { idx = best; swipeTo(titles[idx]); }
        }, 90);
      }, { passive: true });
    }

    document.addEventListener('visibilitychange', () => {
      if (document.hidden || hovering) stopAuto(); else startAuto();
    });
    swipeTo(titles[0]);
    startAuto();
  }

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

  /* ── back to top ── */
  const toTop = $('.totop');
  const toTopProg = toTop ? toTop.querySelector('.totop__prog') : null;
  const RING = 131.95;
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
  const qty = $('.qty');
  if (qty) {
    const out = qty.querySelector('output');
    qty.addEventListener('click', e => {
      const b = e.target.closest('button');
      if (!b) return;
      out.value = Math.max(1, (+out.value || 1) + (+b.dataset.d));
    });
  }
  $$('.variants').forEach(v => {
    v.addEventListener('click', e => {
      const b = e.target.closest('button');
      if (!b) return;
      $$('button', v).forEach(x => x.classList.remove('on'));
      b.classList.add('on');
    });
  });

  /* ── featured slider (products page) ── */
  const fs = $('.fslider');
  if (fs) {
    const track = fs.querySelector('.fslider__track');
    const slides = $$('.fslide', fs);
    const dotsBox = fs.querySelector('.fslider__dots');
    const navBtns = $$('.fslider__nav button', fs);
    let cur = 0, timer = null, hovered = false;
    if (track && slides.length > 1) {
      slides.forEach((_, i) => {
        const b = document.createElement('button');
        b.setAttribute('aria-label', 'Slide ' + (i + 1));
        b.addEventListener('click', () => go(i, true));
        dotsBox.appendChild(b);
      });
      const dots = $$('button', dotsBox);
      function go(i, manual) {
        cur = (i + slides.length) % slides.length;
        track.style.transform = 'translateX(-' + cur * 100 + '%)';
        dots.forEach((d, n) => d.classList.toggle('on', n === cur));
        if (manual) restart();
      }
      function restart() {
        clearInterval(timer);
        if (!hovered && !document.hidden) timer = setInterval(() => go(cur + 1), 5200);
      }
      if (navBtns[0]) navBtns[0].addEventListener('click', () => go(cur - 1, true));
      if (navBtns[1]) navBtns[1].addEventListener('click', () => go(cur + 1, true));
      fs.addEventListener('mouseenter', () => { hovered = true; clearInterval(timer); });
      fs.addEventListener('mouseleave', () => { hovered = false; restart(); });
      document.addEventListener('visibilitychange', restart);
      go(0); restart();
    } else {
      /* single slide: no chrome, no timer */
      if (dotsBox) dotsBox.style.display = 'none';
      const nav = fs.querySelector('.fslider__nav');
      if (nav) nav.style.display = 'none';
    }
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
  const adv = $('.adv');
  const advSticky = $('.adv__sticky');
  const advCards = $$('.advcard');
  const hs = $('.hscroll');
  const hsSticky = $('.hscroll__sticky');
  const hsTrack = $('.hscroll__track');
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
        const w0 = isMobile ? vw * 0.78 : Math.min(CARD_W0, vw * (vw < 1500 ? 0.37 : 0.42));
        const h0 = isMobile ? vw * 0.52 : CARD_H0;
        galCard.style.width = lerp(w0, vw, e) + 'px';
        galCard.style.height = lerp(h0, sh, e) + 'px';
        galCard.style.top = lerp(58, 50, e) + '%';
        galCard.style.borderRadius = lerp(16, 0, e) + 'px';
        galCard.style.transform = 'translate(-50%,-50%) rotate(' + lerp(-9, 0, e) + 'deg)';
        /* narrower screens: copy appears and clears earlier so the growing
           card never covers half-visible text */
        const narrow = vw < 1700;
        const aOut = narrow ? 0.14 : 0.42;
        const bIn  = narrow ? 0.06 : 0.22;
        const bOut = narrow ? 0.52 : 0.68;
        if (galA) galA.style.opacity = 1 - clamp01((p - aOut) / (narrow ? 0.14 : 0.22));
        if (galB) galB.style.opacity = clamp01((p - bIn) / 0.12) - clamp01((p - bOut) / 0.14);
      }
    }

    /* advantages: staggered frosted cards over pinned photo */
    if (adv && advSticky) {
      const r = adv.getBoundingClientRect();
      if (r.bottom > 0 && r.top < vh) {
        const sh = advSticky.getBoundingClientRect().height;
        const p = clamp01(-r.top / (r.height - sh));
        advCards.forEach((card, i) => {
          const pc = easeIO(clamp01(p * 2.1 - i * 0.24));
          card.style.opacity = pc;
          card.style.transform = 'translateY(' + (1 - pc) * 140 + 'px)';
        });
      }
    }

    /* about: horizontal scroll story */
    if (hs && hsSticky && hsTrack && vw >= 860) {
      const r = hs.getBoundingClientRect();
      if (r.bottom > 0 && r.top < vh) {
        const sh = hsSticky.getBoundingClientRect().height;
        const p = easeIO(clamp01(-r.top / (r.height - sh)));
        const max = Math.max(0, hsTrack.scrollWidth - vw + 44);
        hsTrack.style.transform = 'translateX(' + (-p * max) + 'px)';
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

    /* back to top: reveal past the first screen, ring tracks page progress */
    if (toTop) {
      const max = document.documentElement.scrollHeight - vh;
      const p = max > 0 ? clamp01(scrollY / max) : 0;
      toTop.classList.toggle('on', scrollY > vh * 0.7);
      if (toTopProg) toTopProg.style.strokeDashoffset = (RING * (1 - p)).toFixed(2);
    }

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
