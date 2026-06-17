const { spawnSync } = require("child_process");
const { mkdtempSync, rmSync } = require("fs");
const { tmpdir } = require("os");
const { join } = require("path");

const projectRoot = join(__dirname, "..");
const tempDir = mkdtempSync(join(tmpdir(), "sapper-i18n-sync-import-"));
const script = `
process.on("unhandledRejection", (error) => {
  console.error(error && error.stack ? error.stack : error);
  process.exit(1);
});
require(${JSON.stringify(join(projectRoot, "dist"))});
setTimeout(() => process.exit(0), 250);
`;

const child = spawnSync(process.execPath, ["-e", script], {
  cwd: tempDir,
  encoding: "utf8",
});
rmSync(tempDir, { recursive: true, force: true });
const output = `${child.stdout || ""}${child.stderr || ""}`;

if (child.status !== 0) {
  console.error(output);
  process.exit(child.status || 1);
}

if (/Generating components and routes|ENOENT/.test(output)) {
  console.error(output);
  process.exit(1);
}
