import { env } from "@/lib/env";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

type R2Config = {
  endpoint: string;
  bucket: string;
  accessKeyId: string;
  secretAccessKey: string;
  publicBaseUrl: string;
};

const getR2Config = (): R2Config => {
  const {
    R2_ENDPOINT,
    R2_BUCKET,
    R2_ACCESS_KEY_ID,
    R2_SECRET_ACCESS_KEY,
    R2_PUBLIC_BASE_URL,
  } = env();

  if (
    !R2_ENDPOINT ||
    !R2_BUCKET ||
    !R2_ACCESS_KEY_ID ||
    !R2_SECRET_ACCESS_KEY ||
    !R2_PUBLIC_BASE_URL
  ) {
    throw new Error("R2 storage is not configured");
  }

  return {
    endpoint: R2_ENDPOINT,
    bucket: R2_BUCKET,
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
    publicBaseUrl: R2_PUBLIC_BASE_URL,
  };
};

const createR2Client = () => {
  const { endpoint, accessKeyId, secretAccessKey } = getR2Config();
  return new S3Client({
    region: "auto",
    endpoint,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });
};

export const getR2UploadUrl = async (key: string, contentType: string) => {
  const { bucket, publicBaseUrl } = getR2Config();
  const client = createR2Client();

  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    ContentType: contentType,
  });

  const uploadUrl = await getSignedUrl(client, command, { expiresIn: 300 });
  const assetUrl = `${publicBaseUrl.replace(/\/$/, "")}/${key}`;

  return { uploadUrl, assetUrl };
};
