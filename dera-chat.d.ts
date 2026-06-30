// Type definitions for DeraChat 1.0.0

export type TemplateType = 'text' | 'image' | 'embed' | 'carousel' | 'slider' | 'gallery' | string;

export interface DeraImage { src: string; alt?: string; caption?: string; }

export interface DeraResponse {
  type: TemplateType;
  text?: string;
  image?: DeraImage;
  embed?: { src: string; title?: string; caption?: string; openUrl?: string; kind?: string };
  images?: DeraImage[];
  files?: { name: string; url: string; size?: string; ext?: string }[];
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
  fab?: { icon?: 'message' | 'chat' | 'bot' | 'help' | 'sparkles' | 'headset'; shape?: 'round' | 'rounded' | 'square' };
  send?: { icon?: 'send' | 'sendHorizontal' | 'arrow' | 'chevron'; shape?: 'round' | 'rounded' | 'square'; rotate?: boolean };
  identity?: { name?: string; status?: string; avatar?: string };
  features?: Partial<Record<'cta' | 'attachButton' | 'fullscreenButton' | 'suggestions' | 'newConversation' | 'history' | 'mapOpenButton', boolean>>;
  behavior?: {
    cta?: string; welcome?: string; placeholder?: string;
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
}

export interface DeraContext {
  instance: DeraChat;
  reply(response: DeraResponse): DeraChat;
  typing(): HTMLElement;
}

export type DeraEvent =
  | 'ready' | 'mount' | 'destroy' | 'error'
  | 'beforeopen' | 'open' | 'close' | 'fullscreenchange'
  | 'beforesend' | 'message' | 'beforereply' | 'reply'
  | 'typing:start' | 'typing:end' | 'messagerendered'
  | 'clear' | 'newconversation' | 'attach' | 'suggestion:click'
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
