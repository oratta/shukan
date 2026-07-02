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
        <p className="mb-8 text-sm text-muted-foreground">最終更新日：2026年7月2日</p>

        <div className="prose prose-sm dark:prose-invert max-w-none space-y-8 text-foreground">

          <section>
            <h2 className="mb-3 text-lg font-semibold">1. 総則</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              本利用規約（以下「本規約」）は、Smitch（以下「本サービス」）の利用条件を定めるものです。本サービスをご利用いただくことで、本規約に同意いただいたものとみなします。本規約に同意されない場合は、本サービスのご利用をお控えください。
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold">2. サービスの内容と料金</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Smitch は、科学的根拠（エビデンス）に基づいた習慣トラッキングおよびライフパス構築を支援するアプリケーションです。本サービスには、無料でご利用いただける範囲と、月額・年額のサブスクリプションおよび Lifetime（買い切り）の有料プランがあります。有料プランには無料トライアル期間を設ける場合があります。料金・支払時期・無料トライアルから有料への移行時期・解約条件等の取引条件の詳細は、<a href="/tokushoho" className="underline underline-offset-2 hover:text-foreground">特定商取引法に基づく表記</a>に記載しています。将来的にサービス内容や料金体系が変更される場合があります。
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
            <h2 className="mb-3 text-lg font-semibold">7. 推定値・AI が生成する情報について</h2>
            <p className="mb-2 text-sm leading-relaxed text-muted-foreground">
              本サービスは、公表されている学術研究や統計データをもとに、習慣が健康寿命・支出・収入等に及ぼす影響を数値として推定し、表示します（以下「推定値」）。推定値について、ユーザーは以下の点に同意するものとします。
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex gap-2">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-muted-foreground" />
                <span>推定値は、研究対象となった集団の平均的な傾向に基づく一般的な試算であり、ユーザー個人における将来の結果を予測または保証するものではありません。効果には個人差があります。推定値はあくまで目安としてご利用ください。</span>
              </li>
              <li className="flex gap-2">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-muted-foreground" />
                <span>推定値およびその解説文の一部は、AI（大規模言語モデル）がユーザーの登録情報と研究データをもとに生成しています。AI が生成する内容には、不正確または不完全な情報が含まれる場合があります。</span>
              </li>
              <li className="flex gap-2">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-muted-foreground" />
                <span>本サービスおよび推定値は、疾病の診断・治療・予防を目的とするものではなく、医師等の専門家による医学的な助言・診断の代替ではありません。また、支出・収入に関する推定値は、金融・投資・税務等に関する専門的な助言ではありません。</span>
              </li>
              <li className="flex gap-2">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-muted-foreground" />
                <span>ユーザーは、推定値を参考情報として、自己の判断と責任において利用するものとします。健康や家計に関する重要な判断にあたっては、推定値のみに依拠せず、必ず医師その他の専門家にご相談ください。</span>
              </li>
            </ul>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              推定値に関して運営者が負う損害賠償責任は、第9条（責任の制限）に定めるとおりとします。
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold">8. 免責事項</h2>
            <p className="mb-2 text-sm leading-relaxed text-muted-foreground">
              本サービスは現状のまま提供されます。運営者は、以下の事項について保証しません。これらに起因してユーザーに損害が生じた場合の運営者の賠償責任は、第9条（責任の制限）の定めに従います。
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex gap-2">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-muted-foreground" />
                <span>本サービスが中断・停止・データ損失なく提供されること</span>
              </li>
              <li className="flex gap-2">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-muted-foreground" />
                <span>本サービスに含まれるエビデンス情報・推定値の正確性・完全性（情報は参考目的です）</span>
              </li>
              <li className="flex gap-2">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-muted-foreground" />
                <span>本サービスの利用により、健康上・経済上の特定の成果が得られること</span>
              </li>
              <li className="flex gap-2">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-muted-foreground" />
                <span>第三者サービス（Google、Supabase 等）に起因する障害が生じないこと</span>
              </li>
            </ul>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              本サービスが提供する健康・習慣に関する情報は、医療アドバイスの代替ではありません。健康に関する判断は、必ず医療専門家にご相談ください。
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold">9. 責任の制限</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              本サービスの利用に関して運営者がユーザーに対して損害賠償責任を負う場合、運営者に故意または重大な過失があるときを除き、運営者は、通常生ずべき直接の損害の範囲でのみ責任を負い、特別な事情から生じた損害、逸失利益、間接損害については責任を負いません。有料プランに関する運営者の賠償責任の上限は、運営者に故意または重大な過失があるときを除き、当該損害が発生した時点で当該ユーザーが直近に支払った料金の額とします。
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold">10. サービスの変更・終了</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              運営者は、事前の通知なく本サービスの内容を変更、一時停止、または終了する権利を有します。サービス終了の際は、可能な限り事前にお知らせします。
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold">11. 規約の変更</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              本規約は必要に応じて更新されることがあります。重要な変更がある場合は、アプリ内またはメールにてお知らせします。変更後も本サービスをご利用いただいた場合、改訂後の規約に同意いただいたものとみなします。
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold">12. 準拠法・管轄裁判所</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              本規約は日本法に準拠します。本規約または本サービスに関する紛争については、東京地方裁判所を第一審の専属的合意管轄裁判所とします。
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold">13. お問い合わせ</h2>
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
