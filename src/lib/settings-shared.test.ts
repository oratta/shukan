import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  DEFAULT_LOCALE,
  DEFAULT_THEME,
  isSettingsLocale,
  isSettingsTheme,
  readLocaleCookie,
  reconcileSettings,
} from './settings-shared';

describe('#24 既定値', () => {
  it("テーマの既定は 'system'（next-themes の defaultTheme と一致）", () => {
    expect(DEFAULT_THEME).toBe('system');
    const providers = readFileSync(
      join(__dirname, '../components/providers.tsx'),
      'utf-8'
    );
    expect(providers).toContain('defaultTheme="system"');
  });

  it("ロケールの既定は 'en'（DB の column default 'ja' ではなく、既存のユーザー可視挙動を正とする）", () => {
    expect(DEFAULT_LOCALE).toBe('en');
  });

  it('i18n/request.ts が DEFAULT_LOCALE を使う（ハードコードの en を残さない）', () => {
    const req = readFileSync(join(__dirname, '../i18n/request.ts'), 'utf-8');
    expect(req).toContain('DEFAULT_LOCALE');
    expect(req).not.toMatch(/\|\|\s*'en'/);
  });
});

describe('#24 型ガード', () => {
  it('theme は light|dark|system のみ受け付ける', () => {
    expect(isSettingsTheme('light')).toBe(true);
    expect(isSettingsTheme('dark')).toBe(true);
    expect(isSettingsTheme('system')).toBe(true);
    expect(isSettingsTheme('sepia')).toBe(false);
    expect(isSettingsTheme(null)).toBe(false);
    expect(isSettingsTheme(undefined)).toBe(false);
  });

  it('locale は en|ja のみ受け付ける', () => {
    expect(isSettingsLocale('en')).toBe(true);
    expect(isSettingsLocale('ja')).toBe(true);
    expect(isSettingsLocale('fr')).toBe(false);
    expect(isSettingsLocale(undefined)).toBe(false);
  });
});

describe('#24 readLocaleCookie', () => {
  it('locale cookie を読む', () => {
    expect(readLocaleCookie('locale=ja')).toBe('ja');
    expect(readLocaleCookie('foo=1; locale=en; bar=2')).toBe('en');
  });

  it('cookie が空／未設定なら null（新しいブラウザ＝未選択）', () => {
    expect(readLocaleCookie('')).toBeNull();
    expect(readLocaleCookie('theme=dark')).toBeNull();
  });

  it('不正値は null に丸める', () => {
    expect(readLocaleCookie('locale=fr')).toBeNull();
  });

  it('locale で終わる別名 cookie（例 user_locale）を誤読しない', () => {
    expect(readLocaleCookie('user_locale=ja')).toBeNull();
    expect(readLocaleCookie('user_locale=ja; locale=en')).toBe('en');
  });
});

describe('#24 reconcileSettings: ログイン時の優先順位（受け入れ条件4）', () => {
  it('DB に行があればローカルより DB が勝つ（デバイス間同期の本体）', () => {
    const r = reconcileSettings(
      { theme: 'light', locale: 'en' },
      { theme: 'dark', locale: 'ja' }
    );
    expect(r).toEqual({ theme: 'dark', locale: 'ja', needsSeed: false });
  });

  it('別ブラウザ（localStorage / cookie が空）でも DB の値が適用される（受け入れ条件2）', () => {
    const r = reconcileSettings(
      { theme: null, locale: null },
      { theme: 'dark', locale: 'ja' }
    );
    expect(r).toEqual({ theme: 'dark', locale: 'ja', needsSeed: false });
  });

  it('DB に行が無ければローカルの現在値で seed する（既存ユーザーの選択を失わない）', () => {
    const r = reconcileSettings({ theme: 'dark', locale: 'ja' }, null);
    expect(r).toEqual({ theme: 'dark', locale: 'ja', needsSeed: true });
  });

  it('DB にもローカルにも値が無ければ既定値で seed する', () => {
    const r = reconcileSettings({ theme: null, locale: null }, null);
    expect(r).toEqual({ theme: DEFAULT_THEME, locale: DEFAULT_LOCALE, needsSeed: true });
  });

  it('片方だけローカルにある場合、無い方だけ既定値で補う', () => {
    const r = reconcileSettings({ theme: 'light', locale: null }, null);
    expect(r).toEqual({ theme: 'light', locale: DEFAULT_LOCALE, needsSeed: true });
  });
});

// vitest は environment: 'node'（jsdom 無し）のため、コンポーネントの render テストは書けない。
// UI が同期経路（useSettings / SettingsSync）に繋がっていることはソースアサーションで担保する。
describe('#24 UI の配線（ソースアサーション）', () => {
  const read = (p: string) => readFileSync(join(__dirname, '..', p), 'utf-8');

  it('Providers が SettingsSync を 1 つだけマウントする', () => {
    const src = read('components/providers.tsx');
    expect(src).toContain('SettingsSync');
    expect((src.match(/<SettingsSync\s*\/>/g) ?? []).length).toBe(1);
  });

  it('SettingsSync は useSettingsSync を呼ぶだけで何も描画しない', () => {
    const src = read('components/settings-sync.tsx');
    expect(src).toContain('useSettingsSync()');
    expect(src).toContain('return null');
  });

  it('設定画面のテーマ／言語ボタンが saveTheme / saveLocale を呼ぶ（生の setTheme / document.cookie ではない）', () => {
    const src = read('app/(app)/settings/page.tsx');
    expect(src).toContain('saveTheme(opt.value)');
    expect(src).toContain('saveLocale(newLocale)');
    expect(src).not.toContain('document.cookie');
    expect(src).not.toMatch(/setTheme\(/);
  });

  it('ヘッダーのテーマトグルが saveTheme を呼ぶ', () => {
    const src = read('components/layout/header.tsx');
    expect(src).toContain('saveTheme(');
    expect(src).not.toMatch(/setTheme\(/);
  });

  it('LocaleSwitcher が saveLocale を呼ぶ（cookie 直書きしない）', () => {
    const src = read('components/locale-switcher.tsx');
    expect(src).toContain('saveLocale(');
    expect(src).not.toContain('document.cookie');
  });

  it('useSettingsSync の useEffect 依存は user?.id（onAuthStateChange の新 user 参照で二重フェッチしない）', () => {
    const src = read('hooks/useSettings.ts');
    expect(src).toContain('const userId = user?.id;');
    expect(src).toMatch(/\}, \[userId, setTheme, router\]\);/);
  });

  it('未ログイン時は DB 書き込みをスキップする（受け入れ条件3: LP でエラーにならない）', () => {
    const src = read('hooks/useSettings.ts');
    // saveTheme / saveLocale / sync のいずれも userId 無しでは upsert / fetch しない
    expect((src.match(/if \(!userId\) return;/g) ?? []).length).toBeGreaterThanOrEqual(3);
  });
});
