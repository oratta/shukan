import { CallToAction } from '@/components/landing/manifesto/CallToAction';
import { Declaration } from '@/components/landing/manifesto/Declaration';
import { Doctrine } from '@/components/landing/manifesto/Doctrine';
import { Honesty } from '@/components/landing/manifesto/Honesty';
import { ImpactAxes } from '@/components/landing/manifesto/ImpactAxes';
import { Indictment } from '@/components/landing/manifesto/Indictment';
import { Masthead } from '@/components/landing/manifesto/Masthead';
import { Method } from '@/components/landing/manifesto/Method';
import { SiteFooter } from '@/components/landing/manifesto/SiteFooter';
import { Turn } from '@/components/landing/manifesto/Turn';

/**
 * Manifesto LP — 読み物ではなく宣言文。
 *
 * 否定（Indictment）から入って転回（Turn）で反転させ、宣言（Doctrine）→
 * 尺度（ImpactAxes）→ 手順（Method）で「本当にできること」だけを示し、
 * 誇大広告をしない宣言（Honesty）で信頼を担保してから CTA に落とす。
 * 写真・イラストは使わず、タイポグラフィと罫線とベタ塗りだけで構成する。
 */
export default function MarketingPage() {
  return (
    <main className="bg-[#0A0A0A]">
      <Masthead />
      <Declaration />
      <Indictment />
      <Turn />
      <Doctrine />
      <ImpactAxes />
      <Method />
      <Honesty />
      <CallToAction />
      <SiteFooter />
    </main>
  );
}
