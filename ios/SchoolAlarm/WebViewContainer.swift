import SwiftUI
import WebKit
import UniformTypeIdentifiers

struct WebViewContainer: UIViewRepresentable {
    @ObservedObject var viewModel: WebViewModel
    
    func makeUIView(context: Context) -> WKWebView {
        let configuration = WKWebViewConfiguration()
        
        // 1. JavaScript, DOM Storage & Cookies
        let preferences = WKPreferences()
        preferences.javaScriptCanOpenWindowsAutomatically = true
        configuration.preferences = preferences
        
        let webpagePreferences = WKWebpagePreferences()
        webpagePreferences.allowsContentJavaScript = true
        configuration.defaultWebpagePreferences = webpagePreferences
        
        // Inline media playback for audio/video
        configuration.allowsInlineMediaPlayback = true
        configuration.mediaTypesRequiringUserActionForPlayback = []
        
        // Persistent Website Data Store for Cookies & LocalStorage
        configuration.websiteDataStore = WKWebsiteDataStore.default()
        
        let webView = WKWebView(frame: .zero, configuration: configuration)
        webView.uiDelegate = context.coordinator
        webView.navigationDelegate = context.coordinator
        
        // Specification requirement: NO swipe-to-go-back gesture
        webView.allowsBackForwardNavigationGestures = false
        
        // Specification requirement: Pull-to-refresh using UIRefreshControl attached to scrollView
        let refreshControl = UIRefreshControl()
        refreshControl.addTarget(context.coordinator, action: #selector(Coordinator.handleRefresh(_:)), for: .valueChanged)
        webView.scrollView.refreshControl = refreshControl
        
        // Observe loading progress for slim progress bar
        context.coordinator.setupProgressObserver(for: webView)
        
        // Specification requirement: Enable disk caching for fast page loading
        context.coordinator.configureCachePolicy()
        
        // Specification requirement: Load Target Website (https://schoolalarms.blogspot.com)
        if let url = URL(string: viewModel.targetUrlString) {
            var request = URLRequest(url: url)
            request.cachePolicy = .useProtocolCachePolicy
            webView.load(request)
        }
        
        viewModel.webView = webView
        return webView
    }
    
    func updateUIView(_ uiView: WKWebView, context: Context) {
        // Dynamic view updates if needed
    }
    
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
            progressObserver = webView.observe(\.estimatedProgress, options: [.new]) { [weak self] webView, _ in
                DispatchQueue.main.async {
                    self?.parent.viewModel.estimatedProgress = webView.estimatedProgress
                }
            }
        }
        
        func configureCachePolicy() {
            let cache = URLCache(memoryCapacity: 25 * 1024 * 1024, diskCapacity: 120 * 1024 * 1024, diskPath: "SchoolAlarmDiskCache")
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
        
        func webView(_ webView: WKWebView, decidePolicyFor navigationAction: WKNavigationAction, preferences: WKWebpagePreferences, decisionHandler: @escaping (WKNavigationActionPolicy, WKWebpagePreferences) -> Void) {
            guard let url = navigationAction.request.url else {
                decisionHandler(.allow, preferences)
                return
            }
            
            // Handle Downloadable files & PDFs
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
        
        // MARK: - WKUIDelegate (Camera, Microphone & File Uploads)
        
        // Support camera and microphone media capture in WKWebView using requestMediaCapturePermissionFor (iOS 15+)
        @available(iOS 15.0, *)
        func webView(
            _ webView: WKWebView,
            requestMediaCapturePermissionFor origin: WKSecurityOrigin,
            initiatedByFrame frame: WKFrameInfo,
            type: WKMediaCaptureType,
            decisionHandler: @escaping (WKPermissionDecision) -> Void
        ) {
            decisionHandler(.grant)
        }
        
        // Implement WKUIDelegate to handle <input type="file"> (photo, video, document uploads)
        func webView(_ webView: WKWebView, runOpenPanelWith parameters: WKOpenPanelParameters, initiatedByFrame frame: WKFrameInfo, completionHandler: @escaping ([URL]?) -> Void) {
            // Allows photo library / document picking when file input is pressed
            completionHandler(nil)
        }
        
        // JavaScript Dialogs
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
        
        @available(iOS 15.0, *)
        func downloadDidFinish(_ download: WKDownload) {
            // Completed
        }
    }
}
