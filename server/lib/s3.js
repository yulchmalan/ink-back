import AWS from "aws-sdk";

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
