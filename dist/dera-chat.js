/*!
 * DeraChat v1.1.0
 * A self-contained, themeable chat widget in a single file.
 * Shadow DOM isolation · options + events · 7 reply templates · RTL/LTR.
 *
 * @license MIT
 * @see https://github.com/Amrwebdeveloper/dera-chat
 *
 * UMD build: exposes `window.DeraChat`, with CommonJS and AMD support.
 */
(function (global, factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') module.exports = factory();
    else if (typeof define === 'function' && define.amd) define(factory);
    else global.DeraChat = factory();
}(typeof window !== 'undefined' ? window : this, function () {
    'use strict';

    var VERSION = '1.1.0';

    /* ===================================================================
       Styles (injected into each instance's shadow root)
       Theme values come from CSS variables set on :host.
       =================================================================== */
    var CSS = [
        ":host{",
        "  --dc-primary:#3b82f6; --dc-accent:#2dd4bf;",
        "  --dc-user-from:#3b82f6; --dc-user-to:#4f46e5;",
        "  --dc-bot-bg:rgba(255,255,255,.9); --dc-bot-text:#1f2937;",
        "  --dc-radius:24px; --dc-bubble-radius:16px;",
        "  --dc-width:380px; --dc-height:70vh;",
        "  --dc-edge:1.5rem; --dc-fab:4rem; --dc-fab-bottom:1.5rem;",
        "  --dc-fab-radius:9999px; --dc-send-radius:9999px; --dc-send-rotate:-90deg;",
        "  --dc-carousel-item:88%; --dc-gallery-cols:3;",
        "  --dc-font:'Cairo','Segoe UI',Tahoma,system-ui,sans-serif;",
        "  --dc-gray-100:#f3f4f6; --dc-gray-400:#9ca3af; --dc-gray-500:#6b7280; --dc-gray-700:#374151; --dc-gray-800:#1f2937;",
        "  --dc-blue-50:#eff6ff; --dc-red-50:#fef2f2; --dc-red-400:#f87171; --dc-red-500:#ef4444; --dc-red-600:#dc2626;",
        "  --dc-green-400:#4ade80; --dc-green-500:#22c55e; --dc-green-600:#16a34a;",
        "  --dc-shadow-md:0 4px 6px -1px rgba(0,0,0,.1),0 2px 4px -2px rgba(0,0,0,.1);",
        "  --dc-shadow-lg:0 10px 15px -3px rgba(0,0,0,.1),0 4px 6px -4px rgba(0,0,0,.1);",
        "  --dc-shadow-xl:0 20px 25px -5px rgba(0,0,0,.1),0 8px 10px -6px rgba(0,0,0,.1);",
        "  --dc-shadow-2xl:0 25px 50px -12px rgba(0,0,0,.25);",
        "}",
        "*,*::before,*::after{box-sizing:border-box;}",
        "button{font-family:inherit;cursor:pointer;border:none;background:none;color:inherit;}",
        ".dc{font-family:var(--dc-font);-webkit-font-smoothing:antialiased;line-height:1.6;}",
        ".icon{display:inline-block;flex-shrink:0;stroke:currentColor;fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;}",
        ".icon-sm{width:1rem;height:1rem;} .icon-md{width:1.25rem;height:1.25rem;} .icon-lg{width:1.5rem;height:1.5rem;} .icon-xl{width:2rem;height:2rem;}",
        ".is-hidden{display:none !important;}",
        ".sr-only{position:absolute !important;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0;}",

        /* edge placement */
        ":host([data-side='left']) .cta,:host([data-side='left']) .fab,:host([data-side='left']) .widget{left:var(--dc-edge);right:auto;}",
        ":host([data-side='right']) .cta,:host([data-side='right']) .fab,:host([data-side='right']) .widget{right:var(--dc-edge);left:auto;}",
        ":host([data-side='left']) .widget{transform-origin:bottom left;} :host([data-side='right']) .widget{transform-origin:bottom right;}",
        ":host([data-side='left']) .cta__arrow{left:1.5rem;right:auto;} :host([data-side='right']) .cta__arrow{right:1.5rem;left:auto;}",

        /* CTA */
        ".cta{position:fixed;bottom:calc(var(--dc-fab-bottom) + var(--dc-fab) + 1.5rem);width:16rem;z-index:2147483640;display:flex;align-items:flex-start;gap:.75rem;padding:1rem;background:rgba(255,255,255,.9);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);border:1px solid #dbeafe;border-radius:1rem;box-shadow:var(--dc-shadow-xl);font-family:var(--dc-font);}",
        ".cta__text{font-size:.875rem;color:var(--dc-gray-700);font-weight:700;line-height:1.6;margin-top:.25rem;}",
        ".cta__close{color:var(--dc-gray-400);flex-shrink:0;transition:color .2s;} .cta__close:hover{color:var(--dc-red-500);}",
        ".cta__arrow{position:absolute;bottom:-.5rem;width:1rem;height:1rem;background:rgba(255,255,255,.9);border-bottom:1px solid #dbeafe;border-right:1px solid #dbeafe;transform:rotate(45deg);}",

        /* FAB */
        ".fab{position:fixed;bottom:var(--dc-fab-bottom);width:var(--dc-fab);height:var(--dc-fab);z-index:2147483641;display:flex;align-items:center;justify-content:center;color:#fff;border-radius:var(--dc-fab-radius);background:linear-gradient(to right,var(--dc-primary),var(--dc-accent));box-shadow:var(--dc-shadow-2xl);transition:transform .3s,box-shadow .3s;}",
        ".fab:hover{transform:scale(1.05);}",
        ".fab:hover .fab__icon--open{transform:rotate(-12deg);} .fab:hover .fab__icon--close{transform:translateY(.25rem);} .fab__icon{transition:transform .3s;}",
        ".fab__badge{position:absolute;top:-.25rem;right:-.25rem;width:1.5rem;height:1.5rem;display:flex;align-items:center;justify-content:center;font-size:.75rem;font-weight:700;color:#fff;background:var(--dc-red-500);border:2px solid #fff;border-radius:9999px;box-shadow:var(--dc-shadow-md);transform:scale(0);transition:transform .3s;}",
        ".fab__badge.is-visible{transform:scale(1);}",
        ".fab__img{width:100%;height:100%;object-fit:cover;border-radius:inherit;}",

        /* widget */
        ".widget{position:fixed;bottom:calc(var(--dc-fab-bottom) + var(--dc-fab) + 1.5rem);width:90vw;max-width:var(--dc-width);height:var(--dc-height);z-index:2147483641;display:flex;flex-direction:column;overflow:hidden;background:rgba(255,255,255,.45);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border:1px solid rgba(255,255,255,.6);border-radius:var(--dc-radius);box-shadow:0 12px 40px 0 rgba(31,38,135,.12);transform:scale(0);opacity:0;pointer-events:none;font-family:var(--dc-font);transition:transform .4s cubic-bezier(.4,0,.2,1),opacity .4s,width .4s,height .4s,bottom .4s,left .4s,right .4s;}",
        ".widget.is-open{transform:scale(1);opacity:1;pointer-events:auto;}",
        ".widget.is-fullscreen{width:95vw;max-width:95vw;height:90vh;bottom:5vh;left:2.5vw;right:2.5vw;}",

        /* header */
        ".header{position:relative;z-index:10;display:flex;align-items:center;gap:1rem;padding:1rem 1.5rem;background:rgba(255,255,255,.5);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);border-bottom:1px solid rgba(255,255,255,.5);}",
        ".avatar{position:relative;}",
        ".avatar__circle{width:3rem;height:3rem;display:flex;align-items:center;justify-content:center;color:#fff;border-radius:9999px;overflow:hidden;background:linear-gradient(to top right,var(--dc-primary),var(--dc-accent));box-shadow:var(--dc-shadow-lg);}",
        ".avatar__img{width:100%;height:100%;object-fit:cover;}",
        ".avatar__status{position:absolute;bottom:0;right:0;width:.875rem;height:.875rem;background:var(--dc-green-500);border:2px solid #fff;border-radius:9999px;}",
        ".title{margin:0;font-size:1.125rem;font-weight:700;color:var(--dc-gray-800);}",
        ".subtitle{margin:0;font-size:.75rem;font-weight:600;color:var(--dc-green-600);display:flex;align-items:center;gap:.25rem;}",
        ".pulse{position:relative;display:inline-flex;width:.5rem;height:.5rem;}",
        ".pulse__ping{position:absolute;inline-size:100%;block-size:100%;border-radius:9999px;background:var(--dc-green-400);opacity:.75;animation:dc-ping 1s cubic-bezier(0,0,.2,1) infinite;}",
        ".pulse__dot{position:relative;display:inline-flex;width:.5rem;height:.5rem;border-radius:9999px;background:var(--dc-green-500);}",
        ".actions{margin-inline-start:auto;display:flex;align-items:center;gap:.25rem;}",
        ".menu{position:relative;}",
        ".menu__btn{padding:.5rem;color:var(--dc-gray-500);border-radius:9999px;transition:background-color .2s;} .menu__btn:hover{background:rgba(255,255,255,.6);}",
        ".dropdown{position:absolute;inset-inline-end:0;top:100%;margin-top:.5rem;width:12rem;max-width:calc(var(--dc-width) - 2rem);z-index:20;overflow:hidden;background:rgba(255,255,255,.95);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);border:1px solid var(--dc-gray-100);border-radius:.75rem;box-shadow:var(--dc-shadow-xl);}",
        ".dropdown.is-hidden{display:none;}",
        ".dropdown__item{width:100%;display:flex;align-items:center;justify-content:space-between;padding:.75rem 1rem;font-size:.875rem;text-align:start;color:var(--dc-gray-700);transition:background-color .15s;} .dropdown__item:hover{background:var(--dc-blue-50);}",
        ".dropdown__item .icon{color:var(--dc-gray-400);} .dropdown__item:hover .icon{color:var(--dc-primary);}",
        ".dropdown__item--danger{color:var(--dc-red-600);} .dropdown__item--danger .icon{color:var(--dc-red-400);} .dropdown__item--danger:hover{background:var(--dc-red-50);}",

        /* messages */
        ".messages{flex:1 1 auto;overflow-y:auto;display:flex;flex-direction:column;gap:1.5rem;padding:1.5rem;background:rgba(255,255,255,.2);}",
        ".messages::-webkit-scrollbar{width:6px;} .messages::-webkit-scrollbar-thumb{background:rgba(156,163,175,.5);border-radius:10px;}",
        ".row{display:flex;width:100%;animation:dc-in .25s ease;}",
        ".row--user{justify-content:flex-start;} .row--bot{justify-content:flex-end;} .row--chips{justify-content:flex-end;}",
        ".bubble{max-width:85%;padding:.875rem 1.25rem;font-size:.9rem;line-height:1.6;border-radius:var(--dc-bubble-radius);white-space:pre-wrap;overflow-wrap:anywhere;word-break:break-word;}",
        ".bubble--user{color:#fff;background:linear-gradient(to bottom left,var(--dc-user-from),var(--dc-user-to));border-top-right-radius:0;box-shadow:var(--dc-shadow-md);}",
        ".bubble--bot{color:var(--dc-bot-text);background:var(--dc-bot-bg);backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px);border:1px solid rgba(255,255,255,.6);border-top-left-radius:0;box-shadow:0 1px 2px 0 rgba(0,0,0,.05);}",
        ".bubble--media{max-width:100%;width:100%;padding:.7rem;}",
        ".typing-cursor::after{content:'|';margin-inline-start:2px;color:var(--dc-primary);animation:dc-blink 1s step-end infinite;}",
        ".bubble.typing{display:inline-flex;align-items:center;gap:.3rem;padding:.95rem 1.1rem;}",
        ".typing__dot{width:.5rem;height:.5rem;border-radius:9999px;background:var(--dc-gray-400);animation:dc-bounce 1.2s infinite ease-in-out;}",
        ".typing__dot:nth-child(2){animation-delay:.15s;} .typing__dot:nth-child(3){animation-delay:.3s;}",
        ".lead{margin:0 0 .6rem;font-size:.9rem;line-height:1.6;color:var(--dc-bot-text);white-space:pre-wrap;overflow-wrap:anywhere;}",

        /* chips */
        ".chips{display:flex;flex-wrap:wrap;gap:.5rem;justify-content:flex-end;max-width:100%;}",
        ".chip{font-family:inherit;font-size:.8rem;font-weight:600;color:var(--dc-primary);background:rgba(255,255,255,.85);border:1px solid rgba(59,130,246,.25);border-radius:9999px;padding:.4rem .85rem;cursor:pointer;transition:all .2s;}",
        ".chip:hover{background:var(--dc-primary);color:#fff;transform:translateY(-1px);}",

        /* single image */
        ".m-img{margin:0;}",
        ".m-img__btn{display:block;width:100%;padding:0;border:none;background:none;cursor:zoom-in;border-radius:.75rem;overflow:hidden;line-height:0;}",
        ".m-img__el{display:block;width:100%;aspect-ratio:4/3;object-fit:cover;transition:transform .35s;}",
        ".m-img__btn:hover .m-img__el{transform:scale(1.04);}",
        ".m-img__cap{margin:.55rem .15rem .1rem;font-size:.8rem;line-height:1.5;color:var(--dc-gray-500);text-align:start;}",

        /* embed */
        ".m-embed{position:relative;width:100%;aspect-ratio:16/10;border-radius:.75rem;overflow:hidden;background:var(--dc-gray-100);}",
        "@supports not (aspect-ratio:1/1){.m-embed{height:0;padding-top:62.5%;}}",
        ".m-embed__frame{position:absolute;inset:0;width:100%;height:100%;border:0;}",
        ".m-embed__open{display:inline-flex;align-items:center;gap:.4rem;margin-top:.6rem;padding:.5rem .9rem;font-size:.82rem;font-weight:600;text-decoration:none;color:#fff;background:linear-gradient(to right,var(--dc-primary),var(--dc-user-to));border-radius:9999px;box-shadow:var(--dc-shadow-md);transition:transform .15s;}",
        ".m-embed__open:hover{transform:translateY(-1px);}",

        /* carousel */
        ".carousel{position:relative;}",
        ".carousel__vp{display:flex;gap:.6rem;overflow-x:auto;scroll-snap-type:x mandatory;scrollbar-width:none;touch-action:pan-y;cursor:grab;}",
        ".carousel__vp::-webkit-scrollbar{display:none;} .carousel__vp.is-grab{cursor:grabbing;}",
        ".carousel__item{flex:0 0 var(--dc-carousel-item);scroll-snap-align:start;}",
        ".carousel__card{display:block;width:100%;padding:0;border:none;background:none;cursor:zoom-in;border-radius:.75rem;overflow:hidden;line-height:0;}",
        ".carousel__img{display:block;width:100%;aspect-ratio:4/3;object-fit:cover;transition:transform .35s;user-select:none;-webkit-user-drag:none;}",
        ".carousel__card:hover .carousel__img{transform:scale(1.04);}",
        ".carousel__cap{margin:.55rem .15rem .1rem;font-size:.8rem;color:var(--dc-gray-500);text-align:start;}",
        ".carousel__btn{position:absolute;top:38%;transform:translateY(-50%);z-index:2;width:2.4rem;height:2.4rem;display:flex;align-items:center;justify-content:center;color:var(--dc-gray-700);background:rgba(255,255,255,.92);border-radius:9999px;box-shadow:var(--dc-shadow-md);backdrop-filter:blur(4px);transition:opacity .2s,background-color .2s;}",
        ".carousel__btn:hover{background:#fff;} .carousel__btn:disabled{opacity:0;pointer-events:none;}",
        ".carousel__btn--prev{inset-inline-start:.5rem;} .carousel__btn--next{inset-inline-end:.5rem;}",
        ".carousel__dots{display:flex;justify-content:center;gap:.4rem;margin-top:.6rem;}",
        ".carousel__dot{width:.5rem;height:.5rem;padding:0;border:none;border-radius:9999px;background:var(--dc-gray-400);opacity:.5;cursor:pointer;transition:width .25s,opacity .25s,background-color .25s;}",
        ".carousel__dot.is-active{width:1.15rem;opacity:1;background:var(--dc-primary);}",

        /* slider */
        ".slider{position:relative;}",
        ".slider__track{position:relative;width:100%;aspect-ratio:4/3;border-radius:.75rem;overflow:hidden;background:var(--dc-gray-100);touch-action:pan-y;cursor:grab;}",
        ".slider__track:active{cursor:grabbing;}",
        ".slider__slide{position:absolute;inset:0;opacity:0;pointer-events:none;transition:opacity .6s ease;}",
        ".slider__slide.is-active{opacity:1;pointer-events:auto;}",
        ".slider__btn-img{display:block;width:100%;height:100%;padding:0;border:none;background:none;cursor:zoom-in;line-height:0;}",
        ".slider__img{display:block;width:100%;height:100%;object-fit:cover;user-select:none;-webkit-user-drag:none;}",
        ".slider__cap{position:absolute;inset-inline:0;bottom:0;padding:.7rem .9rem;font-size:.85rem;color:#fff;text-align:start;background:linear-gradient(to top,rgba(0,0,0,.7),transparent);}",
        ".slider__btn{position:absolute;top:50%;transform:translateY(-50%);z-index:2;width:2.4rem;height:2.4rem;display:flex;align-items:center;justify-content:center;color:var(--dc-gray-700);background:rgba(255,255,255,.92);border-radius:9999px;box-shadow:var(--dc-shadow-md);backdrop-filter:blur(4px);}",
        ".slider__btn:hover{background:#fff;} .slider__btn--prev{inset-inline-start:.5rem;} .slider__btn--next{inset-inline-end:.5rem;}",
        ".slider__dots{display:flex;justify-content:center;gap:.4rem;margin-top:.6rem;}",
        ".slider__dot{width:.5rem;height:.5rem;padding:0;border:none;border-radius:9999px;background:var(--dc-gray-400);opacity:.5;cursor:pointer;transition:width .25s,opacity .25s;}",
        ".slider__dot.is-active{width:1.15rem;opacity:1;background:var(--dc-primary);}",

        /* gallery */
        ".gallery{display:grid;grid-template-columns:repeat(var(--dc-gallery-cols),1fr);gap:.4rem;}",
        ".gallery__cell{position:relative;padding:0;border:none;background:none;cursor:zoom-in;border-radius:.5rem;overflow:hidden;line-height:0;aspect-ratio:1/1;}",
        ".gallery__img{display:block;width:100%;height:100%;object-fit:cover;transition:transform .35s;user-select:none;-webkit-user-drag:none;}",
        ".gallery__cell:hover .gallery__img{transform:scale(1.06);}",
        ".gallery__more{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;color:#fff;font-size:1.3rem;font-weight:700;background:rgba(15,23,42,.55);backdrop-filter:blur(2px);}",

        /* files (downloadable attachments) */
        ".m-files{display:flex;flex-direction:column;gap:.5rem;}",
        ".m-file{display:flex;align-items:center;gap:.75rem;padding:.6rem .7rem;background:rgba(255,255,255,.75);border:1px solid var(--dc-gray-100);border-radius:.65rem;}",
        ".m-file__ic{width:2.6rem;height:2.6rem;flex-shrink:0;display:grid;place-items:center;border-radius:.5rem;color:#fff;font-size:.6rem;font-weight:800;}",
        ".m-file__meta{flex:1;min-width:0;}",
        ".m-file__name{font-size:.85rem;font-weight:600;color:var(--dc-gray-800);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}",
        ".m-file__size{font-size:.72rem;color:var(--dc-gray-500);}",
        ".m-file__dl{flex-shrink:0;width:2.2rem;height:2.2rem;display:flex;align-items:center;justify-content:center;color:var(--dc-primary);background:var(--dc-blue-50);border-radius:9999px;transition:background-color .2s,transform .15s;}",
        ".m-file__dl:hover{background:var(--dc-primary);color:#fff;transform:translateY(-1px);}",

        /* rtl mirror */
        ":host([dir='rtl']) .carousel__icon,:host([dir='rtl']) .slider__icon,:host([dir='rtl']) .history__icon,:host([dir='rtl']) .lightbox__nav .icon{transform:scaleX(-1);}",

        /* composer */
        ".composer{padding:1rem;z-index:10;background:rgba(255,255,255,.4);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);border-top:1px solid rgba(255,255,255,.5);}",
        ".composer__form{display:flex;align-items:flex-end;gap:.75rem;padding:.5rem;background:rgba(255,255,255,.7);border:1px solid #fff;border-radius:24px;box-shadow:var(--dc-shadow-md);transition:box-shadow .2s;}",
        ".composer__form:focus-within{box-shadow:var(--dc-shadow-lg),0 0 0 2px #dbeafe;}",
        ".composer__attach{padding:.5rem;margin-bottom:.125rem;color:var(--dc-gray-400);border-radius:9999px;transition:color .2s,background-color .2s;} .composer__attach:hover{color:var(--dc-primary);background:var(--dc-blue-50);}",
        ".composer__input{flex:1 1 auto;background:transparent;border:none;outline:none;resize:none;max-height:120px;min-height:24px;padding:.5rem;font-family:inherit;font-size:.9rem;line-height:1.6;color:var(--dc-gray-700);scrollbar-width:thin;}",
        ".composer__input::placeholder{color:var(--dc-gray-400);}",
        ".composer__send{width:2.75rem;height:2.75rem;margin-bottom:.125rem;flex-shrink:0;display:flex;align-items:center;justify-content:center;color:#fff;border-radius:var(--dc-send-radius);background:linear-gradient(to right,var(--dc-primary),var(--dc-user-to));box-shadow:var(--dc-shadow-md);transform:rotate(var(--dc-send-rotate));transition:transform .3s,box-shadow .3s;}",
        ".composer__send:hover{box-shadow:var(--dc-shadow-lg);transform:rotate(var(--dc-send-rotate)) scale(1.05);}",
        ".composer__send .icon{margin:0;}",

        /* history panel */
        ".history{position:absolute;inset:0;z-index:30;display:flex;flex-direction:column;background:rgba(255,255,255,.97);backdrop-filter:blur(12px);animation:dc-in .25s ease;}",
        ".history.is-hidden{display:none;}",
        ".history__head{display:flex;align-items:center;gap:.75rem;padding:1rem 1.25rem;border-bottom:1px solid var(--dc-gray-100);}",
        ".history__back{padding:.4rem;color:var(--dc-gray-500);border-radius:9999px;} .history__back:hover{background:var(--dc-gray-100);}",
        ".history__title{margin:0;flex:1;font-size:1rem;font-weight:700;color:var(--dc-gray-800);}",
        ".history__new{font-size:.8rem;font-weight:600;color:var(--dc-primary);padding:.35rem .75rem;border:1px solid rgba(59,130,246,.3);border-radius:9999px;}",
        ".history__list{flex:1;overflow-y:auto;padding:.5rem;}",
        ".history__item{width:100%;display:flex;align-items:center;gap:.75rem;padding:.75rem;border:none;background:none;border-radius:.75rem;text-align:start;cursor:pointer;transition:background-color .15s;} .history__item:hover{background:var(--dc-blue-50);}",
        ".history__avatar{width:2.5rem;height:2.5rem;flex-shrink:0;display:flex;align-items:center;justify-content:center;color:#fff;border-radius:9999px;background:linear-gradient(to top right,var(--dc-primary),var(--dc-accent));}",
        ".history__meta{flex:1;min-width:0;} .history__name{font-size:.9rem;font-weight:700;color:var(--dc-gray-800);} .history__preview{font-size:.8rem;color:var(--dc-gray-500);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}",
        ".history__time{font-size:.7rem;color:var(--dc-gray-400);flex-shrink:0;}",

        /* lightbox (lives in shadow) */
        ".lightbox{position:fixed;inset:0;z-index:2147483646;display:flex;align-items:center;justify-content:center;opacity:0;transition:opacity .25s;}",
        ".lightbox[hidden]{display:none;} .lightbox.is-open{opacity:1;}",
        ".lightbox__bd{position:absolute;inset:0;background:rgba(15,23,42,.92);backdrop-filter:blur(4px);}",
        ".lightbox__stage{position:relative;z-index:1;max-width:92vw;max-height:80vh;display:flex;align-items:center;justify-content:center;overflow:hidden;}",
        ".lightbox__img{max-width:92vw;max-height:80vh;object-fit:contain;border-radius:.5rem;box-shadow:0 20px 60px rgba(0,0,0,.5);cursor:zoom-in;user-select:none;-webkit-user-drag:none;transform:translate(var(--lb-x,0),var(--lb-y,0)) scale(var(--lb-zoom,1));transition:transform .2s;}",
        ".lightbox__img.is-zoomed{cursor:grab;} .lightbox__img.is-panning{cursor:grabbing;transition:none;}",
        ".lightbox__close,.lightbox__nav,.lightbox__tool{position:absolute;z-index:3;display:flex;align-items:center;justify-content:center;color:#fff;background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.25);border-radius:9999px;transition:background-color .2s;}",
        ".lightbox__close:hover,.lightbox__nav:hover,.lightbox__tool:hover{background:rgba(255,255,255,.28);}",
        ".lightbox__close{top:1rem;inset-inline-end:1rem;width:2.75rem;height:2.75rem;}",
        ".lightbox__nav{top:50%;transform:translateY(-50%);width:3rem;height:3rem;} .lightbox__nav[hidden]{display:none;} .lightbox__nav--prev{inset-inline-start:1rem;} .lightbox__nav--next{inset-inline-end:1rem;}",
        ".lightbox__tools{position:absolute;top:1rem;inset-inline-start:1rem;z-index:3;display:flex;gap:.5rem;} .lightbox__tool{position:static;width:2.75rem;height:2.75rem;}",
        ".lightbox__bar{position:absolute;inset-inline:0;bottom:1.1rem;z-index:3;display:flex;flex-direction:column;align-items:center;gap:.25rem;padding:0 1rem;color:#fff;pointer-events:none;}",
        ".lightbox__counter{font-size:.85rem;font-weight:700;opacity:.85;} .lightbox__caption{font-size:.92rem;text-align:center;max-width:80vw;}",

        /* keyframes */
        "@keyframes dc-blink{50%{opacity:0;}}",
        "@keyframes dc-ping{75%,100%{transform:scale(2);opacity:0;}}",
        "@keyframes dc-in{from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:translateY(0);}}",
        "@keyframes dc-bounce{0%,60%,100%{transform:translateY(0);opacity:.5;}30%{transform:translateY(-5px);opacity:1;}}",
        "@media(prefers-reduced-motion:reduce){*,*::before,*::after{animation-duration:.001ms !important;transition-duration:.001ms !important;}}"
    ].join("\n");

    /* ===================================================================
       Icons
       =================================================================== */
    var ICONS = {
        message: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
        chat: '<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>',
        bot: '<path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/>',
        help: '<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/>',
        sparkles: '<path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/>',
        headset: '<path d="M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H4a1 1 0 0 1-1-1v-7a9 9 0 0 1 18 0v7a1 1 0 0 1-1 1h-2a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3"/>',
        chevronDown: '<path d="m6 9 6 6 6-6"/>',
        chevronLeft: '<path d="m15 18-6-6 6-6"/>',
        chevronRight: '<path d="m9 18 6-6-6-6"/>',
        chevronUp: '<path d="m18 15-6-6-6 6"/>',
        x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
        moreVertical: '<circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/>',
        maximize: '<path d="M8 3H5a2 2 0 0 0-2 2v3"/><path d="M21 8V5a2 2 0 0 0-2-2h-3"/><path d="M3 16v3a2 2 0 0 0 2 2h3"/><path d="M16 21h3a2 2 0 0 0 2-2v-3"/>',
        minimize: '<path d="M8 3v3a2 2 0 0 1-2 2H3"/><path d="M21 8h-3a2 2 0 0 1-2-2V3"/><path d="M3 16h3a2 2 0 0 1 2 2v3"/><path d="M16 21v-3a2 2 0 0 1 2-2h3"/>',
        paperclip: '<path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48"/>',
        send: '<path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/>',
        sendHorizontal: '<path d="M3.7 3a.5.5 0 0 0-.7.6l2.8 7.6a2 2 0 0 1 0 1.4L3 20.4a.5.5 0 0 0 .7.6l18-8.5a.5.5 0 0 0 0-.9z"/><path d="M6 12h16"/>',
        arrow: '<path d="m5 12 7-7 7 7"/><path d="M12 19V5"/>',
        plus: '<path d="M5 12h14"/><path d="M12 5v14"/>',
        history: '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l4 2"/>',
        trash: '<path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/>',
        power: '<path d="M12 2v10"/><path d="M18.4 6.6a9 9 0 1 1-12.77.04"/>',
        zoomIn: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/><path d="M11 8v6"/><path d="M8 11h6"/>',
        zoomOut: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/><path d="M8 11h6"/>',
        reset: '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>',
        externalLink: '<path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>',
        file: '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v6h6"/>',
        download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5"/><path d="M12 15V3"/>'
    };
    var FAB_ICON = { message: 'message', chat: 'chat', bot: 'bot', help: 'help', sparkles: 'sparkles', headset: 'headset' };
    var SEND_ICON = { send: 'send', sendHorizontal: 'sendHorizontal', arrow: 'arrow', chevron: 'chevronUp' };
    var SHAPE = { round: '9999px', rounded: '1.25rem', square: '0.6rem' };

    /* ===================================================================
       Defaults
       =================================================================== */
    var DEFAULTS = {
        el: null,                 // mount target (selector or element); default document.body
        dir: 'ltr',               // 'rtl' | 'ltr'
        open: false,              // start opened
        theme: {
            primary: '#3b82f6', accent: '#2dd4bf',
            userBubble: null,     // [from,to]
            botBubbleBg: null, botBubbleText: null,
            radius: '24px', bubbleRadius: '16px',
            font: null, fontUrl: null
        },
        layout: { side: 'left', edge: '1.5rem', width: '380px', height: '70vh', fabSize: '4rem', fabBottom: '1.5rem' },
        fab: { icon: 'message', shape: 'round', image: '' },
        send: { icon: 'send', shape: 'round', rotate: true },
        identity: { name: 'Assistant', status: 'Online', avatar: '' },
        features: { cta: true, attachButton: true, fullscreenButton: true, suggestions: true, newConversation: true, history: true, mapOpenButton: true },
        behavior: {
            cta: 'Hi! Have a question? We are here to help!',
            welcome: 'Hello! How can I help you today?',
            placeholder: 'Type your message…',
            typeSpeed: 22, botReplyDelay: 600,
            suggestions: [],
            carousel: { itemBasis: '88%' },
            slider: { autoplay: true, interval: 3800 },
            gallery: { columns: 3, maxVisible: 6 }
        },
        strings: {
            options: 'Options', newConversation: 'New conversation', history: 'Chat history',
            fullscreen: 'Fullscreen', exitFullscreen: 'Exit fullscreen', clear: 'Clear chat',
            close: 'Close chat', back: 'Back', newShort: '+ New', attach: 'Attach file',
            send: 'Send', closeCta: 'Close', openMap: 'Open map in a new tab',
            zoomIn: 'Zoom in', zoomOut: 'Zoom out', resetZoom: 'Reset', prev: 'Previous', next: 'Next',
            enlarge: 'Tap to enlarge', historyEmpty: 'No previous conversations'
        },
        history: [],              // seed history entries (UI only): {name, preview, time}
        onMessage: null,          // async (text, ctx) => response  — wire your AI/API here
        responder: null,          // alias for onMessage
        responses: null,          // { "kw1|kw2": template, "*": fallback }  — static bot
        endpoint: null            // POST {message, history} -> returns a response template (e.g. an AI backend)
    };

    /* ===================================================================
       Helpers
       =================================================================== */
    function isObj(v) { return v && typeof v === 'object' && !Array.isArray(v); }
    function deepMerge(base, over) {
        var out = Array.isArray(base) ? base.slice() : Object.assign({}, base);
        if (!over) return out;
        Object.keys(over).forEach(function (k) {
            out[k] = isObj(over[k]) && isObj(base ? base[k] : null) ? deepMerge(base[k], over[k]) : over[k];
        });
        return out;
    }
    function reducedMotion() { return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches); }
    function safeUrl(u, allowData) {
        if (typeof u !== 'string') return '';
        var s = u.trim();
        if (/^(https:\/\/|\/|\.\/|\.\.\/|assets\/)/i.test(s)) return s;
        if (allowData && /^data:image\//i.test(s)) return s;
        if (!/^[a-z][a-z0-9+.-]*:/i.test(s)) return s;
        return '';
    }
    function svgEl(pathHtml, cls) {
        var s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        s.setAttribute('viewBox', '0 0 24 24'); s.setAttribute('aria-hidden', 'true');
        s.setAttribute('class', cls || 'icon'); s.innerHTML = pathHtml; return s;
    }
    function h(tag, attrs, kids) {
        var e = document.createElement(tag);
        if (attrs) Object.keys(attrs).forEach(function (k) {
            var v = attrs[k];
            if (v == null) return;
            if (k === 'class') e.className = v;
            else if (k === 'text') e.textContent = v;
            else if (k.slice(0, 2) === 'on') e.addEventListener(k.slice(2).toLowerCase(), v);
            else e.setAttribute(k, v);
        });
        (kids || []).forEach(function (c) { if (c != null) e.appendChild(typeof c === 'string' ? document.createTextNode(c) : c); });
        return e;
    }
    function iconBtn(cls, label, iconKey, onClick) {
        var b = h('button', { type: 'button', 'class': cls, 'aria-label': label, title: label, onclick: onClick });
        b.appendChild(svgEl(ICONS[iconKey], 'icon icon-md'));
        return b;
    }

    /* ===================================================================
       Lightbox (per instance, lives inside the shadow root)
       =================================================================== */
    function createLightbox(inst) {
        var S = inst.options.strings, items = [], index = 0;
        var zoom = 1, panX = 0, panY = 0, panning = false, sx = 0, sy = 0, spx = 0, spy = 0, lastFocus = null;
        var img = h('img', { 'class': 'lightbox__img', alt: '' });
        var stage = h('div', { 'class': 'lightbox__stage' }, [img]);
        var counter = h('span', { 'class': 'lightbox__counter' });
        var caption = h('span', { 'class': 'lightbox__caption' });
        var zin = iconBtn('lightbox__tool', S.zoomIn, 'zoomIn', function (e) { e.stopPropagation(); setZoom(zoom + 0.5); });
        var zout = iconBtn('lightbox__tool', S.zoomOut, 'zoomOut', function (e) { e.stopPropagation(); setZoom(zoom - 0.5); });
        var zres = iconBtn('lightbox__tool', S.resetZoom, 'reset', function (e) { e.stopPropagation(); resetZoom(); });
        var closeBtn = iconBtn('lightbox__close', S.close, 'x', function (e) { e.stopPropagation(); close(); });
        var prevBtn = iconBtn('lightbox__nav lightbox__nav--prev', S.prev, 'chevronLeft', function (e) { e.stopPropagation(); prev(); });
        var nextBtn = iconBtn('lightbox__nav lightbox__nav--next', S.next, 'chevronRight', function (e) { e.stopPropagation(); next(); });
        var el = h('div', { 'class': 'lightbox', role: 'dialog', 'aria-modal': 'true', hidden: '' }, [
            h('div', { 'class': 'lightbox__bd', onclick: close }), stage,
            h('div', { 'class': 'lightbox__tools' }, [zin, zout, zres]),
            closeBtn, prevBtn, nextBtn, h('div', { 'class': 'lightbox__bar' }, [counter, caption])
        ]);
        inst.root.appendChild(el);

        function isRTL() { return inst.host.getAttribute('dir') === 'rtl'; }
        function applyT() { img.style.setProperty('--lb-zoom', zoom); img.style.setProperty('--lb-x', panX + 'px'); img.style.setProperty('--lb-y', panY + 'px'); img.classList.toggle('is-zoomed', zoom > 1); }
        function clampPan() { var r = img.getBoundingClientRect(); var mx = Math.max(0, (r.width * (zoom - 1)) / 2) / zoom, my = Math.max(0, (r.height * (zoom - 1)) / 2) / zoom; panX = Math.min(Math.max(panX, -mx), mx); panY = Math.min(Math.max(panY, -my), my); }
        function setZoom(z) { zoom = Math.min(Math.max(z, 1), 4); if (zoom <= 1) { panX = 0; panY = 0; } else clampPan(); applyT(); }
        function resetZoom() { zoom = 1; panX = 0; panY = 0; applyT(); }
        function render() { var it = items[index] || {}; resetZoom(); img.setAttribute('src', safeUrl(it.src, true)); img.setAttribute('alt', it.alt || ''); caption.textContent = it.caption || it.alt || ''; var multi = items.length > 1; counter.textContent = multi ? (index + 1) + ' / ' + items.length : ''; prevBtn.hidden = !multi; nextBtn.hidden = !multi; }
        function open(images, start) { items = Array.isArray(images) ? images : [images]; index = Math.min(Math.max(start | 0, 0), items.length - 1); lastFocus = inst.shadow.activeElement; render(); el.hidden = false; document.body.style.overflow = 'hidden'; void el.offsetWidth; el.classList.add('is-open'); closeBtn.focus(); inst.emit('lightbox:open', { index: index, images: items }); }
        function close() { if (el.hidden) return; el.classList.remove('is-open'); document.body.style.overflow = ''; var done = function () { el.hidden = true; el.removeEventListener('transitionend', done); if (lastFocus && lastFocus.focus) lastFocus.focus(); }; el.addEventListener('transitionend', done); window.setTimeout(function () { if (!el.hidden) done(); }, 350); inst.emit('lightbox:close'); }
        function next() { if (items.length > 1) { index = (index + 1) % items.length; render(); inst.emit('lightbox:change', { index: index }); } }
        function prev() { if (items.length > 1) { index = (index - 1 + items.length) % items.length; render(); inst.emit('lightbox:change', { index: index }); } }
        img.addEventListener('click', function (e) { e.stopPropagation(); if (panning) return; setZoom(zoom > 1 ? 1 : 2); });
        img.addEventListener('wheel', function (e) { e.preventDefault(); setZoom(zoom + (e.deltaY < 0 ? 0.3 : -0.3)); }, { passive: false });
        function onPanMove(e) { if (!panning) return; panX = spx + (e.clientX - sx) / zoom; panY = spy + (e.clientY - sy) / zoom; clampPan(); applyT(); }
        function onPanUp() { if (panning) { panning = false; img.classList.remove('is-panning'); } }
        function onKey(e) { if (el.hidden) return; if (e.key === 'Escape') { e.preventDefault(); close(); } else if (e.key === 'ArrowRight') { e.preventDefault(); isRTL() ? prev() : next(); } else if (e.key === 'ArrowLeft') { e.preventDefault(); isRTL() ? next() : prev(); } }
        img.addEventListener('pointerdown', function (e) { if (zoom <= 1) return; panning = true; sx = e.clientX; sy = e.clientY; spx = panX; spy = panY; img.classList.add('is-panning'); });
        window.addEventListener('pointermove', onPanMove);
        window.addEventListener('pointerup', onPanUp);
        document.addEventListener('keydown', onKey);
        function destroy() { window.removeEventListener('pointermove', onPanMove); window.removeEventListener('pointerup', onPanUp); document.removeEventListener('keydown', onKey); }
        return { open: open, close: close, el: el, destroy: destroy };
    }

    /* ===================================================================
       Carousel (side-by-side strip)
       =================================================================== */
    function createCarousel(inst, images, onClick) {
        var imgs = Array.isArray(images) ? images : [], itemEls = [];
        var root = h('div', { 'class': 'carousel', tabindex: '0', role: 'group', 'aria-label': 'Image carousel' });
        var vp = h('div', { 'class': 'carousel__vp' });
        var dragging = false, dragMoved = false, startX = 0, startScroll = 0;
        imgs.forEach(function (it, i) {
            var item = h('div', { 'class': 'carousel__item' }); itemEls.push(item);
            var card = h('button', { type: 'button', 'class': 'carousel__card', 'aria-label': (it.caption || it.alt || 'Image') + ' — ' + inst.options.strings.enlarge, onclick: function () { if (dragMoved) return; onClick(i); } });
            card.appendChild(h('img', { 'class': 'carousel__img', src: safeUrl(it.src, true), alt: it.alt || '', loading: 'lazy' }));
            item.appendChild(card);
            if (it.caption) item.appendChild(h('p', { 'class': 'carousel__cap', text: it.caption }));
            vp.appendChild(item);
        });
        var prevBtn = iconBtn('carousel__btn carousel__btn--prev', inst.options.strings.prev, 'chevronLeft', function () { step(-1); });
        prevBtn.querySelector('svg').setAttribute('class', 'icon icon-md carousel__icon');
        var nextBtn = iconBtn('carousel__btn carousel__btn--next', inst.options.strings.next, 'chevronRight', function () { step(1); });
        nextBtn.querySelector('svg').setAttribute('class', 'icon icon-md carousel__icon');
        var dots = h('div', { 'class': 'carousel__dots' });
        var dotEls = imgs.map(function (_, i) { var d = h('button', { type: 'button', 'class': 'carousel__dot', 'aria-label': 'Image ' + (i + 1), onclick: function () { goTo(i); } }); dots.appendChild(d); return d; });
        root.appendChild(vp);
        if (imgs.length > 1) { root.appendChild(prevBtn); root.appendChild(nextBtn); root.appendChild(dots); }

        function isRTL() { return getComputedStyle(root).direction === 'rtl'; }
        function stride() { if (!itemEls.length) return vp.clientWidth || 1; var w = itemEls[0].offsetWidth; var g = parseFloat(getComputedStyle(vp).columnGap) || 0; return (w || vp.clientWidth) + g; }
        function curIdx() { return Math.round(Math.abs(vp.scrollLeft) / stride()); }
        function ease(p) { return p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2; }
        var tween = 0;
        function scrollTo(target) {
            vp.style.scrollSnapType = 'none';
            var fin = function () { vp.style.scrollSnapType = ''; refresh(); };
            if (reducedMotion()) { vp.scrollLeft = target; fin(); return; }
            var start = vp.scrollLeft, dist = target - start, t0 = null, id = ++tween;
            function frame(now) { if (id !== tween) return; if (t0 === null) t0 = now; var p = Math.min(1, (now - t0) / 440); vp.scrollLeft = start + dist * ease(p); if (p < 1) requestAnimationFrame(frame); else { vp.scrollLeft = target; fin(); } }
            requestAnimationFrame(frame);
            window.setTimeout(function () { if (id === tween) { vp.scrollLeft = target; fin(); } }, 520);
        }
        function step(dir) { var max = vp.scrollWidth - vp.clientWidth; var target = vp.scrollLeft + (isRTL() ? -1 : 1) * dir * stride(); target = isRTL() ? Math.min(0, Math.max(-max, target)) : Math.max(0, Math.min(max, target)); scrollTo(target); announce(curIdx() + dir); }
        function goTo(i) { scrollTo((isRTL() ? -1 : 1) * i * stride()); announce(i); }
        function announce(i) { i = Math.min(Math.max(i, 0), imgs.length - 1); inst.emit('carousel:change', { index: i }); }
        function refresh() { var max = vp.scrollWidth - vp.clientWidth, pos = Math.abs(vp.scrollLeft); prevBtn.disabled = pos <= 1; nextBtn.disabled = pos >= max - 1; var idx = curIdx(); dotEls.forEach(function (d, i) { d.classList.toggle('is-active', i === idx); }); }
        var raf = 0; vp.addEventListener('scroll', function () { if (raf) return; raf = requestAnimationFrame(function () { raf = 0; refresh(); }); });
        root.addEventListener('keydown', function (e) { if (e.key === 'ArrowRight') { e.preventDefault(); isRTL() ? step(-1) : step(1); } else if (e.key === 'ArrowLeft') { e.preventDefault(); isRTL() ? step(1) : step(-1); } });
        vp.addEventListener('pointerdown', function (e) { if (e.pointerType !== 'mouse') return; dragging = true; dragMoved = false; startX = e.clientX; startScroll = vp.scrollLeft; vp.classList.add('is-grab'); vp.style.scrollSnapType = 'none'; });
        vp.addEventListener('pointermove', function (e) { if (!dragging) return; var dx = e.clientX - startX; if (Math.abs(dx) > 4) dragMoved = true; vp.scrollLeft = startScroll - dx; });
        function endDrag() { if (!dragging) return; dragging = false; vp.classList.remove('is-grab'); window.setTimeout(function () { dragMoved = false; }, 0); var idx = Math.min(Math.max(Math.round(Math.abs(vp.scrollLeft) / stride()), 0), imgs.length - 1); scrollTo((isRTL() ? -1 : 1) * idx * stride()); }
        vp.addEventListener('pointerup', endDrag); vp.addEventListener('pointercancel', endDrag); vp.addEventListener('pointerleave', endDrag);
        requestAnimationFrame(refresh);
        return root;
    }

    /* ===================================================================
       Slider (one at a time, cross-fade + autoplay)
       =================================================================== */
    function createSlider(inst, images, onClick) {
        var imgs = Array.isArray(images) ? images : [];
        var cfg = inst.options.behavior.slider || {}, interval = cfg.interval || 3800;
        var autoplay = cfg.autoplay !== false && !reducedMotion() && imgs.length > 1;
        var index = 0, timer = null, swiped = false;
        var root = h('div', { 'class': 'slider', tabindex: '0', role: 'group', 'aria-label': 'Slideshow' });
        var track = h('div', { 'class': 'slider__track' });
        var slideEls = imgs.map(function (it, i) {
            var slide = h('div', { 'class': 'slider__slide' + (i === 0 ? ' is-active' : '') });
            var btn = h('button', { type: 'button', 'class': 'slider__btn-img', 'aria-label': (it.caption || it.alt || 'Image') + ' — ' + inst.options.strings.enlarge, onclick: function () { if (swiped) return; onClick(i); } });
            btn.appendChild(h('img', { 'class': 'slider__img', src: safeUrl(it.src, true), alt: it.alt || '', loading: i === 0 ? 'eager' : 'lazy' }));
            slide.appendChild(btn);
            if (it.caption) slide.appendChild(h('span', { 'class': 'slider__cap', text: it.caption }));
            track.appendChild(slide); return slide;
        });
        var prevBtn = iconBtn('slider__btn slider__btn--prev', inst.options.strings.prev, 'chevronLeft', function () { stop(); go(index - 1); });
        prevBtn.querySelector('svg').setAttribute('class', 'icon icon-md slider__icon');
        var nextBtn = iconBtn('slider__btn slider__btn--next', inst.options.strings.next, 'chevronRight', function () { stop(); go(index + 1); });
        nextBtn.querySelector('svg').setAttribute('class', 'icon icon-md slider__icon');
        var dots = h('div', { 'class': 'slider__dots' });
        var dotEls = imgs.map(function (_, i) { var d = h('button', { type: 'button', 'class': 'slider__dot' + (i === 0 ? ' is-active' : ''), 'aria-label': 'Image ' + (i + 1), onclick: function () { stop(); go(i); } }); dots.appendChild(d); return d; });
        root.appendChild(track);
        if (imgs.length > 1) { root.appendChild(prevBtn); root.appendChild(nextBtn); root.appendChild(dots); }
        function isRTL() { return getComputedStyle(root).direction === 'rtl'; }
        function go(i) { index = (i + imgs.length) % imgs.length; slideEls.forEach(function (s, k) { s.classList.toggle('is-active', k === index); }); dotEls.forEach(function (d, k) { d.classList.toggle('is-active', k === index); }); inst.emit('slider:change', { index: index }); }
        function start() { if (!autoplay || timer) return; timer = window.setInterval(function () { go(index + 1); }, interval); }
        function stop() { if (timer) { window.clearInterval(timer); timer = null; } }
        root.addEventListener('pointerenter', stop); root.addEventListener('pointerleave', start);
        root.addEventListener('keydown', function (e) { if (e.key === 'ArrowRight') { e.preventDefault(); stop(); isRTL() ? go(index - 1) : go(index + 1); } else if (e.key === 'ArrowLeft') { e.preventDefault(); stop(); isRTL() ? go(index + 1) : go(index - 1); } });
        var sx = 0, sy = 0, swiping = false;
        track.addEventListener('pointerdown', function (e) { swiping = true; swiped = false; sx = e.clientX; sy = e.clientY; });
        track.addEventListener('pointermove', function (e) { if (swiping && Math.abs(e.clientX - sx) > 8) swiped = true; });
        function endSwipe(e) { if (!swiping) return; swiping = false; var dx = e.clientX - sx, dy = e.clientY - sy; if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) { stop(); var fwd = isRTL() ? dx > 0 : dx < 0; go(index + (fwd ? 1 : -1)); } window.setTimeout(function () { swiped = false; }, 0); }
        track.addEventListener('pointerup', endSwipe); track.addEventListener('pointercancel', function () { swiping = false; }); track.addEventListener('pointerleave', endSwipe);
        start();
        return root;
    }

    /* ===================================================================
       DeraChat
       =================================================================== */
    function DeraChat(options) {
        if (!(this instanceof DeraChat)) return new DeraChat(options);
        this.options = deepMerge(DEFAULTS, options || {});
        this._handlers = {};
        this._customTemplates = {};
        this._state = { open: false, fullscreen: false, unread: 0, greeted: false };
        this._history = [];       // conversation log: { role: 'user'|'assistant', content }
        this._mounted = false;
        this.els = {};
        if (options && options.mount === false) return;
        this.mount();
    }

    /* ---- Event emitter ---- */
    DeraChat.prototype.on = function (ev, fn) { (this._handlers[ev] = this._handlers[ev] || []).push(fn); return this; };
    DeraChat.prototype.once = function (ev, fn) { var self = this; function w(p) { self.off(ev, w); fn(p); } return this.on(ev, w); };
    DeraChat.prototype.off = function (ev, fn) {
        if (!ev) { this._handlers = {}; return this; }
        if (!fn) { delete this._handlers[ev]; return this; }
        var a = this._handlers[ev]; if (a) { var i = a.indexOf(fn); if (i > -1) a.splice(i, 1); } return this;
    };
    DeraChat.prototype.emit = function (ev, payload) {
        payload = payload || {};
        var cancelled = false;
        payload.cancel = function () { cancelled = true; };
        (this._handlers[ev] || []).forEach(function (fn) { try { fn(payload); } catch (e) { /* listener error */ } });
        (this._handlers['*'] || []).forEach(function (fn) { try { fn(Object.assign({ type: ev }, payload)); } catch (e) {} });
        return !cancelled;
    };

    /* ---- Mount ---- */
    DeraChat.prototype.mount = function (target) {
        if (this._mounted) return this;
        var o = this.options;
        var parent = target || o.el;
        if (typeof parent === 'string') parent = document.querySelector(parent);
        if (!parent) parent = document.body;

        var host = document.createElement('div');
        host.className = 'derachat-host';
        this.host = host;
        parent.appendChild(host);
        this.shadow = host.attachShadow({ mode: 'open' });

        var style = document.createElement('style');
        style.textContent = CSS + this._fontCss();
        this.shadow.appendChild(style);

        this.root = h('div', { 'class': 'dc' });
        this.shadow.appendChild(this.root);

        this._build();
        this._applyAll();
        this._mounted = true;

        var self = this;
        window.setTimeout(function () {
            self._state.unread = o.open ? 0 : 1; self._updateBadge();
            self.emit('ready', { instance: self });
            if (o.open) self.open();
        }, 0);
        return this;
    };

    DeraChat.prototype._fontCss = function () {
        var url = this.options.theme.fontUrl;
        if (!url) return '';
        return "@font-face{font-family:'DeraChatFont';font-style:normal;font-weight:200 1000;font-display:swap;src:url('" + url + "') format('woff2');}";
    };

    /* ---- Build DOM shell ---- */
    DeraChat.prototype._build = function () {
        var self = this, S = this.options.strings, I = this.options.identity, F = this.options.features, B = this.options.behavior;
        var E = this.els;

        /* CTA */
        E.cta = h('div', { 'class': 'cta', role: 'status' }, [
            h('div', { 'class': 'cta__text', text: B.cta }),
            (E.ctaClose = iconBtn('cta__close', S.closeCta, 'x', function (e) { e.stopPropagation(); self.emit('cta:close'); E.cta.style.display = 'none'; })),
            h('div', { 'class': 'cta__arrow', 'aria-hidden': 'true' })
        ]);

        /* FAB */
        // Open icon lives in a slot so it can hold either an inline SVG or an <img>
        E.iconOpen = h('span', { 'class': 'fab__icon fab__icon--open' }, [svgEl(ICONS[FAB_ICON[this.options.fab.icon] || 'message'], 'icon icon-xl')]);
        E.iconClose = svgEl(ICONS.chevronDown, 'icon icon-xl fab__icon fab__icon--close is-hidden');
        E.badge = h('span', { 'class': 'fab__badge', 'aria-live': 'polite', text: '0' });
        E.fab = h('button', { type: 'button', 'class': 'fab', 'aria-label': 'Open or close chat', onclick: function () { self.toggle(); } }, [E.iconOpen, E.iconClose, E.badge]);

        /* header */
        E.avatar = h('div', { 'class': 'avatar__circle' }, [svgEl(ICONS.bot, 'icon icon-lg')]);
        E.name = h('h2', { 'class': 'title', text: I.name });
        E.status = h('span', { text: I.status });
        E.fsMax = svgEl(ICONS.maximize, 'icon icon-md'); E.fsMin = svgEl(ICONS.minimize, 'icon icon-md is-hidden');
        E.fsQuick = h('button', { type: 'button', 'class': 'menu__btn', 'aria-label': S.fullscreen, title: S.fullscreen, onclick: function (e) { e.stopPropagation(); self.fullscreen(); } }, [E.fsMax, E.fsMin]);

        E.dropdown = h('div', { 'class': 'dropdown is-hidden' }, [
            (E.newBtn = this._menuItem(S.newConversation, 'plus', false, function () { self.newConversation(); })),
            (E.historyBtn = this._menuItem(S.history, 'history', false, function () { self._openHistory(); })),
            (E.fsItem = this._menuItem(S.fullscreen, 'maximize', false, function () { self.fullscreen(); })),
            (E.clearBtn = this._menuItem(S.clear, 'trash', false, function () { self.clear(); })),
            (E.closeItem = this._menuItem(S.close, 'power', true, function () { self.close(); }))
        ]);
        E.fsItemLabel = E.fsItem.querySelector('span');
        E.menuBtn = h('button', { type: 'button', 'class': 'menu__btn', 'aria-label': S.options, 'aria-haspopup': 'true', 'aria-expanded': 'false', onclick: function (e) { e.stopPropagation(); self._toggleMenu(); } }, [svgEl(ICONS.moreVertical, 'icon icon-md')]);

        var header = h('header', { 'class': 'header' }, [
            h('div', { 'class': 'avatar' }, [E.avatar, h('span', { 'class': 'avatar__status', 'aria-hidden': 'true' })]),
            h('div', {}, [
                E.name,
                h('p', { 'class': 'subtitle' }, [
                    h('span', { 'class': 'pulse', 'aria-hidden': 'true' }, [h('span', { 'class': 'pulse__ping' }), h('span', { 'class': 'pulse__dot' })]),
                    E.status
                ])
            ]),
            h('div', { 'class': 'actions' }, [E.fsQuick, h('div', { 'class': 'menu' }, [E.menuBtn, E.dropdown])])
        ]);

        /* messages + live region */
        E.messages = h('div', { 'class': 'messages', 'aria-label': 'Messages' });
        E.live = h('div', { 'class': 'sr-only', role: 'status', 'aria-live': 'polite', 'aria-atomic': 'true' });

        /* history panel */
        E.historyList = h('div', { 'class': 'history__list' });
        E.history = h('div', { 'class': 'history is-hidden', role: 'dialog', 'aria-label': S.history }, [
            h('div', { 'class': 'history__head' }, [
                iconBtn('history__back', S.back, 'chevronLeft', function () { self._closeHistory(); }),
                h('h3', { 'class': 'history__title', text: S.history }),
                h('button', { type: 'button', 'class': 'history__new', text: S.newShort, onclick: function () { self.newConversation(); } })
            ]),
            E.historyList
        ]);
        E.history.querySelector('.history__back svg').setAttribute('class', 'icon icon-md history__icon');

        /* composer */
        E.input = h('textarea', { 'class': 'composer__input', placeholder: B.placeholder, rows: '1', autocomplete: 'off' });
        E.sendIcon = svgEl(ICONS[SEND_ICON[this.options.send.icon] || 'send'], 'icon icon-md');
        E.attach = h('button', { type: 'button', 'class': 'composer__attach', 'aria-label': S.attach, onclick: function () { self.emit('attach'); } }, [svgEl(ICONS.paperclip, 'icon icon-md')]);
        E.send = h('button', { type: 'submit', 'class': 'composer__send', 'aria-label': S.send }, [E.sendIcon]);
        E.form = h('form', { 'class': 'composer__form' }, [E.attach, E.input, E.send]);
        E.form.addEventListener('submit', function (e) { e.preventDefault(); self._submit(); });
        E.input.addEventListener('input', function () { this.style.height = 'auto'; this.style.height = this.scrollHeight + 'px'; });
        E.input.addEventListener('keydown', function (e) { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); E.form.requestSubmit(); } });

        E.widget = h('section', { 'class': 'widget', role: 'dialog', 'aria-label': 'Chat window' }, [
            header, E.messages, E.live, E.history, h('div', { 'class': 'composer' }, [E.form])
        ]);

        this.root.appendChild(E.cta);
        this.root.appendChild(E.fab);
        this.root.appendChild(E.widget);

        /* global-ish handlers scoped to shadow / document */
        this._onDocClick = function () { self._closeMenu(); };
        document.addEventListener('click', this._onDocClick);
    };

    DeraChat.prototype._menuItem = function (label, iconKey, danger, onClick) {
        return h('button', { type: 'button', 'class': 'dropdown__item' + (danger ? ' dropdown__item--danger' : ''), onclick: function (e) { e.stopPropagation(); onClick(); } }, [
            h('span', { text: label }), svgEl(ICONS[iconKey], 'icon icon-sm')
        ]);
    };

    /* ---- Theme / identity / features ---- */
    DeraChat.prototype._setVar = function (k, v) { if (v != null) this.host.style.setProperty(k, v); };
    DeraChat.prototype._applyAll = function () {
        this.applyTheme(); this.applyLayout(); this.applyIdentity(); this.applyFeatures();
        this.host.setAttribute('dir', this.options.dir === 'rtl' ? 'rtl' : 'ltr');
        this.host.setAttribute('data-side', this.options.layout.side === 'right' ? 'right' : 'left');
    };
    DeraChat.prototype.applyTheme = function (patch) {
        if (patch) this.options.theme = deepMerge(this.options.theme, patch);
        var t = this.options.theme, ub = t.userBubble || [t.primary, '#4f46e5'];
        this._setVar('--dc-primary', t.primary); this._setVar('--dc-accent', t.accent);
        this._setVar('--dc-user-from', ub[0]); this._setVar('--dc-user-to', ub[1]);
        this._setVar('--dc-bot-bg', t.botBubbleBg); this._setVar('--dc-bot-text', t.botBubbleText);
        this._setVar('--dc-radius', t.radius); this._setVar('--dc-bubble-radius', t.bubbleRadius);
        var font = (t.fontUrl ? "'DeraChatFont', " : '') + (t.font || "'Cairo','Segoe UI',Tahoma,system-ui,sans-serif");
        this._setVar('--dc-font', font);
        // fab + send shapes/icons
        this._setVar('--dc-fab-radius', SHAPE[this.options.fab.shape] || SHAPE.round);
        this._setVar('--dc-send-radius', SHAPE[this.options.send.shape] || SHAPE.round);
        this._setVar('--dc-send-rotate', this.options.send.rotate === false ? '0deg' : '-90deg');
        if (this.els.iconOpen) {
            var fabImg = safeUrl(this.options.fab.image || '', true);
            this.els.iconOpen.replaceChildren(fabImg
                ? h('img', { 'class': 'fab__img', src: fabImg, alt: '' })
                : svgEl(ICONS[FAB_ICON[this.options.fab.icon] || 'message'], 'icon icon-xl'));
        }
        if (this.els.sendIcon) this.els.sendIcon.innerHTML = ICONS[SEND_ICON[this.options.send.icon] || 'send'];
        this.emit('themechange', { theme: this.options.theme });
        return this;
    };
    DeraChat.prototype.applyLayout = function (patch) {
        if (patch) this.options.layout = deepMerge(this.options.layout, patch);
        var l = this.options.layout;
        this._setVar('--dc-width', l.width); this._setVar('--dc-height', l.height);
        this._setVar('--dc-edge', l.edge); this._setVar('--dc-fab', l.fabSize); this._setVar('--dc-fab-bottom', l.fabBottom);
        this._setVar('--dc-carousel-item', this.options.behavior.carousel.itemBasis);
        this._setVar('--dc-gallery-cols', String(this.options.behavior.gallery.columns));
        if (this.host) this.host.setAttribute('data-side', l.side === 'right' ? 'right' : 'left');
        return this;
    };
    DeraChat.prototype.applyIdentity = function (patch) {
        if (patch) this.options.identity = deepMerge(this.options.identity, patch);
        var I = this.options.identity, E = this.els;
        if (E.name) E.name.textContent = I.name;
        if (E.status) E.status.textContent = I.status;
        if (E.avatar) {
            var url = safeUrl(I.avatar || '', true);
            if (url) { E.avatar.replaceChildren(h('img', { 'class': 'avatar__img', src: url, alt: I.name })); }
            else if (!E.avatar.querySelector('svg')) { E.avatar.replaceChildren(svgEl(ICONS.bot, 'icon icon-lg')); }
        }
        if (patch) this.emit('identitychange', { identity: I });
        return this;
    };
    DeraChat.prototype.applyFeatures = function (patch) {
        if (patch) this.options.features = deepMerge(this.options.features, patch);
        var F = this.options.features, E = this.els;
        function tg(el, on) { if (el) el.classList.toggle('is-hidden', on === false); }
        tg(E.cta, F.cta); tg(E.attach, F.attachButton); tg(E.fsQuick, F.fullscreenButton);
        tg(E.newBtn, F.newConversation); tg(E.historyBtn, F.history);
        if (patch) this.emit('featurechange', { features: F });
        return this;
    };
    DeraChat.prototype.setTheme = function (t) { return this.applyTheme(t); };
    DeraChat.prototype.setLayout = function (l) { return this.applyLayout(l); };
    DeraChat.prototype.setIdentity = function (i) { return this.applyIdentity(i); };
    DeraChat.prototype.setFeatures = function (f) { return this.applyFeatures(f); };
    DeraChat.prototype.update = function (o) {
        o = o || {};
        if (o.dir) { this.options.dir = o.dir; this.host.setAttribute('dir', o.dir); }
        if (o.theme || o.fab || o.send) { if (o.fab) this.options.fab = deepMerge(this.options.fab, o.fab); if (o.send) this.options.send = deepMerge(this.options.send, o.send); this.applyTheme(o.theme); }
        if (o.layout) this.applyLayout(o.layout);
        if (o.identity) this.applyIdentity(o.identity);
        if (o.features) this.applyFeatures(o.features);
        if (o.behavior) this.options.behavior = deepMerge(this.options.behavior, o.behavior);
        if (typeof o.onMessage === 'function') this.options.onMessage = o.onMessage;
        if (o.responses) this.options.responses = o.responses;
        return this;
    };

    /* ---- Menu / fullscreen ---- */
    DeraChat.prototype._toggleMenu = function () { var open = this.els.dropdown.classList.contains('is-hidden'); this._setMenu(open); };
    DeraChat.prototype._setMenu = function (open) {
        this.els.dropdown.classList.toggle('is-hidden', !open);
        this.els.menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
        this.emit(open ? 'menu:open' : 'menu:close');
    };
    DeraChat.prototype._closeMenu = function () { if (!this.els.dropdown.classList.contains('is-hidden')) this._setMenu(false); };
    DeraChat.prototype.fullscreen = function (on) {
        var next = typeof on === 'boolean' ? on : !this._state.fullscreen;
        this._state.fullscreen = next;
        this.els.widget.classList.toggle('is-fullscreen', next);
        var S = this.options.strings;
        this.els.fsItemLabel.textContent = next ? S.exitFullscreen : S.fullscreen;
        this.els.fsMax.classList.toggle('is-hidden', next); this.els.fsMin.classList.toggle('is-hidden', !next);
        this.els.fsQuick.setAttribute('aria-label', next ? S.exitFullscreen : S.fullscreen);
        this._setMenu(false);
        this.emit('fullscreenchange', { isFullscreen: next });
        return this;
    };

    /* ---- Open / close ---- */
    Object.defineProperty(DeraChat.prototype, 'isOpen', { get: function () { return this._state.open; } });
    Object.defineProperty(DeraChat.prototype, 'isFullscreen', { get: function () { return this._state.fullscreen; } });
    Object.defineProperty(DeraChat.prototype, 'unreadCount', { get: function () { return this._state.unread; } });
    Object.defineProperty(DeraChat.prototype, 'history', { get: function () { return this._history.slice(); } });

    DeraChat.prototype.open = function () {
        if (this._state.open) return this;
        if (!this.emit('beforeopen')) return this;
        this._state.open = true;
        this.els.widget.classList.add('is-open');
        this.els.iconOpen.classList.add('is-hidden'); this.els.iconClose.classList.remove('is-hidden');
        this.els.cta.style.display = 'none';
        this._state.unread = 0; this._updateBadge();
        if (!this._state.greeted) { this._state.greeted = true; this._greet(); }
        this.emit('open');
        return this;
    };
    DeraChat.prototype.close = function () {
        if (!this._state.open) return this;
        this._state.open = false;
        this.els.widget.classList.remove('is-open');
        this.els.iconOpen.classList.remove('is-hidden'); this.els.iconClose.classList.add('is-hidden');
        this._setMenu(false); this._closeHistory();
        this.emit('close');
        return this;
    };
    DeraChat.prototype.toggle = function () { return this._state.open ? this.close() : this.open(); };

    DeraChat.prototype._updateBadge = function () {
        var c = this._state.unread;
        this.els.badge.textContent = String(c);
        this.els.badge.classList.toggle('is-visible', c > 0);
        this.emit('unread', { count: c });
    };

    /* ---- Messaging (text only here; rich templates added by later phases) ---- */
    DeraChat.prototype._scroll = function () {
        this.els.messages.scrollTo({ top: this.els.messages.scrollHeight, behavior: reducedMotion() ? 'auto' : 'smooth' });
    };
    DeraChat.prototype._announce = function (text) {
        var r = this.els.live; if (!r || !text) return;
        r.textContent = ''; window.setTimeout(function () { r.textContent = text; }, 50);
    };
    DeraChat.prototype._row = function (sender) { return h('div', { 'class': 'row row--' + sender }); };

    DeraChat.prototype._renderUser = function (text) {
        var row = this._row('user');
        row.appendChild(h('div', { 'class': 'bubble bubble--user', text: text }));
        this.els.messages.appendChild(row); this._scroll();
    };
    DeraChat.prototype._typewriter = function (el, text, done) {
        if (reducedMotion() || this.options.behavior.typeSpeed <= 0) { el.textContent = text; if (done) done(); return; }
        var speed = this.options.behavior.typeSpeed, i = 0;
        el.textContent = ''; el.classList.add('typing-cursor');
        (function step() {
            if (i < text.length) { el.append(text.charAt(i)); i++; window.setTimeout(step, speed + Math.random() * 14); }
            else { el.classList.remove('typing-cursor'); if (done) done(); }
        })();
    };
    DeraChat.prototype._showTyping = function () {
        var row = this._row('bot'); row.dataset.typing = '1'; row.setAttribute('aria-hidden', 'true');
        var b = h('div', { 'class': 'bubble bubble--bot typing' }, [h('span', { 'class': 'typing__dot' }), h('span', { 'class': 'typing__dot' }), h('span', { 'class': 'typing__dot' })]);
        row.appendChild(b); this.els.messages.appendChild(row); this._scroll();
        this.emit('typing:start');
        return row;
    };
    DeraChat.prototype._hideTyping = function (row) { if (row && row.parentNode) row.remove(); this.emit('typing:end'); };

    // Phase 1: render a response. Only 'text' here; phase 3 overrides _renderTemplate.
    DeraChat.prototype._renderResponse = function (response) {
        var res = typeof response === 'string' ? { type: 'text', text: response } : (response || {});
        this._announce(this._summary(res));
        if (this._customTemplates[res.type]) {
            var row = this._row('bot');
            var node = this._customTemplates[res.type].call(this, res, h, svgEl);
            if (node) row.appendChild(node);
            this.els.messages.appendChild(row); this._scroll();
            this.emit('messagerendered', { type: res.type, element: row });
            return Promise.resolve();
        }
        return this._renderTemplate(res);
    };
    DeraChat.prototype._renderTemplate = function (res) {
        switch (res.type) {
            case 'image': return this._renderImage(res);
            case 'embed': return this._renderEmbed(res);
            case 'carousel': return this._renderCarousel(res);
            case 'slider': return this._renderSlider(res);
            case 'gallery': return this._renderGallery(res);
            case 'files': case 'file': return this._renderFiles(res);
            case 'text':
            default: return this._renderText(res);
        }
    };
    DeraChat.prototype._summary = function (res) {
        var n = res.images ? res.images.length : 0, pre = res.text ? res.text + '. ' : '';
        switch (res.type) {
            case 'image': return pre + ((res.image && (res.image.caption || res.image.alt)) || 'Image');
            case 'embed': return pre + ((res.embed && (res.embed.caption || res.embed.title)) || 'Embedded content');
            case 'carousel': return pre + 'Carousel with ' + n + ' images';
            case 'slider': return pre + 'Slideshow with ' + n + ' images';
            case 'gallery': return pre + 'Gallery with ' + n + ' images';
            case 'files': case 'file': return pre + ((res.files ? res.files.length : (res.file ? 1 : 0))) + ' attached file(s)';
            default: return res.text || '';
        }
    };
    DeraChat.prototype._lightbox = function () { if (!this._lb) this._lb = createLightbox(this); return this._lb; };
    DeraChat.prototype._mediaBubble = function (res) {
        var b = h('div', { 'class': 'bubble bubble--bot bubble--media' });
        if (res.text) b.appendChild(h('p', { 'class': 'lead', text: res.text }));
        return b;
    };
    DeraChat.prototype._renderText = function (res) {
        var self = this, row = this._row('bot');
        var bubble = h('div', { 'class': 'bubble bubble--bot' });
        row.appendChild(bubble); this.els.messages.appendChild(row);
        return new Promise(function (resolve) {
            self._typewriter(bubble, res.text || '', function () { self._scroll(); resolve(); });
            self._scroll();
        });
    };
    DeraChat.prototype._renderImage = function (res) {
        var self = this, img = res.image || {}, row = this._row('bot'), bubble = this._mediaBubble(res);
        var el = h('img', { 'class': 'm-img__el', src: safeUrl(img.src, true), alt: img.alt || '', loading: 'lazy' });
        var btn = h('button', { type: 'button', 'class': 'm-img__btn', 'aria-label': (img.caption || img.alt || 'Image') + ' — ' + this.options.strings.enlarge, onclick: function () { self.emit('image:click', { src: img.src, index: 0 }); self._lightbox().open([{ src: img.src, alt: img.alt, caption: img.caption }], 0); } }, [el]);
        var fig = h('figure', { 'class': 'm-img' }, [btn]);
        if (img.caption) fig.appendChild(h('figcaption', { 'class': 'm-img__cap', text: img.caption }));
        bubble.appendChild(fig); row.appendChild(bubble); this.els.messages.appendChild(row); this._scroll();
        el.addEventListener('load', function () { self._scroll(); });
        this.emit('messagerendered', { type: 'image', element: row });
        return Promise.resolve();
    };
    DeraChat.prototype._safeEmbed = function (url) {
        if (typeof url !== 'string') return null;
        try {
            var p = new URL(url, location.href); if (p.protocol !== 'https:') return null;
            var hosts = ['www.google.com', 'google.com', 'maps.google.com', 'www.openstreetmap.org', 'openstreetmap.org', 'www.youtube.com', 'youtube.com', 'www.youtube-nocookie.com', 'player.vimeo.com'];
            return hosts.indexOf(p.hostname) === -1 ? null : p.href;
        } catch (e) { return null; }
    };
    DeraChat.prototype._renderEmbed = function (res) {
        var self = this, emb = res.embed || {}, url = this._safeEmbed(emb.src), row = this._row('bot'), bubble = this._mediaBubble(res);
        if (!url) bubble.appendChild(h('p', { 'class': 'lead', text: 'Embedded content could not be displayed (untrusted source).' }));
        else {
            var iframe = h('iframe', { 'class': 'm-embed__frame', src: url, title: emb.title || 'Embedded content', loading: 'lazy', referrerpolicy: 'no-referrer-when-downgrade', allow: 'fullscreen; picture-in-picture', allowfullscreen: '', sandbox: 'allow-scripts allow-popups allow-forms allow-popups-to-escape-sandbox' });
            bubble.appendChild(h('div', { 'class': 'm-embed' }, [iframe]));
            if (emb.caption) bubble.appendChild(h('p', { 'class': 'm-img__cap', text: emb.caption }));
            var openUrl = this._safeEmbed(emb.openUrl);
            if (openUrl && this.options.features.mapOpenButton !== false) {
                bubble.appendChild(h('a', { 'class': 'm-embed__open', href: openUrl, target: '_blank', rel: 'noopener noreferrer', onclick: function () { self.emit('embed:open', { url: openUrl }); } }, [svgEl(ICONS.externalLink, 'icon icon-sm'), h('span', { text: this.options.strings.openMap })]));
            }
        }
        row.appendChild(bubble); this.els.messages.appendChild(row); this._scroll();
        this.emit('messagerendered', { type: 'embed', element: row });
        return Promise.resolve();
    };
    DeraChat.prototype._renderCarousel = function (res) {
        var self = this, imgs = res.images || [], row = this._row('bot'), bubble = this._mediaBubble(res);
        bubble.appendChild(createCarousel(this, imgs, function (i) { self.emit('image:click', { src: (imgs[i] || {}).src, index: i }); self._lightbox().open(imgs, i); }));
        row.appendChild(bubble); this.els.messages.appendChild(row); this._scroll();
        this.emit('messagerendered', { type: 'carousel', element: row });
        return Promise.resolve();
    };
    DeraChat.prototype._renderSlider = function (res) {
        var self = this, imgs = res.images || [], row = this._row('bot'), bubble = this._mediaBubble(res);
        bubble.appendChild(createSlider(this, imgs, function (i) { self.emit('image:click', { src: (imgs[i] || {}).src, index: i }); self._lightbox().open(imgs, i); }));
        row.appendChild(bubble); this.els.messages.appendChild(row); this._scroll();
        this.emit('messagerendered', { type: 'slider', element: row });
        return Promise.resolve();
    };
    DeraChat.prototype._renderGallery = function (res) {
        var self = this, imgs = res.images || [], max = this.options.behavior.gallery.maxVisible || 6, total = imgs.length, show = Math.min(total, max);
        var row = this._row('bot'), bubble = this._mediaBubble(res), grid = h('div', { 'class': 'gallery' });
        for (var i = 0; i < show; i++) (function (i) {
            var it = imgs[i] || {}, overflow = (i === show - 1) && (total > max);
            var cell = h('button', { type: 'button', 'class': 'gallery__cell', 'aria-label': overflow ? ('View all ' + total + ' images') : ((it.caption || it.alt || 'Image') + ' — ' + self.options.strings.enlarge), onclick: function () { self.emit('image:click', { src: it.src, index: i }); self._lightbox().open(imgs, i); } });
            cell.appendChild(h('img', { 'class': 'gallery__img', src: safeUrl(it.src, true), alt: it.alt || '', loading: 'lazy' }));
            if (overflow) cell.appendChild(h('span', { 'class': 'gallery__more', text: '+' + (total - max) }));
            grid.appendChild(cell);
        })(i);
        bubble.appendChild(grid); row.appendChild(bubble); this.els.messages.appendChild(row); this._scroll();
        this.emit('messagerendered', { type: 'gallery', element: row });
        return Promise.resolve();
    };
    DeraChat.prototype._fileColor = function (ext) {
        var m = {
            pdf: '#dc2626', doc: '#2563eb', docx: '#2563eb', txt: '#475569', rtf: '#475569',
            xls: '#16a34a', xlsx: '#16a34a', csv: '#16a34a', ppt: '#ea580c', pptx: '#ea580c',
            zip: '#d97706', rar: '#d97706', '7z': '#d97706', png: '#7c3aed', jpg: '#7c3aed',
            jpeg: '#7c3aed', gif: '#7c3aed', svg: '#7c3aed', webp: '#7c3aed', mp3: '#db2777',
            wav: '#db2777', mp4: '#4f46e5', mov: '#4f46e5', json: '#0891b2', xml: '#0891b2'
        };
        return m[(ext || '').toLowerCase()] || '#64748b';
    };
    DeraChat.prototype._renderFiles = function (res) {
        var self = this, files = res.files || (res.file ? [res.file] : []), row = this._row('bot'), bubble = this._mediaBubble(res);
        var list = h('div', { 'class': 'm-files' });
        files.forEach(function (f) {
            var name = f.name || 'file';
            var ext = (f.ext || (name.indexOf('.') > -1 ? name.split('.').pop() : '')).toLowerCase();
            var url = safeUrl(f.url, false);
            var badge = h('span', { 'class': 'm-file__ic', text: (ext || 'file').toUpperCase().slice(0, 4) });
            badge.style.background = self._fileColor(ext);
            var meta = h('div', { 'class': 'm-file__meta' }, [
                h('div', { 'class': 'm-file__name', title: name, text: name }),
                h('div', { 'class': 'm-file__size', text: f.size ? f.size : (ext ? ext.toUpperCase() + ' file' : 'File') })
            ]);
            var dl = h('a', {
                'class': 'm-file__dl', href: url || '#', download: f.name || '', target: '_blank',
                rel: 'noopener', 'aria-label': 'Download ' + name,
                onclick: function () { self.emit('file:download', { name: name, url: url }); }
            }, [svgEl(ICONS.download, 'icon icon-md')]);
            list.appendChild(h('div', { 'class': 'm-file' }, [badge, meta, dl]));
        });
        bubble.appendChild(list); row.appendChild(bubble); this.els.messages.appendChild(row); this._scroll();
        this.emit('messagerendered', { type: 'files', element: row });
        return Promise.resolve();
    };

    /* ---- Responder ---- */
    DeraChat.prototype._responder = function () {
        var o = this.options;
        if (o.onMessage) return o.onMessage;
        if (o.responder) return o.responder;
        if (o.responses) return this._mapResponder(o.responses);
        if (o.endpoint) return this._endpointResponder(o.endpoint);
        return null;
    };
    // Default backend bridge: POST { message, history } and expect a response template back.
    DeraChat.prototype._endpointResponder = function (url) {
        var self = this;
        return function (text) {
            return fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: text, history: self._history })
            }).then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); });
        };
    };
    DeraChat.prototype._mapResponder = function (map) {
        var keys = Object.keys(map);
        return function (text) {
            var t = (text || '').toLowerCase();
            for (var i = 0; i < keys.length; i++) {
                if (keys[i] === '*') continue;
                var ws = keys[i].split('|');
                for (var j = 0; j < ws.length; j++) if (t.indexOf(ws[j].trim().toLowerCase()) !== -1) return map[keys[i]];
            }
            return map['*'] || { type: 'text', text: '…' };
        };
    };

    DeraChat.prototype._submit = function () {
        var text = (this.els.input.value || '').trim();
        if (!text) return;
        this.els.input.value = ''; this.els.input.style.height = 'auto';
        this.send(text);
    };
    DeraChat.prototype.send = function (text) {
        text = (text || '').trim(); if (!text) return this;
        if (!this.emit('beforesend', { text: text })) return this;
        // remove suggestion chips
        var chips = this.els.messages.querySelectorAll('.row--chips'); Array.prototype.forEach.call(chips, function (c) { c.remove(); });
        this._renderUser(text);
        this._history.push({ role: 'user', content: text });
        this.emit('message', { text: text });
        this._respond(text);
        return this;
    };

    DeraChat.prototype._respond = function (text) {
        var self = this, fn = this._responder();
        var typingRow = this._showTyping();
        var delay = this.options.behavior.botReplyDelay;
        window.setTimeout(function () {
            Promise.resolve()
                .then(function () { return fn ? fn(text, self._ctx()) : self._demo(text); })
                .then(function (response) {
                    self._hideTyping(typingRow);
                    self._history.push({ role: 'assistant', content: (response && response.text) || '' });
                    if (self._state.open === false) { self._state.unread++; self._updateBadge(); }
                    if (!self.emit('beforereply', { response: response })) return;
                    return self._renderResponse(response).then(function () { self.emit('reply', { response: response }); });
                })
                .catch(function (err) {
                    self._hideTyping(typingRow);
                    self.emit('error', { error: err, context: 'respond' });
                    self._renderResponse({ type: 'text', text: 'Sorry, something went wrong.' });
                });
        }, delay);
    };
    DeraChat.prototype._ctx = function () {
        var self = this;
        return {
            instance: self,
            history: self._history.slice(),
            reply: function (r) { return self.reply(r); },
            typing: function () { return self._showTyping(); }
        };
    };
    DeraChat.prototype._demo = function (text) {
        return { type: 'text', text: 'Thanks for your message! (demo reply)' };
    };

    DeraChat.prototype.reply = function (response) { return this._renderResponse(response); };
    DeraChat.prototype.addMessage = function (response) { return this._renderResponse(response); };

    /* ---- Greeting + suggestions ---- */
    DeraChat.prototype._greet = function () {
        var self = this, B = this.options.behavior;
        var row = this._showTyping();
        window.setTimeout(function () {
            self._hideTyping(row);
            self._renderResponse({ type: 'text', text: B.welcome }).then(function () {
                if (self.options.features.suggestions !== false && B.suggestions && B.suggestions.length) self._chips(B.suggestions);
            });
        }, 450);
    };
    DeraChat.prototype._chips = function (list) {
        var self = this, row = this._row('bot'); row.classList.add('row--chips');
        var wrap = h('div', { 'class': 'chips' });
        list.forEach(function (c) {
            wrap.appendChild(h('button', { type: 'button', 'class': 'chip', text: c.label, onclick: function () {
                row.remove();
                self.emit('suggestion:click', { label: c.label, value: c.value });
                self.send(c.value != null ? c.value : c.label);
                self.els.input.focus();
            } }));
        });
        row.appendChild(wrap); this.els.messages.appendChild(row); this._scroll();
    };

    /* ---- Clear / new conversation / history (basic; phase 4 enriches) ---- */
    DeraChat.prototype.clear = function () {
        this.els.messages.replaceChildren(); this._setMenu(false);
        this._history = []; this._state.greeted = true; this._greet();
        this.emit('clear'); return this;
    };
    DeraChat.prototype.newConversation = function () {
        this._archive();
        this.els.messages.replaceChildren(); this._setMenu(false); this._closeHistory();
        this._history = []; this._state.greeted = true; this._greet();
        this.emit('newconversation'); return this;
    };
    DeraChat.prototype._archive = function () {
        var first = this.els.messages.querySelector('.bubble--user');
        this.options.history.unshift({ name: first ? first.textContent.slice(0, 28) : 'Conversation', preview: 'Saved conversation', time: 'now' });
    };
    DeraChat.prototype._openHistory = function () {
        var self = this, S = this.options.strings;
        this.els.historyList.replaceChildren();
        if (!this.options.history.length) this.els.historyList.appendChild(h('div', { 'class': 'history__preview', style: 'padding:1rem;text-align:center', text: S.historyEmpty }));
        this.options.history.forEach(function (c) {
            var item = h('button', { type: 'button', 'class': 'history__item', onclick: function () { self.emit('history:select', { conversation: c }); self._closeHistory(); } }, [
                h('span', { 'class': 'history__avatar' }, [svgEl(ICONS.bot, 'icon icon-md')]),
                h('div', { 'class': 'history__meta' }, [h('div', { 'class': 'history__name', text: c.name }), h('div', { 'class': 'history__preview', text: c.preview })]),
                h('span', { 'class': 'history__time', text: c.time })
            ]);
            self.els.historyList.appendChild(item);
        });
        this.els.history.classList.remove('is-hidden'); this._setMenu(false);
        this.emit('history:open');
    };
    DeraChat.prototype._closeHistory = function () {
        if (this.els.history && !this.els.history.classList.contains('is-hidden')) { this.els.history.classList.add('is-hidden'); this.emit('history:close'); }
    };

    /* ---- Templates registration / messages access ---- */
    DeraChat.prototype.registerTemplate = function (name, fn) { this._customTemplates[name] = fn; return this; };
    DeraChat.prototype.getMessages = function () { return Array.prototype.slice.call(this.els.messages.children); };

    /* ---- Destroy ---- */
    DeraChat.prototype.destroy = function () {
        document.removeEventListener('click', this._onDocClick);
        if (this._lb && this._lb.destroy) this._lb.destroy();
        if (this.host && this.host.parentNode) this.host.parentNode.removeChild(this.host);
        this.emit('destroy'); this._handlers = {}; this._mounted = false;
        return this;
    };

    DeraChat.version = VERSION;
    DeraChat.defaults = DEFAULTS;
    DeraChat.icons = ICONS;

    return DeraChat;
}));
