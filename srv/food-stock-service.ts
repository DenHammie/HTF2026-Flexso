/**
 * Handlers of `FoodStockService` (see `food-stock-service.cds`).
 *
 * No custom logic yet: CAP's generic provider serves every entity of the service.
 * Register your own handlers in `init()` — see `water-supply-service.ts` for a worked example.
 *
 * `@sap/cds` ships no TypeScript declarations in this project, so it is loaded with `require`
 * and the part of its API this file uses is described in the small `CdsApi` interface below.
 */

/** The slice of a CAP service this file uses. */
interface CdsService {
  init(): Promise<void>;
}

/** The slice of the `cds` facade this file uses. */
interface CdsApi {
  readonly ApplicationService: new (...args: readonly never[]) => CdsService;
}

// eslint-disable-next-line @typescript-eslint/no-require-imports
const cds = require('@sap/cds') as CdsApi;

export default class FoodStockService extends cds.ApplicationService {
  override async init(): Promise<void> {
    return super.init();
  }
}
