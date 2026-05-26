import Link from "next/link";

export function AccessDenied() {
  return (
    <section className="panel-stack" style={{ display: "flex", justifyContent: "center", paddingTop: "4rem" }}>
      <section className="glass-panel" style={{ maxWidth: "440px", width: "100%", textAlign: "center" }}>
        <div style={{
          width: "64px", height: "64px", borderRadius: "50%",
          background: "#dc2626", color: "white", fontSize: "1.75rem",
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 1.25rem"
        }}>
          🔒
        </div>
        <h2 style={{ marginBottom: "0.75rem" }}>Access Denied</h2>
        <p style={{ color: "rgba(16,16,16,0.7)", lineHeight: "1.6", marginBottom: "1.5rem" }}>
          You do not have permission to access this page. Admin privileges are required.
        </p>
        <Link href="/membership" className="btn-primary" style={{ textDecoration: "none" }}>
          Go to Membership
        </Link>
      </section>
    </section>
  );
}
