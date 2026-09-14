import SwiftUI

struct SplashScreenView: View {
    @State private var isPulsing = false
    @State private var ringScale: CGFloat = 0.8
    @State private var ringOpacity: Double = 0.5
    
    var body: some View {
        ZStack {
            Color(red: 0.07, green: 0.11, blue: 0.20)
                .ignoresSafeArea()
            
            // Subtle animated background ambient aura
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
