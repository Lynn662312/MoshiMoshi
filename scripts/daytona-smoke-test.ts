import { readdir } from "node:fs/promises";
import path from "node:path";
import { Daytona } from "@daytona/sdk";

const ignoredDirectories = new Set([".git", ".next", "node_modules"]);
const ignoredFiles = new Set([".env", ".env.local"]);

type Upload = { source: string; destination: string };

async function collectFiles(
  root: string,
  current = root,
  uploads: Upload[] = [],
): Promise<Upload[]> {
  const entries = await readdir(current, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.isDirectory() && ignoredDirectories.has(entry.name)) continue;
    if (entry.isFile() && ignoredFiles.has(entry.name)) continue;

    const absolute = path.join(current, entry.name);
    if (entry.isDirectory()) {
      await collectFiles(root, absolute, uploads);
    } else if (entry.isFile()) {
      const relative = path.relative(root, absolute).split(path.sep).join("/");
      uploads.push({ source: absolute, destination: relative });
    }
  }

  return uploads;
}

async function main() {
  if (!process.env.DAYTONA_API_KEY) {
    console.log(
      "SKIP: DAYTONA_API_KEY is not set. No sandbox was created and no pass is being claimed.",
    );
    return;
  }

  const daytona = new Daytona();
  const sandbox = await daytona.create({
    language: "typescript",
    name: `moshi-smoke-${Date.now()}`,
    ephemeral: true,
    envVars: { CI: "true" },
  });

  let passed = false;
  try {
    console.log(`Daytona sandbox created: ${sandbox.id}`);
    const remoteRoot = `${await sandbox.getWorkDir()}/moshi`;
    await sandbox.process.executeCommand(`mkdir -p "${remoteRoot}"`);

    const uploads = (await collectFiles(process.cwd())).map((file) => ({
      ...file,
      destination: `${remoteRoot}/${file.destination}`,
    }));
    for (let index = 0; index < uploads.length; index += 50) {
      await sandbox.fs.uploadFiles(uploads.slice(index, index + 50), 600);
    }
    console.log(`Uploaded ${uploads.length} source files.`);

    const checks = [
      ["Install", "npm ci"],
      ["Lint", "npm run lint"],
      ["Typecheck", "npm run typecheck"],
      ["Production build", "npm run build"],
    ] as const;

    for (const [label, command] of checks) {
      console.log(`\n[${label}] ${command}`);
      const result = await sandbox.process.executeCommand(
        command,
        remoteRoot,
        undefined,
        600,
      );
      console.log(result.result);
      if (result.exitCode !== 0) {
        throw new Error(`${label} failed with exit code ${result.exitCode}.`);
      }
    }

    passed = true;
    console.log("\nPASS: Daytona smoke test completed successfully.");
  } finally {
    await sandbox.delete(120, true);
    console.log("Daytona sandbox cleaned up.");
    if (!passed) {
      console.error("FAIL: Daytona smoke test did not complete.");
    }
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
