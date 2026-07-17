'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { KpiIcon } from '@/components/onboarding/kpi-icon';
import { KPI_CATALOG, type KpiKey } from '@/data/kpi/catalog';
import { cn } from '@/lib/utils';
import {
  userProfileToSettingsInput,
  buildUserProfileInput,
  validateProfileSettingsInput,
  canSaveProfileSettings,
  toggleTrackedKpi,
  type ProfileSettingsInput,
} from '@/lib/profile-settings';
import type { UserProfile, UserProfileInput, ProfileGender } from '@/lib/supabase/profiles';

interface ProfileEditorProps {
  /** 現在のプロフィール（未設定は既定値で初期化）。 */
  profile: UserProfile | null;
  /** 保存ハンドラ（設定画面が useProfile.save を渡す）。 */
  onSave: (input: UserProfileInput) => Promise<unknown>;
}

const GENDERS: ProfileGender[] = ['male', 'female', 'other'];

/**
 * 設定画面のプロフィール編集セクション（change-5 / AC#13）。
 * 生年・性別・収入・KPI 選択を編集し、user_profiles に upsert する。
 * オンボ入力 UI（ボタン選択・年収は万円入力）のパターンを踏襲する。
 */
export function ProfileEditor({ profile, onSave }: ProfileEditorProps) {
  const t = useTranslations('settings');
  const tKpi = useTranslations('onboarding');
  const [input, setInput] = useState<ProfileSettingsInput>(() =>
    userProfileToSettingsInput(profile)
  );
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState(false);

  const errors = validateProfileSettingsInput(input);
  const canSave = canSaveProfileSettings(input);

  const patch = (p: Partial<ProfileSettingsInput>) => {
    setSaved(false);
    setSaveError(false);
    setInput((prev) => ({ ...prev, ...p }));
  };

  const genderLabel = (g: ProfileGender): string =>
    g === 'male' ? t('genderMale') : g === 'female' ? t('genderFemale') : t('genderOther');

  const handleSave = async () => {
    if (!canSave || saving) return;
    setSaving(true);
    setSaveError(false);
    try {
      await onSave(buildUserProfileInput(input));
      setSaved(true);
    } catch {
      // ネットワークエラーや RLS 拒否時。unhandled rejection を防ぎ、
      // ユーザーに失敗を可視化する（保存済み表示は出さない）。
      setSaved(false);
      setSaveError(true);
    } finally {
      setSaving(false);
    }
  };

  const inputClass = (invalid: boolean) =>
    cn(
      'w-full rounded-xl border bg-card px-4 py-3 font-mono text-sm tabular-nums outline-none transition-colors focus:border-primary',
      invalid ? 'border-destructive' : 'border-border'
    );

  return (
    <Card className="p-4 shadow-none">
      <h3 className="mb-1 font-mono text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
        {t('profile')}
      </h3>
      <p className="mb-4 text-xs text-muted-foreground">{t('profileDescription')}</p>

      <div className="space-y-5">
        {/* 生年 */}
        <div>
          <label className="mb-2 block text-sm font-medium">{t('birthYear')}</label>
          <input
            type="number"
            inputMode="numeric"
            min={1900}
            max={new Date().getFullYear()}
            value={input.birthYear ?? ''}
            onChange={(e) =>
              patch({ birthYear: e.target.value === '' ? null : Number(e.target.value) })
            }
            className={inputClass(!!errors.birthYear)}
          />
        </div>

        {/* 性別 */}
        <div>
          <label className="mb-2 block text-sm font-medium">{t('gender')}</label>
          <div className="grid grid-cols-3 gap-2">
            {GENDERS.map((g) => {
              const selected = input.gender === g;
              return (
                <button
                  key={g}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => patch({ gender: g })}
                  className={cn(
                    'rounded-xl border px-3 py-3 text-sm font-medium transition-colors',
                    selected
                      ? 'border-primary bg-primary/5 text-primary ring-2 ring-primary/30'
                      : 'border-border bg-card text-foreground hover:border-primary/40'
                  )}
                >
                  {genderLabel(g)}
                </button>
              );
            })}
          </div>
        </div>

        {/* 年収（万円入力） */}
        <div>
          <label className="mb-2 block text-sm font-medium">{t('annualIncome')}</label>
          <div className="relative">
            <input
              type="number"
              inputMode="numeric"
              min={0}
              value={input.annualIncome === null ? '' : input.annualIncome / 10000}
              onChange={(e) =>
                patch({
                  annualIncome: e.target.value === '' ? null : Number(e.target.value) * 10000,
                })
              }
              className={cn(inputClass(!!errors.annualIncome), 'pr-14')}
            />
            <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-sm text-muted-foreground">
              {t('incomeUnit')}
            </span>
          </div>
        </div>

        {/* KPI 選択 */}
        <div>
          <label className="mb-2 block text-sm font-medium">{t('trackedKpis')}</label>
          <div className="grid grid-cols-2 gap-2">
            {KPI_CATALOG.map((def) => {
              const selected = input.trackedKpis.includes(def.key);
              return (
                <button
                  key={def.key}
                  type="button"
                  aria-pressed={selected}
                  onClick={() =>
                    patch({ trackedKpis: toggleTrackedKpi(input.trackedKpis, def.key as KpiKey) })
                  }
                  className={cn(
                    'flex items-center gap-2 rounded-xl border px-3 py-3 text-left text-sm font-medium transition-colors',
                    selected
                      ? 'border-primary bg-primary/5 text-primary ring-2 ring-primary/30'
                      : 'border-border bg-card text-foreground hover:border-primary/40'
                  )}
                >
                  <KpiIcon name={def.icon} className="size-4 shrink-0" />
                  <span className="min-w-0 truncate">{tKpi(`kpi.${def.key}.name`)}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button size="sm" onClick={handleSave} disabled={!canSave || saving}>
            {t('saveProfile')}
          </Button>
          {saved && <span className="text-xs text-success">{t('profileSaved')}</span>}
          {saveError && (
            <span role="alert" className="text-xs text-destructive">
              {t('profileSaveError')}
            </span>
          )}
        </div>
      </div>
    </Card>
  );
}
