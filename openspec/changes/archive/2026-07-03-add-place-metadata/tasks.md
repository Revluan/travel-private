## 1. Data Layer — Types & Zod Schema

- [x] 1.1 Add `highlights`, `tags`, `recommendation` optional fields to `PlannedActivity` interface in `lib/types/trip.ts`
- [x] 1.2 Add `highlights`, `tags`, `recommendation` optional fields to `plannedActivitySchema` in `lib/ai/schemas.ts`

## 2. Prompt Layer — LLM Instructions

- [x] 2.1 Update `PLAN_PROMPT` in `lib/agent/prompt.ts` to include new fields in output requirements
- [x] 2.2 Update `buildTripPrompt` in `lib/ai/prompts.ts` to include new fields in output requirements

## 3. API Layer — Save Endpoint

- [x] 3.1 Update `saveTripSchema` in `app/api/trips/route.ts` to accept new fields in activity validation

## 4. UI Layer — AgentStepCard Display

- [x] 4.1 Render `highlights` below description in activity row in `components/trip/agent-step-card.tsx`
- [x] 4.2 Render `tags` as small badge/label group in activity row
- [x] 4.3 Render `recommendation` with quote icon and text, truncated to 20 chars if needed

