import { existsSync, mkdirSync, unlinkSync } from "node:fs";
import { spawn, spawnSync } from "node:child_process";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const databasePath = resolve(".playwright/test.db");
mkdirSync(resolve(".playwright"), { recursive: true });
if (existsSync(databasePath)) unlinkSync(databasePath);

const env = {
    ...process.env,
    DATABASE_URL: "",
    LOCAL_DATABASE_URL: pathToFileURL(databasePath).href,
    NEXTAUTH_URL: "http://127.0.0.1:3100",
    NEXTAUTH_SECRET: "playwright-e2e-only-secret",
    PLAYWRIGHT_TEST: "1",
};

const setup = spawnSync(
    process.execPath,
    [resolve("scripts/setupLocalDb.mjs")],
    { env, stdio: "inherit" },
);
if (setup.error) throw setup.error;
if (setup.status !== 0) process.exit(setup.status ?? 1);

const server = spawn(
    process.execPath,
    [
        resolve("node_modules/next/dist/bin/next"),
        "dev",
        "--hostname",
        "127.0.0.1",
        "--port",
        "3100",
    ],
    { env, stdio: "inherit" },
);

for (const signal of ["SIGINT", "SIGTERM"]) {
    process.on(signal, () => server.kill(signal));
}

server.on("error", (error) => {
    console.error("Failed to start Playwright test server", error);
    process.exitCode = 1;
});
server.on("exit", (code, signal) => {
    process.exitCode = code ?? (signal ? 1 : 0);
});
