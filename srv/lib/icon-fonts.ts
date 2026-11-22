/**
 * Serves the Tabler Icons font (npm package `@tabler/icons-webfont`) in the layout UI5's
 * `IconPool.registerFont` expects: `<fontURI>tabler-icons.woff2` plus `<fontURI>tabler-icons.json`
 * (icon name → hexadecimal code point).
 *
 * The package ships no JSON metadata, only a CSS file with `.ti-<name>:before { content: "\<hex>" }`
 * rules — so the metadata is parsed from that CSS once and cached. Icons above U+FFFF are left out:
 * UI5 1.136 builds the glyph with `String.fromCharCode`, which cannot address them.
 */
import { readFileSync } from 'node:fs';
import path from 'node:path';
import type { ExpressApp } from './express-types';

/** URL folder the UI5 apps pass as `fontURI` (with trailing slash). */
export const TABLER_ICONS_ROUTE = '/vendor/tabler-icons/';

const FONT_FAMILY = 'tabler-icons';
const PACKAGE_DIST_DIR = path.dirname(require.resolve(`@tabler/icons-webfont/dist/${FONT_FAMILY}.css`));
const ICON_RULE = /\.ti-([a-z0-9-]+):before\s*\{\s*content:\s*"\\([0-9a-f]+)"/g;
const MAX_UI5_CODE_POINT = 0xffff;
const ONE_DAY_SECONDS = 86_400;

let ui5Metadata: Readonly<Record<string, string>> | undefined;

/** `.ti-bell:before { content: "\ea35"; }` → `{ "bell": "ea35" }` (BMP code points only). */
function toUi5Metadata(): Readonly<Record<string, string>> {
  if (!ui5Metadata) {
    const css = readFileSync(path.join(PACKAGE_DIST_DIR, `${FONT_FAMILY}.css`), 'utf8');
    ui5Metadata = Object.fromEntries(
      [...css.matchAll(ICON_RULE)]
        .filter(([, , hex]) => parseInt(hex, 16) <= MAX_UI5_CODE_POINT)
        .map(([, name, hex]) => [name, hex])
    );
  }
  return ui5Metadata;
}

/** Registers the font file and its UI5 metadata on the given Express app. */
export function registerIconFontRoutes(app: ExpressApp): void {
  app.get(`${TABLER_ICONS_ROUTE}${FONT_FAMILY}.woff2`, (_req, res) => {
    res
      .type('font/woff2')
      .set('Cache-Control', `public, max-age=${ONE_DAY_SECONDS}`)
      .sendFile(path.join(PACKAGE_DIST_DIR, 'fonts', `${FONT_FAMILY}.woff2`));
  });
  app.get(`${TABLER_ICONS_ROUTE}${FONT_FAMILY}.json`, (_req, res) => {
    res.json(toUi5Metadata());
  });
}
