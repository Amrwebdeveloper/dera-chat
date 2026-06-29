/* =====================================================================
   Slider — one image at a time with a smooth cross-fade (vanilla, no deps).
   Different from the carousel: a single full-width slide is shown, slides
   cross-fade, and it can auto-play. Prev/next + dots + lightbox on click.
   RTL/LTR aware. Honors prefers-reduced-motion (no autoplay / instant).
   ===================================================================== */
window.MedChat = window.MedChat || {};
window.MedChat.Slider = (function () {
    'use strict';

    function prefersReducedMotion() {
        return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    }

    function safeSrc(url) {
        if (typeof url !== 'string') return '';
        const u = url.trim();
        if (/^(https:\/\/|\/|\.\/|\.\.\/|assets\/)/i.test(u)) return u;
        if (!/^[a-z][a-z0-9+.-]*:/i.test(u)) return u;
        return '';
    }

    function svgIcon(paths) {
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('viewBox', '0 0 24 24');
        svg.setAttribute('aria-hidden', 'true');
        svg.setAttribute('class', 'icon icon-md slider__icon');
        svg.innerHTML = paths; // static, internal markup only
        return svg;
    }

    /**
     * @param {Array<{src,alt,caption}>} images
     * @param {(i:number)=>void} onImageClick
     * @returns {HTMLElement}
     */
    function create(images, onImageClick) {
        const imgs = Array.isArray(images) ? images : [];
        const CFG = (window.MedChat.CONFIG && window.MedChat.CONFIG.behavior.slider) || {};
        const interval = CFG.interval || 3800;
        const autoplay = CFG.autoplay !== false && !prefersReducedMotion() && imgs.length > 1;

        let index = 0;
        let timer = null;
        let swiped = false; // true while a swipe is in progress (suppresses the click)

        const root = document.createElement('div');
        root.className = 'slider';
        root.setAttribute('tabindex', '0');
        root.setAttribute('role', 'group');
        root.setAttribute('aria-roledescription', 'عرض شرائح');
        root.setAttribute('aria-label', 'عرض شرائح للصور');

        const track = document.createElement('div');
        track.className = 'slider__track';

        const slideEls = imgs.map(function (it, i) {
            const slide = document.createElement('div');
            slide.className = 'slider__slide' + (i === 0 ? ' is-active' : '');

            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'slider__img-btn';
            btn.setAttribute('aria-label', (it.caption || it.alt || 'صورة') + ' — اضغط للتكبير');

            const img = document.createElement('img');
            img.className = 'slider__img';
            img.setAttribute('src', safeSrc(it.src));
            img.setAttribute('alt', typeof it.alt === 'string' ? it.alt : '');
            img.loading = i === 0 ? 'eager' : 'lazy';
            img.draggable = false;
            btn.appendChild(img);
            btn.addEventListener('click', function () {
                if (swiped) return; // ignore the click that ends a swipe
                if (typeof onImageClick === 'function') onImageClick(i);
            });
            slide.appendChild(btn);

            if (it.caption) {
                const cap = document.createElement('span');
                cap.className = 'slider__cap';
                cap.textContent = it.caption;
                slide.appendChild(cap);
            }
            track.appendChild(slide);
            return slide;
        });

        const prevBtn = document.createElement('button');
        prevBtn.type = 'button';
        prevBtn.className = 'slider__btn slider__btn--prev';
        prevBtn.setAttribute('aria-label', 'السابق');
        prevBtn.appendChild(svgIcon('<path d="m15 18-6-6 6-6"/>'));
        prevBtn.addEventListener('click', function () { stop(); go(index - 1); });

        const nextBtn = document.createElement('button');
        nextBtn.type = 'button';
        nextBtn.className = 'slider__btn slider__btn--next';
        nextBtn.setAttribute('aria-label', 'التالي');
        nextBtn.appendChild(svgIcon('<path d="m9 18 6-6-6-6"/>'));
        nextBtn.addEventListener('click', function () { stop(); go(index + 1); });

        const dots = document.createElement('div');
        dots.className = 'slider__dots';
        const dotEls = imgs.map(function (_, i) {
            const d = document.createElement('button');
            d.type = 'button';
            d.className = 'slider__dot' + (i === 0 ? ' is-active' : '');
            d.setAttribute('aria-label', 'الصورة ' + (i + 1));
            d.addEventListener('click', function () { stop(); go(i); });
            dots.appendChild(d);
            return d;
        });

        const live = document.createElement('div');
        live.className = 'sr-only';
        live.setAttribute('aria-live', 'polite');
        live.setAttribute('aria-atomic', 'true');

        root.appendChild(track);
        if (imgs.length > 1) {
            root.appendChild(prevBtn);
            root.appendChild(nextBtn);
            root.appendChild(dots);
        }
        root.appendChild(live);

        function isRTL() { return getComputedStyle(root).direction === 'rtl'; }

        function go(i) {
            index = (i + imgs.length) % imgs.length;
            slideEls.forEach(function (s, k) { s.classList.toggle('is-active', k === index); });
            dotEls.forEach(function (d, k) {
                d.classList.toggle('is-active', k === index);
                d.setAttribute('aria-current', k === index ? 'true' : 'false');
            });
            const it = imgs[index] || {};
            live.textContent = 'صورة ' + (index + 1) + ' من ' + imgs.length + (it.caption ? '، ' + it.caption : '');
        }

        /* Autoplay (pause on hover/focus) */
        function start() {
            if (!autoplay || timer) return;
            timer = window.setInterval(function () { go(index + 1); }, interval);
        }
        function stop() {
            if (timer) { window.clearInterval(timer); timer = null; }
        }
        root.addEventListener('pointerenter', stop);
        root.addEventListener('pointerleave', start);
        root.addEventListener('focusin', stop);
        root.addEventListener('focusout', start);

        root.addEventListener('keydown', function (e) {
            if (e.key === 'ArrowRight') { e.preventDefault(); stop(); isRTL() ? go(index - 1) : go(index + 1); }
            else if (e.key === 'ArrowLeft') { e.preventDefault(); stop(); isRTL() ? go(index + 1) : go(index - 1); }
            else if (e.key === 'Home') { e.preventDefault(); stop(); go(0); }
            else if (e.key === 'End') { e.preventDefault(); stop(); go(imgs.length - 1); }
        });

        // Swipe support (mouse + touch). RTL-aware: in RTL swipe-right advances.
        let sx = 0, sy = 0, swiping = false;
        track.addEventListener('pointerdown', function (e) {
            swiping = true; swiped = false; sx = e.clientX; sy = e.clientY;
        });
        track.addEventListener('pointermove', function (e) {
            if (swiping && Math.abs(e.clientX - sx) > 8) swiped = true;
        });
        function endSwipe(e) {
            if (!swiping) return;
            swiping = false;
            const dx = e.clientX - sx, dy = e.clientY - sy;
            if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
                stop();
                const forward = isRTL() ? dx > 0 : dx < 0;
                go(index + (forward ? 1 : -1));
            }
            // clear the swipe flag after the click has been suppressed
            window.setTimeout(function () { swiped = false; }, 0);
        }
        track.addEventListener('pointerup', endSwipe);
        track.addEventListener('pointercancel', function () { swiping = false; });
        track.addEventListener('pointerleave', endSwipe);

        start();
        return root;
    }

    return { create: create };
})();
