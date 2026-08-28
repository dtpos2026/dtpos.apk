# Refreshing the Customer app's web bundle

Rider and OrderTaker open the live site, so a POS deploy reaches them by itself.

The Customer app carries the bundle inside the APK — that is what makes its
first screen paint without a round trip, and what push notifications are
delivered into. After a POS release it has to be copied in again and the APK
rebuilt.

## From a POS checkout

```bash
# in the POS repository
npm ci
DT_APP_TENANT=<tenant-uuid> npm run build:app

# then, in this repository
node tools/refresh-bundle.mjs --from /path/to/digitaltarget.digital
```

`refresh-bundle.mjs` replaces `Customer/app/src/main/assets/public/` with the
new build and keeps the opening route pointed at the same restaurant. Rebuild in
Android Studio afterwards.

## Or let CI do it

**Actions → Build Android APKs → Run workflow**, with *refresh the Customer
bundle* ticked. The workflow checks out the POS repository, builds the bundle
for the restaurant you name, brands the app and produces the APK — nothing to
install locally.

## How a phone knows it is out of date

`customer_apps` already carries `app_version`, `min_supported_version`,
`update_url` and `update_required`, all editable in Super Admin. Raise the
version there when you publish a new APK and point `update_url` at it.
