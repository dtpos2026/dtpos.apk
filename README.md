# DT POS — Android apps

Three Android apps, one restaurant platform.

| App | Opens | Package | Web bundle |
|---|---|---|---|
| **Customer** | that restaurant's ordering site | `com.digitaltarget.dtcustomer` | inside the APK |
| **Rider** | `#/rider-portal` | `com.digitaltarget.dtrider` | live site |
| **OrderTaker** | `#/order-taker` | `com.digitaltarget.dtordertaker` | live site |

**Open the folder in Android Studio and press Build. That is the whole
procedure.** No `npm install`, no `npx cap sync`, no `node_modules`. Everything
Gradle reads is committed here — see [docs/WHY-VENDORED.md](docs/WHY-VENDORED.md)
for what that means and why.

---

## Build an APK

1. Android Studio → **Open** → pick `Customer/`, `Rider/` or `OrderTaker/`
   (the app folder itself, **not** this repository's root).
2. Wait for Gradle sync. The first one downloads the Android plugin and is slow;
   that is normal, not a hang.
3. **Build → Build Bundle(s) / APK(s) → Build APK(s)**.
4. The APK lands in `<App>/app/build/outputs/apk/debug/app-debug.apk`.

Step-by-step with the exact menus: [docs/BUILD-IN-ANDROID-STUDIO.md](docs/BUILD-IN-ANDROID-STUDIO.md).

Or let CI do it — **Actions → Build Android APKs → Run workflow** — and download
the artifacts. Nothing to install at all.

---

## One restaurant, one APK

Most branding does **not** need a new APK. The logo on screen, the colours, the
restaurant name, the WhatsApp number and which features are on all come from the
database at runtime — edit them in **Super Admin → Premium Customer Apps** and
every phone has them on its next launch.

Three things Android reads from the installed package instead, so they can only
change by rebuilding:

- the **applicationId** — the app's identity on the device and in Play
- the **launcher icon** — the picture on the home screen
- the **launcher name** — the label under it

`tools/brand.mjs` writes all three, taking the name and icon from that same
Super Admin configuration:

```bash
node tools/brand.mjs --app Customer \
  --tenant fd3ead3d-af9a-4ff2-b78d-5f93d1e6e3fb \
  --id com.digitaltarget.buttbbq
```

Then build in Android Studio as above. Full detail, including how to add a
second restaurant without replacing the first one on customers' phones:
[docs/WHITE-LABEL.md](docs/WHITE-LABEL.md).

`tools/` needs Node, and nothing else — no dependencies, no install step.

---

## Where the app actually lives

Rider and OrderTaker carry no copy of the POS. They open the deployed web app,
so `npm run deploy` in the POS repository is also how those two apps are
updated: every phone has the new version on its next launch, with nothing to
reinstall and no version to keep in step.

The Customer app does carry the bundle, so its first screen paints without a
round trip and push notifications work. Refreshing it after a POS release is one
command — see [docs/REFRESH-CUSTOMER-BUNDLE.md](docs/REFRESH-CUSTOMER-BUNDLE.md).

**The site both staff apps point at is
`https://digitaltarget.digital`**, set in each app's
`app/src/main/assets/capacitor.config.json`. If the POS is served from another
domain, change it there — or in one command for both:

```bash
node tools/brand.mjs --app Rider      --site https://your-domain
node tools/brand.mjs --app OrderTaker --site https://your-domain
```

---

## Signing

Debug builds install fine for testing. A release APK must be signed or Android
refuses it. Provide the keystore through the environment — never in this
repository:

```
DT_KEYSTORE_PATH   DT_KEYSTORE_PASSWORD   DT_KEY_ALIAS   DT_KEY_PASSWORD
```

With those unset, the signing block is not declared at all: a debug build still
works, and a release build fails loudly at signing rather than quietly producing
an APK nobody can install.
