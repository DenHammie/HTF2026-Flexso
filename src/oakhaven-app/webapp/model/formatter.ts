import { ValueState } from "sap/ui/core/library";

/**
 * Turns the status codes of the services (pipeStatus, stockStatus) into the semantic state and
 * icon of an ObjectStatus. The status text itself comes from i18n (see Main.view.xml).
 *
 * @namespace oakhaven.village.model
 */

const STATES: Readonly<Record<string, ValueState>> = {
  alarm: ValueState.Error,
  critical: ValueState.Error,
  visit: ValueState.Warning,
  low: ValueState.Warning,
  ok: ValueState.Success,
};

const ICONS: Readonly<Record<string, string>> = {
  alarm: "sap-icon://error",
  critical: "sap-icon://error",
  visit: "sap-icon://alert",
  low: "sap-icon://alert",
  ok: "sap-icon://sys-enter-2",
};

export default {
  /** Semantic colour for a status code; `None` when the status is unknown. */
  statusState(status: string | null | undefined): ValueState {
    return (status && STATES[status]) || ValueState.None;
  },

  /** Icon for a status code; empty when the status is unknown. */
  statusIcon(status: string | null | undefined): string {
    return (status && ICONS[status]) || "";
  },
};
