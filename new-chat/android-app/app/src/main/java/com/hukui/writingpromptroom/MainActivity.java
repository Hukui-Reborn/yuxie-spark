package com.hukui.writingpromptroom;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.os.Bundle;
import android.view.ViewGroup;
import android.webkit.JavascriptInterface;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import org.json.JSONArray;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;

public class MainActivity extends Activity {
    private WebView webView;

    @SuppressLint("SetJavaScriptEnabled")
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        webView = new WebView(this);
        webView.setLayoutParams(new ViewGroup.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.MATCH_PARENT
        ));
        setContentView(webView);

        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(false);
        settings.setAllowFileAccess(true);
        settings.setAllowContentAccess(false);
        settings.setMediaPlaybackRequiresUserGesture(false);

        webView.setWebViewClient(new WebViewClient());
        webView.addJavascriptInterface(new SavedPromptStorage(), "AndroidStorage");
        webView.loadUrl("file:///android_asset/index.html");
    }

    @Override
    public void onBackPressed() {
        if (webView != null && webView.canGoBack()) {
            webView.goBack();
            return;
        }

        super.onBackPressed();
    }

    private class SavedPromptStorage {
        private final File savedFile = new File(getFilesDir(), "saved-prompts.json");

        @JavascriptInterface
        public synchronized String readSaved() {
            try {
                ensureFile();
                FileInputStream stream = new FileInputStream(savedFile);
                byte[] bytes = new byte[(int) savedFile.length()];
                int read = stream.read(bytes);
                stream.close();
                if (read <= 0) {
                    return "[]";
                }
                return new String(bytes, 0, read, StandardCharsets.UTF_8);
            } catch (Exception error) {
                return "[]";
            }
        }

        @JavascriptInterface
        public synchronized boolean writeSaved(String json) {
            try {
                JSONArray parsed = new JSONArray(json == null ? "[]" : json);
                ensureFile();
                FileOutputStream stream = new FileOutputStream(savedFile, false);
                stream.write(parsed.toString(2).getBytes(StandardCharsets.UTF_8));
                stream.close();
                return true;
            } catch (Exception error) {
                return false;
            }
        }

        private void ensureFile() throws Exception {
            if (!savedFile.exists()) {
                FileOutputStream stream = new FileOutputStream(savedFile);
                try {
                    InputStream seed = getAssets().open("saved-prompts.json");
                    byte[] buffer = new byte[4096];
                    int count;
                    while ((count = seed.read(buffer)) > 0) {
                        stream.write(buffer, 0, count);
                    }
                    seed.close();
                } catch (Exception ignored) {
                    stream.write("[]".getBytes(StandardCharsets.UTF_8));
                }
                stream.close();
            }
        }
    }
}
