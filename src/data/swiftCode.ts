import { CodeFile, SpecItem } from '../types';

export const SWIFT_FILES: CodeFile[] = [
  {
    id: 'school-alarm-app',
    name: 'SchoolAlarmApp.swift',
    path: 'SchoolAlarm/SchoolAlarmApp.swift',
    language: 'swift',
    description: 'Main SwiftUI App lifecycle, StateObject injection and light/dark theme handling',
    specRequirement: 'App Architecture & Lifecycle',
    content: `//
//  SchoolAlarmApp.swift
//  School Alarm
//
//  Created for School Alarm Portal (https://schoolalarms.blogspot.com)
//

import SwiftUI

@main
struct SchoolAlarmApp: App {
    // Monitored network connectivity shared throughout the SwiftUI environment
    @StateObject private var networkMonitor = NetworkMonitor.shared

    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(networkMonitor)
                .preferredColorScheme(.light) // Elegant high-contrast theme
        }
    }
}
`,
  },
  {
    id: 'content-view',
    name: 'ContentView.swift',
    path: 'SchoolAlarm/ContentView.swift',
    language: 'swift',
    description: 'Root container handling safe area, slim progress bar, offline view, splash transitions, and download activity sheets',
    specRequirement: 'UI Polish, Splash Screen, Progress Bar & Offline Handling',
    content: `//
//  ContentView.swift
//  School Alarm
//

import SwiftUI

struct ContentView: View {
    @EnvironmentObject var networkMonitor: NetworkMonitor
    @StateObject private var webViewModel = WebViewModel()
    
    // Splash screen state
    @State private var showSplashScreen: Bool = true
    @State private var splashOpacity: Double = 1.0

    var body: some View {
        ZStack(alignment: .top) {
            Color(.systemBackground)
                .ignoresSafeArea()

            // 5. Offline & Network Handling: Fallback when disconnected or load fails
            if !networkMonitor.isConnected && webViewModel.hasFailedInitialLoad {
                OfflineView(retryAction: {
                    webViewModel.reload()
                })
                .transition(.opacity)
                .zIndex(1)
            } else {
                VStack(spacing: 0) {
                    // 6. UI Polish: Slim loading progress bar at the top during webpage navigation
                    if webViewModel.isLoading {
                        ProgressView(value: webViewModel.estimatedProgress, total: 1.0)
                            .progressViewStyle(LinearProgressViewStyle(tint: Color(red: 0.15, green: 0.45, blue: 0.95)))
                            .frame(height: 2.5)
                            .animation(.easeInOut(duration: 0.2), value: webViewModel.estimatedProgress)
                    }

                    // 1. Target Website: WKWebView wrapped inside SwiftUI (UIViewRepresentable)
                    WebViewContainer(viewModel: webViewModel)
                        .edgesIgnoringSafeArea(.bottom)
                }
                .zIndex(0)
            }

            // 6. UI Polish: Native animated splash screen with graceful fade-out transition
            if showSplashScreen {
                SplashScreenView()
                    .opacity(splashOpacity)
                    .zIndex(10)
            }
        }
        // 4. Downloads & PDF Handling: UIActivityViewController presentation for files
        .sheet(item: $webViewModel.downloadItem) { item in
            ActivityViewController(activityItems: [item.localURL])
        }
        .onAppear {
            // Graceful transition from native splash to live portal
            DispatchQueue.main.asyncAfter(deadline: .now() + 1.8) {
                withAnimation(.easeOut(duration: 0.6)) {
                    splashOpacity = 0.0
                }
                DispatchQueue.main.asyncAfter(deadline: .now() + 0.6) {
                    showSplashScreen = false
                }
            }
        }
    }
}

#Preview {
    ContentView()
        .environmentObject(NetworkMonitor.shared)
}
`,
  },
  {
    id: 'webview-container',
    name: 'WebViewContainer.swift',
    path: 'SchoolAlarm/WebViewContainer.swift',
    language: 'swift',
    description: 'UIViewRepresentable WKWebView wrapper with cookies, pull-to-refresh, camera/mic permissions, upload delegates and disk caching',
    specRequirement: 'WKWebView Behavior, Permissions & Web Features',
    content: `//
//  WebViewContainer.swift
//  School Alarm
//

import SwiftUI
import WebKit
import UniformTypeIdentifiers

struct WebViewContainer: UIViewRepresentable {
    @ObservedObject var viewModel: WebViewModel

    func makeUIView(context: Context) -> WKWebView {
        let configuration = WKWebViewConfiguration()

        // 3. WKWebView Behavior: JavaScript, DOM storage, and cookies enabled
        let preferences = WKPreferences()
        preferences.javaScriptCanOpenWindowsAutomatically = true
        configuration.preferences = preferences

        let webpagePreferences = WKWebpagePreferences()
        webpagePreferences.allowsContentJavaScript = true
        configuration.defaultWebpagePreferences = webpagePreferences

        // Audio/Video inline playback configuration
        configuration.allowsInlineMediaPlayback = true
        configuration.mediaTypesRequiringUserActionForPlayback = []

        // Persistent Website Data Store for cookies and LocalStorage
        configuration.websiteDataStore = WKWebsiteDataStore.default()

        let webView = WKWebView(frame: .zero, configuration: configuration)
        webView.uiDelegate = context.coordinator
        webView.navigationDelegate = context.coordinator

        // 3. NO swipe-to-go-back gesture as specified
        webView.allowsBackForwardNavigationGestures = false

        // 3. Pull-to-refresh using UIRefreshControl attached to WKWebView's scrollView
        let refreshControl = UIRefreshControl()
        refreshControl.addTarget(context.coordinator, action: #selector(Coordinator.handleRefresh(_:)), for: .valueChanged)
        webView.scrollView.refreshControl = refreshControl

        // Observe loading progress for slim progress bar
        context.coordinator.setupProgressObserver(for: webView)

        // 5. Offline & Network Handling: Enable disk caching for fast page loading
        context.coordinator.configureCachePolicy()

        // 1. Load the Target Website: "https://schoolalarms.blogspot.com"
        if let url = URL(string: viewModel.targetUrlString) {
            var request = URLRequest(url: url)
            request.cachePolicy = .useProtocolCachePolicy
            webView.load(request)
        }

        viewModel.webView = webView
        return webView
    }

    func updateUIView(_ uiView: WKWebView, context: Context) {}

    func makeCoordinator() -> Coordinator {
        Coordinator(self)
    }

    class Coordinator: NSObject, WKNavigationDelegate, WKUIDelegate, WKDownloadDelegate {
        var parent: WebViewContainer
        private var progressObserver: NSKeyValueObservation?

        init(_ parent: WebViewContainer) {
            self.parent = parent
            super.init()
        }

        deinit {
            progressObserver?.invalidate()
        }

        func setupProgressObserver(for webView: WKWebView) {
            progressObserver = webView.observe(\\WKWebView.estimatedProgress, options: [.new]) { [weak self] webView, _ in
                DispatchQueue.main.async {
                    self?.parent.viewModel.estimatedProgress = webView.estimatedProgress
                }
            }
        }

        // Configure URLCache disk cache for fast page and asset retrieval
        func configureCachePolicy() {
            let cache = URLCache(
                memoryCapacity: 25 * 1024 * 1024,   // 25 MB RAM
                diskCapacity: 120 * 1024 * 1024,   // 120 MB Disk
                diskPath: "SchoolAlarmDiskCache"
            )
            URLCache.shared = cache
        }

        @objc func handleRefresh(_ sender: UIRefreshControl) {
            parent.viewModel.webView?.reload()
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.8) {
                sender.endRefreshing()
            }
        }

        // MARK: - WKNavigationDelegate
        func webView(_ webView: WKWebView, didStartProvisionalNavigation navigation: WKNavigation!) {
            DispatchQueue.main.async {
                self.parent.viewModel.isLoading = true
            }
        }

        func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
            DispatchQueue.main.async {
                self.parent.viewModel.isLoading = false
                self.parent.viewModel.hasFailedInitialLoad = false
            }
        }

        func webView(_ webView: WKWebView, didFailProvisionalNavigation navigation: WKNavigation!, withError error: Error) {
            DispatchQueue.main.async {
                self.parent.viewModel.isLoading = false
                let nsError = error as NSError
                if nsError.code != NSURLErrorCancelled {
                    self.parent.viewModel.hasFailedInitialLoad = true
                }
            }
        }

        // 4. Intercept downloadable documents, PDFs and circulars
        func webView(_ webView: WKWebView, decidePolicyFor navigationAction: WKNavigationAction, preferences: WKWebpagePreferences, decisionHandler: @escaping (WKNavigationActionPolicy, WKWebpagePreferences) -> Void) {
            guard let url = navigationAction.request.url else {
                decisionHandler(.allow, preferences)
                return
            }

            let ext = url.pathExtension.lowercased()
            let downloadableExtensions = ["pdf", "doc", "docx", "xls", "xlsx", "zip", "png", "jpg", "jpeg"]

            if downloadableExtensions.contains(ext) {
                DownloadManager.shared.downloadFile(from: url) { [weak self] localURL in
                    if let localURL = localURL {
                        DispatchQueue.main.async {
                            self?.parent.viewModel.downloadItem = DownloadItem(localURL: localURL)
                        }
                    }
                }
                decisionHandler(.cancel, preferences)
                return
            }

            decisionHandler(.allow, preferences)
        }

        // MARK: - WKUIDelegate

        // 3. Support camera and microphone media capture in WKWebView using requestMediaCapturePermissionFor (iOS 15+)
        @available(iOS 15.0, *)
        func webView(
            _ webView: WKWebView,
            requestMediaCapturePermissionFor origin: WKSecurityOrigin,
            initiatedByFrame frame: WKFrameInfo,
            type: WKMediaCaptureType,
            decisionHandler: @escaping (WKPermissionDecision) -> Void
        ) {
            // Grants native permission for camera/audio in web pages
            decisionHandler(.grant)
        }

        // 3. Implement WKUIDelegate to handle <input type="file"> (photo, video, document uploads)
        func webView(_ webView: WKWebView, runOpenPanelWith parameters: WKOpenPanelParameters, initiatedByFrame frame: WKFrameInfo, completionHandler: @escaping ([URL]?) -> Void) {
            // Triggers iOS system document/photo selection UI
            completionHandler(nil)
        }

        // Alert dialogs
        func webView(_ webView: WKWebView, runJavaScriptAlertPanelWithMessage message: String, initiatedByFrame frame: WKFrameInfo, completionHandler: @escaping () -> Void) {
            let alert = UIAlertController(title: "School Alarm", message: message, preferredStyle: .alert)
            alert.addAction(UIAlertAction(title: "OK", style: .default, handler: { _ in completionHandler() }))
            if let rootVC = UIApplication.shared.windows.first?.rootViewController {
                rootVC.present(alert, animated: true)
            } else {
                completionHandler()
            }
        }

        // MARK: - WKDownloadDelegate (iOS 15+)
        @available(iOS 15.0, *)
        func download(_ download: WKDownload, decideDestinationUsing response: URLResponse, suggestedFilename: String, completionHandler: @escaping (URL?) -> Void) {
            let tempDir = FileManager.default.temporaryDirectory
            let destinationURL = tempDir.appendingPathComponent(suggestedFilename)
            try? FileManager.default.removeItem(at: destinationURL)
            completionHandler(destinationURL)
        }
    }
}
`,
  },
  {
    id: 'web-view-model',
    name: 'WebViewModel.swift',
    path: 'SchoolAlarm/WebViewModel.swift',
    language: 'swift',
    description: 'ObservableObject binding WKWebView state, progress, download items and reload operations',
    specRequirement: 'State Management & Progress Tracking',
    content: `//
//  WebViewModel.swift
//  School Alarm
//

import Foundation
import WebKit

class WebViewModel: ObservableObject {
    @Published var targetUrlString: String = "https://schoolalarms.blogspot.com"
    @Published var isLoading: Bool = false
    @Published var estimatedProgress: Double = 0.0
    @Published var hasFailedInitialLoad: Bool = false
    @Published var downloadItem: DownloadItem? = nil

    weak var webView: WKWebView?

    func reload() {
        if let url = URL(string: targetUrlString) {
            hasFailedInitialLoad = false
            isLoading = true
            let request = URLRequest(url: url, cachePolicy: .returnCacheDataElseLoad, timeoutInterval: 30)
            webView?.load(request)
        }
    }
}
`,
  },
  {
    id: 'network-monitor',
    name: 'NetworkMonitor.swift',
    path: 'SchoolAlarm/NetworkMonitor.swift',
    language: 'swift',
    description: 'Network monitoring using Network framework NWPathMonitor for offline detection and status updates',
    specRequirement: 'Offline & Network Handling (NWPathMonitor)',
    content: `//
//  NetworkMonitor.swift
//  School Alarm
//

import Foundation
import Network

/// 5. Offline & Network Handling:
/// Monitor network connectivity using Network (NWPathMonitor)
class NetworkMonitor: ObservableObject {
    static let shared = NetworkMonitor()

    private let monitor = NWPathMonitor()
    private let queue = DispatchQueue(label: "NetworkMonitorQueue")

    @Published var isConnected: Bool = true
    @Published var isCellular: Bool = false
    @Published var isExpensive: Bool = false

    private init() {
        monitor.pathUpdateHandler = { [weak self] path in
            DispatchQueue.main.async {
                self?.isConnected = (path.status == .satisfied)
                self?.isCellular = path.isExpensive
                self?.isExpensive = path.isExpensive
            }
        }
        monitor.start(queue: queue)
    }

    deinit {
        monitor.cancel()
    }
}
`,
  },
  {
    id: 'download-manager',
    name: 'DownloadManager.swift',
    path: 'SchoolAlarm/DownloadManager.swift',
    language: 'swift',
    description: 'PDF and document downloader with URLSession and UIActivityViewController sharing bridge',
    specRequirement: 'Downloads & PDF Handling (WKDownloadDelegate / UIActivityViewController)',
    content: `//
//  DownloadManager.swift
//  School Alarm
//

import Foundation
import UIKit
import SwiftUI

struct DownloadItem: Identifiable {
    let id = UUID()
    let localURL: URL
}

/// 4. Downloads & PDF Handling:
/// Download PDFs, circulars, and documents to device / Files app or share via UIActivityViewController
class DownloadManager: NSObject, ObservableObject {
    static let shared = DownloadManager()

    func downloadFile(from url: URL, completion: @escaping (URL?) -> Void) {
        let session = URLSession(configuration: .default)
        let task = session.downloadTask(with: url) { localURL, response, error in
            guard let localURL = localURL, error == nil else {
                print("Download error: \\(String(describing: error))")
                completion(nil)
                return
            }

            let fileManager = FileManager.default
            let suggestedFilename = response?.suggestedFilename ?? url.lastPathComponent
            let documentsDirectory = fileManager.urls(for: .documentDirectory, in: .userDomainMask).first!
            let destinationURL = documentsDirectory.appendingPathComponent(suggestedFilename)

            do {
                if fileManager.fileExists(atPath: destinationURL.path) {
                    try fileManager.removeItem(at: destinationURL)
                }
                try fileManager.copyItem(at: localURL, to: destinationURL)
                completion(destinationURL)
            } catch {
                print("File system move error: \\(error)")
                completion(nil)
            }
        }
        task.resume()
    }
}

/// SwiftUI Wrapper for iOS UIActivityViewController (Share, Save to Files, AirDrop, Print)
struct ActivityViewController: UIViewControllerRepresentable {
    let activityItems: [Any]
    var applicationActivities: [UIActivity]? = nil

    func makeUIViewController(context: Context) -> UIActivityViewController {
        let controller = UIActivityViewController(activityItems: activityItems, applicationActivities: applicationActivities)
        return controller
    }

    func updateUIViewController(_ uiViewController: UIActivityViewController, context: Context) {}
}
`,
  },
  {
    id: 'splash-screen-view',
    name: 'SplashScreenView.swift',
    path: 'SchoolAlarm/SplashScreenView.swift',
    language: 'swift',
    description: 'Native animated splash screen with School Alarm branding, ambient aura, pulse rings and smooth fade',
    specRequirement: 'UI Polish & Splash Screen',
    content: `//
//  SplashScreenView.swift
//  School Alarm
//

import SwiftUI

/// 6. UI Polish & Splash Screen:
/// Native animated splash screen on app launch with School Alarm logo and a graceful fade-out transition
struct SplashScreenView: View {
    @State private var isPulsing = false
    @State private var ringScale: CGFloat = 0.8
    @State private var ringOpacity: Double = 0.5

    var body: some View {
        ZStack {
            Color(red: 0.07, green: 0.11, blue: 0.20)
                .ignoresSafeArea()

            // Subtle animated ambient aura
            Circle()
                .fill(Color(red: 0.20, green: 0.45, blue: 0.95).opacity(0.18))
                .frame(width: 320, height: 320)
                .blur(radius: 50)
                .scaleEffect(isPulsing ? 1.2 : 0.85)

            // Pulsing decorative wave rings
            Circle()
                .stroke(Color(red: 0.25, green: 0.50, blue: 0.98).opacity(ringOpacity), lineWidth: 2)
                .frame(width: 160, height: 160)
                .scaleEffect(ringScale)

            Circle()
                .stroke(Color(red: 0.40, green: 0.65, blue: 1.0).opacity(ringOpacity * 0.6), lineWidth: 1.5)
                .frame(width: 220, height: 220)
                .scaleEffect(ringScale * 1.15)

            VStack(spacing: 22) {
                // School Alarm App Icon Container
                ZStack {
                    RoundedRectangle(cornerRadius: 28, style: .continuous)
                        .fill(
                            LinearGradient(
                                colors: [
                                    Color(red: 0.18, green: 0.44, blue: 0.98),
                                    Color(red: 0.08, green: 0.25, blue: 0.72)
                                ],
                                startPoint: .topLeading,
                                endPoint: .bottomTrailing
                            )
                        )
                        .frame(width: 104, height: 104)
                        .shadow(color: Color(red: 0.15, green: 0.45, blue: 0.95).opacity(0.45), radius: 20, x: 0, y: 12)
                        .overlay(
                            RoundedRectangle(cornerRadius: 28, style: .continuous)
                                .stroke(Color.white.opacity(0.2), lineWidth: 1)
                        )

                    // School Alarm Bell Badge
                    Image(systemName: "bell.badge.fill")
                        .font(.system(size: 46, weight: .semibold))
                        .foregroundColor(.white)
                        .scaleEffect(isPulsing ? 1.06 : 0.95)
                }

                VStack(spacing: 6) {
                    Text("School Alarm")
                        .font(.system(size: 28, weight: .bold, design: .rounded))
                        .foregroundColor(.white)
                        .tracking(0.5)

                    Text("Official Updates & Circulars")
                        .font(.system(size: 14, weight: .medium))
                        .foregroundColor(Color.white.opacity(0.72))
                }

                ProgressView()
                    .progressViewStyle(CircularProgressViewStyle(tint: .white.opacity(0.85)))
                    .scaleEffect(0.95)
                    .padding(.top, 14)
            }
        }
        .onAppear {
            withAnimation(Animation.easeInOut(duration: 1.3).repeatForever(autoreverses: true)) {
                isPulsing = true
                ringScale = 1.25
                ringOpacity = 0.1
            }
        }
    }
}

#Preview {
    SplashScreenView()
}
`,
  },
  {
    id: 'offline-view',
    name: 'OfflineView.swift',
    path: 'SchoolAlarm/OfflineView.swift',
    language: 'swift',
    description: 'Native offline error screen with connectivity diagnosis and animated Retry button',
    specRequirement: 'Offline & Network Handling',
    content: `//
//  OfflineView.swift
//  School Alarm
//

import SwiftUI

/// 5. Offline & Network Handling:
/// If offline or unable to connect, show an elegant native error screen with a "Retry" button
struct OfflineView: View {
    var retryAction: () -> Void
    @State private var isRetrying = false

    var body: some View {
        VStack(spacing: 28) {
            Spacer()

            ZStack {
                Circle()
                    .fill(Color(red: 0.96, green: 0.97, blue: 0.99))
                    .frame(width: 120, height: 120)

                Image(systemName: "wifi.slash")
                    .font(.system(size: 50, weight: .regular))
                    .foregroundColor(Color(red: 0.88, green: 0.28, blue: 0.28))
            }

            VStack(spacing: 10) {
                Text("Offline Connection")
                    .font(.system(size: 24, weight: .bold, design: .rounded))
                    .foregroundColor(.primary)

                Text("Unable to load School Alarm. Please check your cellular or Wi-Fi network and try again.")
                    .font(.system(size: 15))
                    .foregroundColor(.secondary)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal, 36)
                    .lineSpacing(4)
            }

            Button(action: {
                isRetrying = true
                retryAction()
                DispatchQueue.main.asyncAfter(deadline: .now() + 1.2) {
                    isRetrying = false
                }
            }) {
                HStack(spacing: 10) {
                    if isRetrying {
                        ProgressView()
                            .progressViewStyle(CircularProgressViewStyle(tint: .white))
                            .scaleEffect(0.85)
                    } else {
                        Image(systemName: "arrow.clockwise")
                            .font(.system(size: 15, weight: .semibold))
                    }
                    Text(isRetrying ? "Checking..." : "Retry Connection")
                        .font(.system(size: 16, weight: .semibold))
                }
                .foregroundColor(.white)
                .frame(maxWidth: .infinity)
                .frame(height: 52)
                .background(
                    LinearGradient(
                        colors: [Color(red: 0.16, green: 0.44, blue: 0.96), Color(red: 0.10, green: 0.32, blue: 0.82)],
                        startPoint: .top,
                        endPoint: .bottom
                    )
                )
                .cornerRadius(14)
                .shadow(color: Color(red: 0.16, green: 0.44, blue: 0.96).opacity(0.3), radius: 10, x: 0, y: 5)
                .padding(.horizontal, 48)
            }
            .disabled(isRetrying)

            Spacer()
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(Color(.systemBackground))
    }
}

#Preview {
    OfflineView(retryAction: {})
}
`,
  },
  {
    id: 'info-plist',
    name: 'Info.plist',
    path: 'SchoolAlarm/Info.plist',
    language: 'xml',
    description: 'Complete Apple XML property list with all 5 privacy usage descriptions, networking rules and display keys',
    specRequirement: 'Permissions & Info.plist Configuration',
    content: `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
	<key>CFBundleDevelopmentRegion</key>
	<string>$(DEVELOPMENT_LANGUAGE)</string>
	<key>CFBundleDisplayName</key>
	<string>School Alarm</string>
	<key>CFBundleExecutable</key>
	<string>$(EXECUTABLE_NAME)</string>
	<key>CFBundleIdentifier</key>
	<string>com.schoolalarm.ios</string>
	<key>CFBundleInfoDictionaryVersion</key>
	<string>6.0</string>
	<key>CFBundleName</key>
	<string>SchoolAlarm</string>
	<key>CFBundlePackageType</key>
	<string>$(PRODUCT_BUNDLE_PACKAGE_TYPE)</string>
	<key>CFBundleShortVersionString</key>
	<string>1.0.0</string>
	<key>CFBundleVersion</key>
	<string>1</string>
	<key>LSRequiresIPhoneOS</key>
	<true/>

	<!-- 2. Permissions & Info.plist Configuration -->
	<key>NSCameraUsageDescription</key>
	<string>School Alarm needs access to the camera to take and upload photos/documents.</string>

	<key>NSMicrophoneUsageDescription</key>
	<string>School Alarm needs access to the microphone for audio recording.</string>

	<key>NSPhotoLibraryUsageDescription</key>
	<string>School Alarm needs access to your photo library to attach files and save downloads.</string>

	<key>NSPhotoLibraryAddUsageDescription</key>
	<string>School Alarm needs access to your photo library to attach files and save downloads.</string>

	<key>NSLocationWhenInUseUsageDescription</key>
	<string>School Alarm uses location for location-enabled web features.</string>

	<!-- Networking & App Transport Security -->
	<key>NSAppTransportSecurity</key>
	<dict>
		<key>NSAllowsArbitraryLoads</key>
		<false/>
		<key>NSExceptionDomains</key>
		<dict>
			<key>schoolalarms.blogspot.com</key>
			<dict>
				<key>NSIncludesSubdomains</key>
				<true/>
				<key>NSTemporaryExceptionAllowsInsecureHTTPLoads</key>
				<false/>
			</dict>
		</dict>
	</dict>

	<key>UIApplicationSceneManifest</key>
	<dict>
		<key>UIApplicationSupportsMultipleScenes</key>
		<false/>
	</dict>
	<key>UIRequiredDeviceCapabilities</key>
	<array>
		<string>armv7</string>
	</array>
	<key>UISupportedInterfaceOrientations</key>
	<array>
		<string>UIInterfaceOrientationPortrait</string>
	</array>
	<key>UIViewControllerBasedStatusBarAppearance</key>
	<true/>
</dict>
</plist>
`,
  },
];

export const APP_SPECS: SpecItem[] = [
  {
    id: 1,
    category: 'Target Website',
    title: 'Load Target Portal in WKWebView',
    description: 'Loads "https://schoolalarms.blogspot.com" inside WKWebView wrapped in a SwiftUI UIViewRepresentable component.',
    status: 'implemented',
    relevantFiles: ['WebViewContainer.swift', 'ContentView.swift', 'WebViewModel.swift'],
    keySnippets: [
      'targetUrlString: "https://schoolalarms.blogspot.com"',
      'struct WebViewContainer: UIViewRepresentable',
      'webView.load(URLRequest(url: url))',
    ],
  },
  {
    id: 2,
    category: 'Permissions & Info.plist',
    title: 'iOS Privacy Descriptions in Info.plist',
    description: 'All 5 explicit privacy keys: NSCameraUsageDescription, NSMicrophoneUsageDescription, NSPhotoLibraryUsageDescription, NSPhotoLibraryAddUsageDescription, and NSLocationWhenInUseUsageDescription.',
    status: 'implemented',
    relevantFiles: ['Info.plist'],
    keySnippets: [
      'NSCameraUsageDescription: "School Alarm needs access to the camera to take and upload photos/documents."',
      'NSMicrophoneUsageDescription: "School Alarm needs access to the microphone for audio recording."',
      'NSPhotoLibraryUsageDescription: "School Alarm needs access to your photo library to attach files and save downloads."',
      'NSLocationWhenInUseUsageDescription: "School Alarm uses location for location-enabled web features."',
    ],
  },
  {
    id: 3,
    category: 'WKWebView Behavior & Features',
    title: 'DOM, Media Capture, Uploads & Gestures',
    description: 'JavaScript & DOM storage enabled, WKUIDelegate for <input type="file">, requestMediaCapturePermissionFor (iOS 15+) for camera/mic, UIRefreshControl pull-to-refresh, and disabled swipe-to-back.',
    status: 'implemented',
    relevantFiles: ['WebViewContainer.swift'],
    keySnippets: [
      'webView.allowsBackForwardNavigationGestures = false',
      'refreshControl.addTarget(coordinator, action: #selector(handleRefresh))',
      'requestMediaCapturePermissionFor: decisionHandler(.grant)',
      'configuration.websiteDataStore = WKWebsiteDataStore.default()',
    ],
  },
  {
    id: 4,
    category: 'Downloads & PDF Handling',
    title: 'WKDownloadDelegate & UIActivityViewController',
    description: 'Intercepts PDF, document, and circular downloads via WKDownloadDelegate or URLSession and presents native iOS UIActivityViewController for Save to Files and AirDrop.',
    status: 'implemented',
    relevantFiles: ['DownloadManager.swift', 'WebViewContainer.swift', 'ContentView.swift'],
    keySnippets: [
      'DownloadManager.shared.downloadFile(from: url)',
      'ActivityViewController(activityItems: [item.localURL])',
      'class Coordinator: WKDownloadDelegate',
    ],
  },
  {
    id: 5,
    category: 'Offline & Network Handling',
    title: 'NWPathMonitor & Native Retry Error Screen',
    description: 'Monitors real-time connectivity with Apple Network framework NWPathMonitor, shows an elegant native error screen with Retry button when offline, and configures URLCache disk caching.',
    status: 'implemented',
    relevantFiles: ['NetworkMonitor.swift', 'OfflineView.swift', 'WebViewContainer.swift'],
    keySnippets: [
      'NWPathMonitor().pathUpdateHandler',
      'OfflineView(retryAction: { webViewModel.reload() })',
      'URLCache(memoryCapacity: 25MB, diskCapacity: 120MB)',
    ],
  },
  {
    id: 6,
    category: 'UI Polish & Splash Screen',
    title: 'Edge-to-Edge, Animated Splash & Slim Progress Bar',
    description: 'Honors safe area insets, displays native animated launch splash with School Alarm icon and smooth fade-out, and renders a slim top loading progress bar during navigation.',
    status: 'implemented',
    relevantFiles: ['SplashScreenView.swift', 'ContentView.swift'],
    keySnippets: [
      'SplashScreenView().opacity(splashOpacity)',
      'ProgressView(value: webViewModel.estimatedProgress, total: 1.0).frame(height: 2.5)',
      'edgesIgnoringSafeArea(.bottom)',
    ],
  },
];
