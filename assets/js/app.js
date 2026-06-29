/* =====================================================================
   Smart Medical Assistant — orchestration.
   Wires the UI to the Bot (template selection) and Messages (rendering).
   Security: all dynamic text is rendered via textContent inside Messages.
   ===================================================================== */
(function () {
    'use strict';

    const Bot = window.MedChat.Bot;
    const Messages = window.MedChat.Messages;
    const CONFIG = window.MedChat.CONFIG;

    const els = {
        messages: document.getElementById('chatMessages'),
        form: document.getElementById('chatForm'),
        input: document.getElementById('messageInput'),
        widget: document.getElementById('chatWidget'),
        toggleBtn: document.getElementById('chatToggleBtn'),
        iconOpen: document.getElementById('chatIconOpen'),
        iconClose: document.getElementById('chatIconClose'),
        badge: document.getElementById('unreadBadge'),
        cta: document.getElementById('ctaMessage'),
        closeCtaBtn: document.getElementById('closeCtaBtn'),
        menuBtn: document.getElementById('menuBtn'),
        dropdown: document.getElementById('dropdownMenu'),
        toggleFullscreen: document.getElementById('toggleFullscreen'),
        fsLabel: document.getElementById('fsLabel'),
        fsIconMax: document.getElementById('fsIconMax'),
        fsIconMin: document.getElementById('fsIconMin'),
        fsQuickBtn: document.getElementById('fullscreenQuickBtn'),
        fsQuickIconMax: document.getElementById('fsQuickIconMax'),
        fsQuickIconMin: document.getElementById('fsQuickIconMin'),
        clearBtn: document.getElementById('clearChatBtn'),
        closeWidgetBtn: document.getElementById('closeWidgetBtn'),
        newChatBtn: document.getElementById('newChatBtn'),
        historyBtn: document.getElementById('historyBtn'),
        historyPanel: document.getElementById('historyPanel'),
        historyBack: document.getElementById('historyBack'),
        historyNewBtn: document.getElementById('historyNewBtn'),
        historyList: document.getElementById('historyList'),
    };

    const state = {
        isChatOpen: false,
        isFullscreen: false,
        unreadCount: 0,
        initialGreetingSent: false,
    };

    const WELCOME_DELAY = 500;
    const wait = function (ms) { return new Promise(function (r) { window.setTimeout(r, ms); }); };
    const scrollDown = function () { Messages.scrollToBottom(els.messages); };

    /* ------------------------- Init ------------------------- */
    window.MedChat.applyTheme();     // push theme config -> CSS variables
    window.MedChat.applyIdentity();  // bot name / status / avatar
    window.MedChat.applyFeatures();  // show/hide optional controls
    window.addEventListener('DOMContentLoaded', function () {
        state.unreadCount = 1;
        updateBadge();
    });

    /* ------------------------- Input ------------------------- */
    els.input.addEventListener('input', function () {
        this.style.height = 'auto';
        this.style.height = this.scrollHeight + 'px';
    });

    els.input.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            els.form.requestSubmit();
        }
    });

    els.form.addEventListener('submit', function (e) {
        e.preventDefault();
        const text = els.input.value.trim();
        if (!text) return;
        els.input.value = '';
        els.input.style.height = 'auto';
        submitText(text);
    });

    /* ------------------------- Conversation flow ------------------------- */
    function submitText(text) {
        text = (text || '').trim();
        if (!text) return;
        els.messages.querySelectorAll('.msg-row--chips').forEach(function (r) { r.remove(); });
        Messages.appendUser(els.messages, text);
        botRespond(text);
    }

    async function botRespond(userText) {
        const typingRow = Messages.appendTyping(els.messages);
        await wait(CONFIG.behavior.botReplyDelay);
        typingRow.remove();

        const response = Bot.getResponse(userText);
        if (!state.isChatOpen) {
            state.unreadCount++;
            updateBadge();
        }
        await Messages.appendBot(els.messages, response);
    }

    async function sendWelcome() {
        const typingRow = Messages.appendTyping(els.messages);
        await wait(WELCOME_DELAY);
        typingRow.remove();
        await Messages.appendBot(els.messages, { type: 'text', text: Bot.WELCOME });
        if (CONFIG.features.suggestions !== false) {
            Messages.appendChips(els.messages, Bot.SUGGESTIONS, function (value) {
                submitText(value);
                els.input.focus(); // keep focus somewhere useful after chips are removed
            });
        }
    }

    /* ------------------------- CTA ------------------------- */
    els.closeCtaBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        els.cta.style.display = 'none';
    });

    /* ------------------------- Open / close ------------------------- */
    els.toggleBtn.addEventListener('click', toggleChat);
    els.closeWidgetBtn.addEventListener('click', toggleChat);

    function toggleChat() {
        state.isChatOpen = !state.isChatOpen;
        if (state.isChatOpen) {
            els.widget.classList.add('is-open');
            els.toggleBtn.setAttribute('aria-expanded', 'true');
            els.iconOpen.classList.add('is-hidden');
            els.iconClose.classList.remove('is-hidden');
            els.cta.style.display = 'none';
            state.unreadCount = 0;
            updateBadge();
            if (!state.initialGreetingSent) {
                sendWelcome();
                state.initialGreetingSent = true;
            }
            window.setTimeout(scrollDown, 100);
        } else {
            els.widget.classList.remove('is-open');
            els.toggleBtn.setAttribute('aria-expanded', 'false');
            els.iconOpen.classList.remove('is-hidden');
            els.iconClose.classList.add('is-hidden');
            setDropdown(false);
            closeHistory();
        }
    }

    /* ------------------------- Options menu ------------------------- */
    function setDropdown(open) {
        els.dropdown.classList.toggle('is-hidden', !open);
        els.menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    }
    els.menuBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        setDropdown(els.dropdown.classList.contains('is-hidden'));
    });
    document.addEventListener('click', function () { setDropdown(false); });
    els.dropdown.addEventListener('click', function (e) { e.stopPropagation(); });
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && !els.dropdown.classList.contains('is-hidden')) {
            setDropdown(false);
            els.menuBtn.focus();
        }
    });

    /* ------------------------- Fullscreen (quick button + menu item) ------------------------- */
    els.fsQuickBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        setFullscreen(!state.isFullscreen);
    });
    els.toggleFullscreen.addEventListener('click', function (e) {
        e.stopPropagation();
        setDropdown(false);
        setFullscreen(!state.isFullscreen);
    });

    function setFullscreen(on) {
        state.isFullscreen = on;
        els.widget.classList.toggle('is-fullscreen', on);
        const label = on ? 'تصغير الشاشة' : 'ملء الشاشة';
        els.fsLabel.textContent = label;
        els.fsQuickBtn.setAttribute('aria-label', label);
        els.fsQuickBtn.setAttribute('title', label);
        els.fsIconMax.classList.toggle('is-hidden', on);
        els.fsIconMin.classList.toggle('is-hidden', !on);
        els.fsQuickIconMax.classList.toggle('is-hidden', on);
        els.fsQuickIconMin.classList.toggle('is-hidden', !on);
        window.setTimeout(scrollDown, 300);
    }

    /* ------------------------- Clear chat ------------------------- */
    els.clearBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        els.messages.replaceChildren();
        setDropdown(false);
        state.initialGreetingSent = true;
        sendWelcome();
    });

    /* ------------------------- New conversation + chat history (UI only) ------------------------- */
    const historyStore = [
        { name: 'استفسار عن الأدوية', preview: 'ما هي جرعة الدواء المناسبة؟', time: 'أمس' },
        { name: 'حجز موعد', preview: 'أريد حجز موعد مع الطبيب', time: 'قبل يومين' },
        { name: 'نتائج التحاليل', preview: 'متى تظهر نتائج التحاليل؟', time: 'قبل 3 أيام' },
    ];

    function botIconSvg() {
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('viewBox', '0 0 24 24');
        svg.setAttribute('aria-hidden', 'true');
        svg.setAttribute('class', 'icon icon-md');
        svg.innerHTML = '<path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/>' +
            '<path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/>';
        return svg;
    }

    function renderHistory() {
        els.historyList.replaceChildren();
        historyStore.forEach(function (c) {
            const item = document.createElement('button');
            item.type = 'button';
            item.className = 'history__item';

            const av = document.createElement('span');
            av.className = 'history__avatar';
            av.appendChild(botIconSvg());

            const meta = document.createElement('div');
            meta.className = 'history__meta';
            const name = document.createElement('div');
            name.className = 'history__name';
            name.textContent = c.name;
            const prev = document.createElement('div');
            prev.className = 'history__preview';
            prev.textContent = c.preview;
            meta.appendChild(name);
            meta.appendChild(prev);

            const time = document.createElement('span');
            time.className = 'history__time';
            time.textContent = c.time;

            item.appendChild(av);
            item.appendChild(meta);
            item.appendChild(time);
            item.addEventListener('click', closeHistory); // UI only — just returns to chat
            els.historyList.appendChild(item);
        });
    }

    function openHistory() { renderHistory(); els.historyPanel.classList.remove('is-hidden'); }
    function closeHistory() { els.historyPanel.classList.add('is-hidden'); }

    function startNewConversation() {
        // Archive the current chat as a (UI-only) history entry
        const firstUser = els.messages.querySelector('.bubble--user');
        historyStore.unshift({
            name: firstUser ? firstUser.textContent.slice(0, 28) : 'محادثة',
            preview: 'محادثة محفوظة',
            time: 'الآن'
        });
        els.messages.replaceChildren();
        state.initialGreetingSent = true;
        sendWelcome();
        setDropdown(false);
        closeHistory();
    }

    els.newChatBtn.addEventListener('click', function (e) { e.stopPropagation(); startNewConversation(); });
    els.historyBtn.addEventListener('click', function (e) { e.stopPropagation(); setDropdown(false); openHistory(); });
    els.historyBack.addEventListener('click', closeHistory);
    els.historyNewBtn.addEventListener('click', startNewConversation);

    /* ------------------------- Unread badge ------------------------- */
    function updateBadge() {
        els.badge.textContent = String(state.unreadCount);
        els.badge.classList.toggle('is-visible', state.unreadCount > 0);
    }
})();
