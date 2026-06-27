"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Check, ChevronLeft, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/auth-provider";
import { KPI_CATALOG, type KpiKey } from "@/data/kpi/catalog";
import { KpiIcon } from "@/components/onboarding/kpi-icon";
import {
  createInitialWizardState,
  canAdvanceFromProfile,
  validateProfileInput,
  canAdvanceFromHabits,
  allHabitPresets,
  isPresetEstablished,
  isPresetActive,
  toggleEstablished,
  toggleActive,
  setEstablishedYearsAgo,
  presetPerTimeEffectValue,
  buildLifetimeImpactInput,
  shouldShowPastBlock,
  runOnboardingWrite,
  yearsAgoToEstablishedSince,
  OnboardingWriteError,
  type WizardState,
  type OnboardingGender,
} from "@/lib/onboarding";
import {
  computeLifetimeImpact,
  type LifetimeImpactResult,
} from "@/lib/lifetime-impact";
import { getHabitPreset } from "@/data/habit-presets";

// [0]イントロ 〜 [5]完了 の6画面。進捗バーは入力ステップ [1][2] のみを数える
// （[0]/[3]/[4]/[5] は遷移・演出・結果なので「ステップN/M」のMには含めない）。
const FORM_STEPS = 2; // [1] プロフィール / [2] 習慣選択
const CALCULATING_MS = 2600;

export function OnboardingWizard() {
  const t = useTranslations("onboarding");
  const router = useRouter();
  const { user } = useAuth();
  const [state, setState] = useState<WizardState>(createInitialWizardState);
  const [writing, setWriting] = useState(false);
  const [writeError, setWriteError] = useState(false);
  // 部分失敗→再試行で habit が重複 insert されないよう、成功済みのプリセットID集合を保持（D-C3）。
  const completedPresetIdsRef = useRef<Set<string>>(new Set());

  const setStep = (step: WizardState["step"]) => setState((s) => ({ ...s, step }));

  const presets = allHabitPresets();
  const profileErrors = validateProfileInput(state.profile);

  const updateProfile = (patch: Partial<WizardState["profile"]>) =>
    setState((s) => ({ ...s, profile: { ...s.profile, ...patch } }));

  // [4] 結果（過去累積＋未来一生分）。step が 4 のときだけ計算する。
  const result: LifetimeImpactResult | null = useMemo(() => {
    if (state.step < 4) return null;
    return computeLifetimeImpact(buildLifetimeImpactInput(state));
  }, [state]);

  // [3] 計算中アニメーション → 数秒で [4] へ自動遷移
  useEffect(() => {
    if (state.step !== 3) return;
    const id = setTimeout(() => setStep(4), CALCULATING_MS);
    return () => clearTimeout(id);
  }, [state.step]);

  const handleStart = async () => {
    if (!user) return;
    setWriting(true);
    setWriteError(false);
    try {
      const completed = await runOnboardingWrite({
        userId: user.id,
        profile: state.profile,
        established: state.established.map((e) => ({
          presetId: e.presetId,
          establishedSince: yearsAgoToEstablishedSince(e.yearsAgo),
        })),
        activePresetIds: state.activePresetIds,
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
              <select
                value={state.profile.gender ?? ""}
                onChange={(e) =>
                  updateProfile({
                    gender: (e.target.value || null) as OnboardingGender | null,
                  })
                }
                className={inputClass(false)}
              >
                <option value="" disabled>
                  —
                </option>
                <option value="male">{t("profile.genderMale")}</option>
                <option value="female">{t("profile.genderFemale")}</option>
                <option value="other">{t("profile.genderOther")}</option>
              </select>
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
            onClick={() => setStep(2)}
          >
            {t("profile.next")}
          </PrimaryButton>
        </section>
      )}

      {/* ───────── [2] 習慣選択（2分類） ───────── */}
      {state.step === 2 && (
        <section className="space-y-6">
          <BackLink label={t("back")} onClick={() => setStep(1)} />
          <Heading title={t("habits.title")} subtitle={t("habits.subtitle")} />

          {/* セクションA: 既に習慣になっているもの（established） */}
          <div className="space-y-3">
            <SectionHeading
              title={t("habits.establishedHeading")}
              note={t("habits.establishedNote")}
            />
            <div className="grid gap-3">
              {presets.map((preset) => {
                const selected = isPresetEstablished(state, preset.id);
                const since = state.established.find((e) => e.presetId === preset.id);
                return (
                  <div key={`est-${preset.id}`} className="space-y-2">
                    <PresetCard
                      label={t(`preset.${preset.id}`)}
                      icon={preset.icon}
                      selected={selected}
                      onClick={() => setState((s) => toggleEstablished(s, preset.id))}
                    />
                    {selected && since && (
                      <div className="flex items-center gap-2 pl-2 text-sm">
                        <label
                          htmlFor={`since-${preset.id}`}
                          className="text-muted-foreground"
                        >
                          {t("habits.sinceLabel")}
                        </label>
                        <input
                          id={`since-${preset.id}`}
                          type="number"
                          inputMode="numeric"
                          min={0}
                          max={80}
                          value={since.yearsAgo}
                          onChange={(e) =>
                            setState((s) =>
                              setEstablishedYearsAgo(
                                s,
                                preset.id,
                                e.target.value === "" ? 0 : Number(e.target.value)
                              )
                            )
                          }
                          className="w-20 rounded-lg border border-border bg-card px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                        />
                        <span className="text-muted-foreground">
                          {t("habits.sinceUnit")}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* セクションB: これから始めたいもの（active） */}
          <div className="space-y-3">
            <SectionHeading
              title={t("habits.activeHeading")}
              note={t("habits.activeNote")}
            />
            <div className="grid gap-3">
              {presets.map((preset) => {
                const establishedHere = isPresetEstablished(state, preset.id);
                const selected = isPresetActive(state, preset.id);
                const effect = formatPerTimeEffect(t, preset.id);
                return (
                  <PresetCard
                    key={`act-${preset.id}`}
                    label={t(`preset.${preset.id}`)}
                    icon={preset.icon}
                    subtitle={
                      establishedHere
                        ? t("habits.alreadyEstablished")
                        : effect
                        ? t("habits.effectPerTime", { effect })
                        : undefined
                    }
                    selected={selected}
                    disabled={establishedHere}
                    onClick={() => setState((s) => toggleActive(s, preset.id))}
                  />
                );
              })}
            </div>
          </div>

          <PrimaryButton
            disabled={!canAdvanceFromHabits(state.activePresetIds)}
            onClick={() => setStep(3)}
          >
            {t("habits.cta")}
          </PrimaryButton>
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

      {/* ───────── [4] 結果（二段構え） ───────── */}
      {state.step === 4 && result && (
        <section className="space-y-6">
          <Heading title={t("result.title")} subtitle={t("result.futureNote")} />

          {/* ブロック1: 過去累積（既存習慣がある場合のみ） */}
          {shouldShowPastBlock(result) && (
            <ResultBlock
              heading={t("result.pastHeading")}
              estimatedLabel={t("result.estimatedLabel")}
              result={result}
              variant="past"
              t={t}
            />
          )}

          {/* ブロック2: 未来一生分 */}
          <ResultBlock
            heading={t("result.futureHeading")}
            result={result}
            variant="future"
            t={t}
          />

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

          {state.established.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">
                {t("done.establishedLabel")}
              </p>
              <ul className="space-y-2">
                {state.established.map((e) => (
                  <HabitRow
                    key={e.presetId}
                    presetId={e.presetId}
                    label={t(`preset.${e.presetId}`)}
                    badge={t("done.establishedBadge")}
                  />
                ))}
              </ul>
            </div>
          )}

          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">
              {t("done.activeLabel")}
            </p>
            <ul className="space-y-2">
              {state.activePresetIds.map((id) => (
                <HabitRow key={id} presetId={id} label={t(`preset.${id}`)} />
              ))}
            </ul>
          </div>

          <PrimaryButton onClick={() => router.push("/")}>{t("done.cta")}</PrimaryButton>
        </section>
      )}
    </div>
  );
}

// ───────── 結果ブロック ─────────

function ResultBlock({
  heading,
  estimatedLabel,
  result,
  variant,
  t,
}: {
  heading: string;
  estimatedLabel?: string;
  result: LifetimeImpactResult;
  variant: "past" | "future";
  t: ReturnType<typeof useTranslations>;
}) {
  return (
    <div className="space-y-3 rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold">{heading}</h2>
        {estimatedLabel && (
          <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
            {estimatedLabel}
          </span>
        )}
      </div>
      <ul className="grid gap-3 sm:grid-cols-2">
        {KPI_CATALOG.map((def) => {
          const value = result.byKpi[def.key][variant];
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
                  {formatKpiValue(t, def.key, value)}
                </span>
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/** KPI 値を符号付き・単位付きで表示する。健康寿命/前向きは年、出費削減/稼ぐ能力は円。 */
function formatKpiValue(
  t: ReturnType<typeof useTranslations>,
  kpi: KpiKey,
  value: number
): string {
  const isMinute = kpi === "health_lifespan" || kpi === "positive_mood";
  const unit = isMinute ? t("result.unitYear") : t("result.unitYen");
  const tmpl = kpi === "cost_saving" ? "result.valueReduction" : "result.valueGain";
  return t(tmpl, { value: value.toLocaleString(), unit });
}

/** プリセットの「1回あたり効果」を i18n 済み文字列にする（複数 KPI のうち効果のある最初の軸）。 */
function formatPerTimeEffect(
  t: ReturnType<typeof useTranslations>,
  presetId: string
): string | null {
  const preset = getHabitPreset(presetId);
  if (!preset) return null;
  for (const kpi of preset.primaryKpis) {
    const eff = presetPerTimeEffectValue(presetId, kpi);
    if (!eff) continue;
    return t(eff.isReduction ? "habits.effectReduction" : "habits.effectGain", {
      kpiName: t(`kpi.${eff.kpi}.name`),
      value: eff.value.toLocaleString(),
      unit: t(`kpi.${eff.kpi}.unit`),
    });
  }
  return null;
}

// ───────── プレゼンテーション小物 ─────────

function PresetCard({
  label,
  icon,
  subtitle,
  selected,
  onClick,
  disabled = false,
}: {
  label: string;
  icon: string;
  subtitle?: string;
  selected: boolean;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={selected}
      aria-disabled={disabled || undefined}
      className={cn(
        "flex items-center gap-4 rounded-2xl border p-4 text-left transition-all",
        disabled
          ? "cursor-not-allowed opacity-50 pointer-events-none border-border bg-card"
          : selected
          ? "border-primary bg-primary/5 ring-2 ring-primary/30"
          : "border-border bg-card hover:border-primary/40"
      )}
    >
      <span
        className={cn(
          "flex size-11 shrink-0 items-center justify-center rounded-xl",
          selected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
        )}
      >
        <KpiIcon name={icon} className="size-5" />
      </span>
      <span className="min-w-0 flex-1 space-y-1">
        <span className="block font-semibold leading-tight">{label}</span>
        {subtitle && (
          <span className="block text-xs text-muted-foreground">{subtitle}</span>
        )}
      </span>
      {selected && <Check className="size-5 shrink-0 text-primary" aria-hidden />}
    </button>
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

function SectionHeading({ title, note }: { title: string; note: string }) {
  return (
    <div className="space-y-1">
      <h2 className="text-base font-semibold">{title}</h2>
      <p className="text-xs text-muted-foreground">{note}</p>
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
