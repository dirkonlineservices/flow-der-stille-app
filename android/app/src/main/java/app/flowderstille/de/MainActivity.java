package app.flowderstille.de;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        // Debugging für WebView aktivieren, um den White Screen in Chrome Inspect zu sehen
        android.webkit.WebView.setWebContentsDebuggingEnabled(true);
    }
}