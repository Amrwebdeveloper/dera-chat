/* =====================================================================
   Bot — the assistant "brain" (demo, no server).
   It chooses the reply template based on the user's message.
   In a real system: replace getResponse() with a fetch() to your server
   and return the same { type, ... } shape for the templates to render.
   ===================================================================== */
window.MedChat = window.MedChat || {};
window.MedChat.Bot = (function () {
    'use strict';

    const CONFIG = window.MedChat.CONFIG;

    // Local image library (health tips)
    const BASE = [
        { src: 'assets/images/heart.svg', alt: 'صحة القلب', caption: 'صحة القلب — مارس الرياضة بانتظام' },
        { src: 'assets/images/pills.svg', alt: 'الأدوية والجرعات', caption: 'الأدوية — التزم بالجرعة الموصوفة' },
        { src: 'assets/images/nutrition.svg', alt: 'التغذية السليمة', caption: 'التغذية — أكثِر من الخضار والفواكه' },
        { src: 'assets/images/vaccine.svg', alt: 'اللقاحات', caption: 'اللقاحات — حدّث مطعوماتك في موعدها' },
        { src: 'assets/images/sleep.svg', alt: 'النوم الصحي', caption: 'النوم — 7 إلى 9 ساعات يومياً' },
        { src: 'assets/images/hydration.svg', alt: 'شرب الماء', caption: 'الترطيب — اشرب ماءً كافياً يومياً' }
    ];

    // Build a longer list by cycling the base images (used to demo the "+N" tile)
    function expand(n) {
        const out = [];
        for (let i = 0; i < n; i++) {
            const b = BASE[i % BASE.length];
            out.push({ src: b.src, alt: b.alt, caption: b.caption });
        }
        return out;
    }

    function has(text, words) {
        return words.some(function (w) { return text.indexOf(w) !== -1; });
    }

    // Pick a deterministic item based on text length (avoids random variance)
    function pickOne(text) {
        return BASE[text.length % BASE.length];
    }

    /**
     * @param {string} userText
     * @returns {{type:string}}
     */
    function getResponse(userText) {
        const t = (userText || '').toLowerCase();

        // 1) Location / map -> embed
        if (has(t, ['موقع', 'خريطة', 'خرائط', 'عنوان', 'مكان', 'فين', 'وين', 'map', 'location', 'address'])) {
            return {
                type: 'embed',
                text: 'هذا موقع العيادة على الخريطة 📍',
                embed: {
                    kind: 'map',
                    title: 'موقع العيادة',
                    caption: 'العيادة الطبية — القاهرة',
                    src: CONFIG.behavior.mapEmbed,
                    openUrl: CONFIG.behavior.mapOpenUrl
                }
            };
        }

        // 2) Album / grid -> gallery (with "+N" overflow)
        if (has(t, ['ألبوم', 'البوم', 'شبكة', 'كل الصور', 'جاليري', 'صور كثيرة', 'gallery', 'grid', 'album'])) {
            return {
                type: 'gallery',
                text: 'ألبوم النصائح الصحية — اضغط أي صورة لتكبيرها 👇',
                images: expand(14)
            };
        }

        // 3) Slider -> one image at a time, cross-fade + autoplay
        if (has(t, ['سلايدر', 'slider', 'شرائح', 'عرض تلقائي', 'تلقائي'])) {
            return {
                type: 'slider',
                text: 'عرض شرائح للنصائح (يعمل تلقائياً، ويتوقف عند المرور بالمؤشر) 🎞️',
                images: BASE.slice()
            };
        }

        // 4) Carousel -> side-by-side strip you scroll/drag
        if (has(t, ['معرض', 'كاروسيل', 'شريط', 'carousel'])) {
            return {
                type: 'carousel',
                text: 'إليك مجموعة نصائح — اسحب أفقياً أو اضغط أي صورة لتكبيرها 👈👉',
                images: BASE.slice()
            };
        }

        // 5) Single image / tip -> image + caption
        if (has(t, ['صورة', 'صوره', 'نصيحة', 'نصائح', 'شكل', 'image', 'photo', 'tip'])) {
            return {
                type: 'image',
                text: 'إليك نصيحة اليوم 🖼️ (اضغط الصورة لتكبيرها):',
                image: pickOne(t)
            };
        }

        // 6) Default -> text
        return {
            type: 'text',
            text: 'شكراً لاستفسارك. سأقوم بالرد عليك في أقرب وقت ممكن بمجرد معالجة طلبك.\n\nجرّب: "موقع العيادة"، "اعرض صورة"، "معرض الصور" (كاروسيل)، أو "ألبوم كل الصور".'
        };
    }

    return {
        get WELCOME() { return CONFIG.behavior.welcome; },
        get SUGGESTIONS() { return CONFIG.behavior.suggestions; },
        GALLERY: BASE,
        getResponse: getResponse
    };
})();
