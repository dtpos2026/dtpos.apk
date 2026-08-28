package com.digitaltarget.dtrider;

import com.getcapacitor.BridgeActivity;

/**
 * DT Rider.
 *
 * A shell, deliberately. The application itself is the POS web app already
 * running at the address in assets/capacitor.config.json, so this APK carries
 * no copy of it: deploy the web app and every phone has the new version on its
 * next launch, with nothing to reinstall and no version to keep in step.
 *
 * Capacitor's BridgeActivity rather than a hand-written WebView, because it
 * already answers what a bare WebView gets wrong -- the geolocation permission
 * prompt, the file chooser, back-button handling, the hardened settings -- and
 * it is the same runtime the Customer app is built on, so there is one thing
 * to understand here, not two.
 */
public class MainActivity extends BridgeActivity {
}
