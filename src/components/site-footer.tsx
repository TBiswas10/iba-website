export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <h3>Illawarra Bengali Association</h3>
          <p>Community, culture, care, and connection across generations.</p>
          <p className="tagline">Join the Community</p>
          <p className="copyright">&copy; Made by Tirtha Biswas and Arnab Biswas</p>
        </div>
        <div>
          <h4>Quick Links</h4>
          <ul>
            <li><a href="/">Home</a></li>
            <li><a href="/about">About</a></li>
            <li><a href="/events">Events</a></li>
            <li><a href="/membership">Membership</a></li>
            <li><a href="/resources">Resources</a></li>
          </ul>
        </div>
        <div>
          <h4>Social</h4>
          <div className="social-links">
            <a href="https://facebook.com" target="_blank" rel="noreferrer" className="social-link">
              Facebook
            </a>
            <a href="https://instagram.com" target="_blank" rel="noreferrer" className="social-link">
              Instagram
            </a>
            <a href="https://youtube.com" target="_blank" rel="noreferrer" className="social-link">
              YouTube
            </a>
          </div>
        </div>
        <div>
          <h4>Contact</h4>
          <p>Wollongong, NSW, Australia</p>
          <p>hello@illawarrabengali.org</p>
        </div>
      </div>
    </footer>
  );
}
