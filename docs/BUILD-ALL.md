# Teeno apps ek saath — Owner, Rider, Order Taker

Do raaste hain. **GitHub Actions** (aap ke PC par kuch install nahi) aur **apna PC** (ek command).
Customer app parked hai; woh sirf tab banti hai jab aap `apps = everything` ya `Customer` chunein.

| App | Package | Khulta hai | Location? |
|---|---|---|---|
| **DT Owner** | `com.digitaltarget.dtowner` | `…/?app=owner#/owner-app` | nahi (permission hi nahi maangta) |
| **DT Rider** | `com.digitaltarget.dtrider` | `…/?app=rider#/rider-portal` | haan (GPS) |
| **DT Order Taker** | `com.digitaltarget.dtordertaker` | `…/?app=order-taker#/order-taker` | haan |

Teeno app website ko full-screen kholti hain. **Website update karne par app khud update ho jati hai**; APK sirf tab dobara
banti hai jab naam, icon, package id ya version badalna ho.

---

## A. GitHub Actions se (sab se aasan)

1. GitHub → is repository → **Actions** → **Build Android APKs** → **Run workflow**.
2. Branch chunein (jis mein kaam hai), **apps = all** rehne dein, **Run workflow**.
3. 6–10 minute baad run kholein → neeche **Artifacts**: `DT-Owner`, `DT-Rider`, `DT-OrderTaker`. Har ek zip mein apni APK hai.
4. APK phone par bhejein (WhatsApp / USB / Drive) aur kholein. Phone mein *Install unknown apps* allow karna hoga (ek dafa).

Har run ka `versionCode` = run number, jo hamesha barhta hai. Is liye naya build purane build ke upar install ho jata hai.

### Jo APK aap staff ko dein — signed release (ek dafa tayyari)

Debug build har dafa **naye, alag key** se sign hoti hai, is liye uske upar doosri build install nahi hoti
(*"App not installed — conflicts with an existing package"*). Staff ko dene wali APK apni **permanent key** se sign honi chahiye.

**1. Key banayein (sirf ek dafa — Windows CMD / PowerShell):**
```
keytool -genkeypair -v -keystore dt-release.keystore -alias dt -keyalg RSA -keysize 2048 -validity 10000
```
Do password poochega (keystore aur key). Dono likh kar rakhein. **`dt-release.keystore` ka backup kisi mehfooz jagah rakhein.
Yeh file kho gayi to installed apps kabhi update nahi hongi — sab ko uninstall karke dobara install karna parega.**

**2. Base64 banayein (PowerShell):**
```
[Convert]::ToBase64String([IO.File]::ReadAllBytes("dt-release.keystore")) | Set-Clipboard
```

**3. GitHub → Settings → Secrets and variables → Actions → New repository secret** — chaar secrets:

| Secret | Value |
|---|---|
| `ANDROID_KEYSTORE_BASE64` | upar copy kiya hua base64 |
| `ANDROID_KEYSTORE_PASSWORD` | keystore ka password |
| `ANDROID_KEY_ALIAS` | `dt` |
| `ANDROID_KEY_PASSWORD` | key ka password |

**4. Run workflow → `release` tick.** Tick `publish_release` bhi karein to teeno signed APK ek **GitHub Release** par aa jayengi
(Releases page par seedha download link — staff ko wahi link dein).

---

## B. Apne PC par (ek command)

Ek dafa: **JDK 21** (https://adoptium.net) aur **Android Studio** (SDK ke liye). Phir `JAVA_HOME` aur `ANDROID_HOME` set karein
(`ANDROID_APPS.md` ke "Zaroori software" hissa mein tareeqa hai; CMD naya kholna na bhoolein).

```
node tools/build-all.mjs                 teeno ki debug APK  ->  dist-apks\
node tools/build-all.mjs --release       signed (DT_KEYSTORE_PATH, DT_KEYSTORE_PASSWORD, DT_KEY_ALIAS, DT_KEY_PASSWORD set hon)
node tools/build-all.mjs --apps Owner    sirf ek
node tools/build-all.mjs --dry-run       sirf dikhaye ke kya karega
```
Script khud check karta hai ke Java/SDK/key theek hain aur kami ho to seedhi wajah batata hai.

---

## C. Phone par asli test — har app ke liye 5 minute

Yeh sab asli phone par karna hai (yeh machine par nahi ho sakta). Jo fail ho woh mujhe likh dein.

**DT Owner**
- [ ] Kholte hi Owner ka sign-in aaye (POS ka email login nahi).
- [ ] Sign in → Overview mein branches aur aaj ki sales.
- [ ] App ko background mein dal kar 10 minute baad kholein → Owner app hi khule (POS login par na jaye).
- [ ] Internet band karein → "offline" saaf likha aaye; wapas on karein → data aa jaye.
- [ ] Install karte waqt location ki permission **na** maange.

**DT Rider**
- [ ] Sign in → Home. Location ki permission maange → Allow.
- [ ] Koi order claim karein → "I have picked up" → "I have reached" → Delivered. Delivered par raqam ka record bane.
- [ ] Phone screen band/open karein → app wahin rahe.
- [ ] Software mein Delivery board par rider ki halat badle.

**DT Order Taker**
- [ ] Sign in → table chunein → item daalein → bhejein. Software ki Running Bills mein 5 second ke andar order aaye.
- [ ] Internet band karke order banayein → "sending/stuck" banner; internet wapas → order chala jaye, **ek hi baar**.

**Teeno**
- [ ] Nayi build purani ke upar install ho (versionCode ki wajah se). Agar "conflicts with existing package" aaye to purani build alag key se thi — ek dafa uninstall karein, phir release key se install; uske baad sab update ho jayengi.

---

## D. Masle

| Dikha | Matlab |
|---|---|
| Actions mein `Failed to find package 'tools'` | Purani workflow. Nayi (is branch ki) workflow chalayein. |
| `A release build needs ANDROID_KEYSTORE_BASE64` | `release` tick hai magar secrets set nahi. Upar "signed release" dekhein. |
| APK khulte hi khali/safed screen | Phone offline hai ya website down. Browser mein `digitaltarget.digital` kholein. |
| "App not installed" | Pehle wali build alag key se sign thi, ya versionCode kam hai. Uninstall karke dobara. |
