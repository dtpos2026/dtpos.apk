package com.digitaltarget.dtowner;

import com.getcapacitor.BridgeActivity;

/**
 * DT Owner.
 *
 * A shell, deliberately -- the same as DT Rider and DT Order Taker. The application is the POS web app already running at
 * the address in assets/capacitor.config.json, so this APK carries no copy of it: deploy the web app and every phone has
 * the new version on its next launch, with nothing to reinstall.
 *
 * The address carries ?app=owner on purpose. Android drops a URL fragment when it restores a WebView after killing the
 * process, and a load that lands on "/" is the full POS with its email login; the query survives the restore and the web
 * app puts the install back on #/owner-app (src/lib/appEntry.ts).
 */
public class MainActivity extends BridgeActivity {
}
