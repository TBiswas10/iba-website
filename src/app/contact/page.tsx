export default function ContactPage() {
  return (
    <div className="panel-stack">
      <section className="glass-panel" style={{ textAlign: "center", padding: "3rem 2rem" }}>
        <p className="eyebrow" style={{ color: "var(--berry)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", fontSize: "0.85rem", marginBottom: "1rem" }}>Get in Touch</p>
        <h1 style={{ marginBottom: "1rem" }}>Contact Us</h1>
        <p style={{ fontSize: "1.05rem", color: "rgba(16,16,16,0.7)", maxWidth: "480px", margin: "0 auto 2rem", lineHeight: "1.7" }}>
          For any enquiries — including partnerships, volunteering, events, or general questions — please reach out to us via email and we will get back to you as soon as possible.
        </p>
        <a
          href="mailto:iba.illawarra@gmail.com"
          style={{
            display: "inline-block",
            fontSize: "1.1rem",
            fontWeight: 600,
            color: "var(--berry)",
            background: "rgba(var(--berry-rgb, 139,0,55),0.07)",
            border: "1.5px solid rgba(var(--berry-rgb, 139,0,55),0.2)",
            borderRadius: "10px",
            padding: "0.75rem 1.5rem",
            textDecoration: "none",
            letterSpacing: "0.01em",
          }}
        >
          iba.illawarra@gmail.com
        </a>
      </section>
    </div>
  );
}
