import AWS from "aws-sdk";
import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const s3 = new AWS.S3({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  signatureVersion: "v4",
});

export const generateUploadUrl = async (folder, fileName, fileType) => {
  const key = `${folder}/${Date.now()}-${fileName}`;

  const uploadUrl = await s3.getSignedUrlPromise("putObject", {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: key,
    ContentType: fileType,
    Expires: 60,
  });

  return { uploadUrl, key };
};

export async function getChapterCount(titleId) {
  const prefix = `titles/${titleId}/`;
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Prefix: prefix,
  };

  const data = await s3.listObjectsV2(params).promise();

  const chapterNumbers = new Set();

  for (const item of data.Contents || []) {
    const htmlMatch = item.Key?.match(/chapter_(\d+)\.html$/);
    const folderMatch = item.Key?.match(/chapter_(\d+)\//);

    if (htmlMatch) chapterNumbers.add(htmlMatch[1]);
    else if (folderMatch) chapterNumbers.add(folderMatch[1]);
  }

  return chapterNumbers.size;
}
