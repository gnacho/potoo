"use strict";
/* Potoo landing: idioma, tema, count-up, FAQ, copiar, reveal y lightbox */
(() => {
    const LANG_KEY = 'potoo-lang';
    const THEME_KEY = 'potoo-theme';
    const root = document.documentElement;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let dict = I18N.es;
    /* ---------- Idioma ---------- */
    function applyLang(lang) {
        dict = I18N[lang] || I18N.es;
        document.querySelectorAll('[data-i18n]').forEach((el) => {
            const key = el.getAttribute('data-i18n');
            if (key && dict[key])
                el.textContent = dict[key];
        });
        document.querySelectorAll('[data-i18n-aria]').forEach((el) => {
            const key = el.getAttribute('data-i18n-aria');
            if (key && dict[key])
                el.setAttribute('aria-label', dict[key]);
        });
        document.querySelectorAll('[data-i18n-alt]').forEach((el) => {
            const key = el.getAttribute('data-i18n-alt');
            if (key && dict[key])
                el.setAttribute('alt', dict[key]);
        });
        root.lang = lang;
        if (dict['meta.title'])
            document.title = dict['meta.title'];
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc && dict['meta.desc'])
            metaDesc.setAttribute('content', dict['meta.desc']);
        const ogTitle = document.querySelector('meta[property="og:title"]');
        if (ogTitle && dict['meta.title'])
            ogTitle.setAttribute('content', dict['meta.title']);
        const ogDesc = document.querySelector('meta[property="og:description"]');
        if (ogDesc && dict['meta.desc'])
            ogDesc.setAttribute('content', dict['meta.desc']);
        const twTitle = document.querySelector('meta[name="twitter:title"]');
        if (twTitle && dict['meta.title'])
            twTitle.setAttribute('content', dict['meta.title']);
        const twDesc = document.querySelector('meta[name="twitter:description"]');
        if (twDesc && dict['meta.desc'])
            twDesc.setAttribute('content', dict['meta.desc']);
        const sel = document.getElementById('langSelect');
        if (sel)
            sel.value = lang;
        try {
            localStorage.setItem(LANG_KEY, lang);
        }
        catch ( /* noop */_a) { /* noop */ }
    }
    function initialLang() {
        const qs = new URLSearchParams(window.location.search).get('hl');
        if (qs === 'es' || qs === 'en')
            return qs;
        try {
            const saved = localStorage.getItem(LANG_KEY);
            if (saved === 'es' || saved === 'en')
                return saved;
        }
        catch ( /* noop */_a) { /* noop */ }
        const nav = (navigator.language || '').toLowerCase();
        if (nav.indexOf('es') === 0)
            return 'es';
        if (nav.indexOf('en') === 0)
            return 'en';
        return 'en';
    }
    const langSelect = document.getElementById('langSelect');
    if (langSelect) {
        langSelect.addEventListener('change', () => {
            applyLang(langSelect.value);
            try {
                const u = new URL(window.location.href);
                u.searchParams.set('hl', langSelect.value);
                window.history.replaceState(null, '', u);
            }
            catch ( /* noop */_a) { /* noop */ }
        });
    }
    /* ---------- Tema: dark por defecto (Luminex), conmutable y persistente ---------- */
    const themeBtn = document.getElementById('themeBtn');
    const themeIcon = document.getElementById('themeIcon');
    function iconPath(t) {
        if (t === 'light') {
            return '<circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/>';
        }
        return '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>';
    }
    function themeNow() {
        const t = root.getAttribute('data-theme');
        return t === 'light' ? 'light' : 'dark';
    }
    function applyTheme(theme) {
        root.setAttribute('data-theme', theme);
        const meta = document.querySelector('meta[name="theme-color"]:not([media])') ||
            document.querySelector('meta[name="theme-color"]');
        const colors = { dark: '#0B1020', light: '#F1F4FB' };
        if (meta)
            meta.setAttribute('content', colors[theme]);
        try {
            localStorage.setItem(THEME_KEY, theme);
        }
        catch ( /* noop */_a) { /* noop */ }
        if (themeIcon)
            themeIcon.innerHTML = iconPath(theme);
    }
    if (themeBtn) {
        themeBtn.addEventListener('click', () => {
            applyTheme(themeNow() === 'dark' ? 'light' : 'dark');
        });
    }
    function initialTheme() {
        try {
            const saved = localStorage.getItem(THEME_KEY);
            if (saved === 'light' || saved === 'dark')
                return saved;
        }
        catch ( /* noop */_a) { /* noop */ }
        return 'dark';
    }
    /* ---------- Count-up de las stats ---------- */
    function animateCount(el) {
        var _a;
        const target = parseInt((_a = el.getAttribute('data-target')) !== null && _a !== void 0 ? _a : '', 10);
        if (isNaN(target))
            return;
        if (reduceMotion || !('requestAnimationFrame' in window)) {
            el.textContent = String(target);
            return;
        }
        const dur = 1100;
        let t0 = null;
        function step(ts) {
            if (t0 === null)
                t0 = ts;
            const p = Math.min((ts - t0) / dur, 1);
            const eased = 1 - Math.pow(1 - p, 3);
            el.textContent = String(Math.round(eased * target));
            if (p < 1)
                requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
    }
    const statNums = Array.from(document.querySelectorAll('.stat-num'));
    let statsDone = false;
    function runStats() {
        if (statsDone)
            return;
        statsDone = true;
        statNums.forEach((el) => {
            el.textContent = '0';
            animateCount(el);
        });
    }
    if ('IntersectionObserver' in window) {
        const so = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    runStats();
                    so.disconnect();
                }
            });
        }, { threshold: 0.35 });
        const statsBand = document.getElementById('stats');
        if (statsBand)
            so.observe(statsBand);
    }
    else {
        runStats();
    }
    /* ---------- FAQ acordeón ---------- */
    document.querySelectorAll('.faq-q').forEach((btn) => {
        btn.addEventListener('click', () => {
            const item = btn.closest('.faq-item');
            const open = item ? item.classList.toggle('open') : false;
            btn.setAttribute('aria-expanded', open ? 'true' : 'false');
        });
    });
    /* ---------- Botones de copiar (con fallback para HTTP) ---------- */
    function labelOf(btn) {
        return btn.querySelector('.copy-label');
    }
    document.querySelectorAll('.copy-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
            const text = btn.getAttribute('data-copy') || '';
            const done = () => {
                const lab = labelOf(btn);
                if (lab) {
                    lab.textContent = dict['misc.copied'] || 'OK';
                    btn.classList.add('copied');
                    setTimeout(() => {
                        lab.textContent = dict['inst.copy'] || 'Copy';
                        btn.classList.remove('copied');
                    }, 1600);
                }
            };
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(text).then(done, () => {
                    legacyCopy(text);
                    done();
                });
            }
            else {
                legacyCopy(text);
                done();
            }
        });
    });
    function legacyCopy(text) {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.setAttribute('readonly', '');
        ta.style.position = 'fixed';
        ta.style.left = '-9999px';
        document.body.appendChild(ta);
        ta.select();
        try {
            document.execCommand('copy');
        }
        catch ( /* noop */_a) { /* noop */ }
        document.body.removeChild(ta);
    }
    /* ---------- Sistema unificado de entrada (Premium, un solo sistema) ----------
       [data-reveal] entra con translateY + opacity; los hijos de un
       [data-reveal-group] reciben --i para el stagger (calc(--i * --stagger)).
       Los grupos con [data-reveal-load] (hero) entran al cargar la página;
       el resto, al cruzar el viewport (una sola activación por elemento). */
    const rvAll = Array.from(document.querySelectorAll('[data-reveal]'));
    rvAll.forEach((el) => {
        el.classList.add('rv');
        if (el.hasAttribute('data-reveal-soft'))
            el.classList.add('rv-soft');
    });
    document.querySelectorAll('[data-reveal-group]').forEach((group) => {
        const items = group.querySelectorAll('[data-reveal]');
        items.forEach((el, i) => {
            el.style.setProperty('--i', String(i));
        });
    });
    function activate(el) {
        el.classList.add('in');
        const finish = () => { el.classList.add('done'); };
        if (reduceMotion) {
            finish();
            return;
        }
        el.addEventListener('transitionend', function onEnd(ev) {
            if (ev.target !== el)
                return;
            if (ev.propertyName === 'transform' || ev.propertyName === 'opacity') {
                el.removeEventListener('transitionend', onEnd);
                finish();
            }
        });
        /* Red de seguridad: la entrada más larga acaba en 820ms */
        setTimeout(finish, 1300);
    }
    const loadReveals = [];
    const ioReveals = [];
    rvAll.forEach((el) => {
        const g = el.closest('[data-reveal-group]');
        if (g && g.hasAttribute('data-reveal-load'))
            loadReveals.push(el);
        else
            ioReveals.push(el);
    });
    if (!('IntersectionObserver' in window) || reduceMotion) {
        rvAll.forEach(activate);
    }
    else {
        /* Hero: dos rAF para pintar un frame en estado inicial y que la
           transición de entrada arranque de verdad */
        loadReveals.forEach((el) => {
            requestAnimationFrame(() => {
                requestAnimationFrame(() => { activate(el); });
            });
        });
        const rvo = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    activate(entry.target);
                    rvo.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
        ioReveals.forEach((el) => { rvo.observe(el); });
    }
    /* Carga diferida determinista de las capturas: data-src + IO.
       loading="lazy" se mantiene como capa nativa; el IO garantiza que
       no se pidan antes de acercarse a la galería (600px de margen). */
    const shotImgs = Array.from(document.querySelectorAll('.shot-btn img[data-src]'));
    function loadShot(img) {
        const src = img.getAttribute('data-src');
        if (src)
            img.src = src;
        img.removeAttribute('data-src');
    }
    if (!('IntersectionObserver' in window)) {
        shotImgs.forEach(loadShot);
    }
    else {
        const sio = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    loadShot(entry.target);
                    sio.unobserve(entry.target);
                }
            });
        }, { rootMargin: '600px 0px' });
        shotImgs.forEach((img) => { sio.observe(img); });
    }
    /* ---------- Lightbox de capturas ---------- */
    const SHOTS = {
        dashboard: { file: 'assets/shots/dashboard.webp', alt: 'gallery.alt1', cap: 'gallery.cap1' }
    };
    const lightbox = document.getElementById('lightbox');
    const lbImg = document.getElementById('lbImg');
    const lbCap = document.getElementById('lbCap');
    const lbClose = document.getElementById('lbClose');
    let lbOpen = false;
    let lbLastFocus = null;
    let lbHideTimer = undefined;
    function lbFinishClose() {
        if (!lightbox || lightbox.hidden)
            return;
        lightbox.classList.remove('open');
        lightbox.hidden = true;
        if (lbLastFocus) {
            try {
                lbLastFocus.focus();
            }
            catch ( /* noop */_a) { /* noop */ }
            lbLastFocus = null;
        }
    }
    function openLightbox(key) {
        if (!key || !lightbox || !lbImg || !lbCap)
            return;
        const shot = SHOTS[key];
        if (!shot || lbOpen)
            return;
        lbImg.src = shot.file;
        lbImg.alt = dict[shot.alt] || '';
        lbCap.textContent = dict[shot.cap] || '';
        lbLastFocus = document.activeElement;
        lightbox.hidden = false;
        /* Relayout para que la transición de entrada se ejecute */
        void lightbox.offsetWidth;
        lightbox.classList.add('open');
        lbOpen = true;
        if (lbClose)
            lbClose.focus();
    }
    function closeLightbox() {
        if (!lbOpen || !lightbox)
            return;
        lbOpen = false;
        if (reduceMotion) {
            lbFinishClose();
            return;
        }
        lightbox.classList.remove('open');
        let finished = false;
        function finish(ev) {
            if (ev && ev.target !== lightbox)
                return;
            if (finished)
                return;
            finished = true;
            if (lbHideTimer !== undefined)
                clearTimeout(lbHideTimer);
            lightbox.removeEventListener('transitionend', finish);
            lbFinishClose();
        }
        lightbox.addEventListener('transitionend', finish);
        lbHideTimer = setTimeout(() => finish(), 400);
    }
    document.querySelectorAll('.shot-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
            openLightbox(btn.getAttribute('data-shot'));
        });
    });
    if (lightbox) {
        if (lbClose)
            lbClose.addEventListener('click', closeLightbox);
        lightbox.addEventListener('click', (ev) => {
            if (ev.target instanceof Element && !ev.target.closest('.lb-fig') && ev.target !== lbClose)
                closeLightbox();
        });
        document.addEventListener('keydown', (ev) => {
            if (ev.key === 'Escape' && lbOpen)
                closeLightbox();
        });
    }
    /* ---------- Arranque ---------- */
    applyTheme(initialTheme());
    applyLang(initialLang());
})();
