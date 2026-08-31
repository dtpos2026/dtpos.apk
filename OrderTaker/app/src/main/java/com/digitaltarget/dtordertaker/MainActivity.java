package com.digitaltarget.dtordertaker;

import com.getcapacitor.BridgeActivity;

/**
 * DT Order Taker.
 *
 * A shell, deliberately. The application itself is the POS web app already
 * running at the address in assets/capacitor.config.json, so this APK carries
 * no copy of it: deploy the web app and every phone has the new version on its
 * next launch, with nothing to reinstall and no version to keep in step.
 *
 * Capacitor's BridgeActivity rather than a hand-written WebView, because it
 * already answers what a bare WebView gets wrong -- the geolocation permission
 * prompt, the file chooser, back-button handling, the hardened settings.
 *
 * v1.30.0 removed the notification channel and the push plugin along with FCM.
 * Firebase is out of this project entirely; the alerting that remains is the
 * app's own, over Supabase, while the app is open.
 */
public class MainActivity extends BridgeActivity {
}
