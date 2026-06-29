/* Copy-to-clipboard buttons for code blocks (used by the doc pages). */
(function () {
    'use strict';
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
})();
