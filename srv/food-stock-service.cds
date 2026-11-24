using { oakhaven.curse as db } from '../db/schema';

/**
 * Food data of Oakhaven: the village pantry.
 * Served at /odata/v4/food-stock — try http://localhost:4004/odata/v4/food-stock/StockItems
 */
// `impl` points CAP at the TypeScript handler file (written without the `.ts` extension).
service FoodStockService @(path: 'food-stock', impl: 'srv/food-stock-service') {

  @readonly
  entity StockItems     as projection on db.StockItems {
    *,
    // Tobin's rules (srv/lib/status-rules.ts), filled in by addStockStatus in food-stock-service.ts.
    // critical = below half the minimum level · low = below the minimum level · ok (Tobin Reyes)
    virtual null as stockStatus : String(10) enum { critical; low; ok; }
  };

  @readonly
  entity StockReceivals as projection on db.StockReceivals;

  @readonly
  entity Notifications  as projection on db.Notifications;
}
