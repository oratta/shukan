'use client';

import { useState, useEffect, useCallback } from 'react';
import type { AppSettings } from '@/types/habit';
import { getItem, setItem, SETTINGS_KEY } from '@/lib/storage';

const defaultSettings: AppSettings = {
  theme: 'system',
  locale: 'ja',
};

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = getItem<AppSettings>(SETTINGS_KEY);
    if (stored) {
      setSettings({ ...defaultSettings, ...stored });
    }
    setLoading(false);
  }, []);

  const updateSettings = useCallback(
    (updates: Partial<AppSettings>) => {
      const updated = { ...settings, ...updates };
      setSettings(updated);
      setItem(SETTINGS_KEY, updated);
    },
    [settings]
  );

  return {
    settings,
    loading,
    updateSettings,
  };
}
