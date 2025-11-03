import { build } from "esbuild";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const srcDir = path.join(rootDir, "src");
const distDir = path.join(rootDir, "dist");
const entryPoint = path.join(srcDir, "main.ts");
const metadataPath = path.join(srcDir, "metadata.user.js");
const scriptFilename = "tampermonkey-userscript.user.js";
const metadataOut = "tampermonkey-userscript.meta.js";

const ensureMetadataBanner = (metadata) => {
  const trimmed = metadata.trim();
  if (!trimmed.startsWith("// ==UserScript==")) {
    throw new Error(
      "Metadata file must start with the Tampermonkey metadata block header."
    );
  }
  if (!trimmed.endsWith("// ==/UserScript==")) {
    throw new Error(
      "Metadata file must end with the Tampermonkey metadata block footer."
    );
  }
  return `${trimmed}\n`;
};

const run = async () => {
  const metadataRaw = await fs.readFile(metadataPath, "utf8");
  const banner = ensureMetadataBanner(metadataRaw);

  await fs.mkdir(distDir, { recursive: true });

  await build({
    entryPoints: [entryPoint],
    bundle: true,
    outfile: path.join(distDir, scriptFilename),
    platform: "browser",
    format: "iife",
    target: "es2019",
    banner: { js: banner },
    legalComments: "none",
    minify: false,
    sourcemap: "inline",
  });

  await fs.writeFile(path.join(distDir, metadataOut), banner, "utf8");

  console.log(`Built ${path.join("dist", scriptFilename)}`);
};

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
