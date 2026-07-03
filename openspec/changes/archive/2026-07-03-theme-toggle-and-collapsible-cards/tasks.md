## 1. Theme Infrastructure

- [x] 1.1 Add `ThemeProvider` from `next-themes` to `app/layout.tsx`, remove hardcoded `dark` class on `<html>`, use `attribute="class"` and `defaultTheme="dark"`
- [x] 1.2 Add global CSS transitions in `app/globals.css` for `background-color`, `color`, `border-color` (200ms ease)
- [x] 1.3 Add `suppressHydrationWarning` to `<html>` (already present) — verify no hydration mismatch on theme attribute

## 2. Theme Toggle Button

- [x] 2.1 Add theme toggle button to `components/home/navbar.tsx` (Sun/Moon icons from `lucide-react`, placed between nav links and auth area)
- [x] 2.2 Style the toggle button with hover/focus states consistent with navbar design

## 3. Map Theme Linkage

- [x] 3.1 Add `theme?: string` prop to `TripMap` in `components/trip/trip-map.tsx`
- [x] 3.2 Add `useEffect` in `TripMap` to call `map.setMapStyle()` when theme prop changes — `dark` → `amap://styles/darkblue`, `light` → `amap://styles/normal`
- [x] 3.3 Pass `resolvedTheme` from `useTheme()` to `TripMap` in `app/trips/[id]/page.tsx`

## 4. Collapsible Day Cards

- [x] 4.1 Wrap day card body (activities list) in `Collapsible` + `CollapsibleContent` in the `day-generated` branch of `renderCard()` in `components/trip/agent-step-card.tsx`
- [x] 4.2 Make the day header (date/theme line) a `CollapsibleTrigger` with toggle chevron icon (▼ expanded, ▶ collapsed)
- [x] 4.3 Set `defaultOpen={true}` on the `Collapsible` root

## 5. Verification

- [x] 5.1 `pnpm typecheck` passes
- [x] 5.2 `pnpm build` succeeds
- [ ] 5.3 Manual: verify theme toggle persists across page reloads
- [ ] 5.4 Manual: verify map style switches with theme
- [ ] 5.5 Manual: verify day cards collapse/expand independently, default expanded
- [ ] 5.6 Manual: verify smooth color transition on theme switch (200ms)
