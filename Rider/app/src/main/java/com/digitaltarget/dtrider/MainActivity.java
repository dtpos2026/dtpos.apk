package com.digitaltarget.dtrider;

import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.os.Build;
import android.os.Bundle;

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
 *
 * v1.29.9 adds the notification channel. From Android 8 (API 26) a
 * notification posted to a channel that was never created is dropped without a
 * word, so "dt_orders" — the channel_id push-dispatch addresses, and the
 * default declared in the manifest — has to exist before the first message
 * lands. Creating a channel that already exists is a no-op, so running this on
 * every launch is safe.
 */
public class MainActivity extends BridgeActivity {

    private static final String ORDER_CHANNEL_ID = "dt_orders";

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        createOrderChannel();
    }

    private void createOrderChannel() {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return;

        NotificationManager manager = getSystemService(NotificationManager.class);
        if (manager == null) return;

        NotificationChannel channel = new NotificationChannel(
                ORDER_CHANNEL_ID,
                getString(R.string.order_channel_name),
                NotificationManager.IMPORTANCE_HIGH);
        channel.setDescription(getString(R.string.order_channel_description));
        channel.enableVibration(true);
        manager.createNotificationChannel(channel);
    }
}
