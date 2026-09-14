# School Alarm - Native iOS App (Swift & SwiftUI)

A lightweight, high-performance native iOS app built in Swift and SwiftUI for the School Alarm portal.

## Target Portal
- **Web Portal URL**: `https://schoolalarms.blogspot.com`
- **Native Wrapper**: `WKWebView` wrapped inside SwiftUI `UIViewRepresentable` (`WebViewContainer.swift`)

## Implemented Specifications

1. **Target Website**:
   - `WKWebView` container with JavaScript, DOM storage, and cookies enabled.
   - `allowsBackForwardNavigationGestures = false` (prevents conflicting back/forward swipe gestures).
   - Pull-to-refresh with `UIRefreshControl` attached directly to the web view's `scrollView`.

2. **Permissions & Info.plist**:
   - `NSCameraUsageDescription`: *"School Alarm needs access to the camera to take and upload photos/documents."*
   - `NSMicrophoneUsageDescription`: *"School Alarm needs access to the microphone for audio recording."*
   - `NSPhotoLibraryUsageDescription`: *"School Alarm needs access to your photo library to attach files and save downloads."*
   - `NSPhotoLibraryAddUsageDescription`: *"School Alarm needs access to your photo library to attach files and save downloads."*
   - `NSLocationWhenInUseUsageDescription`: *"School Alarm uses location for location-enabled web features."*

3. **WKWebView Behavior & Web Features**:
   - `WKUIDelegate` handling `<input type="file">` for photo, video, and document uploads.
   - Media capture support using `requestMediaCapturePermissionFor` (iOS 15+).
   - Native JavaScript alert panels handled gracefully.

4. **Downloads & PDF Handling**:
   - `WKDownloadDelegate` and `URLSession` download task handling.
   - Downloads saved to user Documents directory.
   - Native `UIActivityViewController` presentation sheet for AirDrop, Save to Files, and Print.

5. **Offline & Network Handling**:
   - `NWPathMonitor` from Apple's `Network` framework.
   - Reactive offline error screen (`OfflineView.swift`) with retry connection logic.
   - Dedicated disk cache (`URLCache`) with 120MB disk and 25MB memory capacity for ultra-fast reloading.

6. **UI Polish & Splash Screen**:
   - Edge-to-edge layout honoring safe area insets.
   - Native animated splash screen with glowing School Alarm iconography and graceful spring/fade-out transition.
   - Slim loading progress bar at the top during webpage navigation.

## Opening in Xcode
1. Open Xcode -> File -> New -> Project -> iOS -> App.
2. Product Name: `SchoolAlarm`, Organization Identifier: `com.schoolalarm`.
3. Interface: SwiftUI, Language: Swift.
4. Replace the template files with the files from this folder.
5. In Xcode project settings, ensure `Info.plist` is linked.
6. Build and run on iPhone simulator or connected iOS device (Cmd + R).
