package com.hukui.writingpromptroom;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.view.ViewGroup;
import android.webkit.JavascriptInterface;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import org.json.JSONArray;

import androidx.core.content.FileProvider;

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

        @JavascriptInterface
        public synchronized boolean shareMarkdown(String fileName, String content) {
            try {
                File exportDir = new File(getCacheDir(), "exports");
                if (!exportDir.exists() && !exportDir.mkdirs()) {
                    return false;
                }

                String safeName = sanitizeFileName(fileName == null || fileName.trim().isEmpty()
                        ? "writing-prompts.md"
                        : fileName);
                File exportFile = new File(exportDir, safeName);
                FileOutputStream stream = new FileOutputStream(exportFile, false);
                stream.write((content == null ? "" : content).getBytes(StandardCharsets.UTF_8));
                stream.close();

                Uri uri = FileProvider.getUriForFile(
                        MainActivity.this,
                        getPackageName() + ".fileprovider",
                        exportFile
                );

                Intent intent = new Intent(Intent.ACTION_SEND);
                intent.setType("text/markdown");
                intent.putExtra(Intent.EXTRA_SUBJECT, safeName);
                intent.putExtra(Intent.EXTRA_STREAM, uri);
                intent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);

                runOnUiThread(() -> startActivity(Intent.createChooser(intent, "导出收藏")));
                return true;
            } catch (Exception error) {
                return false;
            }
        }

        private String sanitizeFileName(String name) {
            String cleaned = name.replaceAll("[\\\\/:*?\"<>|]", "_").trim();
            return cleaned.endsWith(".md") ? cleaned : cleaned + ".md";
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
