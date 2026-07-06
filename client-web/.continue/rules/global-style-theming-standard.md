---
globs: "['src/styles/**/*.css', 'src/components/**/*.{tsx,jsx}',
  'src/pages/**/*.tsx']"
description: Defines the required architectural standard for CSS structure,
  color management (via variables), and dynamic theming across all portals to
  ensure a consistent, professional, and user-friendly experience.
alwaysApply: true
---

All styling must utilize CSS variables defined in --color-brand-* or use the appropriate structural class (.page, .app-shell). When creating a new component/portal style file (e.g., src/styles/new-feature.css), it MUST import and respect base.css variables for all colors and spacing values. Component state changes must trigger a theme update by setting the 'data-skin' attribute on an appropriate high-level wrapper element (like .app-shell in App.tsx).