## 1. i18n 文字列追加

- [x] 1.1 `src/messages/ja.json` に `habits.iGaveIn: "負けた…"` を追加
- [x] 1.2 `src/messages/en.json` に `habits.iGaveIn: "I gave in..."` を追加

## 2. StatusIndicator のタップ可能化

- [x] 2.1 `habit-card.tsx` の quit 習慣用 StatusIndicator をタップ可能にし、タップで `onOpenVsTemptation` を発火する
- [x] 2.2 リングに `cursor-pointer` とインタラクションフィードバック（active スケール等）を追加

## 3. VS モーダルに「負けた」ボタン追加

- [x] 3.1 `vs-temptation-modal.tsx` に `onFailed` コールバック prop を追加
- [x] 3.2 「耐えた！」ボタンの下にテキストリンク風の「負けた…」ボタンを配置（i18n キー使用）
- [x] 3.3 「負けた…」タップで `setDayStatus(habitId, today, 'failed')` を呼び、モーダルを閉じる（トロフィー演出なし）

## 4. 独立 VS ボタン削除

- [x] 4.1 `habit-card.tsx` のカード折りたたみ行から Shield アイコン付き VS ボタンを削除

## 5. 動作確認

- [ ] 5.1 quit 習慣のリングタップで VS モーダルが開くことを確認（手動確認待ち）
- [ ] 5.2 「負けた…」タップで today が failed になりモーダルが閉じることを確認（手動確認待ち）
- [ ] 5.3 カード行に独立 VS ボタンが表示されないことを確認（手動確認待ち）
- [ ] 5.4 positive 習慣の動作に影響がないことを確認（手動確認待ち）
