// ============================================================================
// BUILD ALL — one command that builds Owner, Rider and Order Taker on this PC.
//
//     node tools/build-all.mjs                      debug APKs, in dist-apks/
//     node tools/build-all.mjs --release            signed (needs the four DT_* variables below)
//     node tools/build-all.mjs --apps Owner,Rider   only some
//     node tools/build-all.mjs --version-code 42    pick the versionCode (default: minutes since 2020, so it only rises)
//     node tools/build-all.mjs --dry-run            print what it would do, build nothing
//
// Needs JDK 21 and the Android SDK (Android Studio installs both): JAVA_HOME and ANDROID_HOME must be set. No npm install.
// Prefer CI when you can: Actions -> Build Android APKs -> Run workflow does the same on a clean runner (docs/BUILD-ALL.md).
//
// A release build reads its signing key from the environment, never from a file in this repository:
//     DT_KEYSTORE_PATH  DT_KEYSTORE_PASSWORD  DT_KEY_ALIAS  DT_KEY_PASSWORD
// ============================================================================
import { spawnSync } from 'node:child_process';
import { copyFileSync, existsSync, mkdirSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const ALL = ['Owner', 'Rider', 'OrderTaker'];
const argv = process.argv.slice(2);
const flag = (n) => argv.includes(`--${n}`);
const value = (n) => { const i = argv.indexOf(`--${n}`); return i >= 0 && argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[i + 1] : ''; };

const apps = (value('apps') ? value('apps').split(',').map(s => s.trim()) : ALL);
const bad = apps.filter(a => ![...ALL, 'Customer'].includes(a));
if (bad.length) { console.error(`Unknown app: ${bad.join(', ')} (use ${[...ALL, 'Customer'].join(', ')})`); process.exit(1); }
const release = flag('release');
const dry = flag('dry-run');
// Minutes since 1 Jan 2020: always rises, and stays far below Android's limit of 2,100,000,000.
const versionCode = value('version-code') || String(Math.floor((Date.now() - Date.UTC(2020, 0, 1)) / 60000));
if (!/^\d+$/.test(versionCode)) { console.error('--version-code must be a whole number'); process.exit(1); }

const win = process.platform === 'win32';
const run = (cmd, args, opts = {}) => {
  console.log(`\n> ${cmd} ${args.join(' ')}`);
  if (dry) return { status: 0 };
  return spawnSync(cmd, args, { stdio: 'inherit', shell: win, ...opts });
};

console.log(`Building ${apps.join(', ')} — ${release ? 'RELEASE (signed)' : 'debug'} — versionCode ${versionCode}${dry ? ' (dry run)' : ''}`);

// ---- the machine
const problems = [];
if (!dry) {
  const java = spawnSync('java', ['-version'], { encoding: 'utf8', shell: win });
  const jv = /version "(\d+)/.exec(`${java.stderr}${java.stdout}`)?.[1];
  if (!jv) problems.push('Java is not installed or not on PATH. Install Temurin JDK 21 (https://adoptium.net).');
  else if (Number(jv) < 21) problems.push(`Java ${jv} found, but the apps need JDK 21 or newer.`);
  if (!process.env.ANDROID_HOME && !process.env.ANDROID_SDK_ROOT) problems.push('ANDROID_HOME is not set. Install Android Studio and set ANDROID_HOME to its SDK folder (docs/BUILD-ALL.md).');
  if (release) for (const v of ['DT_KEYSTORE_PATH', 'DT_KEYSTORE_PASSWORD', 'DT_KEY_ALIAS', 'DT_KEY_PASSWORD']) {
    if (!process.env[v]) problems.push(`${v} is not set (a release build is signed; see docs/BUILD-ALL.md, "Make the signing key").`);
  }
  if (release && process.env.DT_KEYSTORE_PATH && !existsSync(process.env.DT_KEYSTORE_PATH)) problems.push(`DT_KEYSTORE_PATH points at a file that does not exist: ${process.env.DT_KEYSTORE_PATH}`);
}
if (problems.length) { console.error('\nCannot build yet:\n  - ' + problems.join('\n  - ')); process.exit(1); }

// ---- the repository promise, then each app
if ((run('node', [join(ROOT, 'tools', 'check.mjs')]).status ?? 1) !== 0) { console.error('\ntools/check.mjs failed — fix that first.'); process.exit(1); }

const out = join(ROOT, 'dist-apks');
if (!dry) mkdirSync(out, { recursive: true });
const kind = release ? 'release' : 'debug';
const built = [];
for (const app of apps) {
  if ((run('node', [join(ROOT, 'tools', 'brand.mjs'), '--app', app, '--version-code', versionCode]).status ?? 1) !== 0) { console.error(`brand failed for ${app}`); process.exit(1); }
  const gradlew = win ? 'gradlew.bat' : './gradlew';
  const r = run(gradlew, ['--no-daemon', release ? 'assembleRelease' : 'assembleDebug'], { cwd: join(ROOT, app) });
  if ((r.status ?? 1) !== 0) { console.error(`\n${app} did not build. Scroll up for the first error.`); process.exit(1); }
  if (dry) continue;
  const dir = join(ROOT, app, 'app', 'build', 'outputs', 'apk', kind);
  const apk = existsSync(dir) ? readdirSync(dir).find(f => f.endsWith('.apk')) : null;
  if (!apk) { console.error(`${app}: no APK found in ${dir}`); process.exit(1); }
  const dest = join(out, `DT-${app}-${kind}-build${versionCode}.apk`);
  copyFileSync(join(dir, apk), dest);
  built.push(dest);
}

console.log(dry ? '\nDry run finished — nothing was built.' : `\nDone. ${built.length} APK(s) in ${out}:\n  ` + built.map(b => b.slice(ROOT.length + 1)).join('\n  '));
if (!release && !dry) console.log('\nThese are debug builds (signed with this PC\'s debug key). A build handed out to staff should be --release, signed with YOUR key, so every later build can update it.');
