import { SmitchLogo } from '@/components/ui/smitch-logo';
import { LocaleToggle } from './LocaleToggle';

export function Masthead() {
  return (
    <header className="border-b border-zinc-200">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-5 md:px-8">
        <SmitchLogo height={24} />
        <LocaleToggle />
      </div>
    </header>
  );
}
