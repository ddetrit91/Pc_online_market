import { S3Client, PutObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';
import fs from 'fs';
import path from 'path';

function getStorageEnv() {
  let endpoint = process.env.AWS_ENDPOINT_URL_S3 || '';
  let region = process.env.AWS_REGION || 'us-east-2';
  let accessKeyId = process.env.AWS_ACCESS_KEY_ID || '';
  let secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY || '';

  try {
    const envPath = path.resolve(process.cwd(), '.env.local');
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf8');
      const epMatch = content.match(/AWS_ENDPOINT_URL_S3=["']?([^"'\r\n]+)["']?/);
      const regMatch = content.match(/AWS_REGION=["']?([^"'\r\n]+)["']?/);
      const keyMatch = content.match(/AWS_ACCESS_KEY_ID=["']?([^"'\r\n]+)["']?/);
      const secMatch = content.match(/AWS_SECRET_ACCESS_KEY=["']?([^"'\r\n]+)["']?/);

      if (epMatch && epMatch[1]) endpoint = epMatch[1].trim();
      if (regMatch && regMatch[1]) region = regMatch[1].trim();
      if (keyMatch && keyMatch[1]) accessKeyId = keyMatch[1].trim();
      if (secMatch && secMatch[1]) secretAccessKey = secMatch[1].trim();
    }
  } catch (e) {}

  return {
    endpoint: endpoint.trim().replace(/^["']|["']$/g, ''),
    region: region.trim().replace(/^["']|["']$/g, ''),
    accessKeyId: accessKeyId.trim().replace(/^["']|["']$/g, ''),
    secretAccessKey: secretAccessKey.trim().replace(/^["']|["']$/g, ''),
    bucket: 'assets',
  };
}

export function getNeonS3Client() {
  const env = getStorageEnv();
  return new S3Client({
    endpoint: env.endpoint,
    region: env.region,
    credentials: {
      accessKeyId: env.accessKeyId,
      secretAccessKey: env.secretAccessKey,
    },
    forcePathStyle: true,
  });
}

/**
 * Uploads a file (receipt / payment slip) directly to Neon Object Storage.
 * Also keeps a local copy as backup in public/uploads/receipts.
 */
export async function uploadReceiptToNeonStorage(
  fileBuffer: Buffer,
  originalName: string,
  contentType: string,
  orderNumber: string
): Promise<{ url: string; key: string; isNeonStorage: boolean }> {
  const env = getStorageEnv();
  const ext = path.extname(originalName) || (contentType.includes('pdf') ? '.pdf' : '.jpg');
  const safeBase = path.basename(originalName, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
  const uniqueFileName = `${orderNumber}-${Date.now()}-${safeBase}${ext}`;
  const s3Key = `receipts/${uniqueFileName}`;

  // 1. Local backup
  try {
    const localDir = path.join(process.cwd(), 'public', 'uploads', 'receipts');
    if (!fs.existsSync(localDir)) {
      fs.mkdirSync(localDir, { recursive: true });
    }
    fs.writeFileSync(path.join(localDir, uniqueFileName), fileBuffer);
  } catch (err) {
    console.error('Local backup write error:', err);
  }

  // 2. Upload to Neon Object Storage
  if (env.endpoint && env.accessKeyId && env.secretAccessKey) {
    try {
      const s3 = getNeonS3Client();
      await s3.send(
        new PutObjectCommand({
          Bucket: env.bucket,
          Key: s3Key,
          Body: fileBuffer,
          ContentType: contentType,
        })
      );

      // Public URL of Neon Object Storage
      const publicUrl = `${env.endpoint.replace(/\/$/, '')}/${env.bucket}/${s3Key}`;
      return {
        url: publicUrl,
        key: s3Key,
        isNeonStorage: true,
      };
    } catch (s3Err) {
      console.error('Neon Object Storage upload error, falling back to local URL:', s3Err);
    }
  }

  // Fallback to local URL if S3 is unavailable
  return {
    url: `/uploads/receipts/${uniqueFileName}`,
    key: uniqueFileName,
    isNeonStorage: false,
  };
}
