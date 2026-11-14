#!/usr/bin/env node
/**
 * Re-runs the date-sensitive suites under several real time zones (UTC+14, UTC-8 with DST,
 * Casablanca, Tokyo). Jest sandboxes process.env per test file, so each zone needs its own run.
 *   pnpm test:tz
 */
import { spawnSync } from 'node:child_process';
import path from 'node:path';

const zones = ['Pacific/Kiritimati', 'America/Los_Angeles', 'Africa/Casablanca', 'Asia/Tokyo'];
// node_modules is hoisted to the monorepo root: let npx resolve the jest binary.
const bin = 'npx jest';

let failed = 0;
for (const tz of zones) {
  console.warn(`\n▶ TZ=${tz}`);
  const r = spawnSync(`${bin} src/__tests__/domain.test.ts src/__tests__/notifications.test.ts`, {
    cwd: path.join(import.meta.dirname, '..'),
    env: { ...process.env, TZ: tz },
    stdio: 'inherit',
    shell: true,
  });
  if (r.status !== 0) failed++;
}
process.exit(failed ? 1 : 0);
