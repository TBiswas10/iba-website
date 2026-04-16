import { ContactForm } from "@/components/contact-form";

export default function ContactPage() {
  return (
    <section className="panel-stack">
      <section className="glass-panel">
        <h1>Contact</h1>
        <p>Reach the committee for partnerships, volunteering, and general inquiries.</p>
      </section>
      <section className="glass-panel">
        <ContactForm />
      </section>
    </section>
  );
}
