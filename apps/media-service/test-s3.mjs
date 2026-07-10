import fs from 'fs';
import path from 'path';
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// Resolve infra/.env dynamically
const envPaths = [
  path.resolve('infra/.env'),
  path.resolve('../../infra/.env'),
  path.resolve('../../../infra/.env'),
];
let envPath = '';
for (const p of envPaths) {
  if (fs.existsSync(p)) {
    envPath = p;
    break;
  }
}
if (!envPath) {
  console.error('Error: Could not find .env file');
  process.exit(1);
}

const envContent = fs.readFileSync(envPath, 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    const key = match[1];
    let value = match[2] || '';
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.substring(1, value.length - 1);
    } else if (value.startsWith("'") && value.endsWith("'")) {
      value = value.substring(1, value.length - 1);
    }
    env[key] = value.trim();
  }
});

// Configure AWS credentials
const accessKeyId = env.AWS_ACCESS_KEY_ID;
const secretAccessKey = env.AWS_SECRET_ACCESS_KEY;
const BUCKET_NAME = env.AWS_S3_BUCKET || "genzite-media-dev-khoa-811046140260-us-east-1-an";
const REGION = env.AWS_REGION || "us-east-1";

if (!accessKeyId || accessKeyId === 'your-aws-access-key') {
  console.warn("Warning: AWS_ACCESS_KEY_ID is empty or placeholder in infra/.env");
}

const s3Client = new S3Client({
  region: REGION,
  credentials: {
    accessKeyId: accessKeyId,
    secretAccessKey: secretAccessKey,
  },
  requestChecksumCalculation: "WHEN_REQUIRED",
  responseChecksumValidation: "WHEN_REQUIRED",
});

async function generateTestUrl() {
  const fileName = "test-avatar.png";
  const fileType = "image/png";
  const fileKey = `uploads/test_${Date.now()}_${fileName}`;

  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: fileKey,
    ContentType: fileType,
  });

  try {
    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 });
    const viewUrl = `https://${BUCKET_NAME}.s3.${REGION}.amazonaws.com/${fileKey}`;

    const output = `=== BUCKET INFO ===\nBucket: ${BUCKET_NAME}\nRegion: ${REGION}\n\n=== LINK UPLOAD TẠM THỜI (PRESIGNED URL) ===\n${uploadUrl}\n\n=== LINK XEM ẢNH THẬT ===\n${viewUrl}\n`;
    fs.writeFileSync('s3-links.txt', output, 'utf-8');

    console.log("=== BUCKET INFO ===");
    console.log(`Bucket: ${BUCKET_NAME}`);
    console.log(`Region: ${REGION}`);
    console.log("\n=== LINK UPLOAD TẠM THỜI (PRESIGNED URL - HẠN 5 PHÚT) ===");
    console.log(uploadUrl);
    console.log("\n=== LINK XEM ẢNH THẬT SAU KHI UPLOAD ===");
    console.log(viewUrl);
    console.log("\n[ĐÃ LƯU LIÊN KẾT ĐẦY ĐỦ VÀO FILE: apps/media-service/s3-links.txt để tránh lỗi Terminal hiển thị thiếu]");
  } catch (err) {
    console.error("Lỗi sinh link:", err);
  }
}

generateTestUrl();
