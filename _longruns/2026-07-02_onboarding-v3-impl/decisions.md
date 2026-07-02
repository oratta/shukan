# Decisions: onboarding-v3-impl

## D-exec-1: モデル割り当ての per-change 適合（2026-07-02）
plan.md のモデル割り当ては change × ロール単位だが、build-verify テンプレートの埋め込みポイントは
ロール単位の単一値（`__BUILDER_MODEL__` / `__VERIFIER_MODEL__`）のみ。以下で適合させた:

- **builder**: `CHANGES_JSON` の各エントリに `builderModel` を持たせ、生成スクリプトの Build ループで
  `change.builderModel` を参照するよう exec が生成時に調整（A='sonnet'、B/C=null=inherit）。
  モデル値はエイリアスのみ（model-tiers.md で解決済み）。モデル ID の直書きなし
- **verifier**: Verify ループは run 全体を横断検証するため change 別に切り替え不能。
  割り当て中の最上位ティア **sonnet** をグローバル採用（change-A の haiku 指定は上位互換で吸収。
  検証品質は下がらず、コストのみ僅かに増える安全側）
- **fix ラウンドの builder**（Verify FAIL 時の修正）: どの change に触れるか不定のため
  グローバル `builderModel` = null（inherit）を維持
- **reviewer**: 全 change inherit → `__REVIEWER_MODEL__` = null

## D-A-1: change-A（kpi-income-label）実装範囲の確定（2026-07-02）
review-notes.md の NOTE-1/NOTE-2 をそのまま採用し、以下を機械的に置換した（設計判断の余地なし、逐語置換のみ）:
- `src/data/kpi/catalog.ts`: earning KPI の `name: '稼ぐ能力'` → `'増える収入'`、
  `description` 内の語句「稼ぐ能力」→「増える収入」（文全体は書き直さない）
- `src/messages/ja.json` / `en.json`: 同様に `kpi.earning.name`/`description` を追従
  （en は NOTE-2 のとおり `'Earning power'` → `'Income Growth'`、
  description の 'earning power' → 'income growth'）
- コメント3箇所（NOTE-1）: `src/data/average-income.ts:3` / `src/data/habit-presets.ts:177` /
  `src/components/onboarding/onboarding-wizard.tsx:469` の「稼ぐ能力」を「増える収入」に更新
- `headline: '稼ぐ力のある自分へ'`（catalog/ja.json）と記事本文中の「稼ぐ力」プローズ
  （social-connection / morning-light / fermented-food）は対象外のため無変更
- `src/__tests__/kpi-catalog.test.ts` の earning ケースの期待値を追従更新（TDD: RED確認後にGREEN化）
- 完了確認: `grep -rn '稼ぐ能力' src/` が 0 件。`npm test`（634 tests all green）/
  `npm run lint`（0 errors）/ `npx tsc --noEmit`（0 errors）/ `npm run build`（成功）全通過

## D-B-1: change-B（diagnosis-calc-v3）実装方針の確定（2026-07-02）
plan.md「additive 厳守（既存 export の削除・改名・シグネチャ変更をしない）」に従い、新規モジュール
`src/lib/diagnosis-v3.ts` を追加した。既存 `src/lib/lifetime-impact.ts` / `src/lib/onboarding.ts` は一切変更していない。

- **新モジュール分離の判断**: 選択肢は (a) lifetime-impact.ts に v3 関数を追記 / (b) onboarding.ts に追記 /
  (c) 新ファイル。lifetime-impact は「過去累積＋生涯累計（KPI一律 horizon×日数）」の別モデルで、v3 は
  「未来のみ・KPI別 horizon・年額/生涯年/分日 の混在単位」と計算体系が異なる。混ぜると可読性が落ちるため
  (c) 新ファイルを選択（可逆・YAGNI: v3 廃止時はファイル削除で済む）。change-C の旧 API 削除も見通しやすい。
- **per-day 値の取得**: plan.md 指示どおり `presetPerTimeEffectValue`（onboarding.ts）を再利用（再アンカーせず・
  達成率100%基準）。null（効果0）は 0 として扱う。
- **horizon（effect-model.md §1「表示単位」表 = AC#7 が正）**:
  健康寿命 = 残り寿命年 × 365 暦日 / 前向き = horizon 無し（分/日）/ 出費削減・増える収入 = 240 就労日/年
  （＝年額。生涯累計ではない点が lifetime-impact と決定的に異なる）。残り寿命年は
  `resolveDerivedProfileValues`（[1] 実プロフィール由来。null は V2 既定=残り40年）を使用し、
  プロトの固定サンプル（40歳・寿命90＝残り50年）はハードコードしない。
- **表示単位フォーマット（プロト fmt と同一・AC#9）**: 健康=365日以上は「年」小数1桁（`toFixed(1)`）・
  未満は「日」四捨五入 / 前向き=「分/日」四捨五入 / お金=円→万円で四捨五入して「万円/年」。
  桁区切りは `toLocaleString('ja-JP')`。四捨五入・単位換算の期待値は diagnosis-v3.test.ts に逐一明記。
- **公開 API**: `AchievementRate`(0|0.3|0.7|1) / `ACHIEVEMENT_RATES` / `kpiRawValue` / `formatKpiValue` /
  `computeDiagnosisV3` / `habitPotentialV3`（単体習慣の rate=1 ポテンシャル・AC#8 の個別インパクト用）。
- **達成率の永続化なし**（plan スコープ外）: 本モジュールは計算のみ。WizardState/DB 書き込みは change-C。
- 完了確認: `npm test`（655 tests = 既存634 + 新規21・all green）/ `npx tsc --noEmit`（0 errors）/
  `npm run lint`（0 errors）/ `npm run build`（成功）全通過。既存 lifetime-impact.test.ts /
  onboarding-logic.test.ts は無変更で全 green（additive を実証）。
