import Foundation
import UIKit
import SwiftUI

struct DownloadItem: Identifiable {
    let id = UUID()
    let localURL: URL
}

/// Download Manager handling file downloads, PDF saving and UIActivityViewController sharing
class DownloadManager: NSObject, ObservableObject {
    static let shared = DownloadManager()
    
    func downloadFile(from url: URL, completion: @escaping (URL?) -> Void) {
        let session = URLSession(configuration: .default)
        let task = session.downloadTask(with: url) { localURL, response, error in
            guard let localURL = localURL, error == nil else {
                print("Download error: \(String(describing: error))")
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
                print("File system error: \(error)")
                completion(nil)
            }
        }
        task.resume()
    }
}

/// SwiftUI wrapper for UIActivityViewController (Share / Save to Files / AirDrop)
struct ActivityViewController: UIViewControllerRepresentable {
    let activityItems: [Any]
    var applicationActivities: [UIActivity]? = nil
    
    func makeUIViewController(context: Context) -> UIActivityViewController {
        let controller = UIActivityViewController(activityItems: activityItems, applicationActivities: applicationActivities)
        return controller
    }
    
    func updateUIViewController(_ uiViewController: UIActivityViewController, context: Context) {}
}
