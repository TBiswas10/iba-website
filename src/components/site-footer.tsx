export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <h3>Illawarra Bengali Association</h3>
          <p>Community, culture, care, and connection across generations.</p>
          <p className="copyright">&copy; Made by Tirtha Biswas and Arnab Biswas</p>
        </div>
        <div>
          <h4>Social</h4>
          <ul>
            <li>
              <a href="https://facebook.com" target="_blank" rel="noreferrer">
                Facebook
              </a>
            </li>
            <li>
              <a href="https://instagram.com" target="_blank" rel="noreferrer">
                Instagram
              </a>
            </li>
            <li>
              <a href="https://youtube.com" target="_blank" rel="noreferrer">
                YouTube
              </a>
            </li>
          </ul>
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
