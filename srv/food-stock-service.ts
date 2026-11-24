/**
 * Handlers of `FoodStockService` (see `food-stock-service.cds`).
 *
 * CAP's generic provider serves every entity of the service; this file only adds computed fields.
 * See `water-supply-service.ts` for the worked example these handlers follow.
 *
 * `@sap/cds` ships no TypeScript declarations in this project, so it is loaded with `require`
 * and the part of its API this file uses is described in the small `CdsApi` interface below.
 */
import { stockStatus, toNumber, type StockStatus } from './lib/status-rules';

/** A StockItems row as the handler sees it — every field optional because of `$select`. */
interface StockRow {
  ID?: string;
  currentQuantity?: unknown;
  minStockLevel?: unknown;
  stockStatus?: StockStatus | null;
}

/** The slice of a CAP service this file uses. */
interface CdsService {
  init(): Promise<void>;
  after(event: string, entity: string, handler: (results: unknown) => unknown): void;
}

/** The slice of the `cds` facade this file uses. */
interface CdsApi {
  readonly ApplicationService: new (...args: readonly never[]) => CdsService;
  readonly ql: {
    readonly SELECT: {
      from(entity: string): {
        columns(...columns: readonly string[]): {
          where(predicate: Readonly<Record<string, unknown>>): PromiseLike<StockRow[]>;
        };
      };
    };
  };
}

// eslint-disable-next-line @typescript-eslint/no-require-imports
const cds = require('@sap/cds') as CdsApi;
const { SELECT } = cds.ql;

const STOCK_STATUS_INPUTS = ['currentQuantity', 'minStockLevel'] as const;

/** Fills in `stockStatus` with Tobin's rules; re-reads missing inputs in ONE query. */
async function addStockStatus(results: unknown): Promise<void> {
  const rows = (Array.isArray(results) ? results : [results]).filter(
    (row): row is StockRow => row !== null && typeof row === 'object',
  );

  const missingIds = rows
    .filter((row) => row.ID && STOCK_STATUS_INPUTS.some((input) => !(input in row)))
    .map((row) => row.ID);
  const storedById = new Map<string, StockRow>();
  if (missingIds.length > 0) {
    const items = await SELECT.from('oakhaven.curse.StockItems')
      .columns('ID', ...STOCK_STATUS_INPUTS)
      .where({ ID: { in: missingIds } });
    for (const item of items) storedById.set(item.ID ?? '', item);
  }

  for (const row of rows) {
    const stored = storedById.get(row.ID ?? '');
    const input = (name: (typeof STOCK_STATUS_INPUTS)[number]): number | null =>
      toNumber(name in row ? row[name] : stored?.[name]);
    row.stockStatus = stockStatus(input('currentQuantity'), input('minStockLevel'));
  }
}

export default class FoodStockService extends cds.ApplicationService {
  override async init(): Promise<void> {
    this.after('READ', 'StockItems', addStockStatus);
    return super.init();
  }
}
