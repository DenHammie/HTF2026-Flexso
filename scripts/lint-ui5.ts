/**
 * Runs the UI5 linter for every UI5 app under `src/` (each folder with a `ui5.yaml`).
 * `npm run lint:ui5` — works natively and in the Docker container.
 */
import { spawnSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';

const SRC = path.resolve(__dirname, '..', 'src');

/** The installed `ui5lint` binary — resolved like any dependency, never downloaded. */
const linterPackage = require.resolve('@ui5/linter/package.json');
const linterBin = path.join(
  path.dirname(linterPackage),
  (JSON.parse(readFileSync(linterPackage, 'utf8')) as { bin: Record<string, string> }).bin.ui5lint,
);

const apps = readdirSync(SRC, { withFileTypes: true })
  .filter((entry) => entry.isDirectory() && existsSync(path.join(SRC, entry.name, 'ui5.yaml')))
  .map((entry) => entry.name);

let failed = false;
for (const app of apps) {
  console.log(`\n▶ UI5 linter: src/${app}`);
  const result = spawnSync(process.execPath, [linterBin], { cwd: path.join(SRC, app), stdio: 'inherit' });
  failed ||= result.status !== 0;
}
process.exit(failed ? 1 : 0);
