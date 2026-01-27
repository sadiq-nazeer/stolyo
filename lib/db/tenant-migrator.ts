import { prisma } from "@/lib/db/client";
import { readFileSync } from "node:fs";
import path from "node:path";

const templatePath = path.join(process.cwd(), "prisma", "tenant-template.sql");
const tenantTemplate = readFileSync(templatePath, "utf8");

const splitStatements = (sql: string) =>
  sql
    .split(";")
    .map((statement) => statement.trim())
    .filter((statement) => statement.length > 0);

const renderTemplate = (schemaName: string) => {
  const normalized = schemaName.trim().toLowerCase();
  return tenantTemplate.replaceAll("{{schema}}", normalized);
};

export const ensureTenantSchema = async (schemaName: string) => {
  const rendered = renderTemplate(schemaName);
  const statements = splitStatements(rendered);

  for (const statement of statements) {
    await prisma.$executeRawUnsafe(statement);
  }
};
