/* =====================================================================
   ChatWidget — JSON-driven adapter (PREVIEW / مثال تخيلي).
   Goal of the final version: ONE bundled file + ONE JSON config.
   The user writes ZERO JavaScript — every property (theme, identity,
   layout, fab, send, features, behavior, AND the bot's replies) lives
   in a single JSON object.

   In this preview the adapter sits on top of the existing modules to
   prove the API/shape works. The real build will inline everything
   (CSS + fonts + modules) into one minified `chat-widget.min.js`.

   Usage (imagined final form):
     <script src="chat-widget.min.js"></script>
     <script type="application/json" data-chat-widget>{ ... }</script>
   or programmatically: ChatWidget.init({ ... })
   ===================================================================== */
(function () {
    'use strict';

    function mapTheme(t) {
        if (!t) return {};
        var out = {};
        if (t.primary) out.primary = t.primary;
        if (t.accent) out.accent = t.accent;
        if (t.userBubble) { out.userBubbleFrom = t.userBubble[0]; out.userBubbleTo = t.userBubble[1]; }
        if (t.botBubbleBg) out.botBubbleBg = t.botBubbleBg;
        if (t.botBubbleText) out.botBubbleText = t.botBubbleText;
        if (t.radius) out.radius = t.radius;
        if (t.bubbleRadius) out.bubbleRadius = t.bubbleRadius;
        if (t.font) out.fontFamily = t.font;
        return out;
    }

    // Build a JSON-driven responder: { "kw1|kw2": template, "*": fallback }
    function makeResponder(responses) {
        var keys = Object.keys(responses);
        return function (text) {
            var t = (text || '').toLowerCase();
            for (var i = 0; i < keys.length; i++) {
                if (keys[i] === '*') continue;
                var words = keys[i].split('|');
                for (var j = 0; j < words.length; j++) {
                    if (t.indexOf(words[j].trim().toLowerCase()) !== -1) return responses[keys[i]];
                }
            }
            return responses['*'] || { type: 'text', text: '...' };
        };
    }

    function init(config) {
        var MC = window.MedChat;
        if (!config || !MC) return;

        if (config.dir) document.documentElement.setAttribute('dir', config.dir);

        // One call drives theme + layout + fab + send (all from JSON)
        MC.applyTheme({
            theme: mapTheme(config.theme),
            layout: config.layout || {},
            fab: config.fab || {},
            send: config.send || {}
        });

        // Behavior (welcome, speeds, suggestions, carousel/slider/gallery, map)
        if (config.behavior) {
            // merge nested objects so partial overrides keep defaults
            var b = config.behavior;
            Object.keys(b).forEach(function (k) {
                if (b[k] && typeof b[k] === 'object' && !Array.isArray(b[k])) {
                    MC.CONFIG.behavior[k] = Object.assign({}, MC.CONFIG.behavior[k], b[k]);
                } else {
                    MC.CONFIG.behavior[k] = b[k];
                }
            });
        }

        if (config.identity) MC.applyIdentity(config.identity);
        if (config.features) MC.applyFeatures(config.features);

        // The bot itself becomes data: keyword -> reply template (no code)
        if (config.responses) MC.Bot.getResponse = makeResponder(config.responses);

        // (Final version) config.endpoint -> fetch backend for replies.
    }

    window.ChatWidget = { init: init, version: '0.1.0-preview' };

    // Auto-init from a <script type="application/json" data-chat-widget> block
    function auto() {
        var el = document.querySelector('script[type="application/json"][data-chat-widget]');
        if (!el) return;
        var parsed;
        try { parsed = JSON.parse(el.textContent); }
        catch (e) { console.error('[ChatWidget] invalid JSON config:', e); return; }
        init(parsed);

        // Preview helper: mirror the active config into a <pre id="configView">
        var view = document.getElementById('configView');
        if (view) view.textContent = JSON.stringify(parsed, null, 2);
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', auto);
    else auto();
})();
