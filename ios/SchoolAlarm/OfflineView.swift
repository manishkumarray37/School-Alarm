import SwiftUI

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
