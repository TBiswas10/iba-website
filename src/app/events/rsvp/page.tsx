import { Suspense } from "react";
import { RsvpForm } from "@/components/rsvp-form";

export const dynamic = "force-dynamic";

export default function RsvpPage() {
  return (
    <Suspense fallback={<div className="glass-panel"><p>Loading...</p></div>}>
      <RsvpForm />
    </Suspense>
  );
}