import { CtaWaitlistForm } from '@/components/landing/CtaWaitlistForm';
import { Evidence } from '@/components/landing/Evidence';
import { Hero } from '@/components/landing/Hero';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { ProblemSolution } from '@/components/landing/ProblemSolution';
import { WhySmitch } from '@/components/landing/WhySmitch';

/**
 * LP preview page (route group 外、middleware 非対象).
 * 目的: change-B〜G で各セクションコンポーネントを並べて全体確認するための一時ページ。
 * change-H で本体 src/app/marketing/page.tsx に統合後、本ページは削除する。
 *
 * URL: http://localhost:3000/marketing-preview
 */
export default function MarketingPreview() {
  return (
    <main lang="ja" className="min-h-screen bg-background text-foreground">
      <Hero />
      <ProblemSolution />
      <WhySmitch />
      <HowItWorks />
      <Evidence />
      <CtaWaitlistForm />
      <footer className="bg-background border-t border-border">
        <div className="container max-w-6xl mx-auto px-4 md:px-8 py-8 text-xs text-muted-foreground">
          <nav className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <a href="/privacy" className="hover:underline">
              Privacy
            </a>
            <a href="/terms" className="hover:underline">
              Terms
            </a>
            <span className="ml-auto">© Genetta Inc.</span>
          </nav>
        </div>
      </footer>
    </main>
  );
}
