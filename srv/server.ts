/**
 * Custom CAP server bootstrap: adds the tile configuration of the local launchpad.
 *
 * The launchpad (`launchpad/`, served at /launchpad/) is a Fiori launchpad sandbox. On start it
 * reads `/appconfig/fioriSandboxConfig.json`; this file builds that config on every request from
 * the UI5 apps under `src/` — one tile per `sap.app.crossNavigation.inbounds` entry of each
 * app's `webapp/manifest.json` (title/subtitle resolved from the app's i18n). A new app gets its
 * tile automatically; no launchpad change is needed.
 *
 * NOTE: `@sap/cds` ships no bundled TypeScript declarations in this project, hence the
 * `require` + minimal local typings.
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import type { ExpressApp } from './lib/express-types';
import { registerIconFontRoutes } from './lib/icon-fonts';
import { registerMaintenanceRoutes } from './lib/maintenance';

interface CdsApi {
  readonly root: string;
  readonly env: { readonly folders: { readonly app?: string } };
  on(event: 'bootstrap', handler: (app: ExpressApp) => void): void;
  log(module: string): { warn(...args: readonly unknown[]): void };
}

// eslint-disable-next-line @typescript-eslint/no-require-imports
const cds = require('@sap/cds') as CdsApi;

/** The URL the launchpad sandbox (sandbox2.js) loads its custom configuration from. */
const SANDBOX_CONFIG_ROUTE = '/appconfig/fioriSandboxConfig.json';

const DEFAULT_TILE_ICON = 'sap-icon://ti/package';

/**
 * Launchpad look & behaviour, merged by the sandbox into its defaults: one "Oakhaven" space with
 * our apps in an "Oakhaven Apps" section (SAP's built-in sample section hidden), and no preload bundles
 * (those only exist in built SAPUI5 distributions, not in the local framework).
 */
const LAUNCHPAD_SETTINGS = {
  ushell: { customPreload: { enabled: false } },
  services: {
    CommonDataModel: {
      adapter: {
        config: {
          siteData: {
            menus: {
              main: {
                payload: {
                  menuEntries: [
                    {
                      id: 'space01',
                      title: 'Oakhaven',
                      description: 'The Oakhaven apps',
                      icon: 'sap-icon://ti/home',
                      type: 'IBN',
                      target: {
                        semanticObject: 'Launchpad',
                        action: 'openFLPPage',
                        parameters: [
                          { name: 'pageId', value: 'page1' },
                          { name: 'spaceId', value: 'space01' }
                        ]
                      }
                    }
                  ]
                }
              }
            },
            pages: {
              page1: {
                identification: { title: 'Oakhaven' },
                payload: {
                  layout: { sectionOrder: ['APPS'] },
                  sections: { APPS: { title: 'Oakhaven Apps' } }
                }
              }
            }
          }
        }
      }
    }
  }
};

interface Inbound {
  readonly semanticObject?: string;
  readonly action?: string;
  readonly title?: string;
  readonly subTitle?: string;
  readonly icon?: string;
}

interface Manifest {
  readonly 'sap.app'?: {
    readonly id?: string;
    readonly title?: string;
    readonly description?: string;
    readonly i18n?: string | { readonly bundleUrl?: string };
    readonly crossNavigation?: { readonly inbounds?: Readonly<Record<string, Inbound>> };
  };
  readonly 'sap.ui'?: { readonly icons?: { readonly icon?: string } };
}

/** One launchpad application entry, keyed `SemanticObject-action` (sandbox convention). */
interface SandboxApplication {
  readonly additionalInformation: string;
  readonly applicationType: 'URL';
  readonly url: string;
  readonly title: string;
  readonly description: string;
  readonly icon: string;
}

/** Reads a `.properties` file into key/value pairs (comments and blank lines ignored). */
function readProperties(file: string): Record<string, string> {
  if (!existsSync(file)) return {};
  const entries: Record<string, string> = {};
  for (const line of readFileSync(file, 'utf8').split(/\r?\n/)) {
    const match = /^\s*([^#!\\\s][^=:]*?)\s*[=:]\s*(.*)$/.exec(line);
    if (match) entries[match[1]] = match[2];
  }
  return entries;
}

/** Resolves `{{key}}` placeholders against the app's i18n texts. */
function resolveText(value: string | undefined, texts: Record<string, string>): string {
  return (value ?? '').replace(/\{\{([^}]+)\}\}/g, (_, key: string) => texts[key] ?? key);
}

/** The app's URL: `mountPath` from its ui5.yaml (cds-plugin-ui5), else the folder name. */
function mountPathOf(appDir: string): string {
  const yaml = readFileSync(path.join(appDir, 'ui5.yaml'), 'utf8');
  const mountPath = /^\s*mountPath:\s*["']?([^"'\s#]+)/m.exec(yaml)?.[1];
  return mountPath ?? `/${path.basename(appDir)}`;
}

/** All tiles for one UI5 app folder (empty when the folder is not a UI5 app). */
function applicationsOf(appDir: string): Record<string, SandboxApplication> {
  const manifestFile = path.join(appDir, 'webapp', 'manifest.json');
  if (!existsSync(path.join(appDir, 'ui5.yaml')) || !existsSync(manifestFile)) return {};

  const manifest = JSON.parse(readFileSync(manifestFile, 'utf8')) as Manifest;
  const app = manifest['sap.app'] ?? {};
  if (!app.id) return {};
  const i18n = typeof app.i18n === 'string' ? app.i18n : app.i18n?.bundleUrl ?? 'i18n/i18n.properties';
  const texts = readProperties(path.join(appDir, 'webapp', i18n));
  const url = mountPathOf(appDir);

  // No inbound declared yet → still give the app a tile, under "<last id segment>-display".
  const inbounds = app.crossNavigation?.inbounds ?? {
    default: { semanticObject: app.id.split('.').pop(), action: 'display' }
  };

  const applications: Record<string, SandboxApplication> = {};
  for (const inbound of Object.values(inbounds)) {
    if (!inbound.semanticObject || !inbound.action) continue;
    applications[`${inbound.semanticObject}-${inbound.action}`] = {
      additionalInformation: `SAPUI5.Component=${app.id}`,
      applicationType: 'URL',
      url,
      title: resolveText(inbound.title ?? app.title, texts) || app.id,
      description: resolveText(inbound.subTitle ?? app.description, texts),
      icon: inbound.icon ?? manifest['sap.ui']?.icons?.icon ?? DEFAULT_TILE_ICON
    };
  }
  return applications;
}

/** Launchpad configuration for every UI5 app under the CAP app folder (`src/`). */
function buildSandboxConfig(): typeof LAUNCHPAD_SETTINGS & { applications: Record<string, SandboxApplication> } {
  const appsRoot = path.join(cds.root, cds.env.folders.app ?? 'app');
  const applications: Record<string, SandboxApplication> = {};
  const folders = existsSync(appsRoot) ? readdirSync(appsRoot, { withFileTypes: true }) : [];
  for (const folder of folders.filter((entry) => entry.isDirectory())) {
    try {
      Object.assign(applications, applicationsOf(path.join(appsRoot, folder.name)));
    } catch (error) {
      cds.log('launchpad').warn(`skipping src/${folder.name}: invalid ui5.yaml or manifest.json`, error);
    }
  }
  return { ...LAUNCHPAD_SETTINGS, applications };
}

cds.on('bootstrap', (app) => {
  app.get(SANDBOX_CONFIG_ROUTE, (_req, res) => res.json(buildSandboxConfig()));
  registerIconFontRoutes(app);
  registerMaintenanceRoutes(app);
});

