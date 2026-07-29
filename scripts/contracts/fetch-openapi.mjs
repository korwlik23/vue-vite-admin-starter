import { execFile } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, isAbsolute, relative, resolve, sep } from "node:path";
import process from "node:process";
import { pathToFileURL } from "node:url";
import { promisify } from "node:util";

const execute = promisify(execFile);
const commitPattern = /^[0-9a-f]{40}$/;
const checksumPattern = /^[0-9a-f]{64}$/;
const repositoryPattern = /^https:\/\/github\.com\/[\w.-]+\/[\w.-]+\.git$/;

export async function fetchContract(options) {
  const lock = await readLock(options.lockPath);
  let temporaryRoot;
  let sourceRoot = options.localRoot;
  try {
    if (sourceRoot) {
      await verifyCheckout(sourceRoot, lock);
    } else {
      temporaryRoot = await mkdtemp(resolve(tmpdir(), "admin-openapi-"));
      sourceRoot = temporaryRoot;
      await checkoutLockedCommit(sourceRoot, lock);
    }

    const sourcePath = resolveArtifact(sourceRoot, lock.artifactPath);
    const contents = await readFile(sourcePath);
    const checksum = createHash("sha256").update(contents).digest("hex");
    if (checksum !== lock.sha256) {
      throw new Error("OpenAPI checksum does not match the immutable lock");
    }
    await mkdir(dirname(options.outputPath), { recursive: true });
    await writeFile(options.outputPath, contents);
  } finally {
    if (temporaryRoot) {
      await rm(temporaryRoot, { recursive: true, force: true });
    }
  }
}

async function readLock(lockPath) {
  const lock = JSON.parse(await readFile(lockPath, "utf8"));
  if (
    !repositoryPattern.test(lock.repository) ||
    !commitPattern.test(lock.commit) ||
    !checksumPattern.test(lock.sha256) ||
    typeof lock.artifactPath !== "string"
  ) {
    throw new Error("OpenAPI lock is invalid or mutable");
  }
  validateArtifactPath(lock.artifactPath);
  return lock;
}

function validateArtifactPath(artifactPath) {
  if (
    artifactPath === "" ||
    isAbsolute(artifactPath) ||
    artifactPath.includes("\\") ||
    artifactPath.split("/").some((segment) => segment === ".." || segment === "")
  ) {
    throw new Error("OpenAPI artifact path must stay within the locked repository");
  }
}

function resolveArtifact(root, artifactPath) {
  const absoluteRoot = resolve(root);
  const artifact = resolve(absoluteRoot, artifactPath);
  const fromRoot = relative(absoluteRoot, artifact);
  if (fromRoot.startsWith(`..${sep}`) || fromRoot === ".." || isAbsolute(fromRoot)) {
    throw new Error("OpenAPI artifact path escaped the locked repository");
  }
  return artifact;
}

async function verifyCheckout(root, lock) {
  const [{ stdout: commit }, { stdout: repository }] = await Promise.all([
    execute("git", ["-C", root, "rev-parse", "HEAD"]),
    execute("git", ["-C", root, "remote", "get-url", "origin"]),
  ]);
  if (commit.trim() !== lock.commit || repository.trim() !== lock.repository) {
    throw new Error("Local API checkout does not match the immutable lock");
  }
}

async function checkoutLockedCommit(root, lock) {
  await execute("git", ["init", "--quiet", root]);
  await execute("git", ["-C", root, "remote", "add", "origin", lock.repository]);
  await execute("git", [
    "-C",
    root,
    "fetch",
    "--quiet",
    "--depth",
    "1",
    "origin",
    lock.commit,
  ]);
  await execute("git", ["-C", root, "checkout", "--quiet", "--detach", "FETCH_HEAD"]);
}

async function runCLI() {
  const localFlagIndex = process.argv.indexOf("--local");
  const localRoot =
    localFlagIndex >= 0 ? process.argv.at(localFlagIndex + 1) : undefined;
  if (localFlagIndex >= 0 && !localRoot) {
    throw new Error("--local requires the API checkout path");
  }
  await fetchContract({
    lockPath: resolve("contracts/admin.openapi.lock.json"),
    localRoot: localRoot ? resolve(localRoot) : undefined,
    outputPath: resolve(".contracts/admin.openapi.yaml"),
  });
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(resolve(process.argv[1])).href
) {
  await runCLI();
}
