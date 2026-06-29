/* =====================================================================
   ChatWidget — class concept (تصوّر للمعاينة، ليس التنفيذ النهائي).
   Named instance + options + event listeners:

       const chat = new ChatWidget({ identity, theme, fab, onMessage });
       chat.on('message', (text) => { ... });
       chat.open(); chat.send('...'); chat.setTheme({ primary:'#...' });

   In this concept it wraps the existing modules to prove the API shape.
   The real build inlines everything into one bundle (Shadow DOM, etc.).
   ===================================================================== */
(function () {
    'use strict';

    function mapTheme(t) {
        if (!t) return {};
        var o = {};
        if (t.primary) o.primary = t.primary;
        if (t.accent) o.accent = t.accent;
        if (t.userBubble) { o.userBubbleFrom = t.userBubble[0]; o.userBubbleTo = t.userBubble[1]; }
        if (t.botBubbleBg) o.botBubbleBg = t.botBubbleBg;
        if (t.botBubbleText) o.botBubbleText = t.botBubbleText;
        if (t.radius) o.radius = t.radius;
        if (t.bubbleRadius) o.bubbleRadius = t.bubbleRadius;
        if (t.font) o.fontFamily = t.font;
        return o;
    }

    function makeResponder(responses) {
        var keys = Object.keys(responses);
        return function (text) {
            var t = (text || '').toLowerCase();
            for (var i = 0; i < keys.length; i++) {
                if (keys[i] === '*') continue;
                var ws = keys[i].split('|');
                for (var j = 0; j < ws.length; j++)
                    if (t.indexOf(ws[j].trim().toLowerCase()) !== -1) return responses[keys[i]];
            }
            return responses['*'] || { type: 'text', text: '...' };
        };
    }

    function ChatWidget(options) {
        if (!(this instanceof ChatWidget)) return new ChatWidget(options);
        this.options = options || {};
        this._handlers = {};
        this._mc = window.MedChat;
        this._w = document.getElementById('chatWidget');
        this._open = this._w ? this._w.classList.contains('is-open') : false;

        this._observe();
        this.update(this.options);

        var self = this;
        window.setTimeout(function () { self.emit('ready', self); }, 0);
    }

    /* ---- Event emitter ---- */
    ChatWidget.prototype.on = function (ev, fn) {
        (this._handlers[ev] = this._handlers[ev] || []).push(fn); return this;
    };
    ChatWidget.prototype.off = function (ev, fn) {
        var a = this._handlers[ev]; if (a) { var i = a.indexOf(fn); if (i > -1) a.splice(i, 1); } return this;
    };
    ChatWidget.prototype.emit = function (ev, payload) {
        (this._handlers[ev] || []).forEach(function (h) { try { h(payload); } catch (e) { /* listener error */ } });
    };

    /* ---- Apply / update options ---- */
    ChatWidget.prototype.update = function (o) {
        o = o || {};
        var mc = this._mc;
        if (o.dir) document.documentElement.setAttribute('dir', o.dir);
        mc.applyTheme({ theme: mapTheme(o.theme), layout: o.layout || {}, fab: o.fab || {}, send: o.send || {} });
        if (o.behavior) Object.keys(o.behavior).forEach(function (k) {
            var v = o.behavior[k];
            if (v && typeof v === 'object' && !Array.isArray(v)) mc.CONFIG.behavior[k] = Object.assign({}, mc.CONFIG.behavior[k], v);
            else mc.CONFIG.behavior[k] = v;
        });
        if (o.identity) mc.applyIdentity(o.identity);
        if (o.features) mc.applyFeatures(o.features);
        if (typeof o.onMessage === 'function') mc.Bot.getResponse = o.onMessage;
        else if (o.responses) mc.Bot.getResponse = makeResponder(o.responses);
        return this;
    };
    ChatWidget.prototype.setTheme = function (t) { return this.update({ theme: t }); };
    ChatWidget.prototype.setLayout = function (l) { return this.update({ layout: l }); };
    ChatWidget.prototype.setIdentity = function (i) { return this.update({ identity: i }); };
    ChatWidget.prototype.setFeatures = function (f) { return this.update({ features: f }); };

    /* ---- Actions ---- */
    ChatWidget.prototype.open = function () { if (!this.isOpen) document.getElementById('chatToggleBtn').click(); return this; };
    ChatWidget.prototype.close = function () { if (this.isOpen) document.getElementById('chatToggleBtn').click(); return this; };
    ChatWidget.prototype.toggle = function () { document.getElementById('chatToggleBtn').click(); return this; };
    ChatWidget.prototype.send = function (text) {
        this.open();
        var i = document.getElementById('messageInput');
        i.value = text;
        document.getElementById('chatForm').requestSubmit();
        return this;
    };
    ChatWidget.prototype.reply = function (response) {
        this._mc.Messages.appendBot(document.getElementById('chatMessages'), response);
        return this;
    };
    ChatWidget.prototype.clear = function () { document.getElementById('clearChatBtn').click(); return this; };

    Object.defineProperty(ChatWidget.prototype, 'isOpen', {
        get: function () { return this._w.classList.contains('is-open'); }
    });

    /* ---- Internal: bridge DOM changes to events ---- */
    ChatWidget.prototype._observe = function () {
        var self = this;
        new MutationObserver(function () {
            var open = self._w.classList.contains('is-open');
            if (open !== self._open) { self._open = open; self.emit(open ? 'open' : 'close', self); }
        }).observe(self._w, { attributes: true, attributeFilter: ['class'] });

        var msgs = document.getElementById('chatMessages');
        new MutationObserver(function (muts) {
            muts.forEach(function (m) {
                m.addedNodes.forEach(function (n) {
                    if (n.nodeType !== 1 || !n.querySelector) return;
                    if (n.querySelector('.bubble--user')) self.emit('message', n.querySelector('.bubble--user').textContent);
                    else if (n.querySelector('.bubble--bot:not(.typing)')) self.emit('reply', self.options);
                });
            });
        }).observe(msgs, { childList: true });
    };

    window.ChatWidget = ChatWidget;
})();
