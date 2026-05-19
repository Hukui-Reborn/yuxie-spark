# 语写火花 Android 版

这是把网页工具封装成 Android App 的工程。App 内使用 WebView 加载本地页面，收藏通过 `AndroidStorage` 原生桥写入 App 内部文件：

`/data/data/com.hukui.writingpromptroom/files/saved-prompts.json`

这个文件属于 App 私有数据，不是浏览器缓存，也不依赖 `localhost` 服务。

## 构建 APK

1. 安装 Android Studio。
2. 用 Android Studio 打开 `android-app` 文件夹。
3. 等待 Gradle 同步完成。
4. 点击 `Build > Build Bundle(s) / APK(s) > Build APK(s)`。
5. 生成的 APK 通常在：

`android-app/app/build/outputs/apk/debug/app-debug.apk`

也可以在安装好 Android Studio / Gradle 后运行：

`build-debug-apk.cmd`

如果你之后继续修改网页版本，先运行：

`sync-web-assets.cmd`

## GitHub Actions 在线构建

仓库根目录已经提供工作流：

`.github/workflows/android-apk.yml`

把整个项目上传到 GitHub 后，可以在 GitHub 网页里进入 `Actions`，选择 `Build Android APK`，点击 `Run workflow`。构建完成后，在本次运行页面底部的 `Artifacts` 区域下载：

`writing-prompt-room-debug-apk`

## 安装到手机

把 APK 传到安卓手机后打开安装。第一次安装非应用商店 APK 时，系统可能会要求允许“安装未知来源应用”。
