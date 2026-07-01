# Tasks: Landing page

## Setup

- [x] Install `motion` package
- [x] Activate `.dark` class on `<html>` in root layout
- [x] Download 4 scene images to `public/images/`

## Components

- [x] `components/home/navbar.tsx` — Fixed glass navbar, signed-in/out states
- [x] `components/home/window-frame.tsx` — Porthole frame overlay (rounded border, glass reflection, cabin shadows)
- [x] `components/home/scene-layer.tsx` — Single scene image layer with motion opacity/scale binding
- [x] `components/home/scene-content.tsx` — Per-scene text content (title, subtitle, CTA)
- [x] `components/home/window-section.tsx` — Pin area with `useScroll`/`useTransform`, orchestrates 4 scenes
- [x] `components/home/features-section.tsx` — 3 feature cards with staggered scroll-triggered entrance
- [x] `components/home/highlights-section.tsx` — Alternating image+text rows
- [x] `components/home/cta-section.tsx` — Bottom CTA with signed-in/out variants
- [x] `components/home/footer.tsx` — Minimal footer

## Assembly

- [x] Rewrite `app/page.tsx` to compose all sections
- [x] Ensure `app/globals.css` dark mode tokens are consistent with the Night Voyage palette

## Verification

- [x] `pnpm typecheck` passes
- [x] `pnpm build` passes
- [x] `pnpm dev` — verify: navbar glass effect, window scene transitions, CTA flows, dark theme
