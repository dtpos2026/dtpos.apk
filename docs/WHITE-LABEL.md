# One restaurant, one app

## What does NOT need a new APK

Almost everything. The customer app reads its branding from the database each
time it opens, through the same anon-safe call the website uses
(`public_customer_app_config`). Edit it in **Super Admin → Premium Customer
Apps**:

- app name shown inside the app
- logo
- theme colours
- WhatsApp number
- which features are switched on (ordering, tracking, history, offers, support)
- app version, minimum supported version, update URL

Change any of these and every phone has them on its next launch. No rebuild, no
reinstall.

## What DOES need a new APK

Three things, because Android reads them from the installed package rather than
from the running app:

| | Why it cannot be changed at runtime |
|---|---|
| **applicationId** | It *is* the app's identity to the device and to Play. |
| **launcher icon** | Compiled into the APK's resources. |
| **launcher name** | The same. |

## Branding a restaurant

```bash
node tools/brand.mjs --app Customer \
  --tenant fd3ead3d-af9a-4ff2-b78d-5f93d1e6e3fb \
  --id com.digitaltarget.buttbbq
```

That reads the restaurant's app name and icon from the live database, writes the
launcher icons at all five densities, stamps the id and the name, and points the
app at that restaurant's ordering site. Then build in Android Studio as usual.

Anything can be given by hand instead, and a flag always wins over the database:

```bash
node tools/brand.mjs --app Customer \
  --name "Ali Foods" --id com.alifoods.customer --icon ./ali-logo.png \
  --version 1.2.0 --version-code 4
```

`tools/` uses only Node's own libraries — there is nothing to install.

## The mistake worth avoiding

**Give every restaurant its own applicationId.**

Android identifies an installed app by that id and nothing else. Two
restaurants built under the same id are, to every phone and to the Play Console,
the same app: installing the second silently *replaces* the first and takes its
data with it, and neither can be published alongside the other.

The failure is invisible until a customer who has both loses one. `brand.mjs`
warns when you brand for a restaurant while still on the shared default id.

A convention that keeps them apart:

```
com.digitaltarget.buttbbq
com.digitaltarget.alifoods
com.digitaltarget.<restaurant-slug>
```

The Java package (`namespace` in `app/build.gradle`) is deliberately *not*
changed — that is where `MainActivity` and the generated `R` class are compiled,
and moving it without moving the sources breaks the build. Only `applicationId`
needs to differ, and it is the one that matters.

## Icons

Give a **square PNG, at least 512×512**, with a transparent or solid
background. It is written out twice per density:

- the legacy square icon (Android 7), drawn edge to edge
- the adaptive-icon foreground (Android 8+), inset to the middle 66%

That inset is not padding for looks. Launchers crop the foreground to a circle,
a squircle or a rounded square depending on the phone, and only that middle
region is guaranteed to survive. A logo drawn edge to edge loses its corners on
most devices.

JPEG and SVG are refused rather than mangled — convert first.

## The staff apps

Rider and OrderTaker are the same restaurant platform for every tenant: staff
sign in with a username and, when the same username exists at more than one
restaurant, the **Workspace Code**. So one APK of each serves everybody, and
they normally need no branding at all.

Brand them only if a particular restaurant wants its own name and icon on staff
phones — the same command, with `--app Rider` or `--app OrderTaker`.
