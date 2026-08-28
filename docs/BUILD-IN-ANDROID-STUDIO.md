# Building an APK in Android Studio

Nothing but Android Studio is needed. No npm, no Node, no `cap sync`.

## Before the first build

**Java** — Android Studio ships its own JDK, so this is usually already done.
The Android Gradle Plugin needs **JDK 17 or newer**; 21 is what CI uses.
Check under *File → Settings → Build, Execution, Deployment → Build Tools →
Gradle → Gradle JDK*.

**Android SDK** — Android Studio installs it on first run and writes
`local.properties` itself when it opens a project. If a build ever says
`SDK location not found`, open *Tools → SDK Manager* once and let it finish.

**Where you put this repository matters.** Clone or unzip it somewhere short,
with no brackets and no spaces:

```
C:\dtpos.apk          good
C:\Users\you\Downloads\dtpos.apk (3)\...     breaks Gradle
```

A path containing `(3)` — the shape a browser gives a re-downloaded zip — makes
Gradle fail while naming a *different* missing file, which sends you looking in
entirely the wrong place. Windows' 260-character path limit does the same from
a deep Downloads folder.

## Build

1. **File → Open** and choose **one app folder**:
   `Customer`, `Rider` or `OrderTaker`.
   Not this repository's root — there is no Gradle project there.
2. Let Gradle sync. The first sync downloads the Android plugin from
   `dl.google.com` and takes a few minutes. It is not stuck.
3. **Build → Build Bundle(s) / APK(s) → Build APK(s)**
4. When the balloon says *APK(s) generated successfully*, click **locate**.
   The file is at:

   ```
   <App>/app/build/outputs/apk/debug/app-debug.apk
   ```

Copy it to a phone and open it. Android will ask to allow installing from this
source; that is expected for an APK that did not come from Play.

## Run it straight onto a phone

Turn on *Developer options → USB debugging* on the phone, plug it in, pick it in
the device dropdown, press **▶ Run**. Android Studio installs and launches it.

## If a build fails

| What it says | What it means |
|---|---|
| `SDK location not found` | Open *Tools → SDK Manager* once, then re-sync. |
| `Could not resolve com.android.tools.build:gradle` | The machine cannot reach `dl.google.com`. That host serves the Android plugin and nothing mirrors it. On a filtered network, use the CI workflow instead. |
| `cordova.variables.gradle ... does not exist` | Something removed a committed directory. `git status` will show it; `git checkout .` restores it. |
| `Cannot create symbolic link` | Not from this repository — that one belongs to the Windows desktop build. |
| Gradle names a file you can plainly see | Check the path for brackets or spaces. See above. |

## The other way

**GitHub → Actions → Build Android APKs → Run workflow.** Pick which apps, and
optionally a restaurant to brand for. The APKs arrive as downloadable artifacts
and nothing has to be installed on your machine at all.
