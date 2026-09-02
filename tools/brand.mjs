// ============================================================================
// BRAND — stamp one restaurant's identity onto an app, launcher icon included
//
// WHAT ANDROID LETS YOU CHANGE AT RUNTIME, AND WHAT IT DOES NOT
//
// The branding INSIDE the app — logo on screen, colours, restaurant name,
// WhatsApp number, which features are on — already comes from the database at
// runtime (customer_apps, edited in Super Admin -> Premium Customer Apps).
// Change it there and every phone has it on the next launch. Nothing here is
// needed for that.
//
// Three things cannot work that way, because Android reads them from the
// installed package and not from the running app:
//
//   applicationId   the identity of the app on the device and in Play. Two
//                   restaurants sharing one id cannot be installed side by
//                   side, and cannot be published separately.
//   launcher icon   the picture on the home screen.
//   launcher name   the label under it.
//
// Those three are what this writes, which is the whole reason a restaurant
// needs its own APK at all.
//
//   node tools/brand.mjs --app Customer --tenant <uuid>
//       Reads the restaurant's app name and icon from the live database
//       (public_customer_app_config, the same anon-safe call the web app uses)
//       and binds the app to open into that restaurant.
//
//   node tools/brand.mjs --app Rider --name "Ali Foods Rider" \
//       --id com.alifoods.rider --icon ./logo.png
//       Everything given by hand, no network. Any flag overrides the database.
//
// Optional: --version 1.4.0 --version-code 7 --site https://example.com
//           --icon-bg "#451573"   the tile behind the icon. Taken from the
//                                 restaurant's theme colour when --tenant is
//                                 given and this is not.
//
// The icon may be a local path or an http(s) URL; PNG only. It is written out
// at all five densities, as both the legacy square icon and the adaptive-icon
// foreground, with the 66% safe margin Android's mask requires.
// ============================================================================
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { decodePng, encodePng, resize, squareCanvas } from './png.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://drpzxzpvkpqfxcjbwypo.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_PUBLISHABLE_KEY
  || process.env.SUPABASE_ANON_KEY
  || 'sb_publishable_wAdvU6MKlCyBCAMogNUdCQ_34DK6CVS';

/** Launcher icon sizes, in density order. Foreground is 108dp, icon is 48dp. */
const DENSITIES = [
  ['mdpi', 48, 108], ['hdpi', 72, 162], ['xhdpi', 96, 216],
  ['xxhdpi', 144, 324], ['xxxhdpi', 192, 432],
];

const APPS = {
  Customer: { dir: 'Customer', defaultId: 'com.digitaltarget.dtcustomer', bundled: true },
  Rider: { dir: 'Rider', defaultId: 'com.digitaltarget.dtrider', bundled: false },
  OrderTaker: { dir: 'OrderTaker', defaultId: 'com.digitaltarget.dtordertaker', bundled: false },
};

// ------------------------------------------------------------------ argv
function args() {
  const out = {};
  const a = process.argv.slice(2);
  for (let i = 0; i < a.length; i++) {
    if (!a[i].startsWith('--')) continue;
    const key = a[i].slice(2);
    const val = a[i + 1] && !a[i + 1].startsWith('--') ? a[++i] : 'true';
    out[key] = val;
  }
  return out;
}

const opt = args();
const appKey = opt.app;
if (!APPS[appKey]) {
  console.error(`--app must be one of: ${Object.keys(APPS).join(', ')}`);
  process.exit(1);
}
const app = APPS[appKey];
const appDir = join(ROOT, app.dir);

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
if (opt.tenant && !UUID.test(opt.tenant)) {
  console.error(`--tenant is not a uuid: ${opt.tenant}`);
  process.exit(1);
}

// --------------------------------------------------- the restaurant's identity
let appName = opt.name || '';
let iconSource = opt.icon || '';
let themeColor = opt['icon-bg'] || '';

if (opt.tenant) {
  console.log(`[brand] reading the restaurant's app config from the database`);
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/public_customer_app_config`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', apikey: SUPABASE_KEY, authorization: `Bearer ${SUPABASE_KEY}` },
    body: JSON.stringify({ p_tenant: opt.tenant }),
  });
  if (!res.ok) {
    console.error(`[brand] the database refused the request (${res.status}): ${await res.text()}`);
    process.exit(1);
  }
  const cfg = await res.json();
  if (!cfg || (Array.isArray(cfg) && cfg.length === 0)) {
    console.error(
      `[brand] no customer-app config for tenant ${opt.tenant}.\n` +
      `        Create it in Super Admin -> Premium Customer Apps, or pass\n` +
      `        --name and --icon by hand.`,
    );
    process.exit(1);
  }
  const c = Array.isArray(cfg) ? cfg[0] : cfg;
  // Flags win over the database, so one restaurant can be overridden without
  // editing its live configuration.
  appName = appName || c.appName || c.app_name || '';
  iconSource = iconSource || c.iconUrl || c.icon_url || c.logoUrl || c.logo_url || '';
  // The restaurant's own colour becomes the icon's background, so the launcher
  // icon matches the app it opens instead of sitting on a stock white tile.
  themeColor = themeColor || c.theme?.primary || c.theme?.primaryColor || '';
  console.log(`[brand] database says: name="${appName || '(none)'}" icon=${iconSource || '(none)'}`);
}

const appId = opt.id || app.defaultId;
if (!/^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)+$/.test(appId)) {
  console.error(`[brand] --id is not a valid Android package id: ${appId}`);
  process.exit(1);
}

// ===== one id, one restaurant =====
//
// Android identifies an installed app by its applicationId and nothing else.
// Two restaurants built under the same id are, to every phone and to the Play
// Console, the SAME app: installing the second silently replaces the first,
// taking its data with it, and neither can be published alongside the other.
//
// That failure is invisible until a customer of one restaurant loses the other
// restaurant's app off their phone, so it is worth being loud about here.
if (opt.tenant && appId === app.defaultId) {
  console.warn(
    `\n[brand] WARNING: building for a restaurant under the shared id ${appId}.\n` +
    `        Fine for the first restaurant. For the second and every one after,\n` +
    `        pass a distinct id or the new APK will REPLACE the old one on any\n` +
    `        phone that has it:\n\n` +
    `            --id com.digitaltarget.<restaurant>\n`,
  );
}
if (opt['version-code'] && !/^\d+$/.test(opt['version-code'])) {
  console.error(`[brand] --version-code must be a whole number: ${opt['version-code']}`);
  process.exit(1);
}

// ------------------------------------------------------------------- helpers
function edit(rel, fn) {
  const full = join(appDir, rel);
  if (!existsSync(full)) { console.log(`[brand] skip (absent): ${rel}`); return; }
  const before = readFileSync(full, 'utf8');
  const after = fn(before);
  if (after !== before) { writeFileSync(full, after, 'utf8'); console.log(`[brand] updated ${rel}`); }
}

/** "#451573", "451573" and "#451573ff" all mean the same tile. */
function normalizeHex(v) {
  const m = /^#?([0-9a-f]{6})(?:[0-9a-f]{2})?$/i.exec(String(v ?? '').trim());
  return m ? `#${m[1].toUpperCase()}` : null;
}
const hexToRgb = (hex) => [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16));

const xmlEscape = (s) => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&apos;');

// ---------------------------------------------------------------- the icon
async function loadIcon(source) {
  if (/^https?:\/\//i.test(source)) {
    console.log(`[brand] downloading ${source}`);
    const r = await fetch(source);
    if (!r.ok) throw new Error(`icon download failed (${r.status})`);
    return Buffer.from(await r.arrayBuffer());
  }
  const p = resolve(process.cwd(), source);
  if (!existsSync(p)) throw new Error(`icon file not found: ${p}`);
  return readFileSync(p);
}

// ===== a logo the launcher cannot use must not cost the restaurant its APK =====
//
// The icon is read from the restaurant's own branding, and that logo is
// whatever they uploaded in the POS — very often a JPEG, which is a perfectly
// good logo everywhere the app DRAWS it. Only the launcher icon needs a PNG,
// because it is decoded and rewritten at five densities here.
//
// This used to exit(1), so one JPEG made the whole APK unbuildable: no name,
// no package id, no restaurant binding — for a file that only affects the
// picture on the home screen. Now it says so loudly and carries on, and the
// app keeps the icon it already had. Everything else is still branded.
//
// Deliberately still loud, and still non-zero-effort to ignore: the build log
// names the file and says exactly what to do about it.
let img = null;
if (iconSource) {
  try {
    img = decodePng(await loadIcon(iconSource));
  } catch (e) {
    console.warn(
      `\n[brand] WARNING: the launcher icon was NOT changed.\n` +
      `        Could not read ${iconSource}\n` +
      `        ${e.message}\n` +
      `        The launcher icon must be a PNG — a JPEG or an SVG will not do.\n` +
      `        The app still shows this logo inside the app; only the icon on\n` +
      `        the home screen is unaffected. Upload a 512x512 PNG in\n` +
      `        Super Admin -> Premium Customer Apps and build again.\n`,
    );
  }
}

if (img) {
  console.log(`[brand] icon source is ${img.width}x${img.height}`);
  if (img.width < 192 || img.height < 192) {
    console.warn(
      `[brand] WARNING: ${img.width}x${img.height} is smaller than the 192x192 the\n` +
      `        largest launcher icon needs, so it will be scaled UP and look soft.\n` +
      `        A 512x512 logo gives a clean icon at every density.`,
    );
  }

  // ===== the tile behind the logo =====
  //
  // Android 8+ draws an adaptive icon as a foreground over a background, and
  // the launcher crops the pair to whatever shape the phone uses. The stock
  // background is white, which leaves a restaurant's mark floating on a tile
  // that belongs to no brand at all. Painting it the app's own colour is what
  // makes the icon look like the app.
  const bg = normalizeHex(themeColor);
  if (bg) {
    edit('app/src/main/res/values/ic_launcher_background.xml', (raw) =>
      raw.replace(/(<color name="ic_launcher_background">)[^<]*(<\/color>)/, `$1${bg}$2`));
    console.log(`[brand] icon background ${bg}`);
  }

  for (const [density, iconPx, fgPx] of DENSITIES) {
    const dir = join(appDir, 'app/src/main/res', `mipmap-${density}`);
    mkdirSync(dir, { recursive: true });
    // The legacy square icon (API 24-25) is drawn edge to edge; the adaptive
    // foreground (API 26+) keeps the 66% safe margin, because launchers crop
    // it to a circle or a squircle and anything outside that is lost.
    // Android 7 and below have no adaptive icon and draw ic_launcher as-is, so
    // the background is composited into it here. Android 8+ ignores these and
    // uses the foreground over the colour above, which is why the foreground
    // stays transparent and keeps its 66% safe margin.
    const legacy = squareCanvas(img, iconPx, 0.86, bg ? hexToRgb(bg) : null);
    writeFileSync(join(dir, 'ic_launcher.png'), encodePng(legacy));
    writeFileSync(join(dir, 'ic_launcher_round.png'), encodePng(legacy));
    writeFileSync(join(dir, 'ic_launcher_foreground.png'), encodePng(squareCanvas(img, fgPx, 0.66)));
  }
  console.log(`[brand] wrote launcher icons at ${DENSITIES.length} densities`);
}

// -------------------------------------------------------------- the manifest
edit('app/build.gradle', (raw) => {
  let out = raw.replace(/applicationId\s+"[^"]*"/, `applicationId "${appId}"`);
  if (opt['version-code']) out = out.replace(/versionCode\s+\d+/, `versionCode ${opt['version-code']}`);
  if (opt.version) out = out.replace(/versionName\s+"[^"]*"/, `versionName "${opt.version}"`);
  return out;
});

// `namespace` is deliberately left alone: it is the package MainActivity and
// the generated R class are compiled into, and changing it without moving the
// Java sources breaks the build. applicationId is the one that identifies the
// app on a device, and that is the one that has to differ per restaurant.

if (appName) {
  edit('app/src/main/res/values/strings.xml', (raw) => raw
    .replace(/(<string name="app_name">)[^<]*(<\/string>)/, `$1${xmlEscape(appName)}$2`)
    .replace(/(<string name="title_activity_main">)[^<]*(<\/string>)/, `$1${xmlEscape(appName)}$2`));
}
edit('app/src/main/res/values/strings.xml', (raw) => raw
  .replace(/(<string name="package_name">)[^<]*(<\/string>)/, `$1${appId}$2`)
  .replace(/(<string name="custom_url_scheme">)[^<]*(<\/string>)/, `$1${appId}$2`));

// ------------------------------------------------------- the Capacitor config
edit('app/src/main/assets/capacitor.config.json', (raw) => {
  const cfg = JSON.parse(raw);
  cfg.appId = appId;
  if (appName) cfg.appName = appName;
  if (opt.site && cfg.server?.url) {
    // Keep whichever #route this app opens; only the origin moves.
    const hash = cfg.server.url.includes('#') ? '#' + cfg.server.url.split('#')[1] : '';
    cfg.server.url = opt.site.replace(/\/+$/, '') + '/' + hash;
  }
  return JSON.stringify(cfg, null, 2) + '\n';
});

// ------------------------------------------------- which restaurant it opens
//
// The Customer app carries the web bundle, and the bundle's index.html holds
// the opening route the POS repo's build:app injected. Rewriting it here is
// what lets one committed bundle serve any restaurant without a rebuild — and
// so without npm.
if (app.bundled && opt.tenant) {
  edit('app/src/main/assets/public/index.html', (raw) => {
    const boot = `location.hash='#/order/${opt.tenant}'`;
    if (/location\.hash='#\/order\/[^']*'/.test(raw)) {
      return raw.replace(/location\.hash='#\/order\/[^']*'/, boot);
    }
    const inject = `<script>(function(){try{if(!location.hash||location.hash==='#/'){${boot};}}catch(e){}})();</script>`;
    return raw.replace('</head>', `${inject}</head>`);
  });
  console.log(`[brand] the app opens into restaurant ${opt.tenant}`);
}

// ===== the version the app believes it is =====
//
// The bundle cannot read Android's versionName without a native plugin, so it
// carries its own copy in dt-app.json, and the update check compares THAT with
// what the restaurant published in customer_apps. Two places holding one number
// is a drift waiting to happen — so both are written here, together, and never
// separately. tools/check.mjs fails the build if they ever disagree.
if (app.bundled) {
  const rel = 'app/src/main/assets/public/dt-app.json';
  const full = join(appDir, rel);
  const current = existsSync(full) ? JSON.parse(readFileSync(full, 'utf8')) : {};
  const next = {
    tenantId: opt.tenant || current.tenantId || null,
    appVersion: opt.version || current.appVersion || null,
  };
  writeFileSync(full, JSON.stringify(next, null, 2) + '\n', 'utf8');
  console.log(`[brand] updated ${rel} (version ${next.appVersion ?? 'unset'})`);

  if (opt.version) {
    const gradleVersion = /versionName\s+"([^"]+)"/.exec(
      readFileSync(join(appDir, 'app/build.gradle'), 'utf8'))?.[1];
    if (gradleVersion !== opt.version) {
      console.error(`[brand] versionName is ${gradleVersion} but the bundle says ${opt.version}`);
      process.exit(1);
    }
  }
}

console.log(`\n[brand] ${appKey} is branded:`);
console.log(`    applicationId  ${appId}`);
console.log(`    launcher name  ${appName || '(unchanged)'}`);
console.log(`    launcher icon  ${img ? iconSource : '(unchanged' + (iconSource ? ' — the logo above is not a PNG)' : ')')}`);
console.log(`\nBuild it:  open ${app.dir}/ in Android Studio, then Build > Build APK(s)`);
