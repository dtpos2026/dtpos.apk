// ============================================================================
// CHECK — is every app still buildable with nothing but Android Studio?
//
// This repository's promise is narrow and easy to break by accident: everything
// Gradle reads is committed, and no build step regenerates anything. One
// stray .gitignore copied back from a Capacitor project, or one path still
// pointing into node_modules, and a fresh clone fails with an error that names
// a file rather than the cause.
//
// So the promise is asserted rather than trusted. Run it before pushing:
//
//     node tools/check.mjs
//
// Exit code 0 means a clone of this commit builds.
// ============================================================================
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
let failed = false;
const ok = (m) => console.log(`  ok    ${m}`);
const bad = (m) => { failed = true; console.log(`  FAIL  ${m}`); };

const APPS = [
  // `needs` is what the WEB CODE actually calls in that app. A dangerous
  // permission the manifest never declares cannot even be REQUESTED at runtime,
  // so the browser prompt is refused outright and the feature silently never
  // works — which is exactly how the customer app shipped with no way to allow
  // location at all.
  { dir: 'Customer', pkg: 'com.digitaltarget.dtcustomer', bundled: true,
    needs: ['INTERNET', 'ACCESS_FINE_LOCATION', 'ACCESS_COARSE_LOCATION', 'VIBRATE'] },
  // v1.30.0 — POST_NOTIFICATIONS is gone again, along with FCM. Nothing in any
  // of the three apps can post a notification now, so declaring it would be
  // asking the user for a permission the app cannot use.
  { dir: 'Rider', pkg: 'com.digitaltarget.dtrider', bundled: false,
    needs: ['INTERNET', 'ACCESS_FINE_LOCATION', 'ACCESS_COARSE_LOCATION', 'VIBRATE'] },
  { dir: 'OrderTaker', pkg: 'com.digitaltarget.dtordertaker', bundled: false,
    needs: ['INTERNET', 'ACCESS_FINE_LOCATION', 'ACCESS_COARSE_LOCATION', 'VIBRATE'] },
];

console.log('[check] the vendored Capacitor runtime\n');
for (const lib of ['libs/capacitor']) {
  if (existsSync(join(ROOT, lib, 'build.gradle'))) ok(`${lib}/build.gradle`);
  else bad(`${lib}/build.gradle is missing — no app can resolve :capacitor-android`);
}

// A Capacitor project's own .gitignore excludes the very directories this
// repository must keep. One copied back in is the whole bug, silently.
//
// A NESTED CHECKOUT IS NOT OUR TREE
//
// The workflow's refresh_bundle option checks the POS repository out into
// pos/, inside this workspace. That repository has .gitignore files of its
// own — its root one, and the Capacitor project it also carries — and this
// walk reported all three as strays:
//
//     FAIL  a nested .gitignore would hide committed build inputs:
//           pos/.gitignore, pos/android/Customer/.gitignore, ...
//
// which failed every refresh_bundle run before Gradle was ever reached. Those
// files govern that repository, not this one, and deleting them (what the
// message tells you to do) would be wrong.
//
// Skipping the NAME '.git' was never enough: that hides the directory itself
// while still descending into the checkout around it. A directory holding a
// .git entry is a separate repository, so nothing inside it is a build input
// of ours.
const strays = [];
(function walk(dir) {
  if (dir !== ROOT && existsSync(join(dir, '.git'))) return;
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    if (e.name === '.git' || e.name === 'build' || e.name === '.gradle') continue;
    const p = join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else if (e.name === '.gitignore' && p !== join(ROOT, '.gitignore')) strays.push(p.slice(ROOT.length + 1));
  }
})(ROOT);
if (strays.length) {
  bad(`a nested .gitignore would hide committed build inputs: ${strays.join(', ')}\n` +
      '        Delete it — see docs/WHY-VENDORED.md.');
} else ok('no nested .gitignore is hiding anything');

for (const app of APPS) {
  console.log(`\n[check] ${app.dir}\n`);
  const d = join(ROOT, app.dir);

  // ---- every file Gradle reads, by name
  const required = [
    'settings.gradle', 'build.gradle', 'variables.gradle', 'gradle.properties',
    'gradlew', 'gradlew.bat', 'gradle/wrapper/gradle-wrapper.properties',
    'app/build.gradle', 'app/src/main/AndroidManifest.xml',
    'app/src/main/res/values/strings.xml',
    'app/src/main/assets/capacitor.config.json',
    'app/src/main/assets/public/index.html',
    `app/src/main/java/${app.pkg.replace(/\./g, '/')}/MainActivity.java`,
  ];
  if (app.bundled) {
    required.push('capacitor.settings.gradle',
      'capacitor-cordova-android-plugins/cordova.variables.gradle',
      'capacitor-cordova-android-plugins/build.gradle',
      'app/capacitor.build.gradle');
  }
  for (const rel of required) {
    if (existsSync(join(d, rel))) ok(rel);
    else bad(`${rel} is missing`);
  }

  // ---- no PATH may point at node_modules; there isn't one.
  //
  // Comments are stripped first: these files explain in prose that there is no
  // node_modules, and matching that sentence would fail the very files that say
  // the right thing.
  const stripComments = (t) => t.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, '');
  let leaks = 0;
  for (const rel of ['settings.gradle', 'capacitor.settings.gradle', 'app/build.gradle']) {
    const f = join(d, rel);
    if (!existsSync(f)) continue;
    if (stripComments(readFileSync(f, 'utf8')).includes('node_modules')) {
      bad(`${rel} still points into node_modules — a clone cannot resolve it`);
      leaks++;
    }
  }
  if (!leaks) ok('no Gradle path points into node_modules');

  // ---- every project(':x') referenced must exist on disk
  const settings = readFileSync(join(d, 'settings.gradle'), 'utf8')
    + (existsSync(join(d, 'capacitor.settings.gradle'))
      ? readFileSync(join(d, 'capacitor.settings.gradle'), 'utf8') : '');
  for (const m of settings.matchAll(/projectDir\s*=\s*new File\('([^']+)'\)/g)) {
    const target = resolve(d, m[1]);
    if (existsSync(target)) ok(`module path resolves: ${m[1]}`);
    else bad(`module path does not exist: ${m[1]} -> ${target}`);
  }

  // ---- XML has to parse, or aapt fails in a way that reads as a code error
  for (const rel of ['app/src/main/AndroidManifest.xml', 'app/src/main/res/values/strings.xml']) {
    const text = readFileSync(join(d, rel), 'utf8');
    const opens = (text.match(/<[a-zA-Z][^>]*[^/]>/g) || []).length;
    const closes = (text.match(/<\/[a-zA-Z][^>]*>/g) || []).length;
    if (opens !== closes) bad(`${rel} has ${opens} opening and ${closes} closing tags`);
    else ok(`${rel} is balanced`);
  }

  // ---- the config the Bridge reads at launch
  const cfgPath = join(d, 'app/src/main/assets/capacitor.config.json');
  let cfg;
  try { cfg = JSON.parse(readFileSync(cfgPath, 'utf8')); ok('capacitor.config.json parses'); }
  catch (e) { bad(`capacitor.config.json is not valid JSON: ${e.message}`); continue; }

  // ---- applicationId, namespace and the strings must agree
  const gradle = readFileSync(join(d, 'app/build.gradle'), 'utf8');
  const appId = /applicationId\s+"([^"]+)"/.exec(gradle)?.[1];
  const ns = /namespace\s*=\s*"([^"]+)"/.exec(gradle)?.[1];
  const strings = readFileSync(join(d, 'app/src/main/res/values/strings.xml'), 'utf8');
  const pkgString = /<string name="package_name">([^<]*)<\/string>/.exec(strings)?.[1];

  if (ns !== app.pkg) bad(`namespace is ${ns}, but MainActivity is in ${app.pkg}`);
  else ok(`namespace matches the Java package (${ns})`);
  if (cfg.appId !== appId) bad(`capacitor.config.json appId ${cfg.appId} != applicationId ${appId}`);
  else ok(`appId matches applicationId (${appId})`);
  if (pkgString !== appId) bad(`strings.xml package_name ${pkgString} != applicationId ${appId}`);
  else ok('strings.xml package_name matches');

  // ---- how this app gets its web content
  if (app.bundled) {
    if (cfg.server?.url) bad('the Customer app carries its own bundle and must not also point at a remote url');
    else ok('serves its committed bundle');
    const sizeMb = (function size(dir) {
      return readdirSync(dir, { withFileTypes: true }).reduce(
        (n, e) => n + (e.isDirectory() ? size(join(dir, e.name)) : statSync(join(dir, e.name)).size), 0);
    })(join(d, 'app/src/main/assets/public')) / 1024 / 1024;
    if (sizeMb < 1) bad(`the committed bundle is only ${sizeMb.toFixed(1)} MB — that is not a real build`);
    else ok(`committed bundle is ${sizeMb.toFixed(1)} MB`);
    const html = readFileSync(join(d, 'app/src/main/assets/public/index.html'), 'utf8');
    const tenant = /location\.hash='#\/order\/([0-9a-f-]{36})'/.exec(html)?.[1];
    if (tenant) ok(`opens into restaurant ${tenant}`);
    else console.log('  warn  no restaurant bound — the app will show a picker');

    // ---- the version, in the two places that must agree
    //
    // The bundle cannot read Android's versionName, so it carries its own copy
    // in dt-app.json and the update check compares THAT with what the
    // restaurant published. If the two drift, the app either nags about an
    // update it already has or stays silent about one it needs.
    const infoPath = join(d, 'app/src/main/assets/public/dt-app.json');
    const gradleVersion = /versionName\s+"([^"]+)"/.exec(gradle)?.[1] ?? null;
    if (!existsSync(infoPath)) {
      bad('dt-app.json is missing — the app cannot know its own version, so the\n' +
          '        update check is inert. Run tools/brand.mjs, or rebuild the bundle.');
    } else {
      let info = {};
      try { info = JSON.parse(readFileSync(infoPath, 'utf8')); }
      catch (e) { bad(`dt-app.json is not valid JSON: ${e.message}`); }
      if (!info.appVersion) {
        bad('dt-app.json carries no appVersion — the update check can never fire');
      } else if (info.appVersion !== gradleVersion) {
        bad(`dt-app.json says ${info.appVersion} but versionName is ${gradleVersion}.\n` +
            '        Set both with: tools/brand.mjs --version <x.y.z>');
      } else ok(`version agrees in both places (${gradleVersion})`);
    }
  } else {
    if (!cfg.server?.url) bad('a staff app must name the site it opens');
    else if (!/^https:\/\//.test(cfg.server.url)) bad(`server.url must be https: ${cfg.server.url}`);
    else ok(`opens ${cfg.server.url}`);
  }

  // ---- permissions the app genuinely needs
  const manifest = readFileSync(join(d, 'app/src/main/AndroidManifest.xml'), 'utf8');
  const missingPerms = app.needs.filter(p => !manifest.includes(`android.permission.${p}`));
  if (missingPerms.length) {
    bad(`not declared: ${missingPerms.join(', ')}\n` +
        '        A dangerous permission the manifest omits cannot be REQUESTED at\n' +
        '        runtime, so the prompt is refused and the user cannot allow it.');
  } else ok(`declares all ${app.needs.length} permissions its code uses`);

  // Location must be optional, or Play hides the app from every device with no
  // GPS. It fills in an address; it is not what the app is for.
  if (app.needs.includes('ACCESS_FINE_LOCATION')) {
    if (/uses-feature[^>]*android\.hardware\.location[^>]*required="false"/.test(manifest)) {
      ok('location declared optional, so GPS-less devices can still install');
    } else {
      bad('android.hardware.location is not declared optional — Play will hide the\n' +
          '        app from devices without GPS');
    }
  }

  // The reverse mistake: a permission nothing uses. Android shows it to the
  // user and Play asks about it, so an unearned one costs trust for nothing.
  for (const declared of new Set(Array.from(manifest.matchAll(/android\.permission\.([A-Z_]+)/g), m => m[1]))) {
    if (!app.needs.includes(declared) && declared !== 'ACCESS_NETWORK_STATE') {
      bad(`${declared} is declared but nothing in this app uses it`);
    }
  }

  // ---- Firebase must stay out
  //
  // v1.30.0. Instructed twice: "Firebase ye q ha?? del — Supabase he lgy."
  // The only Firebase left in this repository was FCM, pulled in by
  // @capacitor/push-notifications. It is gone, and this is what stops it
  // drifting back in one file at a time — a Gradle classpath here, a plugin
  // include there, and the project quietly depends on Google again.
  {
    const firebaseHits = [];
    const scan = [
      ['settings.gradle', join(d, 'settings.gradle')],
      ['capacitor.settings.gradle', join(d, 'capacitor.settings.gradle')],
      ['build.gradle', join(d, 'build.gradle')],
      ['app/build.gradle', join(d, 'app/build.gradle')],
      ['app/capacitor.build.gradle', join(d, 'app/capacitor.build.gradle')],
      ['AndroidManifest.xml', join(d, 'app/src/main/AndroidManifest.xml')],
      ['capacitor.plugins.json', join(d, 'app/src/main/assets/capacitor.plugins.json')],
    ];
    for (const [label, file] of scan) {
      if (!existsSync(file)) continue;
      const text = readFileSync(file, 'utf8');
      // The MainActivity comment says the word while explaining its absence,
      // so only build files and the manifest are scanned, never prose.
      for (const needle of ['google-services', 'com.google.firebase', 'firebase-messaging',
                            'push-notifications', 'PushNotificationsPlugin',
                            'POST_NOTIFICATIONS', 'firebase.messaging']) {
        if (text.includes(needle)) firebaseHits.push(`${label}: ${needle}`);
      }
    }
    if (existsSync(join(ROOT, 'libs/capacitor-push-notifications'))) {
      firebaseHits.push('libs/capacitor-push-notifications is back');
    }
    if (existsSync(join(d, 'app/google-services.json'))) {
      firebaseHits.push('app/google-services.json is back');
    }
    if (firebaseHits.length) {
      bad(`Firebase has crept back in: ${firebaseHits.join('; ')}`);
    } else {
      ok('no Firebase: no FCM, no google-services, no push plugin');
    }
  }

  // ---- launcher icons, at every density
  const missing = ['mdpi', 'hdpi', 'xhdpi', 'xxhdpi', 'xxxhdpi'].filter(den =>
    !existsSync(join(d, 'app/src/main/res', `mipmap-${den}`, 'ic_launcher.png')));
  if (missing.length) bad(`launcher icon missing for: ${missing.join(', ')}`);
  else ok('launcher icons present at all five densities');
}

console.log('');
if (failed) {
  console.error('[check] NOT buildable — fix the FAIL lines above.');
  process.exit(1);
}
console.log('[check] all three apps are buildable from a clean clone.');
