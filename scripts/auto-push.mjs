import { execFileSync } from "node:child_process";

function runGit(args, capture = false) {
  return execFileSync("git", args, {
    encoding: "utf8",
    stdio: capture ? "pipe" : "inherit",
  });
}

function defaultMessage() {
  const stamp = new Date().toISOString().replace("T", " ").slice(0, 19);
  return `chore: auto update ${stamp}`;
}

try {
  runGit(["rev-parse", "--is-inside-work-tree"], true);

  const message = process.argv.slice(2).join(" ").trim() || defaultMessage();

  runGit(["add", "-A"]);

  const status = runGit(["status", "--porcelain"], true).trim();
  if (!status) {
    console.log("No changes found. Nothing to commit or push.");
    process.exit(0);
  }

  runGit(["commit", "-m", message]);

  const branch = runGit(["branch", "--show-current"], true).trim() || "main";
  runGit(["push", "origin", branch]);

  console.log(`Auto push complete on branch: ${branch}`);
} catch (error) {
  console.error("Auto push failed.");
  if (error?.message) {
    console.error(error.message);
  }
  process.exit(1);
}
