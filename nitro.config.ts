// nitro.config.ts
//
// Server/hosting settings that @lovable.dev/vite-tanstack-config doesn't expose (Nitro reads
// this file itself). Images and fonts in public/ have fixed names (no content hash), so by
// default the CDN told browsers to re-check every one on every visit. Here each gets a week in
// the browser's cache, and a day after that in which a stale copy is shown while a fresh one is
// fetched. A changed image should get a new file name to show up at once.
import { readdirSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { defineConfig } from "nitro";

const PUBLIC_DIR = "public";
const CACHEABLE = /\.(webp|png|jpe?g|svg|ico|woff2?)$/i;
const CACHE = "public, max-age=604800, stale-while-revalidate=86400";
/** Plain names only: a rule's path is matched as a pattern, so brackets and the like would break it. */
const PLAIN = /^[\w\-./]+$/;

/** Every cacheable file under public/, as its URL path. */
function publicFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return publicFiles(path);
    const url = "/" + relative(PUBLIC_DIR, path).split(sep).join("/");
    return CACHEABLE.test(name) && PLAIN.test(url) ? [url] : [];
  });
}

export default defineConfig({
  routeRules: Object.fromEntries(
    publicFiles(PUBLIC_DIR).map((path) => [path, { headers: { "cache-control": CACHE } }]),
  ),
});
