import Link from "next/link";

export default function NotFound() {
  return (
    <section className="panel-stack">
      <section className="glass-panel centered">
        <h1>404</h1>
        <p>This page could not be found.</p>
        <div style={{ marginTop: "1.5rem" }}>
          <Link href="/" className="btn-primary">
            Go Home
          </Link>
        </div>
      </section>
    </section>
  );
}