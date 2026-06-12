"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Check, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/auth-provider";
import { KPI_CATALOG, type KpiKey } from "@/data/kpi/catalog";
import { KpiIcon } from "@/components/onboarding/kpi-icon";
import {
  createInitialWizardState,
  canAdvanceFromKpi,
  canAdvanceFromProfile,
  validateProfileInput,
  canAdvanceFromPresets,
  presetsForKpi,
  presetPerTimeEffect,
  runOnboardingWrite,
  OnboardingWriteError,
  type WizardState,
  type OnboardingGender,
} from "@/lib/onboarding";
import { getHabitPreset } from "@/data/habit-presets";

const TOTAL_STEPS = 4;

export function OnboardingWizard() {
  const t = useTranslations("onboarding");
  const router = useRouter();
  const { user } = useAuth();
  const [state, setState] = useState<WizardState>(createInitialWizardState);
  const [writing, setWriting] = useState(false);
  const [writeError, setWriteError] = useState(false);
  // 部分失敗→再試行で habit が重複 insert されないよう、書き込み成功済みの
  // プリセットID集合をレンダーをまたいで保持する（D-C3）。
  const completedPresetIdsRef = useRef<Set<string>>(new Set());

  const setStep = (step: WizardState["step"]) =>
    setState((s) => ({ ...s, step }));

  const selectedKpiDef = useMemo(
    () => KPI_CATALOG.find((d) => d.key === state.selectedKpi) ?? null,
    [state.selectedKpi]
  );

  const presets = useMemo(
    () => (state.selectedKpi ? presetsForKpi(state.selectedKpi) : []),
    [state.selectedKpi]
  );

  const profileErrors = validateProfileInput(state.profile);

  // ───────── ステップ操作 ─────────
  const selectKpi = (key: KpiKey) =>
    setState((s) => ({ ...s, selectedKpi: key }));

  const togglePreset = (id: string) =>
    setState((s) => ({
      ...s,
      selectedPresetIds: s.selectedPresetIds.includes(id)
        ? s.selectedPresetIds.filter((p) => p !== id)
        : [...s.selectedPresetIds, id],
    }));

  const updateProfile = (patch: Partial<WizardState["profile"]>) =>
    setState((s) => ({ ...s, profile: { ...s.profile, ...patch } }));

  const handleStart = async () => {
    if (!user || !state.selectedKpi) return;
    setWriting(true);
    setWriteError(false);
    try {
      // 前回までに成功したプリセットを引き継ぎ、未完了分のみ書き込む（重複防止・D-C3）
      const completed = await runOnboardingWrite({
        userId: user.id,
        selectedKpi: state.selectedKpi,
        profile: state.profile,
        selectedPresetIds: state.selectedPresetIds,
        completedPresetIds: completedPresetIdsRef.current,
      });
      completedPresetIdsRef.current = completed;
      router.push("/");
    } catch (error) {
      // 失敗時も、それまでに成功した集合は次の再試行のために保持する
      if (error instanceof OnboardingWriteError) {
        completedPresetIdsRef.current = error.succeededPresetIds;
      }
      setWriteError(true);
      setWriting(false);
    }
  };

  return (
    <div className="space-y-8">
      <StepProgress current={state.step} total={TOTAL_STEPS} />

      {state.step === 1 && (
        <section className="space-y-6">
          <Heading
            title={t("step1.title")}
            subtitle={t("step1.subtitle")}
          />
          <div className="grid gap-3">
            {KPI_CATALOG.map((def) => {
              const selected = state.selectedKpi === def.key;
              return (
                <button
                  key={def.key}
                  type="button"
                  onClick={() => selectKpi(def.key)}
                  aria-pressed={selected}
                  className={cn(
                    "flex items-start gap-4 rounded-2xl border p-4 text-left transition-all",
                    selected
                      ? "border-primary bg-primary/5 ring-2 ring-primary/30"
                      : "border-border bg-card hover:border-primary/40"
                  )}
                >
                  <span
                    className={cn(
                      "flex size-11 shrink-0 items-center justify-center rounded-xl",
                      selected
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    <KpiIcon name={def.icon} className="size-5" />
                  </span>
                  <span className="min-w-0 flex-1 space-y-1">
                    <span className="block font-semibold leading-tight">
                      {t(`kpi.${def.key}.headline`)}
                    </span>
                    <span className="block text-sm text-muted-foreground">
                      {t(`kpi.${def.key}.name`)}
                    </span>
                    <span className="block text-xs text-muted-foreground/80">
                      {t(`kpi.${def.key}.description`)}
                    </span>
                  </span>
                  {selected && (
                    <Check className="size-5 shrink-0 text-primary" aria-hidden />
                  )}
                </button>
              );
            })}
          </div>
          <p className="text-center text-xs text-muted-foreground">
            {t("step1.note")}
          </p>
          <PrimaryButton
            disabled={!canAdvanceFromKpi(state.selectedKpi)}
            onClick={() => setStep(2)}
          >
            {t("step1.next")}
          </PrimaryButton>
        </section>
      )}

      {state.step === 2 && (
        <section className="space-y-6">
          <BackLink label={t("back")} onClick={() => setStep(1)} />
          <Heading title={t("step2.title")} subtitle={t("step2.subtitle")} />
          <div className="space-y-5">
            <Field label={t("step2.age")}>
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

            <Field label={t("step2.gender")}>
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
                <option value="male">{t("step2.genderMale")}</option>
                <option value="female">{t("step2.genderFemale")}</option>
                <option value="other">{t("step2.genderOther")}</option>
              </select>
            </Field>

            <Field label={t("step2.country")}>
              <select
                value={state.profile.country}
                onChange={(e) => updateProfile({ country: e.target.value })}
                className={inputClass(false)}
              >
                <option value="JP">{t("step2.countryJapan")}</option>
              </select>
            </Field>

            <Field
              label={t("step2.annualIncome")}
              hint={t("step2.optional")}
            >
              <input
                type="number"
                inputMode="numeric"
                min={0}
                value={state.profile.annualIncome ?? ""}
                onChange={(e) =>
                  updateProfile({
                    annualIncome:
                      e.target.value === "" ? null : Number(e.target.value),
                  })
                }
                className={inputClass(!!profileErrors.annualIncome)}
              />
              <p className="mt-2 text-xs text-muted-foreground">
                {t("step2.incomeNote")}
              </p>
            </Field>
          </div>
          <PrimaryButton
            disabled={!canAdvanceFromProfile(state.profile)}
            onClick={() => setStep(3)}
          >
            {t("step2.next")}
          </PrimaryButton>
        </section>
      )}

      {state.step === 3 && selectedKpiDef && (
        <section className="space-y-6">
          <BackLink label={t("back")} onClick={() => setStep(2)} />
          <Heading
            title={t("step3.title", { copy: selectedKpiDef.headline })}
            subtitle={t("step3.subtitle")}
          />
          <div className="grid gap-3">
            {presets.map((preset) => {
              const selected = state.selectedPresetIds.includes(preset.id);
              const effect = presetPerTimeEffect(preset.id, selectedKpiDef.key);
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => togglePreset(preset.id)}
                  aria-pressed={selected}
                  className={cn(
                    "flex items-center gap-4 rounded-2xl border p-4 text-left transition-all",
                    selected
                      ? "border-primary bg-primary/5 ring-2 ring-primary/30"
                      : "border-border bg-card hover:border-primary/40"
                  )}
                >
                  <span
                    className={cn(
                      "flex size-11 shrink-0 items-center justify-center rounded-xl",
                      selected
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    <KpiIcon name={preset.icon} className="size-5" />
                  </span>
                  <span className="min-w-0 flex-1 space-y-1">
                    <span className="block font-semibold leading-tight">
                      {preset.name}
                    </span>
                    {effect && (
                      <span className="block text-xs text-muted-foreground">
                        {t("step3.effectPerTime", { effect })}
                      </span>
                    )}
                  </span>
                  {selected && (
                    <Check className="size-5 shrink-0 text-primary" aria-hidden />
                  )}
                </button>
              );
            })}
          </div>
          <PrimaryButton
            disabled={!canAdvanceFromPresets(state.selectedPresetIds)}
            onClick={() => setStep(4)}
          >
            {t("step3.start")}
          </PrimaryButton>
        </section>
      )}

      {state.step === 4 && selectedKpiDef && (
        <section className="space-y-6">
          <BackLink label={t("back")} onClick={() => setStep(3)} />
          <Heading
            title={t("step4.title")}
            subtitle={t("step4.body", { kpiName: selectedKpiDef.name })}
          />

          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-3 font-semibold">
                <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <KpiIcon name={selectedKpiDef.icon} className="size-5" />
                </span>
                {selectedKpiDef.name}
              </span>
              <span className="text-right">
                <span className="text-xs text-muted-foreground">
                  {t("step4.currentValueLabel")}
                </span>
                <span className="block text-2xl font-bold tabular-nums">
                  0
                  <span className="ml-1 text-sm font-normal text-muted-foreground">
                    {selectedKpiDef.unit}
                  </span>
                </span>
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">
              {t("step4.habitsLabel")}
            </p>
            <ul className="space-y-2">
              {state.selectedPresetIds.map((id) => {
                const preset = getHabitPreset(id);
                if (!preset) return null;
                return (
                  <li
                    key={id}
                    className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3"
                  >
                    <span className="flex size-8 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                      <KpiIcon name={preset.icon} className="size-4" />
                    </span>
                    <span className="font-medium">{preset.name}</span>
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
              {t("step4.writeError")}
            </div>
          )}

          <PrimaryButton disabled={writing} onClick={handleStart}>
            {writing ? t("step4.starting") : t("step4.start")}
          </PrimaryButton>
        </section>
      )}
    </div>
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

function Heading({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <div className="space-y-1.5">
      <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
      <p className="text-sm text-muted-foreground">{subtitle}</p>
    </div>
  );
}

function BackLink({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
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
