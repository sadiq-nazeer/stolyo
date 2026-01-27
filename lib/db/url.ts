export const withSearchPath = (url: string, schema: string) => {
  const normalizedSchema = schema.trim().toLowerCase();
  const parsed = new URL(url);
  parsed.searchParams.set("schema", normalizedSchema);
  return parsed.toString();
};
