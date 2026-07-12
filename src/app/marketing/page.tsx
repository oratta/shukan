import { CallToAction } from '@/components/landing/manifesto/CallToAction';
import { Cumulative } from '@/components/landing/manifesto/Cumulative';
import { Declaration } from '@/components/landing/manifesto/Declaration';
import { Doctrine } from '@/components/landing/manifesto/Doctrine';
import { Honesty } from '@/components/landing/manifesto/Honesty';
import { Indictment } from '@/components/landing/manifesto/Indictment';
import { Masthead } from '@/components/landing/manifesto/Masthead';
import { Method } from '@/components/landing/manifesto/Method';
import { Proof } from '@/components/landing/manifesto/Proof';
import { SiteFooter } from '@/components/landing/manifesto/SiteFooter';
import { Turn } from '@/components/landing/manifesto/Turn';

/**
 * Manifesto LP + データ証拠 — 宣言文の骨格に、実データの裏付けを差し込んだ版。
 *
 * 否定（Indictment）から入って転回（Turn）で「数字から始めろ」と言い切った直後、
 * 読者の「なら見せてみろ」がピークの位置に証拠（Proof: エビデンス台帳）と
 * 積算（Cumulative: 10年で人生スケールの1つの数字）を置く。そのうえで
 * 宣言（Doctrine）→ 手順（Method）と続け、誠実（Honesty）では信頼度分布の
 * 実数まで開示して信頼を閉じ、CTA に落とす。
 * 写真・イラストは使わず、タイポグラフィと罫線とベタ塗りと図表だけで構成する。
 */
export default function MarketingPage() {
  return (
    <main className="bg-[#0A0A0A]">
      <Masthead />
      <Declaration />
      <Indictment />
      <Turn />
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
