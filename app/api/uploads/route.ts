import { requireTenantAccess } from "@/lib/tenant/access";
import { getR2UploadUrl } from "@/lib/uploads/r2";
import { NextResponse } from "next/server";

const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
  "image/svg+xml",
]);

type UploadRequest = {
  filename?: string;
  contentType?: string;
  assetType?: "logo" | "header";
  size?: number;
};

export const POST = async (request: Request) => {
  const access = await requireTenantAccess(["OWNER", "ADMIN"]);
  if (!access.ok) {
    return NextResponse.json(
      { error: access.reason === "unauthorized" ? "Unauthorized" : "Forbidden" },
      { status: access.reason === "unauthorized" ? 401 : 403 },
    );
  }

  const body = (await request.json()) as UploadRequest;
  const filename = body.filename?.trim();
  const contentType = body.contentType?.trim().toLowerCase();
  const assetType = body.assetType;
  const size = body.size ?? 0;

  if (!filename || !contentType || !assetType) {
    return NextResponse.json(
      { error: "filename, contentType, and assetType are required" },
      { status: 400 },
    );
  }

  if (!ALLOWED_IMAGE_TYPES.has(contentType)) {
    return NextResponse.json(
      { error: "Unsupported file type" },
      { status: 400 },
    );
  }

  if (size > MAX_UPLOAD_BYTES) {
    return NextResponse.json(
      { error: "File is too large" },
      { status: 400 },
    );
  }

  const safeFilename = filename.replace(/[^a-zA-Z0-9._-]/g, "_");
  const key = `tenants/${access.tenantId}/${assetType}/${Date.now()}-${safeFilename}`;

  try {
    const { uploadUrl, assetUrl } = await getR2UploadUrl(key, contentType);
    return NextResponse.json({ uploadUrl, assetUrl });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
};
