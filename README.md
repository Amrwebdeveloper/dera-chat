# DeraChat

A drop-in chat widget in a **single file**. Named class, options in, events out.
Fully isolated with **Shadow DOM**, themeable, RTL/LTR, no CDN, XSS-safe.

```html
<script src="dera-chat.min.js"></script>
<script>
  const chat = new DeraChat({
    identity: { name: 'Acme Support', avatar: 'logo.png' },
    theme:    { primary: '#3b82f6', accent: '#2dd4bf', radius: '20px' },
    layout:   { side: 'right' },
    fab:      { icon: 'headset', shape: 'rounded' },
    onMessage: async (text) => {
      const r = await fetch('/api/chat', { method:'POST', body: JSON.stringify({ text }) });
      return await r.json();        // { type:'text'|'image'|'carousel'|... }
    },
  });

  chat.on('message', (e) => console.log('user:', e.text));
  chat.on('reply',   (e) => console.log('bot:', e.response));
</script>
```

## Files
| File | Purpose |
|------|---------|
| `dera-chat.js` | The bundle (readable source — CSS + icons inlined) |
| `dera-chat.min.js` | Minified bundle (~57 KB) |
| `dera-chat.d.ts` | TypeScript types |
| `index.html` | Landing page + live demo |

Loads as UMD (`window.DeraChat`), CommonJS, or AMD. Optional Cairo font via `theme.fontUrl`.

## Reply templates
`onMessage` returns one of these shapes (`responses` map or `endpoint` also supported):

```js
{ type:'text', text:'Hello 👋' }
{ type:'image', text, image:{ src, alt, caption } }                 // lightbox on click
{ type:'embed', text, embed:{ src, title, caption, openUrl } }       // sandboxed iframe (maps…)
{ type:'carousel', text, images:[{src,alt,caption}, …] }             // drag/scroll strip
{ type:'slider',   text, images:[…] }                                // autoplay cross-fade
{ type:'gallery',  text, images:[…] }                                // grid with “+N”
{ type:'files',    text, files:[{ name, url, size, ext }, …] }       // downloadable attachments
```

## Events
`ready` · `open` · `close` · `message` · `reply` · `beforesend`/`beforereply` (cancelable) ·
`typing:start`/`typing:end` · `messagerendered` · `clear` · `newconversation` · `attach` ·
`suggestion:click` · `image:click` · `file:download` · `lightbox:open`/`:close`/`:change` · `carousel:change` ·
`slider:change` · `embed:open` · `menu:open`/`:close` · `history:open`/`:close`/`:select` ·
`unread` · `cta:close` · `themechange`/`identitychange`/`featurechange` · `error` · `*` (all).

```js
chat.on('beforesend', (e) => { if (isSpam(e.text)) e.cancel(); }); // cancelable
```

## Methods
`open()` `close()` `toggle()` `fullscreen(on?)` · `send(text)` `reply(response)` `addMessage(r)`
`clear()` `newConversation()` `getMessages()` · `setTheme()` `setIdentity()` `setFeatures()`
`setLayout()` `update(options)` · `on()` `once()` `off()` `emit()` · `registerTemplate(name, fn)` · `destroy()`.
Getters: `isOpen`, `isFullscreen`, `unreadCount`, `options`.

## Options (summary)
`el`, `dir`, `open`, `theme{primary,accent,userBubble,radius,bubbleRadius,font,fontUrl}`,
`layout{side,edge,width,height,fabSize,fabBottom}`, `fab{icon,shape}`, `send{icon,shape,rotate}`,
`identity{name,status,avatar}`, `features{…booleans}`,
`behavior{welcome,placeholder,typeSpeed,botReplyDelay,suggestions,carousel,slider,gallery}`,
`strings{…i18n}`, `onMessage|responses|responder`.

## Multiple instances
Each `new DeraChat()` mounts its own host + Shadow DOM + theme. Run as many as you like, independently.

## Build
```
npx terser dera-chat.js -c -m -o dera-chat.min.js
```

> Note: the older `assets/`, `landing.html`, `example.html`, `concept.html` are the previous
> module-based prototype, kept for reference. `dera-chat.js` is the current single-bundle product.
