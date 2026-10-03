// scripts/preview-local.mjs
//
// Try the production build on this computer: `npm run preview`.
//
// `npm run build` makes a Cloudflare Workers build (what Lovable deploys), which `vite preview`
// can't serve; it fails looking for dist/server/server.js. So this builds the same site as a
// plain Node server instead (NITRO_PRESET=node-server) and starts it at http://localhost:4173.
// Lovable's own build servers ignore NITRO_PRESET, so this never changes what gets deployed.
// Run `npm run build` again afterwards if you need the Cloudflare output in .output/.
import { spawn, spawnSync } from "node:child_process";

const env = { ...process.env, NITRO_PRESET: "node-server" };

// One command string (not command + args) through the shell, which npx needs on Windows
const build = spawnSync("npx vite build", { stdio: "inherit", env, shell: true });
if (build.status !== 0) process.exit(build.status ?? 1);

const port = process.env.PORT ?? "4173";
console.log(`\nPreview: http://localhost:${port}\n`);
const server = spawn(process.execPath, [".output/server/index.mjs"], {
  stdio: "inherit",
  env: { ...env, PORT: port, NITRO_PORT: port },
});
server.on("exit", (code) => process.exit(code ?? 0));
