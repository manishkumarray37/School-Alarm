import SwiftUI

@main
struct SchoolAlarmApp: App {
    @StateObject private var networkMonitor = NetworkMonitor.shared
    
    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(networkMonitor)
                .preferredColorScheme(.light)
        }
    }
}
