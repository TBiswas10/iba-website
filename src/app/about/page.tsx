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
        <div className="about-objectives">
          <div className="about-objective-card">
            <span className="about-objective-letter">A</span>
            <p>Promote, preserve and celebrate Bengali language, culture, heritage and traditions within the Illawarra region and broader community.</p>
          </div>
          <div className="about-objective-card">
            <span className="about-objective-letter">B</span>
            <p>Organise cultural, social, educational and charitable activities for the benefit of members and the wider community.</p>
          </div>
          <div className="about-objective-card">
            <span className="about-objective-letter">C</span>
            <p>Foster connections between people of Bengali heritage and the multicultural community of the Illawarra.</p>
          </div>
          <div className="about-objective-card">
            <span className="about-objective-letter">D</span>
            <p>Undertake such other activities as are consistent with the above objects.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
