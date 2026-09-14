import SwiftUI

struct ContentView: View {
    @EnvironmentObject var networkMonitor: NetworkMonitor
    @StateObject private var webViewModel = WebViewModel()
    @State private var showSplashScreen: Bool = true
    @State private var splashOpacity: Double = 1.0
    
    var body: some View {
        ZStack(alignment: .top) {
            Color(.systemBackground)
                .ignoresSafeArea()
            
            // Offline & Network Handling: NWPathMonitor fallback
            if !networkMonitor.isConnected && webViewModel.hasFailedInitialLoad {
                OfflineView(retryAction: {
                    webViewModel.reload()
                })
                .transition(.opacity)
                .zIndex(1)
            } else {
                VStack(spacing: 0) {
                    // UI Polish: Slim loading progress bar at the top during webpage navigation
                    if webViewModel.isLoading {
                        ProgressView(value: webViewModel.estimatedProgress, total: 1.0)
                            .progressViewStyle(LinearProgressViewStyle(tint: Color(red: 0.15, green: 0.45, blue: 0.95)))
                            .frame(height: 2.5)
                            .animation(.easeInOut(duration: 0.2), value: webViewModel.estimatedProgress)
                    }
                    
                    // Native WKWebView wrapped in SwiftUI UIViewRepresentable
                    WebViewContainer(viewModel: webViewModel)
                        .edgesIgnoringSafeArea(.bottom)
                }
                .zIndex(0)
            }
            
            // Native animated splash screen with graceful fade-out transition
            if showSplashScreen {
                SplashScreenView()
                    .opacity(splashOpacity)
                    .zIndex(10)
            }
        }
        // Downloads & PDF Handling: UIActivityViewController sheet for saving/sharing
        .sheet(item: $webViewModel.downloadItem) { item in
            ActivityViewController(activityItems: [item.localURL])
        }
        .onAppear {
            // Dismiss splash screen smoothly after initial setup
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
