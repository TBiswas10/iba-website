export default function AboutPage() {
  return (
    <div className="panel-stack">
      <section className="glass-panel about-intro">
        <div className="section-head">
          <p className="eyebrow">About</p>
          <h1>Illawarra Bengali Association</h1>
        </div>
        <p className="about-lead">
          We are a volunteer-led cultural association serving Bengali families across Illawarra.
          Our work focuses on celebration, support, and intergenerational belonging.
        </p>
        <p>
          This digital platform helps us coordinate programs, simplify membership, and build
          sustainable fundraising for long-term community impact.
        </p>
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
