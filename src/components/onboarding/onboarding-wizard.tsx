"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { ChevronLeft, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/auth-provider";
import { KPI_CATALOG, type KpiKey } from "@/data/kpi/catalog";
import { KpiIcon } from "@/components/onboarding/kpi-icon";
import {
  createInitialWizardState,
  canAdvanceFromProfile,
  validateProfileInput,
  onboardingV3Presets,
  availableAchievementRates,
  tapHabitRate,
  completeHabitAdvance,
  backInHabits,
  getHabitRate,
  buildDiagnosisSelections,
  profileInputToUserProfile,
  runOnboardingWrite,
  rateToHabitStatus,
  ONBOARDING_V3_PRESET_IDS,
  OnboardingWriteError,
  type WizardState,
  type OnboardingGender,
} from "@/lib/onboarding";
import {
  computeDiagnosisV3,
  habitPotentialV3,
  type AchievementRate,
  type DiagnosisV3Result,
} from "@/lib/diagnosis-v3";
import { getHabitPreset } from "@/data/habit-presets";

// [0]イントロ 〜 [5]完了 の6画面。進捗バーは入力ステップ [1][2] のみを数える。
const FORM_STEPS = 2; // [1] プロフィール / [2] 段階タップ診断
const CALCULATING_MS = 2600;
const HABIT_ADVANCE_MS = 460; // タップ→次の習慣までの余韻

// 達成率 → 4択ラベルの i18n キー。
const RATE_LEVEL_KEY: Record<number, "full" | "most" | "sometimes" | "none"> = {
  1: "full",
  0.7: "most",
  0.3: "sometimes",
  0: "none",
};

const V3_PRESETS = onboardingV3Presets();
const TOTAL_HABITS = V3_PRESETS.length;

export function OnboardingWizard() {
  const t = useTranslations("onboarding");
  const router = useRouter();
  const { user } = useAuth();
  const [state, setState] = useState<WizardState>(createInitialWizardState);
  const [writing, setWriting] = useState(false);
  const [writeError, setWriteError] = useState(false);
  // 部分失敗→再試行で habit が重複 insert されないよう、成功済みのプリセットID集合を保持。
  const completedPresetIdsRef = useRef<Set<string>>(new Set());

  const setStep = (step: WizardState["step"]) => setState((s) => ({ ...s, step }));

  const profileErrors = validateProfileInput(state.profile);

  const updateProfile = (patch: Partial<WizardState["profile"]>) =>
    setState((s) => ({ ...s, profile: { ...s.profile, ...patch } }));

  // 計算用プロフィール（[1] の実プロフィール由来。診断の horizon 算出に使う）。
  const calcProfile = useMemo(() => profileInputToUserProfile(state.profile), [state.profile]);

  // 上部4KPIライブ累計（回答済み習慣 × 達成率・未来のみ）。
  const liveResult: DiagnosisV3Result = useMemo(
    () => computeDiagnosisV3({ selections: buildDiagnosisSelections(state), profile: calcProfile }),
    [state, calcProfile]
  );

  // [4] 結果（未来のみ・単一表示）。step が 4 のときだけ計算する。
  const result: DiagnosisV3Result | null = useMemo(() => {
    if (state.step < 4) return null;
    return computeDiagnosisV3({ selections: buildDiagnosisSelections(state), profile: calcProfile });
  }, [state, calcProfile]);

  // [3] 計算中アニメーション → 数秒で [4] へ自動遷移
  useEffect(() => {
    if (state.step !== 3) return;
    const id = setTimeout(() => setStep(4), CALCULATING_MS);
    return () => clearTimeout(id);
  }, [state.step]);

  // 4択タップ: 達成率記録 → 余韻 → 次の習慣へ（最後なら [3] 計算中へ）。
  // 連打ガード（advancing）は純粋関数側（tapHabitRate / completeHabitAdvance）が持つため、
  // 余分にスケジュールされたタイマーは no-op になる。
  const chooseRate = (presetId: string, rate: AchievementRate) => {
    setState((s) => tapHabitRate(s, presetId, rate));
    window.setTimeout(() => setState(completeHabitAdvance), HABIT_ADVANCE_MS);
  };

  const goBackInHabits = () => setState(backInHabits);

  const handleStart = async () => {
    if (!user) return;
    setWriting(true);
    setWriteError(false);
    try {
      const completed = await runOnboardingWrite({
        userId: user.id,
        profile: state.profile,
        rates: state.rates,
        completedPresetIds: completedPresetIdsRef.current,
      });
      completedPresetIdsRef.current = completed;
      setWriting(false);
      setStep(5);
    } catch (error) {
      if (error instanceof OnboardingWriteError) {
        completedPresetIdsRef.current = error.succeededPresetIds;
      }
      setWriteError(true);
      setWriting(false);
    }
  };

  const currentPreset = V3_PRESETS[state.habitIndex];

  return (
    <div className="space-y-8">
      {(state.step === 1 || state.step === 2) && (
        <StepProgress current={state.step} total={FORM_STEPS} />
      )}

      {/* ───────── [0] イントロ ───────── */}
      {state.step === 0 && (
        <section className="flex min-h-[60dvh] flex-col justify-center space-y-8 text-center">
          <div className="space-y-3">
            <h1 className="text-3xl font-bold leading-tight tracking-tight">
              {t("intro.title")}
            </h1>
            <p className="text-base text-muted-foreground">{t("intro.subtitle")}</p>
          </div>
          <div className="space-y-3">
            <PrimaryButton onClick={() => setStep(1)}>{t("intro.cta")}</PrimaryButton>
            <p className="text-xs text-muted-foreground">{t("intro.note")}</p>
          </div>
        </section>
      )}

      {/* ───────── [1] プロフィール ───────── */}
      {state.step === 1 && (
        <section className="space-y-6">
          <BackLink label={t("back")} onClick={() => setStep(0)} />
          <Heading title={t("profile.title")} subtitle={t("profile.subtitle")} />
          <div className="space-y-5">
            <Field label={t("profile.age")}>
              <input
                type="number"
                inputMode="numeric"
                min={1}
                max={120}
                value={state.profile.age ?? ""}
                onChange={(e) =>
                  updateProfile({
                    age: e.target.value === "" ? null : Number(e.target.value),
                  })
                }
                className={inputClass(!!profileErrors.age && state.profile.age !== null)}
              />
            </Field>

            <Field label={t("profile.gender")}>
              <div className="grid grid-cols-3 gap-2">
                {(["male", "female", "other"] as const).map((g) => {
                  const selected = state.profile.gender === g;
                  const label =
                    g === "male"
                      ? t("profile.genderMale")
                      : g === "female"
                      ? t("profile.genderFemale")
                      : t("profile.genderOther");
                  return (
                    <button
                      key={g}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => updateProfile({ gender: g as OnboardingGender })}
                      className={cn(
                        "rounded-xl border px-3 py-3 text-sm font-medium transition-colors",
                        selected
                          ? "border-primary bg-primary/5 text-primary ring-2 ring-primary/30"
                          : "border-border bg-card text-foreground hover:border-primary/40"
                      )}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </Field>

            <Field label={t("profile.country")}>
              <select
                value={state.profile.country}
                onChange={(e) => updateProfile({ country: e.target.value })}
                className={inputClass(false)}
              >
                <option value="JP">{t("profile.countryJapan")}</option>
              </select>
            </Field>

            <Field label={t("profile.annualIncome")} hint={t("profile.optional")}>
              <div className="relative">
                <input
                  type="number"
                  inputMode="numeric"
                  min={0}
                  placeholder={t("profile.incomePlaceholder")}
                  value={
                    state.profile.annualIncome === null
                      ? ""
                      : state.profile.annualIncome / 10000
                  }
                  onChange={(e) =>
                    updateProfile({
                      annualIncome:
                        e.target.value === "" ? null : Number(e.target.value) * 10000,
                    })
                  }
                  className={cn(inputClass(!!profileErrors.annualIncome), "pr-14")}
                />
                <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-sm text-muted-foreground">
                  {t("profile.incomeUnit")}
                </span>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                {t("profile.incomeNote")}
              </p>
            </Field>
          </div>
          <PrimaryButton
            disabled={!canAdvanceFromProfile(state.profile)}
            onClick={() => setState((s) => ({ ...s, step: 2, habitIndex: 0 }))}
          >
            {t("profile.next")}
          </PrimaryButton>
        </section>
      )}

      {/* ───────── [2] 段階タップ診断（1画面1習慣・4択） ───────── */}
      {state.step === 2 && currentPreset && (
        <section className="space-y-5">
          <div className="flex items-center gap-3">
            <BackLink label={t("back")} onClick={goBackInHabits} />
            <span className="ml-auto text-xs font-medium text-muted-foreground tabular-nums">
              {t("habits.countLabel", {
                current: state.habitIndex + 1,
                total: TOTAL_HABITS,
              })}
            </span>
          </div>

          {/* 上部: 4KPIライブ累計（固定表示） */}
          <div className="rounded-2xl border border-border bg-card p-4">
            <p className="mb-3 text-xs text-muted-foreground">{t("habits.liveLead")}</p>
            <ul className="grid grid-cols-2 gap-x-4 gap-y-3">
              {KPI_CATALOG.map((def) => {
                const v = liveResult.byKpi[def.key];
                return (
                  <li key={def.key} className="flex items-center justify-between gap-2">
                    <span className="flex min-w-0 items-center gap-1.5">
                      <KpiIcon name={def.icon} className="size-3.5 shrink-0 text-primary" />
                      <span className="truncate text-[11px] text-muted-foreground">
                        {t(`kpi.${def.key}.name`)}
                      </span>
                    </span>
                    <span className="shrink-0 text-sm font-bold tabular-nums">
                      {v.display}
                      <span className="ml-0.5 text-[10px] font-semibold text-muted-foreground">
                        {v.unit}
                      </span>
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* 中央: 習慣カード（タイトル・個別インパクト・補足） */}
          <div className="space-y-4">
            <h1 className="text-xl font-bold leading-snug tracking-tight">
              {t(`preset.${currentPreset.id}`)}
            </h1>

            <HabitImpactBox presetId={currentPreset.id} profileResult={habitPotentialV3(currentPreset.id, calcProfile)} t={t} />

            <p className="text-xs leading-relaxed text-muted-foreground">
              {t(`habitSub.${currentPreset.id}`)}
            </p>
          </div>

          {/* 質問 */}
          <p className="text-sm font-bold">{t("habits.ask")}</p>

          {/* 最下部: 4択 2×2 グリッド */}
          <div className="grid grid-cols-2 gap-2.5">
            {availableAchievementRates(currentPreset.id).map((rate) => {
              const levelKey = RATE_LEVEL_KEY[rate];
              const selected = getHabitRate(state, currentPreset.id) === rate;
              return (
                <button
                  key={rate}
                  type="button"
                  aria-pressed={selected}
                  disabled={state.advancing}
                  onClick={() => chooseRate(currentPreset.id, rate)}
                  className={cn(
                    "flex flex-col items-start gap-1 rounded-2xl border p-3.5 text-left transition-all active:scale-[0.98]",
                    selected
                      ? "border-primary bg-primary/5 ring-2 ring-primary/30"
                      : "border-border bg-card hover:border-primary/40"
                  )}
                >
                  <span className="flex w-full items-center justify-between gap-2">
                    <span className="text-sm font-bold leading-tight">
                      {t(`habits.levels.${levelKey}.label`)}
                    </span>
                    <span className="text-xs font-bold text-muted-foreground tabular-nums">
                      {Math.round(rate * 100)}%
                    </span>
                  </span>
                  <span className="text-[11px] leading-tight text-muted-foreground">
                    {t(`habits.levels.${levelKey}.desc`)}
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* ───────── [3] 計算中 ───────── */}
      {state.step === 3 && (
        <section className="flex min-h-[60dvh] flex-col items-center justify-center space-y-6 text-center">
          <Loader2 className="size-10 animate-spin text-primary" aria-hidden />
          <h1 className="text-xl font-bold tracking-tight">{t("calculating.title")}</h1>
          <ul className="space-y-1.5 text-sm text-muted-foreground" aria-live="polite">
            <li>{t("calculating.phase1")}</li>
            <li>{t("calculating.phase2")}</li>
            <li>{t("calculating.phase3")}</li>
          </ul>
        </section>
      )}

      {/* ───────── [4] 結果（未来のみ・単一表示） ───────── */}
      {state.step === 4 && result && (
        <section className="space-y-6">
          <Heading title={t("result.title")} subtitle={t("result.lead")} />

          <div className="rounded-2xl border border-border bg-card p-5">
            <ul className="grid gap-4 sm:grid-cols-2">
              {KPI_CATALOG.map((def) => {
                const v = result.byKpi[def.key];
                return (
                  <li key={def.key} className="flex items-center gap-3">
                    <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <KpiIcon name={def.icon} className="size-5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-xs text-muted-foreground">
                        {t(`kpi.${def.key}.name`)}
                      </span>
                      <span className="block text-lg font-bold tabular-nums">
                        {t("result.value", { value: v.display, unit: v.unit })}
                      </span>
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>

          {writeError && (
            <div
              role="alert"
              className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive"
            >
              {t("writeError")}
            </div>
          )}

          <PrimaryButton disabled={writing} onClick={handleStart}>
            {writing ? t("starting") : t("result.cta")}
          </PrimaryButton>
          <p className="text-center text-xs text-muted-foreground">
            {t("result.footnote")}
          </p>
        </section>
      )}

      {/* ───────── [5] 完了 ───────── */}
      {state.step === 5 && (
        <section className="space-y-6">
          <Heading title={t("done.title")} subtitle={t("done.body")} />

          <RegisteredHabits state={state} t={t} />

          <PrimaryButton onClick={() => router.push("/")}>{t("done.cta")}</PrimaryButton>
        </section>
      )}
    </div>
  );
}

// ───────── 個別インパクトボックス（達成率100%・未来分の4KPI） ─────────

function HabitImpactBox({
  presetId,
  profileResult,
  t,
}: {
  presetId: string;
  profileResult: DiagnosisV3Result;
  t: ReturnType<typeof useTranslations>;
}) {
  return (
    <div className="rounded-xl border border-border bg-muted/30 p-3">
      <p className="mb-2.5 text-[11px] font-semibold text-muted-foreground">
        {t("habits.impactLead")}
      </p>
      <div className="grid grid-cols-4 gap-2">
        {KPI_CATALOG.map((def) => {
          const v = profileResult.byKpi[def.key];
          const dim = v.raw <= 0;
          return (
            <div key={def.key} className="flex flex-col items-center gap-1 text-center">
              <KpiIcon
                name={def.icon}
                className={cn("size-4", dim ? "text-muted-foreground/50" : "text-primary")}
              />
              <span
                className={cn(
                  "text-[13px] font-bold leading-none tabular-nums",
                  dim ? "text-muted-foreground" : "text-foreground"
                )}
              >
                {dim ? "—" : `+${v.display}`}
                {!dim && (
                  <span className="ml-0.5 text-[9px] font-semibold text-muted-foreground">
                    {v.unit}
                  </span>
                )}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ───────── 完了画面: 登録される習慣（達成率>0） ─────────

function RegisteredHabits({
  state,
  t,
}: {
  state: WizardState;
  t: ReturnType<typeof useTranslations>;
}) {
  const registered = ONBOARDING_V3_PRESET_IDS.map((id) => {
    const rate = state.rates[id];
    const status = rate === undefined ? null : rateToHabitStatus(rate);
    return status ? { id, status } : null;
  }).filter((x): x is { id: string; status: "active" | "established" } => x !== null);

  if (registered.length === 0) {
    return <p className="text-sm text-muted-foreground">{t("done.emptyNote")}</p>;
  }

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-muted-foreground">{t("done.habitsLabel")}</p>
      <ul className="space-y-2">
        {registered.map(({ id, status }) => (
          <HabitRow
            key={id}
            presetId={id}
            label={t(`preset.${id}`)}
            badge={status === "established" ? t("done.establishedBadge") : undefined}
          />
        ))}
      </ul>
    </div>
  );
}

function HabitRow({
  presetId,
  label,
  badge,
}: {
  presetId: string;
  label: string;
  badge?: string;
}) {
  const preset = getHabitPreset(presetId);
  if (!preset) return null;
  return (
    <li className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3">
      <span className="flex size-8 items-center justify-center rounded-lg bg-muted text-muted-foreground">
        <KpiIcon name={preset.icon} className="size-4" />
      </span>
      <span className="flex-1 font-medium">{label}</span>
      {badge && (
        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
          {badge}
        </span>
      )}
    </li>
  );
}

// ───────── プレゼンテーション小物 ─────────

function StepProgress({ current, total }: { current: number; total: number }) {
  const t = useTranslations("onboarding");
  return (
    <div className="space-y-2">
      <div className="flex gap-1.5" aria-hidden>
        {Array.from({ length: total }).map((_, i) => (
          <span
            key={i}
            className={cn(
              "h-1.5 flex-1 rounded-full transition-colors",
              i < current ? "bg-primary" : "bg-muted"
            )}
          />
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        {t("stepLabel", { current, total })}
      </p>
    </div>
  );
}

function Heading({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="space-y-1.5">
      <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
      <p className="text-sm text-muted-foreground">{subtitle}</p>
    </div>
  );
}

function BackLink({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
    >
      <ChevronLeft className="size-4" aria-hidden />
      {label}
    </button>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="flex items-center gap-2 text-sm font-medium">
        {label}
        {hint && (
          <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-normal text-muted-foreground">
            {hint}
          </span>
        )}
      </span>
      {children}
    </label>
  );
}

function PrimaryButton({
  disabled,
  onClick,
  children,
}: {
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="w-full rounded-xl bg-primary px-4 py-3.5 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {children}
    </button>
  );
}

function inputClass(error: boolean): string {
  return cn(
    "w-full rounded-xl border bg-card px-4 py-3 text-sm shadow-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20",
    error ? "border-destructive" : "border-border"
  );
}
