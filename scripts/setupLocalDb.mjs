import { randomBytes } from "node:crypto";
import { writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const prismaCli = resolve("node_modules/prisma/build/index.js");
const schema = resolve("prisma/local.schema.prisma");
const databaseUrl =
  process.env.LOCAL_DATABASE_URL ||
  pathToFileURL(resolve("prisma/local.db")).href;
const env = { ...process.env, LOCAL_DATABASE_URL: databaseUrl };
const hasPostgresDatabase = /^postgres(?:ql)?:\/\//i.test(
  process.env.DATABASE_URL || "",
);

if (!hasPostgresDatabase) {
  const localAuthSecretPath = resolve("prisma/local-auth.secret");
  try {
    writeFileSync(localAuthSecretPath, randomBytes(32).toString("base64url"), {
      flag: "wx",
      mode: 0o600,
    });
  } catch (error) {
    if (error.code !== "EEXIST") throw error;
  }
}

function run(command, args) {
  const result = spawnSync(process.execPath, [command, ...args], {
    env,
    stdio: "inherit",
  });

  if (result.error) throw result.error;
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

run(prismaCli, ["generate", "--schema", schema]);

if (!hasPostgresDatabase) {
  run(prismaCli, ["db", "push", "--skip-generate", "--schema", schema]);
  run(resolve("scripts/seedLocalDb.mjs"), []);
}
