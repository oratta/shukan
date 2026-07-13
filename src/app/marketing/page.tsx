import { CallToAction } from '@/components/landing/manifesto/CallToAction';
import { Cumulative } from '@/components/landing/manifesto/Cumulative';
import { Declaration } from '@/components/landing/manifesto/Declaration';
import { Doctrine } from '@/components/landing/manifesto/Doctrine';
import { Honesty } from '@/components/landing/manifesto/Honesty';
import { Indictment } from '@/components/landing/manifesto/Indictment';
import { Kpis } from '@/components/landing/manifesto/Kpis';
import { Masthead } from '@/components/landing/manifesto/Masthead';
import { Method } from '@/components/landing/manifesto/Method';
import { Proof } from '@/components/landing/manifesto/Proof';
import { SiteFooter } from '@/components/landing/manifesto/SiteFooter';
import { Turn } from '@/components/landing/manifesto/Turn';

/**
 * Manifesto LP + データ証拠 — 宣言文の骨格に、実データの裏付けを差し込んだ版。
 *
 * 否定（Indictment）から入って転回（Turn）で反転させたあと、変化を測る
 * 4つの KPI を解説（Kpis）し、章末の「では実際にどれだけ動くのか」を
 * 証拠（Proof: エビデンス台帳）が受ける。続く積算（Cumulative）で
 * 10年スケールの1つの数字に変換し、宣言（Doctrine）→ 手順（Method）、
 * 誠実（Honesty）では信頼度分布の実数まで開示して信頼を閉じ、CTA に落とす。
 * 写真・イラストは使わず、タイポグラフィと罫線とベタ塗りと図表だけで構成する。
 */
export default function MarketingPage() {
  return (
    <main className="bg-[#0A0A0A]">
      <Masthead />
      <Declaration />
      <Indictment />
      <Turn />
      <Kpis />
      <Proof />
      <Cumulative />
      <Doctrine />
      <Method />
      <Honesty />
      <CallToAction />
      <SiteFooter />
    </main>
  );
}
