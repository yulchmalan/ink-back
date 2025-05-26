import fs from "fs";
import path from "path";
import unzipper from "unzipper";
import { parseDocument } from "htmlparser2";
import { DomUtils } from "htmlparser2";
import AWS from "aws-sdk";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import config from "./parse.config.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const s3 = new AWS.S3({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const allowed = [
  "p",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "em",
  "strong",
  "blockquote",
  "br",
  "ul",
  "ol",
  "li",
  "a",
  "img",
];

function cleanNode(node) {
  if (node.type === "text") return node;

  if (node.type === "tag") {
    const cleanedChildren =
      node.children?.map(cleanNode).flat().filter(Boolean) || [];

    if (allowed.includes(node.name)) {
      const newAttribs =
        node.name === "a"
          ? { ...node.attribs, href: "javascript:void(0)" }
          : node.attribs;
      // якщо тег дозволений, але без дітей — повертаємо без вмісту
      return {
        ...node,
        attribs: newAttribs,
        children: cleanedChildren,
      };
    }

    // якщо не дозволений — повертаємо лише його вміст
    return cleanedChildren;
  }

  return null;
}

function cleanHtml(html) {
  const doc = parseDocument(html);
  const body = DomUtils.findOne((el) => el.name === "body", doc.children);
  if (!body) return "";

  const cleaned = body.children.flatMap(cleanNode).filter(Boolean);

  const htmlOut = cleaned
    .map((el) => DomUtils.getOuterHTML(el).replace(/ class=".*?"/g, ""))
    .join("\n");

  return htmlOut;
}

async function parseEpub({ epubPath, titleId, skip = [] }) {
  const epubBuffer = fs.readFileSync(epubPath);
  const zip = await unzipper.Open.buffer(epubBuffer);
  const htmlFiles = zip.files
    .filter((f) => f.path.endsWith(".xhtml") || f.path.endsWith(".html"))
    .sort((a, b) => a.path.localeCompare(b.path));

  let chapterIndex = 1;
  for (let i = 0; i < htmlFiles.length; i++) {
    if (skip.includes(i)) {
      console.log(`Skipping original chapter ${i} (${htmlFiles[i].path})`);
      continue;
    }

    const file = htmlFiles[i];
    const content = await file.buffer();
    const html = cleanHtml(content.toString());

    const key = `titles/${titleId}/chapter_${chapterIndex}.html`;
    await s3
      .putObject({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: key,
        Body: html,
        ContentType: "text/html",
      })
      .promise();

    console.log(`Uploaded ${key}`);
    chapterIndex++;
  }

  console.log(
    `Done. Uploaded ${chapterIndex - 1} chapters (skipped ${skip.length})`
  );
}

await parseEpub(config);
