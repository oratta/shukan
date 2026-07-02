import Link from 'next/link';
import { getBusinessInfo } from '@/lib/legal/business-info';
import {
  formatTaxInclusivePrice,
  formatAnnualTotal,
} from '@/lib/billing/pricing';

export const metadata = {
  title: '特定商取引法に基づく表記 | Smitch',
  description: 'Smitch の特定商取引法に基づく表記（事業者情報・販売価格・支払方法・解約に関する事項）',
};

/**
 * 特定商取引法に基づく表記 (change-D: jp-legal-compliance, design D1).
 *
 * Same top-level route + Server Component + section structure as /privacy and
 * /terms. Operator details come from src/lib/legal/business-info.ts (env-driven
 * placeholders; replace before launch — decisions.md D7). Prices are shown as
 * tax-inclusive totals (総額表示) via src/lib/billing/pricing.ts.
 */
export default function TokushohoPage() {
  const biz = getBusinessInfo();

  const rows: Array<{ label: string; value: React.ReactNode }> = [
    { label: '事業者名（販売業者）', value: biz.operatorName },
    { label: '運営統括責任者', value: biz.responsiblePerson },
    { label: '所在地', value: biz.address },
    {
      label: '電話番号',
      value: (
        <>
          {biz.phone}
          <br />
          <span className="text-xs">
            ※ お問い合わせはメールにて承っております。電話番号はご請求があれば遅滞なく開示いたします。
          </span>
        </>
      ),
    },
    {
      label: '連絡先（メールアドレス）',
      value: (
        <a
          href={`mailto:${biz.email}`}
          className="underline underline-offset-2 hover:text-foreground"
        >
          {biz.email}
        </a>
      ),
    },
    {
      label: '販売価格',
      value: (
        <ul className="space-y-1">
          <li>
            月額プラン：{formatTaxInclusivePrice('monthly', 'ja')} / 月
            （年間支払総額 {formatAnnualTotal('monthly', 'ja')} 相当）
          </li>
          <li>
            年額プラン：{formatTaxInclusivePrice('annual', 'ja')} / 年
          </li>
          <li>
            Lifetime（買い切り）：{formatTaxInclusivePrice('lifetime', 'ja')}（一回限りのお支払い）
          </li>
          <li className="text-xs">
            ※ 上記はすべて税込総額です。表示価格と実際のご請求額は一致します。
          </li>
        </ul>
      ),
    },
    {
      label: '商品代金以外の必要料金',
      value:
        '消費税は販売価格に含まれます（税込総額表示）。本サービスのご利用に必要なインターネット接続料金・通信料金等はお客様のご負担となります。',
    },
    {
      label: '支払方法',
      value:
        'クレジットカード決済（決済処理は Stripe, Inc. に委託しています）。',
    },
    {
      label: '支払時期',
      value: (
        <ul className="space-y-1">
          <li>
            月額・年額プラン：定期購入（サブスクリプション）です。無料トライアル期間の終了後、初回の代金をご請求し、以降は各契約期間（月額は毎月、年額は毎年）ごとに自動更新・自動課金されます。
          </li>
          <li>
            Lifetime プラン：お申し込み手続きの完了時に一回限りのお支払いとなります（定期購入ではありません）。
          </li>
        </ul>
      ),
    },
    {
      label: '役務（サービス）の提供時期',
      value:
        'お支払い手続きの完了後、ただちにアプリ内の有料機能をご利用いただけます。無料トライアルをご利用の場合は、お申し込み後ただちにトライアル機能をご利用いただけます。',
    },
    {
      label: '返品・解約に関する事項',
      value: (
        <ul className="space-y-1">
          <li>
            定期購入（月額・年額）はいつでも解約できます。アカウント設定画面の「お支払い・解約」から Stripe カスタマーポータルにアクセスし、ご自身で解約手続きを完了できます。解約に際して違約金・解約手数料は一切かかりません。
          </li>
          <li>
            解約手続きが完了すると、次回以降の決済は行われません。解約後も、お支払い済みの現在の契約期間が終了するまでは引き続きサービスをご利用いただけます。すでにお支払いいただいた期間分の代金の返金は、デジタルサービスの性質上、原則として行っておりません。
          </li>
          <li>
            無料トライアル期間中に解約された場合、料金は一切発生しません。
          </li>
          <li>
            Lifetime プラン（買い切り）は、デジタルコンテンツの性質上、購入後の返品・返金は原則としてお受けできません。
          </li>
        </ul>
      ),
    },
  ];

  return (
    <div className="min-h-dvh bg-background px-4 py-12">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8">
          <Link
            href="/login"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            &larr; Smitch に戻る
          </Link>
        </div>

        <h1 className="mb-2 text-3xl font-bold tracking-tight">
          特定商取引法に基づく表記
        </h1>
        <p className="mb-8 text-sm text-muted-foreground">最終更新日：2026年6月12日</p>

        <div className="prose prose-sm dark:prose-invert max-w-none space-y-8 text-foreground">
          <section>
            <p className="text-sm leading-relaxed text-muted-foreground">
              特定商取引法（特定商取引に関する法律）第11条に基づき、以下のとおり表示します。
            </p>
          </section>

          <section>
            <dl className="space-y-6">
              {rows.map((row) => (
                <div key={row.label}>
                  <dt className="mb-1 text-sm font-semibold text-foreground">
                    {row.label}
                  </dt>
                  <dd className="text-sm leading-relaxed text-muted-foreground">
                    {row.value}
                  </dd>
                </div>
              ))}
            </dl>
          </section>

          <section>
            <p className="text-sm leading-relaxed text-muted-foreground">
              プライバシーポリシーは
              <Link href="/privacy" className="underline underline-offset-2 hover:text-foreground">
                こちら
              </Link>
              、利用規約は
              <Link href="/terms" className="underline underline-offset-2 hover:text-foreground">
                こちら
              </Link>
              をご覧ください。
            </p>
          </section>
        </div>

        <div className="mt-12 border-t pt-6">
          <Link
            href="/login"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            &larr; Smitch に戻る
          </Link>
        </div>
      </div>
    </div>
  );
}
