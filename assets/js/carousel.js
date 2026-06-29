/* =====================================================================
   Carousel — a horizontal side-by-side image strip (vanilla, no deps).
   - Shows multiple thumbnails at once and scrolls horizontally.
   - Mouse drag-to-scroll + native touch scroll + prev/next buttons.
   - RTL/LTR aware (button direction, drag sign, scroll bounds).
   - Each thumbnail opens the lightbox at its index.
   ===================================================================== */
window.MedChat = window.MedChat || {};
window.MedChat.Carousel = (function () {
    'use strict';

    function prefersReducedMotion() {
        return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    }

    // Allow only local/relative or https image sources
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
        svg.setAttribute('class', 'icon icon-md carousel__icon');
        svg.innerHTML = paths; // static, internal markup only
        return svg;
    }

    /**
     * Create the carousel element.
     * @param {Array<{src,alt,caption}>} images
     * @param {(i:number)=>void} onImageClick
     * @returns {HTMLElement}
     */
    function create(images, onImageClick) {
        const imgs = Array.isArray(images) ? images : [];

        const root = document.createElement('div');
        root.className = 'carousel';
        root.setAttribute('tabindex', '0');
        root.setAttribute('role', 'group');
        root.setAttribute('aria-roledescription', 'شريط صور');
        root.setAttribute('aria-label', 'معرض صور');

        const viewport = document.createElement('div');
        viewport.className = 'carousel__viewport';

        const itemEls = [];
        imgs.forEach(function (it, i) {
            // One full-width card per item (same look as the single-image template)
            const item = document.createElement('div');
            item.className = 'carousel__item';
            itemEls.push(item);

            const card = document.createElement('button');
            card.type = 'button';
            card.className = 'carousel__card';
            card.setAttribute('aria-label', (it.caption || it.alt || 'صورة') + ' — اضغط للتكبير');

            const img = document.createElement('img');
            img.className = 'carousel__img';
            img.setAttribute('src', safeSrc(it.src));
            img.setAttribute('alt', typeof it.alt === 'string' ? it.alt : '');
            img.loading = 'lazy';
            img.draggable = false;
            card.appendChild(img);

            card.addEventListener('click', function () {
                if (dragMoved) return; // ignore the click that ends a drag
                if (typeof onImageClick === 'function') onImageClick(i);
            });
            item.appendChild(card);

            if (it.caption) {
                const cap = document.createElement('p');
                cap.className = 'carousel__cap';
                cap.textContent = it.caption;
                item.appendChild(cap);
            }
            viewport.appendChild(item);
        });

        const prevBtn = document.createElement('button');
        prevBtn.type = 'button';
        prevBtn.className = 'carousel__btn carousel__btn--prev';
        prevBtn.setAttribute('aria-label', 'السابق');
        prevBtn.appendChild(svgIcon('<path d="m15 18-6-6 6-6"/>'));
        prevBtn.addEventListener('click', function () { step(-1); });

        const nextBtn = document.createElement('button');
        nextBtn.type = 'button';
        nextBtn.className = 'carousel__btn carousel__btn--next';
        nextBtn.setAttribute('aria-label', 'التالي');
        nextBtn.appendChild(svgIcon('<path d="m9 18 6-6-6-6"/>'));
        nextBtn.addEventListener('click', function () { step(1); });

        // Position dots (one per card)
        const dots = document.createElement('div');
        dots.className = 'carousel__dots';
        const dotEls = imgs.map(function (_, i) {
            const d = document.createElement('button');
            d.type = 'button';
            d.className = 'carousel__dot';
            d.setAttribute('aria-label', 'الصورة ' + (i + 1));
            d.addEventListener('click', function () { goTo(i); });
            dots.appendChild(d);
            return d;
        });

        const live = document.createElement('div');
        live.className = 'sr-only';
        live.setAttribute('aria-live', 'polite');
        live.setAttribute('aria-atomic', 'true');

        root.appendChild(viewport);
        if (imgs.length > 1) {
            root.appendChild(prevBtn);
            root.appendChild(nextBtn);
            root.appendChild(dots);
        }
        root.appendChild(live);

        function isRTL() { return getComputedStyle(root).direction === 'rtl'; }

        function itemStride() {
            if (!itemEls.length) return viewport.clientWidth || 1;
            const w = itemEls[0].getBoundingClientRect().width;
            const gap = parseFloat(getComputedStyle(viewport).columnGap) || 0;
            return w + gap;
        }

        // Move by one item toward start (dir=-1) or end (dir=+1).
        // Direct scrollLeft assignment is used because native smooth-scroll to a
        // negative scrollLeft is unreliable in RTL across browsers.
        function step(dir) {
            const max = viewport.scrollWidth - viewport.clientWidth;
            let target = viewport.scrollLeft + (isRTL() ? -1 : 1) * dir * itemStride();
            target = isRTL() ? Math.min(0, Math.max(-max, target)) : Math.max(0, Math.min(max, target));
            scrollTween(target);
            const idx = currentIndex() + dir;
            announce(Math.min(Math.max(idx, 0), imgs.length - 1));
        }

        // Jump to a specific card index (used by the dots)
        function goTo(i) {
            const target = (isRTL() ? -1 : 1) * i * itemStride();
            scrollTween(target);
            announce(i);
        }

        // Lightweight scrollLeft tween (avoids broken native smooth + RTL).
        // Snap is disabled during the animation so it glides smoothly, then
        // re-enabled at the end (which keeps native touch snapping for mobile).
        let tweenId = 0;
        function easeInOutCubic(p) { return p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2; }
        function scrollTween(target) {
            viewport.style.scrollSnapType = 'none';
            const restoreSnap = function () { viewport.style.scrollSnapType = ''; };
            if (prefersReducedMotion()) { viewport.scrollLeft = target; restoreSnap(); refreshButtons(); return; }
            const start = viewport.scrollLeft;
            const dist = target - start;
            const duration = 440;
            let t0 = null;
            const myId = ++tweenId;
            function frame(now) {
                if (myId !== tweenId) return;            // a newer tween took over
                if (t0 === null) t0 = now;
                const p = Math.min(1, (now - t0) / duration);
                viewport.scrollLeft = start + dist * easeInOutCubic(p);
                if (p < 1) requestAnimationFrame(frame);
                else { viewport.scrollLeft = target; restoreSnap(); refreshButtons(); }
            }
            requestAnimationFrame(frame);
            // Safety net: guarantee the final position even if rAF is throttled
            window.setTimeout(function () {
                if (myId === tweenId) { viewport.scrollLeft = target; restoreSnap(); refreshButtons(); }
            }, duration + 80);
        }

        function currentIndex() {
            return Math.round(Math.abs(viewport.scrollLeft) / itemStride());
        }

        function announce(idx) {
            const it = imgs[idx] || {};
            live.textContent = 'صورة ' + (idx + 1) + ' من ' + imgs.length +
                (it.caption ? '، ' + it.caption : '');
        }

        function refreshButtons() {
            const max = viewport.scrollWidth - viewport.clientWidth;
            const pos = Math.abs(viewport.scrollLeft);
            prevBtn.disabled = pos <= 1;                 // at start
            nextBtn.disabled = pos >= max - 1;           // at end
            const idx = currentIndex();
            dotEls.forEach(function (d, i) {
                d.classList.toggle('is-active', i === idx);
                d.setAttribute('aria-current', i === idx ? 'true' : 'false');
            });
        }

        viewport.addEventListener('scroll', function () {
            if (rafId) return;
            rafId = requestAnimationFrame(function () { rafId = 0; refreshButtons(); });
        });
        let rafId = 0;

        // Keyboard navigation when the carousel is focused
        root.addEventListener('keydown', function (e) {
            if (e.key === 'ArrowRight') { e.preventDefault(); isRTL() ? step(-1) : step(1); }
            else if (e.key === 'ArrowLeft') { e.preventDefault(); isRTL() ? step(1) : step(-1); }
            else if (e.key === 'Home') { e.preventDefault(); viewport.scrollTo({ left: 0 }); announce(0); }
            else if (e.key === 'End') {
                e.preventDefault();
                viewport.scrollTo({ left: (isRTL() ? -1 : 1) * (viewport.scrollWidth - viewport.clientWidth) });
                announce(imgs.length - 1);
            }
        });

        // Mouse drag-to-scroll (touch/pen use native scrolling).
        // Listeners are scoped to the viewport (no global listener leak); the drag
        // also ends on pointerleave so it can't get stuck if released off-strip.
        let dragging = false, dragMoved = false, startX = 0, startScroll = 0;
        viewport.addEventListener('pointerdown', function (e) {
            if (e.pointerType !== 'mouse') return;
            dragging = true; dragMoved = false;
            startX = e.clientX; startScroll = viewport.scrollLeft;
            viewport.classList.add('is-grabbing');
            // Disable snap while dragging so intermediate positions don't snap back
            viewport.style.scrollSnapType = 'none';
        });
        viewport.addEventListener('pointermove', function (e) {
            if (!dragging) return;
            const dx = e.clientX - startX;
            if (Math.abs(dx) > 4) dragMoved = true;
            // Natural "grab" drag: content follows the pointer (same sign for RTL/LTR)
            viewport.scrollLeft = startScroll - dx;
        });
        function endDrag() {
            if (!dragging) return;
            dragging = false;
            viewport.classList.remove('is-grabbing');
            // keep dragMoved truthy briefly so the trailing click is suppressed
            window.setTimeout(function () { dragMoved = false; }, 0);
            // smooth-snap to the nearest card (instead of an abrupt native snap)
            const stride = itemStride();
            let idx = Math.round(Math.abs(viewport.scrollLeft) / stride);
            idx = Math.min(Math.max(idx, 0), imgs.length - 1);
            scrollTween((isRTL() ? -1 : 1) * idx * stride);
        }
        viewport.addEventListener('pointerup', endDrag);
        viewport.addEventListener('pointercancel', endDrag);
        viewport.addEventListener('pointerleave', endDrag);

        // Initial button state once laid out
        requestAnimationFrame(refreshButtons);

        return root;
    }

    return { create: create };
})();
