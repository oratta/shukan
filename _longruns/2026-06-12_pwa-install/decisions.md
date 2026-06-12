# Decisions Log — PWA インストール可能化

意思決定の記録。各エントリにはエビデンス（実行コマンドと出力）を含める。

## D1: 依存インストールの実施（Setup, 2026-06-12）
- 事象: `npm run test:run` が `sh: vitest: command not found` で失敗
- 判断: worktree に node_modules が無いだけと判断し `npm install` を実行
- エビデンス: install 後 `npm run test:run` → `Test Files 11 passed (11) / Tests 197 passed (197)`
- 注: package.json / package-lock.json への変更はなし（lockfile 通りのインストールのみ）
