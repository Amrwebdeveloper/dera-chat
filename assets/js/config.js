/* =====================================================================
   Configuration & theming.
   Edit these values to customize colors, size, shape, position and
   behavior. applyTheme() pushes the theme values into CSS variables so
   the whole UI updates from one place. You can also call
   MedChat.applyTheme({ ...overrides }) at runtime.
   ===================================================================== */
window.MedChat = window.MedChat || {};

window.MedChat.CONFIG = {
    /* ---- Visual theme ---- */
    theme: {
        primary: '#3b82f6',                 // main brand color (FAB, header, send button)
        accent: '#2dd4bf',                  // gradient partner / accent color
        userBubbleFrom: '#3b82f6',          // user bubble gradient start
        userBubbleTo: '#4f46e5',            // user bubble gradient end
        botBubbleBg: 'rgba(255, 255, 255, 0.9)',
        botBubbleText: '#1f2937',
        radius: '24px',                     // widget corner radius
        bubbleRadius: '16px',               // message bubble radius
        fontFamily: "'Cairo', system-ui, -apple-system, 'Segoe UI', Tahoma, sans-serif",
    },

    /* ---- Bot identity ---- */
    identity: {
        name: 'المساعد الطبي الذكي',     // header title
        status: 'متصل الآن',             // status line under the name
        avatar: '',                       // image URL; empty -> default bot icon
    },

    /* ---- Feature toggles (true/false) ---- */
    features: {
        cta: true,                        // the call-to-action bubble
        attachButton: true,               // the paperclip/attach button
        fullscreenButton: true,           // the quick fullscreen button in the header
        suggestions: true,                // quick-reply chips after the welcome
        newConversation: true,            // "new conversation" menu item
        history: true,                    // "chat history" menu item (UI only)
        mapOpenButton: true,              // "open map" button under embeds
    },

    /* ---- Layout / placement ---- */
    layout: {
        side: 'left',                       // 'left' or 'right' edge of the screen
        edge: '1.5rem',                     // distance from the screen edge
        width: '380px',                     // widget width
        height: '70vh',                     // widget height
        fabSize: '4rem',                    // floating action button size
        fabBottom: '1.5rem',                // floating button distance from the bottom
    },

    /* ---- Floating action button (the external launcher icon) ---- */
    fab: {
        icon: 'message',                    // 'message' | 'chat' | 'bot' | 'help' | 'sparkles' | 'headset'
        shape: 'round',                     // 'round' | 'rounded' | 'square'
    },

    /* ---- Send button ---- */
    send: {
        icon: 'send',                       // 'send' | 'sendHorizontal' | 'arrow' | 'chevron'
        shape: 'round',                     // 'round' | 'rounded' | 'square'
        rotate: true,                       // rotate the icon -90deg (nice for the paper-plane)
    },

    /* ---- Behavior / content ---- */
    behavior: {
        welcome: 'مرحباً بك! أنا مساعدك الطبي الذكي. كيف يمكنني مساعدتك اليوم؟',
        botReplyDelay: 700,                 // "typing…" delay before the bot replies (ms)
        typeSpeed: 22,                      // typewriter speed (ms per char)
        suggestions: [                      // quick-reply chips shown after the welcome
            { label: '📍 موقع العيادة', value: 'أين موقع العيادة؟' },
            { label: '🖼️ نصيحة بصورة', value: 'اعرض لي نصيحة صحية بصورة' },
            { label: '🎠 معرض (كاروسيل)', value: 'اعرض لي معرض الصور' },
            { label: '🎞️ سلايدر', value: 'اعرض سلايدر الصور' },
            { label: '🖼️ ألبوم صور', value: 'اعرض لي ألبوم كل الصور' },
            { label: '💬 سؤال عام', value: 'عندي استفسار عام' },
        ],
        carousel: {
            // Card width. '88%' keeps it near full chat width while peeking the next
            // card so it's clear there are more cards side-by-side. '100%' = no peek.
            itemBasis: '88%',
        },
        slider: {
            autoplay: true,                 // auto-advance the slider
            interval: 3800,                 // autoplay interval (ms)
        },
        gallery: {
            columns: 3,                     // grid columns
            maxVisible: 6,                  // max tiles before showing the "+N" overflow tile
        },
        // Map embed (OpenStreetMap is iframe-friendly without an API key).
        mapEmbed: 'https://www.openstreetmap.org/export/embed.html?bbox=31.198%2C30.016%2C31.226%2C30.037&layer=mapnik&marker=30.0264%2C31.2122',
        // Full map page opened by the "open map" button (new tab).
        mapOpenUrl: 'https://www.openstreetmap.org/?mlat=30.0264&mlon=31.2122#map=15/30.0264/31.2122',
    },
};

/* Icon sets (inline SVG paths) for the launcher and send button */
window.MedChat.FAB_ICONS = {
    message: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
    chat: '<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>',
    bot: '<path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/>',
    help: '<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/>',
    sparkles: '<path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/>',
    headset: '<path d="M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H4a1 1 0 0 1-1-1v-7a9 9 0 0 1 18 0v7a1 1 0 0 1-1 1h-2a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3"/>'
};
window.MedChat.SEND_ICONS = {
    send: '<path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/>',
    sendHorizontal: '<path d="M3.7 3a.5.5 0 0 0-.7.6l2.8 7.6a2 2 0 0 1 0 1.4L3 20.4a.5.5 0 0 0 .7.6l18-8.5a.5.5 0 0 0 0-.9z"/><path d="M6 12h16"/>',
    arrow: '<path d="m5 12 7-7 7 7"/><path d="M12 19V5"/>',
    chevron: '<path d="m18 15-6-6-6 6"/>'
};
window.MedChat.SHAPE_RADIUS = { round: '9999px', rounded: '1.25rem', square: '0.6rem' };

/* Apply the config to CSS variables + layout attributes. */
window.MedChat.applyTheme = function (overrides) {
    var cfg = window.MedChat.CONFIG;
    if (overrides) {
        if (overrides.theme) Object.assign(cfg.theme, overrides.theme);
        if (overrides.layout) Object.assign(cfg.layout, overrides.layout);
        if (overrides.behavior) Object.assign(cfg.behavior, overrides.behavior);
        if (overrides.fab) Object.assign(cfg.fab, overrides.fab);
        if (overrides.send) Object.assign(cfg.send, overrides.send);
    }
    var t = cfg.theme, l = cfg.layout;
    var s = document.documentElement.style;
    s.setProperty('--chat-primary', t.primary);
    s.setProperty('--chat-accent', t.accent);
    s.setProperty('--chat-user-from', t.userBubbleFrom);
    s.setProperty('--chat-user-to', t.userBubbleTo);
    s.setProperty('--chat-bot-bg', t.botBubbleBg);
    s.setProperty('--chat-bot-text', t.botBubbleText);
    s.setProperty('--chat-radius', t.radius);
    s.setProperty('--chat-bubble-radius', t.bubbleRadius);
    s.setProperty('--chat-font', t.fontFamily);
    s.setProperty('--chat-width', l.width);
    s.setProperty('--chat-height', l.height);
    s.setProperty('--chat-edge', l.edge);
    s.setProperty('--chat-fab', l.fabSize);
    s.setProperty('--fab-bottom', l.fabBottom || '1.5rem');
    s.setProperty('--carousel-item', cfg.behavior.carousel.itemBasis);
    s.setProperty('--gallery-cols', String(cfg.behavior.gallery.columns));
    document.documentElement.setAttribute('data-chat-side', l.side === 'right' ? 'right' : 'left');

    // Launcher (FAB) shape + icon
    var R = window.MedChat.SHAPE_RADIUS;
    s.setProperty('--fab-radius', R[cfg.fab.shape] || R.round);
    var fabIcon = document.getElementById('chatIconOpen');
    if (fabIcon) fabIcon.innerHTML = window.MedChat.FAB_ICONS[cfg.fab.icon] || window.MedChat.FAB_ICONS.message;

    // Send button shape + icon + rotation
    s.setProperty('--send-radius', R[cfg.send.shape] || R.round);
    s.setProperty('--send-rotate', cfg.send.rotate === false ? '0deg' : '-90deg');
    var sendIcon = document.querySelector('#sendBtn svg');
    if (sendIcon) sendIcon.innerHTML = window.MedChat.SEND_ICONS[cfg.send.icon] || window.MedChat.SEND_ICONS.send;
};

/* Apply bot identity (name, status, avatar) to the header. */
window.MedChat.applyIdentity = function (overrides) {
    var id = window.MedChat.CONFIG.identity;
    if (overrides) Object.assign(id, overrides);

    var name = document.getElementById('botName');
    var status = document.getElementById('botStatus');
    var avatar = document.getElementById('botAvatar');
    if (name) name.textContent = id.name;
    if (status) status.textContent = id.status;

    if (avatar) {
        var url = (id.avatar || '').trim();
        var safe = /^(https:\/\/|\/|\.\/|\.\.\/|assets\/|data:image\/)/i.test(url);
        var existing = avatar.querySelector('img.avatar__img');
        if (url && safe) {
            if (!existing) {
                var img = document.createElement('img');
                img.className = 'avatar__img';
                img.alt = id.name;
                avatar.replaceChildren(img); // remove default icon, show photo
                existing = img;
            }
            existing.setAttribute('src', url);
        } else if (existing) {
            // avatar cleared -> restore the default bot icon
            var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            svg.setAttribute('viewBox', '0 0 24 24');
            svg.setAttribute('aria-hidden', 'true');
            svg.setAttribute('class', 'icon icon-lg');
            svg.innerHTML = '<path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/>' +
                '<path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/>';
            avatar.replaceChildren(svg);
        }
    }
};

/* Apply feature toggles by showing/hiding the related elements. */
window.MedChat.applyFeatures = function (overrides) {
    var f = window.MedChat.CONFIG.features;
    if (overrides) Object.assign(f, overrides);
    var toggle = function (id, on) {
        var el = document.getElementById(id);
        if (el) el.classList.toggle('is-hidden', on === false);
    };
    toggle('ctaMessage', f.cta);
    toggle('attachBtn', f.attachButton);
    toggle('fullscreenQuickBtn', f.fullscreenButton);
    toggle('newChatBtn', f.newConversation);
    toggle('historyBtn', f.history);
};
