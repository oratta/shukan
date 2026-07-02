# 実装仕様: オンボーディング [2] 確定習慣の反映

このセッションで確定した「オンボーディングで出す習慣」をコードに載せる。背景と根拠は
`docs/context/onboarding-v3-effect-model.md` §8、エビデンス値は
`_longruns/2026-06-28_onboarding-v3-interactive/research/{social-connection,morning-light,fermented-food}.md`。

**スコープ厳守**: health＋mood 系の確定分と新規3本のみ実装する。cost/earning 系の未レビュープリセット
（daily_saving_habit / stop_impulse_buying / cook_at_home / deep_focus_work / morning_routine /
cut_digital_distraction / keep_learning）は**今回いっさい変更しない**（残置）。

---

## 1. 新規 impact 記事を3本作成

`src/data/impact-articles/` に kebab-case で作成。型は `LifeImpactArticle`（`daily-strength.ts` を雛形に）。
本文（researchBody / inferences / sources / calculationLogic）は各ドシエ `research/*.md` の内容を使う。
researchBody は既存記事同様の日本語・{{health_inference}}{{cost_inference}}{{income_inference}}{{cumulative}} プレースホルダ入り。
calculationParams は下記（ドシエ値をそのまま／整数）。confidenceLevel はドシエの留保を踏まえ設定。

| ファイル | export 名 | habitCategory | calculationParams (health/cost/income/mood) | confidence | defaultIcon(lucide) |
|---|---|---|---|---|---|
| social-connection.ts | socialConnection | 'social_connection' | 6 / 300 / 900 / 55 | medium | message-circle-heart |
| morning-light.ts | morningLight | 'morning_light' | 4 / 100 / 650 / 58 | medium | sunrise |
| fermented-food.ts | fermentedFood | 'fermented_food' | 5 / 20 / 600 / 20 | medium | soup |

- defaultHabitType: 3本とも 'positive'。
- social-connection と morning-light は mood が主効果、health も副次。fermented-food は health 主・mood 副次。
- 各記事の calculationLogic は該当ドシエ「calculationLogic 案」を TS 配列に落とす（label/value/formula/result）。
- inferences.cumulative（1ヶ月/1年/10年）は calculationParams から算出して記述（daily-strength の書式に倣う）。

## 2. ArticleId 型に3件追加（`src/types/impact.ts`）

- `ArticleId` union に `'social_connection' | 'morning_light' | 'fermented_food'` を追加。
- `VALID_ARTICLE_IDS` 配列にも同3件を追加。

## 3. 記事レジストリ登録（`src/data/impact-articles/index.ts`）

- import 3行追加、Map に3エントリ追加（適切なコメント区分に）。

## 4. `src/data/habit-presets.ts` を最終リストに置換

**最終プリセット（health＋mood）。id / name / articleIds / primaryKpis / icon:**

health_lifespan 系:
1. `quit_smoking_for_health` / 「タバコを吸わない」/ ['quit_smoking'] / ['health_lifespan'] / cigarette-off  ※nameとlabel更新
2. `daily_cardio_habit` / 「少し息が切れるくらいの運動を毎日行う」/ ['daily_cardio'] / ['health_lifespan','positive_mood'] / person-standing  ※walking除去
3. `solid_sleep` / 「毎日6〜8時間の睡眠をとる」/ ['sleep_7hours'] / ['health_lifespan','earning'] / moon  ※no_screens除去
4. `eat_vegetables_habit` / 「野菜・果物を1日5皿（約350g）食べる」/ ['eat_vegetables'] / ['health_lifespan'] / salad
5. `drink_water_habit` / 「毎日コップ8杯（約1.5L）の水を飲む」/ ['drink_water'] / ['health_lifespan'] / glass-water
6. `quit_sugar_habit` / 「砂糖入りの飲み物・お菓子をとらない」/ ['quit_sugar'] / ['health_lifespan'] / candy-off
7. `quit_junk_food_habit` / 「ジャンクフードを食べない」/ ['quit_junk_food'] / ['health_lifespan'] / hamburger  ※lucide要確認、なければ 'utensils-crossed'
8. `daily_strength_habit` / 「毎日、筋トレをする（自重でOK）」/ ['daily_strength'] / ['health_lifespan'] / dumbbell  ※新規
9. `fermented_food_habit` / 「毎日1品、発酵食品を食べる（納豆・味噌・ヨーグルトなど）」/ ['fermented_food'] / ['health_lifespan'] / soup  ※新規

cost_saving 系（この確定分のみ・既存 daily_saving/stop_impulse/cook_at_home は残置）:
10. `quit_alcohol_habit` / 「アルコールを飲まない」/ ['quit_alcohol'] / ['cost_saving'] / wine-off  ※旧 quit_drinking を統合・置換

positive_mood 系:
11. `daily_meditation_habit` / 「毎日の瞑想」/ ['daily_meditation'] / ['positive_mood'] / brain  ※変更なし
12. `daily_journaling_habit` / 「毎日、感情を吐き出す日記を書く」/ ['daily_journaling'] / ['positive_mood'] / pen-line  ※旧 gratitude_and_journaling 置換・gratitude除去
13. `time_in_nature_habit` / 「毎日20分、自然の中で過ごす」/ ['time_in_nature'] / ['positive_mood'] / tree-pine  ※walking除去
14. `social_connection_habit` / 「毎日、誰かと近況や気持ちを打ち明け合う会話をする」/ ['social_connection'] / ['positive_mood','health_lifespan'] / message-circle-heart  ※新規
15. `morning_light_habit` / 「毎日、起床後1時間以内に10分以上、外の光を浴びる」/ ['morning_light'] / ['positive_mood','health_lifespan'] / sunrise  ※新規

**削除するプリセット**: `balanced_eating`（→4-6に分割）, `cut_junk`（→7と10に分割）, `quit_drinking`（→10に統合）,
`mindful_movement`（ヨガ・ストレッチ廃止）, `gratitude_and_journaling`（→12に置換）。

**残置（変更禁止）**: `daily_saving_habit`, `stop_impulse_buying`, `cook_at_home`, `deep_focus_work`,
`morning_routine`, `cut_digital_distraction`, `keep_learning`。

- defaultHabitType は各記事の性質に合わせ既存慣例どおり（quit系は 'quit'、それ以外 'positive'）。
- lucide アイコン名は実在するものを使う（`node_modules/lucide-react` で確認、無ければ近い実在アイコンに）。

## 5. メッセージ更新（`src/messages/ja.json` と `src/messages/en.json` の `onboarding.preset`）

- **削除**: balanced_eating, cut_junk, quit_drinking, mindful_movement, gratitude_and_journaling。
- **更新**: quit_smoking_for_health, daily_cardio_habit, solid_sleep, time_in_nature_habit のラベルを上記 name に。
- **追加**: eat_vegetables_habit, drink_water_habit, quit_sugar_habit, quit_junk_food_habit, quit_alcohol_habit,
  daily_strength_habit, fermented_food_habit, daily_journaling_habit, social_connection_habit, morning_light_habit。
- ja は上記日本語 name をそのまま。en は自然な英訳（例: social_connection_habit = "Have a heart-to-heart conversation every day"）。
- ja/en でキーの集合を完全一致させる（パリティ厳守）。

## 6. テスト更新

- `src/__tests__/{onboarding-logic,lifetime-impact,onboarding-write}.test.ts` が `quit_drinking` / `daily_cardio_habit` 等の
  旧定義・旧効果値に依存している箇所を、新プリセット定義・新効果値に合わせて更新する。
- 効果値が変わる主因: daily_cardio_habit（walking除去で健康21→10等）, solid_sleep（no_screens除去）,
  balanced_eating→分割, cut_junk/quit_drinking→再編。テストの期待値を新 calculationParams で再計算して直す。

## 7. 検証（必須・順に実行し全て通す）

```
npm run lint
npx tsc --noEmit        # 型チェック
npm test                # 全テストグリーン
npm run build           # 本番ビルド成功
```

- 途中エラーは自分で直す。特に ArticleId 型の網羅性、messages パリティ、テスト期待値。
- 完了したら「変更ファイル一覧」「テスト結果」「新オンボーディング習慣数（health/mood/cost/earning 各ボックスの件数）」を報告。

## 参考（既存記事の calculationParams＝効果値の相場感）
- quit_smoking: 健康14/ mood0 など強め。 eat_vegetables: 10/300/600/0。 daily_journaling: 5/100/800/58。
- 新3本は既存と比べ過大でない保守値。フロスは不採用（実装対象外）。
