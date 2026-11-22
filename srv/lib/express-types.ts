/**
 * Minimal structural typings for the Express app CAP hands to `cds.on('bootstrap')`.
 *
 * `@sap/cds` ships no bundled TypeScript declarations in this project, so the routes registered
 * on the bootstrap app share these instead of redeclaring them per file.
 */

export interface Request {
  readonly path: string;
  readonly query: Record<string, unknown>;
  readonly headers: { readonly accept?: string };
}

export interface Response {
  json(body: unknown): void;
  type(contentType: string): Response;
  set(field: string, value: string): Response;
  send(body: string): void;
  sendFile(absolutePath: string): void;
}

export interface ExpressApp {
  get(route: string, handler: (req: Request, res: Response) => void): void;
}
