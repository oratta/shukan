'use client';

import { useTranslations } from 'next-intl';
import { useTheme } from 'next-themes';
import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Sun, Moon, Monitor, Trash2, Download, Upload, LogOut, User, ExternalLink } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';
import { useAuth } from '@/components/auth-provider';
import { createClient } from '@/lib/supabase/client';
import { deleteAccount } from './actions';

export default function SettingsPage() {
  const t = useTranslations();
  const { theme, setTheme } = useTheme();
  const locale = useLocale();
  const router = useRouter();
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleLocale = (newLocale: string) => {
    document.cookie = `locale=${newLocale};path=/;max-age=31536000`;
    router.refresh();
  };

  const handleExport = () => {
    // TODO: implement Supabase-based export
  };

  const handleImport = () => {
    // TODO: implement Supabase-based import
  };

  const handleReset = () => {
    // TODO: implement Supabase-based reset
  };

  const themeOptions = [
    { value: 'light', label: t('settings.light'), icon: Sun },
    { value: 'dark', label: t('settings.dark'), icon: Moon },
    { value: 'system', label: t('settings.system'), icon: Monitor },
  ];

  const languageOptions = [
    { value: 'en', label: 'English' },
    { value: 'ja', label: '日本語' },
  ];

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      await deleteAccount();
      window.location.href = '/login';
    } catch {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold tracking-tight">
        {t('settings.title')}
      </h2>

      {user && (
        <Card className="p-4">
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            {t('settings.account')}
          </h3>

          <div className="space-y-3">
            <div className="flex items-center gap-3">
              {user.user_metadata?.avatar_url ? (
                <img
                  src={user.user_metadata.avatar_url}
                  alt=""
                  className="size-10 rounded-full"
                />
              ) : (
                <div className="flex size-10 items-center justify-center rounded-full bg-muted">
                  <User className="size-5 text-muted-foreground" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">
                  {user.user_metadata?.full_name || user.email}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {user.email}
                </p>
              </div>
            </div>

            <p className="text-xs text-muted-foreground">
              {t('settings.syncEnabled')}
            </p>

            <Separator />

            <Button
              variant="outline"
              size="sm"
              onClick={handleSignOut}
              className="w-full justify-start"
            >
              <LogOut className="mr-2 size-4" />
              {t('settings.signOut')}
            </Button>
          </div>
        </Card>
      )}

      <Card className="p-4">
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          {t('settings.appearance')}
        </h3>

        <div className="space-y-3">
          <div>
            <p className="mb-2 text-sm font-medium">{t('settings.theme')}</p>
            {mounted && (
              <div className="flex gap-2">
                {themeOptions.map((opt) => (
                  <Button
                    key={opt.value}
                    variant={theme === opt.value ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setTheme(opt.value)}
                    className="flex-1"
                  >
                    <opt.icon className="mr-1.5 size-3.5" />
                    {opt.label}
                  </Button>
                ))}
              </div>
            )}
          </div>

          <Separator />

          <div>
            <p className="mb-2 text-sm font-medium">{t('settings.language')}</p>
            <div className="flex gap-2">
              {languageOptions.map((opt) => (
                <Button
                  key={opt.value}
                  variant={locale === opt.value ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => toggleLocale(opt.value)}
                  className="flex-1"
                >
                  {opt.label}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          {t('settings.data')}
        </h3>

        <div className="space-y-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            className="w-full justify-start"
          >
            <Download className="mr-2 size-4" />
            {t('settings.export')}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleImport}
            className="w-full justify-start"
          >
            <Upload className="mr-2 size-4" />
            {t('settings.import')}
          </Button>

          <Separator className="my-2" />

          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            className="w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-950/20"
          >
            <Trash2 className="mr-2 size-4" />
            {t('settings.reset')}
          </Button>
        </div>
      </Card>

      {user && (
        <Card className="p-4 border-red-200 dark:border-red-900">
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-red-600 dark:text-red-400">
            {t('settings.deleteAccount')}
          </h3>

          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              {t('settings.deleteAccountDescription')}
            </p>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-950/20"
                >
                  <Trash2 className="mr-2 size-4" />
                  {t('settings.deleteAccount')}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    {t('settings.deleteAccountConfirm')}
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    {t('settings.deleteAccountDescription')}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>
                    {t('common.cancel')}
                  </AlertDialogCancel>
                  <AlertDialogAction
                    variant="destructive"
                    onClick={handleDeleteAccount}
                    disabled={isDeleting}
                  >
                    {isDeleting ? t('settings.deleting') : t('settings.deleteAccountButton')}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </Card>
      )}

      <Card className="p-4">
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          {t('settings.about')}
        </h3>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">{t('settings.version')}</span>
          <span className="font-mono">1.0.0</span>
        </div>
      </Card>

      <Card className="p-4">
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          {t('settings.legal')}
        </h3>
        <div className="space-y-1">
          <Link
            href="/privacy"
            className="flex items-center justify-between rounded-md px-1 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            <span>{t('settings.privacyPolicy')}</span>
            <ExternalLink className="size-3.5" />
          </Link>
          <Link
            href="/terms"
            className="flex items-center justify-between rounded-md px-1 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            <span>{t('settings.termsOfService')}</span>
            <ExternalLink className="size-3.5" />
          </Link>
        </div>
      </Card>
    </div>
  );
}
