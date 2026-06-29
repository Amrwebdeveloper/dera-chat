/* =====================================================================
   Lightbox — popup image viewer (vanilla, no deps).
   - RTL/LTR aware (arrows and positions mirror logically).
   - Keyboard: Esc / Arrows / Home / End, focus trap + restore.
   - Zoom: click to toggle, +/- buttons, mouse wheel; drag to pan.
   - Body scroll lock while open.
   Security: src is validated, text inserted via textContent.
   ===================================================================== */
window.MedChat = window.MedChat || {};
window.MedChat.Lightbox = (function () {
    'use strict';

    const ZOOM_MIN = 1;
    const ZOOM_MAX = 4;

    let root, imgEl, captionEl, counterEl, stage;
    let closeBtn, prevBtn, nextBtn, zoomInBtn, zoomOutBtn, resetBtn;
    let items = [];
    let index = 0;
    let lastFocused = null;
    let built = false;
    let closeTimer = null;
    let onCloseEnd = null;

    // Zoom / pan state
    let zoom = 1, panX = 0, panY = 0;
    let panning = false, startX = 0, startY = 0, startPanX = 0, startPanY = 0;

    function isRTL() {
        return (document.documentElement.getAttribute('dir') || 'ltr').toLowerCase() === 'rtl';
    }

    // Allow only local/relative or https sources (blocks javascript:, etc.)
    function safeSrc(url) {
        if (typeof url !== 'string') return '';
        const u = url.trim();
        if (/^(https:\/\/|\/|\.\/|\.\.\/|assets\/)/i.test(u)) return u;
        if (!/^[a-z][a-z0-9+.-]*:/i.test(u)) return u;
        return '';
    }

    function build() {
        if (built) return;
        built = true;

        root = document.createElement('div');
        root.className = 'lightbox';
        root.setAttribute('role', 'dialog');
        root.setAttribute('aria-modal', 'true');
        root.setAttribute('aria-label', 'عارض الصور');
        root.hidden = true;

        const backdrop = document.createElement('div');
        backdrop.className = 'lightbox__backdrop';
        backdrop.addEventListener('click', close);

        stage = document.createElement('div');
        stage.className = 'lightbox__stage';

        imgEl = document.createElement('img');
        imgEl.className = 'lightbox__img';
        imgEl.alt = '';
        imgEl.draggable = false;
        imgEl.addEventListener('click', onImageClick);
        imgEl.addEventListener('wheel', onWheel, { passive: false });
        imgEl.addEventListener('pointerdown', onPanStart);
        stage.appendChild(imgEl);

        // Zoom toolbar
        const tools = document.createElement('div');
        tools.className = 'lightbox__tools';
        zoomInBtn = iconBtn('lightbox__tool', 'تكبير',
            '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/><path d="M11 8v6"/><path d="M8 11h6"/>');
        zoomOutBtn = iconBtn('lightbox__tool', 'تصغير',
            '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/><path d="M8 11h6"/>');
        resetBtn = iconBtn('lightbox__tool', 'إعادة الضبط',
            '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>');
        zoomInBtn.addEventListener('click', function (e) { e.stopPropagation(); setZoom(zoom + 0.5); });
        zoomOutBtn.addEventListener('click', function (e) { e.stopPropagation(); setZoom(zoom - 0.5); });
        resetBtn.addEventListener('click', function (e) { e.stopPropagation(); resetZoom(); });
        tools.appendChild(zoomInBtn);
        tools.appendChild(zoomOutBtn);
        tools.appendChild(resetBtn);

        closeBtn = iconBtn('lightbox__close', 'إغلاق', '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>');
        closeBtn.addEventListener('click', close);

        prevBtn = iconBtn('lightbox__nav lightbox__nav--prev', 'السابق', '<path d="m15 18-6-6 6-6"/>');
        prevBtn.addEventListener('click', function (e) { e.stopPropagation(); prev(); });

        nextBtn = iconBtn('lightbox__nav lightbox__nav--next', 'التالي', '<path d="m9 18 6-6-6-6"/>');
        nextBtn.addEventListener('click', function (e) { e.stopPropagation(); next(); });

        const bar = document.createElement('div');
        bar.className = 'lightbox__bar';
        counterEl = document.createElement('span');
        counterEl.className = 'lightbox__counter';
        captionEl = document.createElement('span');
        captionEl.className = 'lightbox__caption';
        bar.appendChild(counterEl);
        bar.appendChild(captionEl);

        root.appendChild(backdrop);
        root.appendChild(stage);
        root.appendChild(tools);
        root.appendChild(closeBtn);
        root.appendChild(prevBtn);
        root.appendChild(nextBtn);
        root.appendChild(bar);
        document.body.appendChild(root);

        document.addEventListener('keydown', onKeydown);
        window.addEventListener('pointermove', onPanMove);
        window.addEventListener('pointerup', onPanEnd);
    }

    function iconBtn(className, label, paths) {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = className;
        btn.setAttribute('aria-label', label);
        btn.title = label;
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('viewBox', '0 0 24 24');
        svg.setAttribute('aria-hidden', 'true');
        svg.setAttribute('class', 'icon icon-lg lightbox__icon');
        svg.innerHTML = paths; // static, internal markup only
        btn.appendChild(svg);
        return btn;
    }

    function render() {
        const it = items[index] || {};
        resetZoom();
        imgEl.setAttribute('src', safeSrc(it.src));
        imgEl.setAttribute('alt', typeof it.alt === 'string' ? it.alt : '');
        captionEl.textContent = it.caption || it.alt || '';
        const multi = items.length > 1;
        counterEl.textContent = multi ? (index + 1) + ' / ' + items.length : '';
        prevBtn.hidden = !multi;
        nextBtn.hidden = !multi;
    }

    /* ---- Zoom & pan ---- */
    function applyTransform() {
        imgEl.style.setProperty('--lb-zoom', String(zoom));
        imgEl.style.setProperty('--lb-x', panX + 'px');
        imgEl.style.setProperty('--lb-y', panY + 'px');
        imgEl.classList.toggle('is-zoomed', zoom > 1);
    }
    function clampPan() {
        const r = imgEl.getBoundingClientRect();
        const maxX = Math.max(0, (r.width * (zoom - 1)) / 2) / zoom;
        const maxY = Math.max(0, (r.height * (zoom - 1)) / 2) / zoom;
        panX = Math.min(Math.max(panX, -maxX), maxX);
        panY = Math.min(Math.max(panY, -maxY), maxY);
    }
    function setZoom(z) {
        zoom = Math.min(Math.max(z, ZOOM_MIN), ZOOM_MAX);
        if (zoom <= 1) { panX = 0; panY = 0; } else { clampPan(); }
        applyTransform();
    }
    function resetZoom() { zoom = 1; panX = 0; panY = 0; applyTransform(); }

    function onImageClick(e) {
        e.stopPropagation();
        if (panning) return;
        setZoom(zoom > 1 ? 1 : 2);
    }
    function onWheel(e) {
        e.preventDefault();
        setZoom(zoom + (e.deltaY < 0 ? 0.3 : -0.3));
    }
    function onPanStart(e) {
        if (zoom <= 1) return;
        panning = true;
        startX = e.clientX; startY = e.clientY;
        startPanX = panX; startPanY = panY;
        imgEl.classList.add('is-panning');
    }
    function onPanMove(e) {
        if (!panning) return;
        panX = startPanX + (e.clientX - startX) / zoom;
        panY = startPanY + (e.clientY - startY) / zoom;
        clampPan();
        applyTransform();
    }
    function onPanEnd() {
        if (!panning) return;
        panning = false;
        imgEl.classList.remove('is-panning');
    }

    /* ---- Open / close ---- */
    function open(images, startIndex) {
        build();
        clearPendingClose(); // cancel a pending hide if reopened mid-transition
        items = Array.isArray(images) ? images : [images];
        index = Math.min(Math.max(startIndex | 0, 0), items.length - 1);
        if (root.hidden) lastFocused = document.activeElement;
        render();
        root.hidden = false;
        document.body.classList.add('no-scroll');
        void root.offsetWidth; // force reflow so the transition runs (robust vs throttled rAF)
        root.classList.add('is-open');
        closeBtn.focus();
    }

    function clearPendingClose() {
        if (closeTimer) { window.clearTimeout(closeTimer); closeTimer = null; }
        if (onCloseEnd) { root.removeEventListener('transitionend', onCloseEnd); onCloseEnd = null; }
    }
    function finishClose() {
        clearPendingClose();
        root.hidden = true;
        if (lastFocused && typeof lastFocused.focus === 'function') lastFocused.focus();
    }
    function close() {
        if (!built || root.hidden) return;
        root.classList.remove('is-open');
        document.body.classList.remove('no-scroll');
        clearPendingClose();
        onCloseEnd = function (e) {
            if (e && e.target !== root) return; // ignore inner-element transitions
            finishClose();
        };
        root.addEventListener('transitionend', onCloseEnd);
        closeTimer = window.setTimeout(finishClose, 350); // fallback
    }

    function next() { if (items.length > 1) { index = (index + 1) % items.length; render(); } }
    function prev() { if (items.length > 1) { index = (index - 1 + items.length) % items.length; render(); } }

    function onKeydown(e) {
        if (root.hidden) return;
        switch (e.key) {
            case 'Escape': e.preventDefault(); close(); break;
            case 'ArrowRight': e.preventDefault(); isRTL() ? prev() : next(); break;
            case 'ArrowLeft': e.preventDefault(); isRTL() ? next() : prev(); break;
            case 'Home': e.preventDefault(); index = 0; render(); break;
            case 'End': e.preventDefault(); index = items.length - 1; render(); break;
            case '+': case '=': e.preventDefault(); setZoom(zoom + 0.5); break;
            case '-': e.preventDefault(); setZoom(zoom - 0.5); break;
            case 'Tab': trapFocus(e); break;
            default: break;
        }
    }

    function trapFocus(e) {
        const focusable = [closeBtn, zoomInBtn, zoomOutBtn, resetBtn, prevBtn, nextBtn]
            .filter(function (b) { return b && !b.hidden; });
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }

    return { open: open, close: close };
})();
