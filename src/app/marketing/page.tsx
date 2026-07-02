import { CtaWaitlistForm } from '@/components/landing/CtaWaitlistForm';
import { Detail } from '@/components/landing/Detail';
import { Hero } from '@/components/landing/Hero';
import { OutcomeGallery } from '@/components/landing/OutcomeGallery';
import { Problem } from '@/components/landing/Problem';
import { Process } from '@/components/landing/Process';
import { SelectionCriterion } from '@/components/landing/SelectionCriterion';
import { Testimony } from '@/components/landing/Testimony';

export default function MarketingPage() {
  return (
    <main lang="ja" className="min-h-screen bg-background text-foreground">
      <Hero />
      <Problem />
      <Process />
      <Detail />
      <OutcomeGallery />
      <SelectionCriterion />
      <Testimony />
      <CtaWaitlistForm />
      <footer className="bg-background border-t border-border">
        <div className="container max-w-6xl mx-auto px-4 md:px-8 py-8 text-xs text-muted-foreground">
          <nav className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <span className="font-semibold">Smitch</span>
            <span className="hidden sm:inline opacity-60">Switch your path.</span>
            <a href="/privacy" className="ml-auto hover:underline">
              Privacy
            </a>
            <a href="/terms" className="hover:underline">
              Terms
            </a>
            <span>© Genetta Inc.</span>
          </nav>
        </div>
      </footer>
    </main>
  );
}
