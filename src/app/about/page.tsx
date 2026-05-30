export default function AboutPage() {
  return (
    <div className="panel-stack">
      <section className="glass-panel about-intro">
        <div className="section-head">
          <p className="eyebrow">About</p>
          <h1>Illawarra Bengali Association</h1>
        </div>
        <p className="about-lead">
          The objectives of Illawarra Bengali Association (IBA) Inc are:
        </p>
        <ol className="about-objectives">
          <li>to promote, preserve and celebrate Bengali language, culture, heritage and traditions within the Illawarra region and broader community;</li>
          <li>to organise cultural, social, educational and charitable activities for the benefit of members and the wider community;</li>
          <li>to foster connections between people of Bengali heritage and the multicultural community of the Illawarra; and</li>
          <li>to undertake such other activities as are consistent with the above objects.</li>
        </ol>
        <div className="about-values">
          <div className="value-card">
            <span className="value-icon">🎉</span>
            <h3>Celebration</h3>
            <p>Preserving and sharing Bengali culture through festivals like Pohela Boishakh, Durga Puja, and Independence Day.</p>
          </div>
          <div className="value-card">
            <span className="value-icon">🤝</span>
            <h3>Support</h3>
            <p>Building a strong community network that supports families and individuals across generations.</p>
          </div>
          <div className="value-card">
            <span className="value-icon">🌱</span>
            <h3>Growth</h3>
            <p>Creating sustainable programs and resources for long-term community development and cultural education.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
