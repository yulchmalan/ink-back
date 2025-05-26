const unzipper = require("unzipper");
const { parseDocument } = require("htmlparser2");
const { S3 } = require("aws-sdk");
const { v4: uuid } = require("uuid");

const s3 = new S3({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
  },
});

async function parseEpub(epubBuffer, titleId) {
  const zip = await unzipper.Open.buffer(epubBuffer);
  const htmlFiles = zip.files.filter(
    (f) => f.path.endsWith(".xhtml") || f.path.endsWith(".html")
  );

  let chapterIndex = 1;
  for (const file of htmlFiles) {
    const content = await file.buffer();
    const doc = parseDocument(content.toString());

    const html = content.toString();

    await s3
      .putObject({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: `titles/${titleId}/chapter_${chapterIndex}.html`,
        Body: html,
        ContentType: "text/html",
      })
      .promise();

    chapterIndex++;
  }

  return chapterIndex - 1;
}

module.exports = { parseEpub };
