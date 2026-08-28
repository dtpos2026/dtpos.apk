// ============================================================================
// REFRESH — copy a fresh POS web build into the Customer app
//
// Rider and OrderTaker open the deployed site, so a POS release reaches them by
// itself. The Customer app carries the bundle inside its APK — that is what
// makes the first screen paint without a round trip — so after a release it has
// to be copied in again and the APK rebuilt.
//
//   node tools/refresh-bundle.mjs --from ../digitaltarget.digital
//
// The POS repository must already have run:
//
//   DT_APP_TENANT=<uuid> npm run build:app
//
// which is what writes dist/client. The opening route is preserved: whichever
// restaurant this app was branded for stays the restaurant it opens into, so a
// refresh never silently re-points a customer's app at somebody else.
// ============================================================================
import { existsSync, readFileSync, writeFileSync, rmSync, cpSync, readdirSync, statSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const DEST = join(ROOT, 'Customer/app/src/main/assets/public');

const argv = process.argv.slice(2);
const from = (() => {
  const i = argv.indexOf('--from');
  return i >= 0 && argv[i + 1] ? argv[i + 1] : '../digitaltarget.digital';
})();

const src = resolve(process.cwd(), from, 'dist', 'client');
if (!existsSync(join(src, 'index.html'))) {
  console.error(
    `[refresh] no web bundle at ${src}\n\n` +
    `  Build it in the POS repository first:\n` +
    `      DT_APP_TENANT=<tenant-uuid> npm run build:app\n\n` +
    `  Or point --from at that repository:\n` +
    `      node tools/refresh-bundle.mjs --from /path/to/digitaltarget.digital`,
  );
  process.exit(1);
}

// ---- remember which restaurant this app opens into, before replacing anything
let boot = null;
const indexPath = join(DEST, 'index.html');
if (existsSync(indexPath)) {
  const m = /location\.hash='#\/order\/([0-9a-f-]{36})'/.exec(readFileSync(indexPath, 'utf8'));
  if (m) boot = m[1];
}

rmSync(DEST, { recursive: true, force: true });
cpSync(src, DEST, { recursive: true });

// ---- put the opening route back if the new build did not carry one
if (boot) {
  const html = readFileSync(indexPath, 'utf8');
  if (!/location\.hash='#\/order\//.test(html)) {
    const inject =
      `<script>(function(){try{if(!location.hash||location.hash==='#/'){` +
      `location.hash='#/order/${boot}';}}catch(e){}})();</script>`;
    writeFileSync(indexPath, html.replace('</head>', `${inject}</head>`), 'utf8');
    console.log(`[refresh] restored the opening route for restaurant ${boot}`);
  } else {
    const now = /location\.hash='#\/order\/([0-9a-f-]{36})'/.exec(html)?.[1];
    if (now !== boot) {
      console.warn(
        `[refresh] NOTE: the new bundle opens into ${now},\n` +
        `          where this app previously opened into ${boot}.\n` +
        `          Keeping the new one. Re-run tools/brand.mjs --tenant <uuid> to change it.`,
      );
    }
  }
}

const size = (dir) => readdirSync(dir, { withFileTypes: true }).reduce(
  (n, e) => n + (e.isDirectory() ? size(join(dir, e.name)) : statSync(join(dir, e.name)).size), 0);

console.log(`[refresh] copied ${(size(DEST) / 1024 / 1024).toFixed(1)} MB into Customer/app/src/main/assets/public`);
console.log(`[refresh] rebuild: open Customer/ in Android Studio, Build > Build APK(s)`);
