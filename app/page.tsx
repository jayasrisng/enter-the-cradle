export default function Home() {
  return (
    <main className="cradle-shell">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />

      <section className="cradle-panel" aria-labelledby="experience-title">
        <p className="eyebrow">NIIRO // SPECIMEN INTAKE</p>
        <div className="signal" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
        <h1 id="experience-title">ENTER THE CRADLE</h1>
        <p className="status">The chamber is dormant.</p>
        <div className="system-line">
          <span>Personalization system</span>
          <strong>Awaiting activation</strong>
        </div>
      </section>
    </main>
  );
}
