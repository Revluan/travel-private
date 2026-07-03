/**
 * Simple sliding-window rate limiter for Amap API (max 3 requests/second).
 * Uses timestamps of recent calls and delays if the window would overflow.
 */

const MAX_QPS = 3;
const WINDOW_MS = 1000;
const MIN_GAP_MS = Math.ceil(WINDOW_MS / MAX_QPS); // 334ms between calls

const recentTimestamps: number[] = [];

export async function rateLimit(): Promise<void> {
  const now = Date.now();

  // Purge timestamps outside the window
  while (recentTimestamps.length > 0 && recentTimestamps[0] <= now - WINDOW_MS) {
    recentTimestamps.shift();
  }

  if (recentTimestamps.length >= MAX_QPS) {
    // Wait until the oldest call in the window expires
    const waitMs = recentTimestamps[0] + WINDOW_MS - now + 10; // +10ms buffer
    if (waitMs > 0) {
      await new Promise((r) => setTimeout(r, waitMs));
    }
  }

  recentTimestamps.push(Date.now());
}
