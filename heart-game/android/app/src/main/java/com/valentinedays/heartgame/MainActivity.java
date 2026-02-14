package com.valentinedays.heartgame;

import android.os.Bundle;
import android.view.WindowManager;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
  @Override
  public void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);

    // Anti-cópia (não impede 100% — outra câmara/roots/etc. ainda conseguem),
    // mas bloqueia screenshots/recents na maioria dos casos.
    if (!BuildConfig.DEBUG) {
      getWindow().setFlags(
          WindowManager.LayoutParams.FLAG_SECURE,
          WindowManager.LayoutParams.FLAG_SECURE
      );
    }
  }
}
