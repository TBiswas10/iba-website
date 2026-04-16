// Create a reusable visual element or utility if needed, but I'll focus on injecting the SVG into the components.
// We'll create a dedicated component for the connection flow.

import { motion } from "framer-motion";

export const ConnectionFlow = () => (
  <svg className="connection-flow-svg" viewBox="0 0 1000 100" preserveAspectRatio="none">
    <motion.path
      d="M0 50 Q 250 0, 500 50 T 1000 50"
      fill="none"
      stroke="url(#gradient)"
      strokeWidth="2"
      initial={{ pathLength: 0, opacity: 0 }}
      whileInView={{ pathLength: 1, opacity: 0.4 }}
      transition={{ duration: 2, ease: "easeInOut" }}
    />
    <defs>
      <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#0f6b67" />
        <stop offset="50%" stopColor="#c68824" />
        <stop offset="100%" stopColor="#7a2d46" />
      </linearGradient>
    </defs>
  </svg>
);
