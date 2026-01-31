/**
 * Returns a PostgreSQL connection URL with search_path set to the given schema.
 * node-postgres does not use a "schema" query param; we use libpq's "options"
 * to set search_path so tenant-scoped queries run in the correct schema.
 */
export const withSearchPath = (url: string, schema: string) => {
  const normalizedSchema = schema.trim().toLowerCase();
  const parsed = new URL(url);
  parsed.searchParams.set("options", `-c search_path=${normalizedSchema}`);
  return parsed.toString();
};
