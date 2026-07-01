// Type definitions for DeraChat 1.2.0
// Project: https://github.com/Amrwebdeveloper/dera-chat

export type TemplateType = 'text' | 'image' | 'embed' | 'iframe' | 'carousel' | 'slider' | 'gallery' | 'files' | 'form' | string;

export interface DeraImage { src: string; alt?: string; caption?: string; }

export interface DeraEmbed {
  src: string;
  title?: string;
  caption?: string;
  openUrl?: string;
  /** CSS aspect-ratio, e.g. '16/9' | '4/3' | '1/1'. */
  ratio?: string;
  /** Fixed height, e.g. '420px' | 420. Overrides ratio. */
  height?: string | number;
  /** iframe `allow` attribute (validated). */
  allow?: string;
  /** iframe `sandbox` attribute (validated). Defaults to a safe, cross-origin-only set. */
  sandbox?: string;
}

export type DeraFieldType =
  | 'text' | 'email' | 'tel' | 'url' | 'number' | 'password' | 'date' | 'time' | 'search' | 'color'
  | 'textarea' | 'select' | 'checkbox' | 'radio';

export interface DeraFormField {
  name: string;
  type?: DeraFieldType;
  label?: string;
  placeholder?: string;
  required?: boolean;
  value?: string | number | boolean;
  checked?: boolean;
  rows?: number;
  min?: string | number;
  max?: string | number;
  pattern?: string;
  options?: Array<string | { label: string; value: string }>;
}

export interface DeraForm {
  id?: string;
  fields: DeraFormField[];
  submitLabel?: string;
  successText?: string;
}

export interface DeraResponse {
  type: TemplateType;
  text?: string;
  /** Override the global Markdown setting for this message. */
  markdown?: boolean;
  image?: DeraImage;
  embed?: DeraEmbed;
  iframe?: DeraEmbed;
  images?: DeraImage[];
  files?: { name: string; url: string; size?: string; ext?: string }[];
  form?: DeraForm;
  [key: string]: any;
}

export interface DeraOptions {
  el?: string | HTMLElement | null;
  dir?: 'rtl' | 'ltr';
  open?: boolean;
  mount?: boolean;
  theme?: {
    primary?: string; accent?: string;
    userBubble?: [string, string];
    botBubbleBg?: string; botBubbleText?: string;
    radius?: string; bubbleRadius?: string;
    font?: string; fontUrl?: string;
  };
  layout?: { side?: 'left' | 'right'; edge?: string; width?: string; height?: string; fabSize?: string; fabBottom?: string };
  fab?: { icon?: 'message' | 'chat' | 'bot' | 'help' | 'sparkles' | 'headset'; shape?: 'round' | 'rounded' | 'square'; image?: string };
  send?: { icon?: 'send' | 'sendHorizontal' | 'arrow' | 'chevron'; shape?: 'round' | 'rounded' | 'square'; rotate?: boolean };
  identity?: { name?: string; status?: string; avatar?: string };
  features?: Partial<Record<'cta' | 'attachButton' | 'fullscreenButton' | 'suggestions' | 'newConversation' | 'history' | 'mapOpenButton', boolean>>;
  behavior?: {
    cta?: string; welcome?: string; placeholder?: string;
    /** Render Markdown in text/lead bubbles (default true). */
    markdown?: boolean;
    typeSpeed?: number; botReplyDelay?: number;
    suggestions?: { label: string; value?: string }[];
    carousel?: { itemBasis?: string };
    slider?: { autoplay?: boolean; interval?: number };
    gallery?: { columns?: number; maxVisible?: number };
  };
  strings?: Record<string, string>;
  history?: { name: string; preview: string; time: string }[];
  onMessage?: (text: string, ctx: DeraContext) => DeraResponse | Promise<DeraResponse>;
  responder?: (text: string, ctx: DeraContext) => DeraResponse | Promise<DeraResponse>;
  responses?: Record<string, DeraResponse>;
  endpoint?: string;
}

export interface DeraMessage { role: 'user' | 'assistant'; content: string; }

export interface DeraContext {
  instance: DeraChat;
  history: DeraMessage[];
  reply(response: DeraResponse): DeraChat;
  typing(): HTMLElement;
}

export type DeraEvent =
  | 'ready' | 'mount' | 'destroy' | 'error'
  | 'beforeopen' | 'open' | 'close' | 'fullscreenchange'
  | 'beforesend' | 'message' | 'beforereply' | 'reply'
  | 'typing:start' | 'typing:end' | 'messagerendered'
  | 'clear' | 'newconversation' | 'attach' | 'suggestion:click' | 'form:submit'
  | 'image:click' | 'file:download' | 'lightbox:open' | 'lightbox:close' | 'lightbox:change'
  | 'carousel:change' | 'slider:change' | 'embed:open'
  | 'menu:open' | 'menu:close' | 'history:open' | 'history:close' | 'history:select'
  | 'unread' | 'cta:close' | 'themechange' | 'identitychange' | 'featurechange'
  | '*';

export default class DeraChat {
  constructor(options?: DeraOptions);
  static version: string;
  static defaults: DeraOptions;
  static icons: Record<string, string>;

  readonly isOpen: boolean;
  readonly isFullscreen: boolean;
  readonly unreadCount: number;
  readonly history: DeraMessage[];
  options: DeraOptions;

  mount(target?: string | HTMLElement): this;
  destroy(): this;

  open(): this;
  close(): this;
  toggle(): this;
  fullscreen(on?: boolean): this;

  send(text: string): this;
  reply(response: DeraResponse): Promise<void>;
  addMessage(response: DeraResponse): Promise<void>;
  clear(): this;
  newConversation(): this;
  getMessages(): Element[];

  update(options: DeraOptions): this;
  setTheme(theme: DeraOptions['theme']): this;
  setLayout(layout: DeraOptions['layout']): this;
  setIdentity(identity: DeraOptions['identity']): this;
  setFeatures(features: DeraOptions['features']): this;

  on(event: DeraEvent, handler: (payload: any) => void): this;
  once(event: DeraEvent, handler: (payload: any) => void): this;
  off(event?: DeraEvent, handler?: (payload: any) => void): this;
  emit(event: string, payload?: any): boolean;

  registerTemplate(name: string, render: (response: DeraResponse, h: Function, svg: Function) => HTMLElement | null): this;
}
