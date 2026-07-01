<div align="center">

# DeraChat

**A self-contained, themeable chat widget in a single file.**

Named class · Shadow DOM isolation · Markdown · options + events · 8 reply templates · RTL/LTR · zero dependencies.

[![version](https://img.shields.io/github/v/tag/Amrwebdeveloper/dera-chat?label=version&sort=semver)](https://github.com/Amrwebdeveloper/dera-chat/tags)
[![license](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![jsDelivr](https://img.shields.io/badge/CDN-jsDelivr-e84d3d.svg)](https://www.jsdelivr.com/package/gh/Amrwebdeveloper/dera-chat)
[![dependencies](https://img.shields.io/badge/dependencies-0-success.svg)](#)
[![minified](https://img.shields.io/badge/minified-~71KB-informational.svg)](dist/dera-chat.min.js)

[**Live demo →**](https://amrwebdeveloper.github.io/dera-chat/)

</div>

---

## Contents

- [Why DeraChat](#why-derachat)
- [Quick start](#quick-start)
- [Installation](#installation)
- [Reply templates](#reply-templates)
- [Events](#events)
- [Methods](#methods)
- [Options](#options)
- [Theming](#theming)
- [Multiple instances](#multiple-instances)
- [Browser support](#browser-support)
- [Build](#build)
- [License](#license)

## Why DeraChat

- **One file.** Drop in `dera-chat.min.js` — CSS, icons and markup are inlined. No build step, no CSS to include.
- **Fully isolated.** Each widget lives in its own Shadow DOM, so the host page can't break it and it can't leak out.
- **Event-driven.** A small `.on()/.once()/.off()` API with cancelable hooks (`beforesend`, `beforereply`).
- **Markdown built in.** Bot text renders **bold**, *italic*, `code`, code blocks, lists, quotes and links — safely, no dependency.
- **8 reply templates.** text, image, embed/iframe (maps & any site), carousel, slider, gallery, downloadable files, and interactive forms.
- **Any backend.** Plug an async `onMessage`, a JSON `responses` map, or a remote endpoint.
- **Accessible & safe.** Live-region announcements, focus trapping, reduced-motion support; all text via `textContent`.
- **RTL & LTR**, **multiple instances per page**, and **zero dependencies**.

## Quick start

```html
<script src="https://cdn.jsdelivr.net/gh/Amrwebdeveloper/dera-chat@v1.2.0/dist/dera-chat.min.js"></script>
<script>
  const chat = new DeraChat({
    identity: { name: 'Acme Support', avatar: 'logo.png' },
    theme:    { primary: '#3b82f6', accent: '#2dd4bf', radius: '20px' },
    layout:   { side: 'right' },
    fab:      { icon: 'headset', shape: 'rounded' },

    // connect your backend (async), or use a `responses` map
    onMessage: async (text) => {
      const res = await fetch('/api/chat', { method: 'POST', body: JSON.stringify({ text }) });
      return await res.json();            // { type: 'text' | 'image' | 'carousel' | ... }
    },
  });

  chat
    .on('message', (e) => console.log('user:', e.text))
    .on('reply',   (e) => console.log('bot:', e.response));
</script>
```

### Connect to an AI / backend

`onMessage` is async and receives the conversation `history`, so you can give any model full context:

```js
onMessage: async (text, ctx) => {
  const res = await fetch('/api/ai', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: text, history: ctx.history }),  // [{ role, content }]
  });
  const { reply } = await res.json();
  return { type: 'text', text: reply };
}
```

Or just point `endpoint` at your server — DeraChat POSTs `{ message, history }` and renders the returned template:

```js
const chat = new DeraChat({ endpoint: '/api/chat' });
```

A typing indicator is shown automatically while the promise is pending. Read the log any time via `chat.history`.

## Installation

**CDN (jsDelivr)** — recommended:

```html
<!-- pinned version (recommended) -->
<script src="https://cdn.jsdelivr.net/gh/Amrwebdeveloper/dera-chat@v1.2.0/dist/dera-chat.min.js"></script>

<!-- latest on the main branch -->
<script src="https://cdn.jsdelivr.net/gh/Amrwebdeveloper/dera-chat@main/dist/dera-chat.min.js"></script>
```

**Self-hosted** — copy `dist/dera-chat.min.js` into your project and reference it. The bundle exposes
`window.DeraChat` (UMD) and also works with CommonJS and AMD. TypeScript types ship in `dist/dera-chat.d.ts`.

## Reply templates

Your `onMessage` (or `responses` map) returns one of these shapes; DeraChat renders it.

| `type` | Renders | Key fields |
|--------|---------|------------|
| `text` | Markdown text with a typewriter effect | `text`, `markdown?` |
| `image` | Image + caption (opens lightbox) | `image: { src, alt, caption }` |
| `embed` / `iframe` | Sandboxed iframe — maps, video, any https site | `embed: { src, title, caption, openUrl, ratio, height }` |
| `carousel` | Side-by-side scrollable strip | `images: [{ src, alt, caption }]` |
| `slider` | Auto-playing cross-fade | `images: [...]` |
| `gallery` | Grid with a “+N” overflow tile | `images: [...]` |
| `files` | Downloadable attachments | `files: [{ name, url, size, ext }]` |
| `form` | Interactive form → `form:submit` event | `form: { fields, submitLabel, successText }` |

```js
{ type: 'text',     text: '**Bold**, *italic*, `code`, [links](…) and lists all render' }
{ type: 'image',    text: 'Tip',  image: { src: 'tip.png', alt: 'Tip', caption: 'Stay hydrated' } }
{ type: 'embed',    text: 'Find us', embed: { src: 'https://…/embed', caption: 'HQ', openUrl: 'https://…' } }
{ type: 'iframe',   embed: { src: 'https://www.youtube-nocookie.com/embed/…', ratio: '16/9' } }
{ type: 'carousel', text: 'Gallery',  images: [ { src, alt, caption }, … ] }
{ type: 'slider',   text: 'Slideshow', images: [ … ] }
{ type: 'gallery',  text: 'Album',     images: [ … ] }
{ type: 'files',    text: 'Downloads', files: [ { name: 'guide.pdf', url: '/guide.pdf', size: '245 KB' } ] }
{ type: 'form',     text: 'Contact us', form: {
    submitLabel: 'Send',
    fields: [
      { name: 'email',   label: 'Email',   type: 'email', required: true },
      { name: 'topic',   label: 'Topic',   type: 'select', options: ['Support', 'Sales'] },
      { name: 'message', label: 'Message', type: 'textarea' },
    ],
} }
```

Register custom templates with [`registerTemplate()`](#methods).

### Markdown

Bot text (the `text` template and the caption on any media template) renders a safe Markdown subset:
`**bold**`, `*italic*`, `~~strike~~`, `` `code` ``, `# headings`, `- lists`, `1.` lists, `> quotes`,
fenced ```` ``` ```` code blocks, `---` rules and `[links](url)`. It's rendered straight to DOM nodes
(never `innerHTML`), so message content can't inject markup. Turn it off globally with
`behavior: { markdown: false }`, or per message with `{ type: 'text', text: '…', markdown: false }`.

### Forms

The `form` template renders a real, accessible `<form>`. Fields support `text`, `email`, `tel`, `url`,
`number`, `password`, `date`, `time`, `textarea`, `select`, `checkbox` and `radio`, with native `required`
validation. On submit it fires a cancelable `form:submit` event carrying the collected `values`:

```js
chat.on('form:submit', (e) => {
  console.log(e.id, e.values);            // { email: '…', topic: 'Support', message: '…' }
  // e.cancel();  // to keep the form editable and suppress the success note
  fetch('/api/contact', { method: 'POST', body: JSON.stringify(e.values) });
});
```

## Events

Subscribe with `.on(event, handler)` — chainable. Cancelable events expose `payload.cancel()`.

| Event | Payload | Notes |
|-------|---------|-------|
| `ready` | `{ instance }` | mounted & ready |
| `open` / `close` | — | `open` is cancelable via `beforeopen` |
| `message` | `{ text }` | user sent a message |
| `beforesend` | `{ text, cancel() }` | cancelable |
| `reply` | `{ response }` | bot reply rendered |
| `beforereply` | `{ response, cancel() }` | cancelable |
| `typing:start` / `typing:end` | — | typing indicator |
| `messagerendered` | `{ type, element }` | any message rendered |
| `image:click` | `{ src, index }` | image opened |
| `file:download` | `{ name, url }` | attachment downloaded |
| `lightbox:open` / `:close` / `:change` | `{ index, images }` | image viewer |
| `carousel:change` / `slider:change` | `{ index }` | slide changed |
| `embed:open` | `{ url }` | “open map/link” clicked |
| `form:submit` | `{ id, values, form, reset(), cancel() }` | form submitted; cancelable |
| `suggestion:click` | `{ label, value }` | quick-reply chip |
| `fullscreenchange` | `{ isFullscreen }` | — |
| `unread` | `{ count }` | unread badge changed |
| `clear` / `newconversation` | — | conversation reset |
| `themechange` / `identitychange` / `featurechange` | `{ … }` | runtime updates |
| `error` | `{ error, context }` | internal error |
| `*` | `{ type, … }` | every event (for analytics) |

```js
chat.on('beforesend', (e) => { if (isSpam(e.text)) e.cancel(); });
```

## Methods

```
open() · close() · toggle() · fullscreen(on?)
send(text) · reply(response) · addMessage(response)
clear() · newConversation() · getMessages()
setTheme() · setLayout() · setIdentity() · setFeatures() · update(options)
on() · once() · off() · emit()
registerTemplate(name, render) · destroy()
```

Read-only getters: `isOpen`, `isFullscreen`, `unreadCount`, `options`.

## Options

| Group | Keys |
|-------|------|
| `theme` | `primary`, `accent`, `userBubble`, `botBubbleBg`, `botBubbleText`, `radius`, `bubbleRadius`, `font`, `fontUrl` |
| `layout` | `side` (`left`/`right`), `edge`, `width`, `height`, `fabSize`, `fabBottom` |
| `fab` | `icon` (`message`/`chat`/`bot`/`help`/`sparkles`/`headset`), `shape` (`round`/`rounded`/`square`) |
| `send` | `icon` (`send`/`sendHorizontal`/`arrow`/`chevron`), `shape`, `rotate` |
| `identity` | `name`, `status`, `avatar` |
| `features` | `cta`, `attachButton`, `fullscreenButton`, `suggestions`, `newConversation`, `history`, `mapOpenButton` (booleans) |
| `behavior` | `welcome`, `placeholder`, `markdown` (bool), `typeSpeed`, `botReplyDelay`, `suggestions`, `carousel`, `slider`, `gallery` |
| `strings` | UI string overrides (i18n) |
| `responder` | `onMessage(text, ctx)` · `responses` map · `endpoint` |
| top-level | `el`, `dir` (`rtl`/`ltr`), `open` |

## Theming

Everything is driven by CSS variables and can change at runtime:

```js
chat.setTheme({ primary: '#e11d48', accent: '#f59e0b', radius: '12px' });
chat.setLayout({ side: 'left' });
chat.setIdentity({ name: 'Dr. Sarah', status: 'typing…' });
chat.setFeatures({ history: false });
```

## Multiple instances

Each `new DeraChat()` mounts its own host element, Shadow DOM and theme — run as many independent
widgets on one page as you like, then `destroy()` to remove and clean up.

## Browser support

Modern evergreen browsers (Chrome, Edge, Firefox, Safari) that support Shadow DOM and CSS custom
properties. No build step or polyfills required.

## Build

The distributable is `dist/dera-chat.js`; the minified build is produced with [terser](https://terser.org):

```bash
npm run build
# terser dist/dera-chat.js -c -m -o dist/dera-chat.min.js
```

## License

[MIT](LICENSE) © Amrwebdeveloper
