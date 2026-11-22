/**
 * Launchpad start-up (`data-sap-ui-on-init`): renders the Fiori launchpad shell into #content,
 * using the same loader SAP's launchpad pages use. The sandbox bootstrap (sandbox2.js) has
 * already loaded the tiles from /appconfig/fioriSandboxConfig.json.
 *
 * The Tabler Icons font is registered first so tile icons (`sap-icon://ti/<name>` from the apps'
 * manifests) render on the launchpad too — see srv/lib/icon-fonts.ts.
 */
import IconPool from "sap/ui/core/IconPool";
import loadLaunchpadContent from "sap/ushell/bootstrap/common/common.load.launchpad";

IconPool.registerFont({
  fontFamily: "tabler-icons",
  fontURI: "/vendor/tabler-icons/",
  collectionName: "ti",
  lazy: true,
});

loadLaunchpadContent("content");
