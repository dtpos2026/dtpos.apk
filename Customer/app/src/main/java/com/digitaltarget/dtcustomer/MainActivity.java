package com.digitaltarget.dtcustomer;

import com.getcapacitor.BridgeActivity;

/**
 * DT Customer app shell.
 *
 * The stock Capacitor activity, and nothing else. The web app is bundled in
 * assets/public and bound to one restaurant at build time.
 *
 * v1.30.0 removed the notification channel and the push plugin along with FCM.
 * Firebase is out of this project entirely; the alerting that remains is the
 * app's own, over Supabase, while the app is open.
 */
public class MainActivity extends BridgeActivity {
}
