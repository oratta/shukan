import { test, expect } from '@playwright/test';

const BASE = 'http://localhost:3001';

test.describe('Shukan 動作確認', () => {
  test('ログインページが正常にレンダリングされる', async ({ page }) => {
    await page.goto(BASE);
    // ミドルウェアでログインにリダイレクトされるはず
    await page.waitForLoadState('networkidle');

    // ログインページの要素を確認
    const heading = page.locator('text=Shukan');
    await expect(heading.first()).toBeVisible({ timeout: 10000 });

    // Googleログインボタンが存在する
    const googleButton = page.getByText(/Google|ログイン|Sign in/i);
    await expect(googleButton.first()).toBeVisible();

    console.log('✅ ログインページ: OK');
  });

  test('ビルド済みコンポーネントのインポートが問題ない', async ({ page }) => {
    // ログインページのJSが正しくロードされるか
    await page.goto(BASE);
    await page.waitForLoadState('networkidle');

    // コンソールエラーがないか確認
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    // ページを再ロードしてエラーを監視
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // 重大なJSエラーがないか（Next.jsの軽微な警告は除外）
    const criticalErrors = errors.filter(
      (e) => !e.includes('Warning:') && !e.includes('DevTools') && !e.includes('favicon')
    );

    if (criticalErrors.length > 0) {
      console.log('⚠️ コンソールエラー:', criticalErrors);
    } else {
      console.log('✅ JSエラーなし: OK');
    }

    expect(criticalErrors.length).toBe(0);
  });

  test('本番URLが応答する', async ({ page }) => {
    const response = await page.goto('https://shukan.vercel.app');
    expect(response?.status()).toBeLessThan(500);
    await page.waitForLoadState('networkidle');

    const title = await page.title();
    console.log('✅ 本番サイト応答: OK (title:', title, ')');
  });
});
