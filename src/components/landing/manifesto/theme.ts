/**
 * Manifesto LP の色は 3 色に固定する（黒 / 白 / 差し色 1）。
 *
 * `bg-background` などのテーマトークンを使わないのは意図的で、この LP は
 * ライト／ダークで見え方が変わらない単一のルックにコミットしている。
 * 差し色は DESIGN.md の Primary Light (#4A8FE7)。黒地・白地の双方で
 * 見出しに使える程度のコントラストがあり、黒文字を載せる背景にも使える。
 */
export const INK = '#0A0A0A';
export const PAPER = '#FAFAFA';
export const ACCENT = '#4A8FE7';

/** 罫線とベタ塗りだけで構成するので、角丸は一切使わない。 */
export const CTA_ON_INK =
  'inline-flex items-center justify-center bg-[#4A8FE7] px-8 py-5 text-base font-bold text-[#0A0A0A] transition-colors hover:bg-[#FAFAFA] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FAFAFA]';

export const CTA_GHOST_ON_INK =
  'inline-flex items-center justify-center border-2 border-[#FAFAFA] px-8 py-5 text-base font-bold text-[#FAFAFA] transition-colors hover:bg-[#FAFAFA] hover:text-[#0A0A0A] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FAFAFA]';

export const CTA_ON_ACCENT =
  'inline-flex items-center justify-center bg-[#0A0A0A] px-8 py-5 text-base font-bold text-[#FAFAFA] transition-colors hover:bg-[#FAFAFA] hover:text-[#0A0A0A] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0A0A0A]';

export const CTA_GHOST_ON_ACCENT =
  'inline-flex items-center justify-center border-2 border-[#0A0A0A] px-8 py-5 text-base font-bold text-[#0A0A0A] transition-colors hover:bg-[#0A0A0A] hover:text-[#FAFAFA] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0A0A0A]';

/** 見出しは装飾を持たず、サイズとウェイトだけで殴る。 */
export const DISPLAY = 'font-black leading-[0.86] tracking-tight';
export const DISPLAY_XL = `${DISPLAY} text-[clamp(2.75rem,10vw,8.5rem)]`;
export const DISPLAY_LG = `${DISPLAY} text-[clamp(2.25rem,7vw,5.5rem)]`;

export const EYEBROW = 'font-mono text-xs font-medium tracking-[0.35em] uppercase';

export const SHELL = 'mx-auto w-full max-w-6xl px-4 md:px-8';
