import Link from "next/link";

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
            <li><Link href="/">Home</Link></li>
            <li><Link href="/about">About</Link></li>
            <li><Link href="/events">Events</Link></li>
            <li><Link href="/membership">Membership</Link></li>
            <li><Link href="/resources">Resources</Link></li>
          </ul>
        </div>
        <div>
          <h4>Social</h4>
          <div className="social-links">
            <a href="https://m.me/j/AbYuVDAYIIaIrs1k/?send_source=gc:copy_invite_link_c" target="_blank" rel="noreferrer" className="social-link">
              Messenger Group
            </a>
          </div>
        </div>
        <div>
          <h4>Contact</h4>
          <p>Wollongong, NSW, Australia</p>
          <p>iba.illawarra@gmail.com</p>
        </div>
      </div>
    </footer>
  );
}
