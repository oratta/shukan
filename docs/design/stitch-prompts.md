# Smitch - Stitch UI プロンプト集

DESIGN.md のブランド情報を反映した各画面のプロンプト。
Stitch UI（stitch.withgoogle.com）に貼り付けて使う。

生成後、Voice Canvas や手動編集で磨いてからエクスポートする。

---

## 共通 Vibe（全画面に適用）

```
Brand: "Smitch" — evidence-based life path builder.
Tone: Quiet confidence, intellectual, calm. Like Linear meets Calm app.
Color palette: Deep indigo #2B4162 (primary), Bright blue #4A8FE7 (accent),
Green #3D8A5A (success/completed), Coral #D08068 (failed),
Warm gold #B8860B (impact metrics), Background #F8F9FA (light), #0F1923 (dark).
Typography: Clean sans-serif (Geist-like), generous whitespace.
No flashy gradients, no gamification feel. Professional, trustworthy, minimal.
```

---

## 1. Home Screen（最重要）

```
Habit tracking home screen for "Smitch", an evidence-based life improvement app.

Anatomy: Single-column mobile layout, max-width 672px centered.
Sticky frosted-glass header at top: small logo mark on left, avatar + theme toggle on right.
Fixed bottom tab bar with 4 items: Home, Discover, Stats, Settings.

Main content (scrollable, top to bottom):
1. Page title "Habits" in large bold, with "3/5 completed" subtitle in muted text.
2. Thin horizontal progress bar (green fill on gray track, rounded).
3. Daily Impact Summary card:
   - Header row: "Today's Impact" label.
   - Three metric columns side by side: Health (heart icon, "+18 min"),
     Cost (wallet icon, "¥274"), Income (trending-up icon, "¥68").
   - Each shows earned/total format like "18/24 min".
   - Thin divider line.
   - "5 Days" section with same 3-column layout showing cumulative impact.
4. Yesterday Review Banner (amber/warm tone card):
   - Calendar-check icon + "Review yesterday's habits" + "2 unchecked" badge + chevron.
5. Habit cards list (vertical stack, each card expandable):
   - Each card: drag handle + completion circle + habit name +
     row of past-day dots with weekday labels (月火水木金) above.
   - Completed habits show green filled circle.
   - Uncompleted show empty circle outline.

Vibe: Deep indigo (#2B4162) primary, bright blue (#4A8FE7) accents.
Clean white cards on #F8F9FA background. Green #3D8A5A for completed states.
Calm, intellectual, not gamified. Generous padding and whitespace.
Feels like a premium health app, not a todo list.

Content:
- Header: Smitch logo mark + "Smitch"
- Habits: "Morning Run" (completed, 12-day streak), "Read 30 min" (completed),
  "Meditate" (not done), "Take Vitamins" (not done), "No Sugar" (completed, quit type)
- Impact values: Health +18/24 min, Cost ¥274/¥320, Income ¥68/¥95
- Bottom nav: Home (active), Discover, Stats, Settings
```

---

## 2. Login Screen

```
Login screen for "Smitch", an evidence-based life path builder app.

Anatomy: Full viewport height, vertically centered content.
Single card or clean layout with generous top spacing.

Content (centered vertically):
1. Smitch logo mark (abstract M/W mountain path shape in indigo).
2. "Smitch" wordmark below logo, large and bold.
3. Tagline: "Switch your path." in muted smaller text.
4. Generous spacing.
5. "Sign in with Google" button — full width, white background,
   Google icon on left, rounded corners, subtle border.

Vibe: Deep indigo (#2B4162) for logo and text.
Light background #F8F9FA. Minimal, no decoration, lots of breathing room.
Premium and trustworthy. The login screen should feel like opening
a high-end journal, not a tech product.

Content:
- Logo: abstract geometric M shape (mountain trail silhouette)
- Brand: "Smitch"
- Tagline: "Switch your path."
- CTA: "Sign in with Google"
```

---

## 3. Stats Screen

```
Statistics dashboard for "Smitch" habit tracking app.

Anatomy: Single-column mobile layout, scrollable.
Header and bottom nav same as home screen.

Content sections (top to bottom):
1. Page title "Statistics" in large bold.
2. Two-column grid of stat cards:
   - Left: Current Streak — flame icon (orange), large "8" number, "days avg" label.
   - Right: Longest Streak — trophy icon (yellow), large "23" number, "days" label.
3. Completion Rate card:
   - Circular progress ring (large, green) on left.
   - "78%" large text + "Completion Rate (This Month)" label on right.
4. Total Life Impact Savings card:
   - Header: "Total Life Impact" + green "Cumulative" badge.
   - Three rows on warm cream background (#FFF8F0):
     - Health: heart icon, "+3.2 hours" in warm gold.
     - Cost Savings: wallet icon, "¥8,400" in warm gold.
     - Income Gain: trending-up icon, "¥2,100" in warm gold.
5. Review History section:
   - Section title "Review History" with divider above.
   - Monthly calendar grid (7 columns for weekdays).
   - Each past day has a small colored dot: green (good mood),
     yellow (neutral), red (low mood), none (no data).
   - Month navigation arrows.
   - Selected day expands inline detail below calendar.

Vibe: Same brand palette. Cards with subtle shadows instead of borders.
Data-rich but not overwhelming. Warm gold (#B8860B) for impact numbers
on cream (#FFF8F0) backgrounds. Clean, analytical, trustworthy.
```

---

## 4. Discover Screen

```
Evidence-based habit discovery screen for "Smitch".

Anatomy: Single-column mobile layout.
Two sections: "Quit Habits" and "Build Habits", each with 2-column card grid.

Content:
1. Page title "Discover" in large bold.
2. Section: "Quit Habits" (section heading).
   - 2-column grid of article cards:
     - Each card: hero image (h-28, rounded top),
       title below, impact metrics (health/cost/income in small text),
       confidence badge (High/Medium pill).
   - Example cards: "Quit Smoking", "Reduce Alcohol", "No Late-Night Snacking"
3. Section: "Build Habits" (section heading).
   - Same 2-column grid:
   - Example cards: "Daily Exercise", "Morning Meditation", "Reading 30min",
     "Healthy Breakfast", "Quality Sleep"

Vibe: Cards with subtle elevation, rounded corners (12-16px radius).
Hero images with slight overlay for readability.
Impact metrics in warm gold on each card.
Confidence badges: green for High, amber for Medium.
Browse-friendly, magazine-like layout. Inviting but not pushy.
```

---

## 5. Settings Screen

```
Settings screen for "Smitch" app.

Anatomy: Single-column mobile layout. Stacked card sections.

Content sections:
1. Page title "Settings" in large bold.
2. Account card:
   - User avatar (circle, 40px) + name + email.
   - "Data synced" status in tiny muted text.
   - Divider.
   - "Sign out" button (outline style, full width).
3. Appearance card:
   - "Theme" row: three equal buttons — Light (sun icon),
     Dark (moon icon), System (monitor icon). Active one highlighted.
   - Divider.
   - "Language" row: two equal buttons — English, 日本語. Active highlighted.
4. Data card:
   - Three full-width outline buttons stacked:
     - "Export Data" (download icon)
     - "Import Data" (upload icon)
     - "Reset All Data" (trash icon, red/destructive text)
5. About card:
   - "Version" label on left, "1.0.0" on right.

Vibe: Clean, utilitarian, lots of breathing room.
Cards with subtle borders, not heavy shadows.
Destructive actions clearly marked in red.
Feels like iOS Settings — familiar, trustworthy, no surprises.
```
