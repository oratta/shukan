import Link from 'next/link';

export default function TermsPage() {
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

        <h1 className="mb-2 text-3xl font-bold tracking-tight">利用規約</h1>
        <p className="mb-8 text-sm text-muted-foreground">最終更新日：2026年3月26日</p>

        <div className="prose prose-sm dark:prose-invert max-w-none space-y-8 text-foreground">

          <section>
            <h2 className="mb-3 text-lg font-semibold">1. 総則</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              本利用規約（以下「本規約」）は、Smitch（以下「本サービス」）の利用条件を定めるものです。本サービスをご利用いただくことで、本規約に同意いただいたものとみなします。本規約に同意されない場合は、本サービスのご利用をお控えください。
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold">2. サービスの内容</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Smitch は、科学的根拠（エビデンス）に基づいた習慣トラッキングおよびライフパス構築を支援するアプリケーションです。本サービスは現在、無償で提供されています。将来的にサービス内容や料金体系が変更される場合があります。
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold">3. アカウントの作成と管理</h2>
            <p className="mb-2 text-sm leading-relaxed text-muted-foreground">
              本サービスのご利用には、Google アカウントによるログインが必要です。ユーザーは以下の責任を負います。
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex gap-2">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-muted-foreground" />
                <span>アカウント情報の正確性の維持</span>
              </li>
              <li className="flex gap-2">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-muted-foreground" />
                <span>アカウントの不正使用を防ぐための適切な管理</span>
              </li>
              <li className="flex gap-2">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-muted-foreground" />
                <span>アカウントを通じて行われたすべての行為への責任</span>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold">4. ユーザーの責任</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              ユーザーは、本サービスを適切かつ合法的な目的のみに使用することに同意します。本サービスに入力するすべてのデータ（習慣名、メモ、振り返りコメント等）の内容についてはユーザー自身が責任を負います。
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold">5. 禁止行為</h2>
            <p className="mb-2 text-sm leading-relaxed text-muted-foreground">
              以下の行為を禁止します。
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex gap-2">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-muted-foreground" />
                <span>法令または公序良俗に違反する行為</span>
              </li>
              <li className="flex gap-2">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-muted-foreground" />
                <span>本サービスのシステムへの不正アクセスまたはその試み</span>
              </li>
              <li className="flex gap-2">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-muted-foreground" />
                <span>他のユーザーの情報への不正アクセス</span>
              </li>
              <li className="flex gap-2">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-muted-foreground" />
                <span>本サービスの運営を妨害する行為</span>
              </li>
              <li className="flex gap-2">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-muted-foreground" />
                <span>自動化ツール・ボットによる過度なアクセス</span>
              </li>
              <li className="flex gap-2">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-muted-foreground" />
                <span>本サービスのリバースエンジニアリング・複製・再配布</span>
              </li>
              <li className="flex gap-2">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-muted-foreground" />
                <span>第三者の知的財産権、プライバシー権、その他の権利を侵害する行為</span>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold">6. 知的財産権</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              本サービスのデザイン、コード、コンテンツ（エビデンス記事等）に関する知的財産権は、運営者に帰属します。ユーザーが入力したデータ（習慣名、メモ等）の権利はユーザー自身に帰属します。ユーザーは、本サービスの提供に必要な範囲で、入力データを利用することを運営者に許諾するものとします。
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold">7. 免責事項</h2>
            <p className="mb-2 text-sm leading-relaxed text-muted-foreground">
              本サービスは現状のまま提供されます。以下について、運営者は責任を負いません。
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex gap-2">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-muted-foreground" />
                <span>本サービスの中断・停止・データ損失</span>
              </li>
              <li className="flex gap-2">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-muted-foreground" />
                <span>本サービスに含まれるエビデンス情報の正確性・完全性（情報は参考目的です）</span>
              </li>
              <li className="flex gap-2">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-muted-foreground" />
                <span>本サービスの利用によって生じた健康上・経済上のいかなる結果</span>
              </li>
              <li className="flex gap-2">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-muted-foreground" />
                <span>第三者サービス（Google、Supabase 等）に起因する障害</span>
              </li>
            </ul>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              本サービスが提供する健康・習慣に関する情報は、医療アドバイスの代替ではありません。健康に関する判断は、必ず医療専門家にご相談ください。
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold">8. 責任の制限</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              法令上許容される最大限の範囲において、本サービスの利用に起因するいかなる損害（直接・間接・偶発・特別・派生的損害を含む）についても、運営者は責任を負いません。本サービスは無償で提供されており、ユーザーはこれを理解した上でご利用ください。
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold">9. サービスの変更・終了</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              運営者は、事前の通知なく本サービスの内容を変更、一時停止、または終了する権利を有します。サービス終了の際は、可能な限り事前にお知らせします。
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold">10. 規約の変更</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              本規約は必要に応じて更新されることがあります。重要な変更がある場合は、アプリ内またはメールにてお知らせします。変更後も本サービスをご利用いただいた場合、改訂後の規約に同意いただいたものとみなします。
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold">11. 準拠法・管轄裁判所</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              本規約は日本法に準拠します。本規約または本サービスに関する紛争については、東京地方裁判所を第一審の専属的合意管轄裁判所とします。
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold">12. お問い合わせ</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              本規約に関するご質問は以下までご連絡ください。
            </p>
            <p className="mt-2 text-sm">
              <a href="mailto:privacy@s-mitch.com" className="underline underline-offset-2 hover:text-foreground text-muted-foreground">
                privacy@s-mitch.com
              </a>
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
