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
