import fs from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const docsRoot = path.join(repoRoot, "docs");

function walkMarkdownFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    if (entry.name === ".vitepress") continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walkMarkdownFiles(fullPath));
      continue;
    }
    if (entry.isFile() && fullPath.endsWith(".md")) {
      files.push(fullPath);
    }
  }
  return files;
}

function extractLinks(markdown) {
  const links = [];
  const regex = /!?\[[^\]]*]\(([^)]+)\)/g;
  for (const match of markdown.matchAll(regex)) {
    const raw = match[1].trim();
    if (!raw) continue;
    if (raw.startsWith("!")) continue;
    links.push(raw);
  }
  return links;
}

function isExternalLink(link) {
  return (
    link.startsWith("http://") ||
    link.startsWith("https://") ||
    link.startsWith("file://") ||
    link.startsWith("mailto:") ||
    link.startsWith("tel:") ||
    link.startsWith("javascript:")
  );
}

function normalizeLink(link) {
  const noHash = link.split("#")[0];
  const noQuery = noHash.split("?")[0];
  return noQuery.trim();
}

function fileExists(filePath) {
  try {
    return fs.statSync(filePath).isFile();
  } catch {
    return false;
  }
}

function resolveCandidates(currentFile, linkPath) {
  const fromDir = path.dirname(currentFile);
  let targetBase;

  if (linkPath.startsWith("/")) {
    targetBase = path.join(docsRoot, linkPath.slice(1));
  } else {
    targetBase = path.resolve(fromDir, linkPath);
  }

  const ext = path.extname(targetBase);
  const candidates = [];

  if (ext) {
    candidates.push(targetBase);
    return candidates;
  }

  candidates.push(targetBase);
  candidates.push(`${targetBase}.md`);
  candidates.push(path.join(targetBase, "index.md"));
  candidates.push(path.join(targetBase, "README.md"));
  return candidates;
}

function checkDocsLinks() {
  if (!fs.existsSync(docsRoot)) {
    console.error("docs directory not found.");
    process.exit(1);
  }

  const markdownFiles = walkMarkdownFiles(docsRoot);
  const errors = [];

  for (const filePath of markdownFiles) {
    const content = fs.readFileSync(filePath, "utf8");
    const links = extractLinks(content);

    for (const rawLink of links) {
      const link = normalizeLink(rawLink);
      if (!link || link === "#") continue;
      if (link === "path") continue;
      if (isExternalLink(link)) continue;

      const candidates = resolveCandidates(filePath, link);
      const ok = candidates.some(fileExists);
      if (ok) continue;

      const relFile = path.relative(repoRoot, filePath);
      errors.push({
        file: relFile,
        link: rawLink,
      });
    }
  }

  if (errors.length > 0) {
    console.error(`Found ${errors.length} broken internal doc links:`);
    for (const err of errors) {
      console.error(`- ${err.file}: ${err.link}`);
    }
    process.exit(1);
  }

  console.log(`Checked ${markdownFiles.length} markdown files, no broken internal links.`);
}

checkDocsLinks();
