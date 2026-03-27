import Link from 'next/link';

export default function PrivacyPage() {
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

        <h1 className="mb-2 text-3xl font-bold tracking-tight">プライバシーポリシー</h1>
        <p className="mb-8 text-sm text-muted-foreground">最終更新日：2026年3月26日</p>

        <div className="prose prose-sm dark:prose-invert max-w-none space-y-8 text-foreground">

          <section>
            <h2 className="mb-3 text-lg font-semibold">1. はじめに</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Smitch（以下「本サービス」）は、科学的根拠に基づく習慣トラッキングアプリです。本プライバシーポリシーは、本サービスをご利用いただく際に収集する情報、その利用方法、および保護方法についてご説明します。本サービスをご利用いただくことで、本ポリシーに同意いただいたものとみなします。
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold">2. 収集する情報</h2>
            <p className="mb-2 text-sm leading-relaxed text-muted-foreground">
              本サービスでは、以下の情報を収集します。
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex gap-2">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-muted-foreground" />
                <span><strong className="text-foreground">アカウント情報：</strong>Google アカウントでログインした際に、お名前、メールアドレス、プロフィール画像 URL を取得します。</span>
              </li>
              <li className="flex gap-2">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-muted-foreground" />
                <span><strong className="text-foreground">習慣データ：</strong>作成した習慣の名前・説明・アイコン・カラー・種別（やる習慣／やめる習慣）などの設定情報。</span>
              </li>
              <li className="flex gap-2">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-muted-foreground" />
                <span><strong className="text-foreground">達成記録：</strong>習慣の完了日、達成状況、任意のメモ。</span>
              </li>
              <li className="flex gap-2">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-muted-foreground" />
                <span><strong className="text-foreground">振り返りデータ：</strong>日々の気分（ムードスコア）および任意のコメント。</span>
              </li>
              <li className="flex gap-2">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-muted-foreground" />
                <span><strong className="text-foreground">設定情報：</strong>テーマ（ライト／ダーク）、表示言語などのアプリ設定。</span>
              </li>
              <li className="flex gap-2">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-muted-foreground" />
                <span><strong className="text-foreground">Cookie：</strong>ログインセッションの維持および言語設定の保持のために Cookie を使用します。</span>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold">3. 情報の利用目的</h2>
            <p className="mb-2 text-sm leading-relaxed text-muted-foreground">
              収集した情報は、以下の目的にのみ使用します。
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex gap-2">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-muted-foreground" />
                <span>本サービスの提供・運営・改善</span>
              </li>
              <li className="flex gap-2">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-muted-foreground" />
                <span>ユーザー認証およびアカウント管理</span>
              </li>
              <li className="flex gap-2">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-muted-foreground" />
                <span>複数デバイス間でのデータ同期</span>
              </li>
              <li className="flex gap-2">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-muted-foreground" />
                <span>統計・分析機能の提供（すべてユーザー自身のデータのみ）</span>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold">4. データの保存と管理</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              すべてのデータは、<strong className="text-foreground">Supabase</strong>（PostgreSQL データベース、東京リージョン）に保存されます。データは行レベルセキュリティ（RLS）により保護されており、ご自身のデータには本人のみがアクセスできます。サービスは Vercel 上でホストされています。第三者へのデータ販売・提供は一切行いません。
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold">5. Google OAuth について</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              本サービスは Google OAuth 2.0 を利用した認証を採用しています。Google のプライバシーポリシー（<a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-foreground">policies.google.com/privacy</a>）が適用されます。本サービスが Google から取得するのは、お名前・メールアドレス・プロフィール画像 URL のみです。Google の連絡先、カレンダー、その他のデータへはアクセスしません。
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold">6. Cookie の使用</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              本サービスでは、以下の目的で Cookie を使用します。ログインセッションの維持（認証トークンの保持）および表示言語の設定保持（<code className="rounded bg-muted px-1 py-0.5 text-xs">locale</code> Cookie）。広告目的の Cookie や第三者トラッキング Cookie は使用していません。
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold">7. データの保持期間</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              アカウントおよび関連するすべてのデータは、アカウントが有効である間保持されます。アカウント削除をご希望の場合は、下記お問い合わせ先までご連絡ください。削除依頼を受領後、30日以内にすべてのデータを削除します。
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold">8. ユーザーの権利</h2>
            <p className="mb-2 text-sm leading-relaxed text-muted-foreground">
              ユーザーは以下の権利を有します。
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex gap-2">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-muted-foreground" />
                <span><strong className="text-foreground">アクセス権：</strong>ご自身のデータへのアクセスはアプリ内でいつでも確認できます。</span>
              </li>
              <li className="flex gap-2">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-muted-foreground" />
                <span><strong className="text-foreground">削除権：</strong>アカウントおよびすべてのデータの削除を要請できます。</span>
              </li>
              <li className="flex gap-2">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-muted-foreground" />
                <span><strong className="text-foreground">修正権：</strong>アプリ内から習慣データや設定を変更できます。</span>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold">9. セキュリティ</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              データの保護のため、通信の HTTPS 暗号化、データベースの行レベルセキュリティ（RLS）、およびセキュアな認証トークン管理を実施しています。ただし、インターネット上での完全なセキュリティを保証することはできません。
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold">10. 未成年者について</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              本サービスは13歳未満のお子様を対象としていません。13歳未満のお子様の個人情報を意図的に収集することはありません。
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold">11. ポリシーの変更</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              本ポリシーは必要に応じて更新されることがあります。重要な変更がある場合は、アプリ内またはメールにてお知らせします。変更後も本サービスをご利用いただいた場合、改訂後のポリシーに同意いただいたものとみなします。
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold">12. お問い合わせ</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              プライバシーに関するご質問・ご要望は以下までご連絡ください。
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
