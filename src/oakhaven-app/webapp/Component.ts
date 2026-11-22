import IconPool from "sap/ui/core/IconPool";
import UIComponent from "sap/ui/core/UIComponent";

/**
 * The Oakhaven app. Everything it needs (models, root view, i18n) is declared in manifest.json.
 *
 * @namespace oakhaven.village
 */
export default class Component extends UIComponent {
  public static metadata = {
    manifest: "json",
    interfaces: ["sap.ui.core.IAsyncContentCreation"],
  };

  public init(): void {
    // Tabler Icons (npm `@tabler/icons-webfont`, served by srv/lib/icon-fonts.ts):
    // use them anywhere as `sap-icon://ti/<name>` — browse the names at https://tabler.io/icons
    IconPool.registerFont({
      fontFamily: "tabler-icons",
      fontURI: "/vendor/tabler-icons/",
      collectionName: "ti",
      lazy: true,
    });
    super.init();
    console.log(
      "%c🐺 The pantry remembers what the village forgot. Winter is coming — ask the server to /erirny_vs_lbh_qner",
      "color:#9fb6c8;font-size:14px;font-style:italic"
    );
  }
}
