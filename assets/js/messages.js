/* =====================================================================
   Messages — renders messages and reply templates.
   Supported templates (the bot picks one per answer type):
     - text     : plain text with a typewriter effect
     - image    : image + caption  (lightbox on click)
     - embed    : external embed such as a map (sandboxed iframe)
     - carousel : side-by-side scrollable image strip (lightbox on click)
     - gallery  : grid of images with a "+N" overflow tile (lightbox)
   Security: all text via textContent, image/embed URLs validated,
   iframes restricted to whitelisted hosts + sandbox.
   ===================================================================== */
window.MedChat = window.MedChat || {};
window.MedChat.Messages = (function () {
    'use strict';

    const CONFIG = window.MedChat.CONFIG;
    const TYPE_SPEED = (CONFIG && CONFIG.behavior.typeSpeed) || 22;

    // Allowed hosts for the embed template
    const EMBED_HOSTS = [
        'www.google.com', 'google.com', 'maps.google.com',
        'www.openstreetmap.org', 'openstreetmap.org',
        'www.youtube.com', 'youtube.com', 'www.youtube-nocookie.com',
        'player.vimeo.com'
    ];

    function prefersReducedMotion() {
        return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    }

    function scrollToBottom(container) {
        container.scrollTo({
            top: container.scrollHeight,
            behavior: prefersReducedMotion() ? 'auto' : 'smooth'
        });
    }

    // Single screen-reader announcement: reads the whole reply once
    function announce(text) {
        const region = document.getElementById('chatLiveRegion');
        if (!region || !text) return;
        region.textContent = '';
        window.setTimeout(function () { region.textContent = text; }, 50);
    }

    function summarize(res) {
        switch (res.type) {
            case 'image': return (res.text ? res.text + '. ' : '') +
                ((res.image && (res.image.caption || res.image.alt)) || 'صورة');
            case 'embed': return (res.text ? res.text + '. ' : '') +
                ((res.embed && (res.embed.caption || res.embed.title)) || 'محتوى مضمّن');
            case 'carousel': return (res.text ? res.text + '. ' : '') +
                'معرض صور يحتوي ' + ((res.images && res.images.length) || 0) + ' صور';
            case 'slider': return (res.text ? res.text + '. ' : '') +
                'عرض شرائح يحتوي ' + ((res.images && res.images.length) || 0) + ' صور';
            case 'gallery': return (res.text ? res.text + '. ' : '') +
                'ألبوم صور يحتوي ' + ((res.images && res.images.length) || 0) + ' صور';
            default: return res.text || '';
        }
    }

    function safeImgSrc(url) {
        if (typeof url !== 'string') return '';
        const u = url.trim();
        if (/^(https:\/\/|\/|\.\/|\.\.\/|assets\/)/i.test(u)) return u;
        if (!/^[a-z][a-z0-9+.-]*:/i.test(u)) return u;
        return '';
    }

    function safeEmbedUrl(url) {
        if (typeof url !== 'string') return null;
        try {
            const parsed = new URL(url, window.location.href);
            if (parsed.protocol !== 'https:') return null;
            if (EMBED_HOSTS.indexOf(parsed.hostname) === -1) return null;
            return parsed.href;
        } catch (e) {
            return null;
        }
    }

    function makeRow(sender) {
        const row = document.createElement('div');
        row.className = 'msg-row msg-row--' + sender;
        return row;
    }

    function svgIcon(cls, paths) {
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('viewBox', '0 0 24 24');
        svg.setAttribute('aria-hidden', 'true');
        svg.setAttribute('class', cls);
        svg.innerHTML = paths; // static, internal markup only
        return svg;
    }

    function featureOn(name) {
        const f = CONFIG && CONFIG.features;
        return !f || f[name] !== false; // default on unless explicitly false
    }

    function makeMediaBubble(res) {
        const bubble = document.createElement('div');
        bubble.className = 'bubble bubble--bot bubble--media';
        if (res.text) {
            const lead = document.createElement('p');
            lead.className = 'media__lead';
            lead.textContent = res.text;
            bubble.appendChild(lead);
        }
        return bubble;
    }

    /* ------------------------- User message ------------------------- */
    function appendUser(container, text) {
        const row = makeRow('user');
        const bubble = document.createElement('div');
        bubble.className = 'bubble bubble--user';
        bubble.textContent = text;
        row.appendChild(bubble);
        container.appendChild(row);
        scrollToBottom(container);
        return Promise.resolve();
    }

    /* ------------------------- Typing indicator ------------------------- */
    function appendTyping(container) {
        const row = makeRow('bot');
        row.dataset.typing = '1';
        row.setAttribute('aria-hidden', 'true'); // decorative — not announced
        const bubble = document.createElement('div');
        bubble.className = 'bubble bubble--bot typing';
        for (let i = 0; i < 3; i++) {
            const dot = document.createElement('span');
            dot.className = 'typing__dot';
            bubble.appendChild(dot);
        }
        row.appendChild(bubble);
        container.appendChild(row);
        scrollToBottom(container);
        return row;
    }

    /* ------------------------- Bot reply (dispatch by type) ------------------------- */
    function appendBot(container, response) {
        const res = (typeof response === 'string') ? { type: 'text', text: response } : (response || {});
        announce(summarize(res));
        switch (res.type) {
            case 'image': return renderImage(container, res);
            case 'embed': return renderEmbed(container, res);
            case 'carousel': return renderCarousel(container, res);
            case 'slider': return renderSlider(container, res);
            case 'gallery': return renderGallery(container, res);
            case 'text':
            default: return renderText(container, res);
        }
    }

    /* Template: text */
    function renderText(container, res) {
        const row = makeRow('bot');
        const bubble = document.createElement('div');
        bubble.className = 'bubble bubble--bot';
        row.appendChild(bubble);
        container.appendChild(row);
        return typeWriter(bubble, res.text || '', function () { scrollToBottom(container); });
    }

    /* Template: single image + caption */
    function renderImage(container, res) {
        const img = res.image || {};
        const row = makeRow('bot');
        const bubble = makeMediaBubble(res);

        const fig = document.createElement('figure');
        fig.className = 'media-img';

        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'media-img__btn';
        btn.setAttribute('aria-label', (img.caption || img.alt || 'صورة') + ' — اضغط للتكبير');

        const el = document.createElement('img');
        el.className = 'media-img__el';
        el.setAttribute('src', safeImgSrc(img.src));
        el.setAttribute('alt', typeof img.alt === 'string' ? img.alt : '');
        el.loading = 'lazy';
        el.draggable = false;
        btn.appendChild(el);
        btn.addEventListener('click', function () {
            window.MedChat.Lightbox.open([{ src: img.src, alt: img.alt, caption: img.caption }], 0);
        });
        fig.appendChild(btn);

        if (img.caption) {
            const cap = document.createElement('figcaption');
            cap.className = 'media-img__cap';
            cap.textContent = img.caption;
            fig.appendChild(cap);
        }
        bubble.appendChild(fig);
        row.appendChild(bubble);
        container.appendChild(row);
        scrollToBottom(container);
        el.addEventListener('load', function () { scrollToBottom(container); });
        return Promise.resolve();
    }

    /* Template: embed (iframe) */
    function renderEmbed(container, res) {
        const emb = res.embed || {};
        const url = safeEmbedUrl(emb.src);
        const row = makeRow('bot');
        const bubble = makeMediaBubble(res);

        if (!url) {
            const warn = document.createElement('p');
            warn.className = 'media__lead';
            warn.textContent = 'تعذّر عرض المحتوى المضمّن (مصدر غير موثوق).';
            bubble.appendChild(warn);
        } else {
            const frame = document.createElement('div');
            frame.className = 'media-embed';
            const iframe = document.createElement('iframe');
            iframe.className = 'media-embed__frame';
            iframe.setAttribute('src', url);
            iframe.setAttribute('title', emb.title || 'محتوى مضمّن');
            iframe.setAttribute('loading', 'lazy');
            iframe.setAttribute('referrerpolicy', 'no-referrer-when-downgrade');
            iframe.setAttribute('allow', 'fullscreen; picture-in-picture');
            iframe.setAttribute('allowfullscreen', '');
            // No allow-same-origin: the frame can't treat itself as its real origin
            iframe.setAttribute('sandbox', 'allow-scripts allow-popups allow-forms allow-popups-to-escape-sandbox');
            frame.appendChild(iframe);
            bubble.appendChild(frame);

            if (emb.caption) {
                const cap = document.createElement('p');
                cap.className = 'media-img__cap';
                cap.textContent = emb.caption;
                bubble.appendChild(cap);
            }

            // "Open map" button (new tab) — opens the full external page
            const openUrl = safeEmbedUrl(emb.openUrl);
            if (openUrl && featureOn('mapOpenButton')) {
                const a = document.createElement('a');
                a.className = 'media-embed__open';
                a.href = openUrl;
                a.target = '_blank';
                a.rel = 'noopener noreferrer';
                a.appendChild(svgIcon('icon icon-sm',
                    '<path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>'));
                const span = document.createElement('span');
                span.textContent = 'افتح الخريطة في نافذة جديدة';
                a.appendChild(span);
                bubble.appendChild(a);
            }
        }
        row.appendChild(bubble);
        container.appendChild(row);
        scrollToBottom(container);
        return Promise.resolve();
    }

    /* Template: carousel (side-by-side strip) */
    function renderCarousel(container, res) {
        const images = Array.isArray(res.images) ? res.images : [];
        const row = makeRow('bot');
        const bubble = makeMediaBubble(res);
        const car = window.MedChat.Carousel.create(images, function (i) {
            window.MedChat.Lightbox.open(images, i);
        });
        bubble.appendChild(car);
        row.appendChild(bubble);
        container.appendChild(row);
        scrollToBottom(container);
        return Promise.resolve();
    }

    /* Template: slider (one image at a time, cross-fade + autoplay) */
    function renderSlider(container, res) {
        const images = Array.isArray(res.images) ? res.images : [];
        const row = makeRow('bot');
        const bubble = makeMediaBubble(res);
        const sl = window.MedChat.Slider.create(images, function (i) {
            window.MedChat.Lightbox.open(images, i);
        });
        bubble.appendChild(sl);
        row.appendChild(bubble);
        container.appendChild(row);
        scrollToBottom(container);
        return Promise.resolve();
    }

    /* Template: gallery grid with a "+N" overflow tile */
    function renderGallery(container, res) {
        const images = Array.isArray(res.images) ? res.images : [];
        const max = (CONFIG && CONFIG.behavior.gallery.maxVisible) || 6;
        const total = images.length;
        const showCount = Math.min(total, max);

        const row = makeRow('bot');
        const bubble = makeMediaBubble(res);

        const grid = document.createElement('div');
        grid.className = 'gallery';

        for (let i = 0; i < showCount; i++) {
            const it = images[i] || {};
            const isOverflow = (i === showCount - 1) && (total > max);

            const cell = document.createElement('button');
            cell.type = 'button';
            cell.className = 'gallery__cell';
            cell.setAttribute('aria-label',
                isOverflow ? ('عرض كل الصور (' + total + ')') : ((it.caption || it.alt || 'صورة') + ' — اضغط للتكبير'));

            const img = document.createElement('img');
            img.className = 'gallery__img';
            img.setAttribute('src', safeImgSrc(it.src));
            img.setAttribute('alt', typeof it.alt === 'string' ? it.alt : '');
            img.loading = 'lazy';
            img.draggable = false;
            cell.appendChild(img);

            if (isOverflow) {
                const more = document.createElement('span');
                more.className = 'gallery__more';
                more.textContent = '+' + (total - max);
                cell.appendChild(more);
            }

            cell.addEventListener('click', function () {
                window.MedChat.Lightbox.open(images, i); // lightbox always holds ALL images
            });
            grid.appendChild(cell);
        }

        bubble.appendChild(grid);
        row.appendChild(bubble);
        container.appendChild(row);
        scrollToBottom(container);
        return Promise.resolve();
    }

    /* ------------------------- Quick-reply chips ------------------------- */
    function appendChips(container, chips, onPick) {
        const row = makeRow('bot');
        row.classList.add('msg-row--chips');
        const wrap = document.createElement('div');
        wrap.className = 'chips';
        (chips || []).forEach(function (c) {
            const b = document.createElement('button');
            b.type = 'button';
            b.className = 'chip';
            b.textContent = c.label;
            b.addEventListener('click', function () {
                row.remove();
                onPick(c.value != null ? c.value : c.label);
            });
            wrap.appendChild(b);
        });
        row.appendChild(wrap);
        container.appendChild(row);
        scrollToBottom(container);
        return row;
    }

    /* ------------------------- Typewriter effect ------------------------- */
    function typeWriter(element, text, onTick, speed) {
        speed = speed || TYPE_SPEED;
        return new Promise(function (resolve) {
            element.textContent = '';
            element.classList.add('typing-cursor');
            let i = 0;
            (function step() {
                if (i < text.length) {
                    element.append(text.charAt(i)); // safe per-char append
                    i++;
                    if (onTick) onTick();
                    window.setTimeout(step, speed + Math.random() * 14);
                } else {
                    element.classList.remove('typing-cursor');
                    resolve();
                }
            })();
        });
    }

    return {
        scrollToBottom: scrollToBottom,
        appendUser: appendUser,
        appendTyping: appendTyping,
        appendBot: appendBot,
        appendChips: appendChips
    };
})();
