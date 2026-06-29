/* =====================================================================
   Landing page interactions: live customization playground + copy
   buttons. Drives the real widget via the MedChat.* apply functions.
   ===================================================================== */
(function () {
    'use strict';

    var MC = window.MedChat;
    if (!MC) return;

    function on(selector, handler) {
        document.querySelectorAll(selector).forEach(function (el) {
            el.addEventListener('click', function () { handler(el); });
        });
    }

    /* ---- Copy buttons ---- */
    document.querySelectorAll('.code__copy').forEach(function (btn) {
        btn.addEventListener('click', function () {
            var block = btn.closest('[data-code]');
            var code = block && block.querySelector('code');
            if (!code || !navigator.clipboard) return;
            navigator.clipboard.writeText(code.innerText).then(function () {
                var prev = btn.textContent;
                btn.textContent = 'تم النسخ ✓';
                btn.classList.add('is-done');
                window.setTimeout(function () { btn.textContent = prev; btn.classList.remove('is-done'); }, 1500);
            });
        });
    });

    /* ---- Open the live widget ---- */
    function openWidget() {
        var w = document.getElementById('chatWidget');
        if (w && !w.classList.contains('is-open')) document.getElementById('chatToggleBtn').click();
    }
    on('[data-pg-open]', openWidget);

    /* ---- Theme ---- */
    on('[data-pg-color]', function (el) {
        MC.applyTheme({ theme: {
            primary: el.dataset.primary, accent: el.dataset.accent,
            userBubbleFrom: el.dataset.primary, userBubbleTo: el.dataset.accent
        } });
        openWidget();
    });
    on('[data-pg-side]', function (el) { MC.applyTheme({ layout: { side: el.dataset.pgSide } }); });
    on('[data-pg-radius]', function (el) { MC.applyTheme({ theme: { radius: el.dataset.pgRadius } }); openWidget(); });
    on('[data-pg-fab-icon]', function (el) { MC.applyTheme({ fab: { icon: el.dataset.pgFabIcon } }); });
    on('[data-pg-fab-shape]', function (el) { MC.applyTheme({ fab: { shape: el.dataset.pgFabShape } }); });
    on('[data-pg-send]', function (el) {
        var icon = el.dataset.pgSend;
        MC.applyTheme({ send: { icon: icon, rotate: icon === 'send' } });
        openWidget();
    });

    /* ---- Identity ---- */
    on('[data-pg-name]', function (el) { MC.applyIdentity({ name: el.dataset.pgName }); openWidget(); });

    /* ---- Feature toggles ---- */
    on('[data-pg-feature]', function (el) {
        var isOn = el.classList.toggle('is-on');
        var patch = {};
        patch[el.dataset.pgFeature] = isOn;
        MC.applyFeatures(patch);
        openWidget();
    });

    /* ---- Reset to defaults ---- */
    on('[data-pg-reset]', function () {
        MC.applyTheme({
            theme: { primary: '#3b82f6', accent: '#2dd4bf', userBubbleFrom: '#3b82f6', userBubbleTo: '#4f46e5', radius: '24px' },
            layout: { side: 'left', fabBottom: '1.5rem' },
            fab: { icon: 'message', shape: 'round' },
            send: { icon: 'send', shape: 'round', rotate: true }
        });
        MC.applyIdentity({ name: 'المساعد الطبي الذكي', status: 'متصل الآن', avatar: '' });
        MC.applyFeatures({
            cta: true, attachButton: true, fullscreenButton: true, suggestions: true,
            newConversation: true, history: true, mapOpenButton: true
        });
        document.querySelectorAll('[data-pg-feature]').forEach(function (c) { c.classList.add('is-on'); });
    });
})();
