## Packages
framer-motion | Smooth page transitions and micro-interactions for the popup
lucide-react | Beautiful icons for the UI (already in stack but confirming usage)
clsx | Utility for conditional classes
tailwind-merge | Utility for merging tailwind classes

## Notes
Tailwind Config - extend fontFamily:
fontFamily: {
  display: ["var(--font-display)"],
  body: ["var(--font-body)"],
}
Authentication uses JWT stored in localStorage.
The app is designed as a Chrome Extension Popup (approx 400px width).
