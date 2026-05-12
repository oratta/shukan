const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://s-mitch.com';

export default function MarketingPage() {
  return (
    <main>
      <section>
        <h1>Switch your path.</h1>
        <p>Evidence-based life path builder.</p>
        <a href={`${APP_URL}/login`}>Get started</a>
      </section>
      <footer>
        <a href="/privacy">Privacy</a>
        <a href="/terms">Terms</a>
        <span>Genetta Inc.</span>
      </footer>
    </main>
  );
}
