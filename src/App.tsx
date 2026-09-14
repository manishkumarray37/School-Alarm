import React, { useState } from 'react';
import { Header } from './components/Header';
import { IPhoneSimulator } from './components/IPhoneSimulator';
import { CodeViewer } from './components/CodeViewer';
import { SpecsChecklist } from './components/SpecsChecklist';
import { SimulatorTab } from './types';
import {
  Smartphone,
  Code2,
  CheckCircle2,
  Download,
  ShieldCheck,
  Zap,
  Globe,
  Camera,
  Mic,
  Image as ImageIcon,
  MapPin,
  FileDown,
  RotateCw,
  ExternalLink,
  BookOpen,
  ArrowUpRight
} from 'lucide-react';
import { generateXcodeZip, downloadBlob } from './utils/xcodeZip';

export default function App() {
  const [activeTab, setActiveTab] = useState<SimulatorTab>('simulator');
  const [isOffline, setIsOffline] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleDownloadZip = async () => {
    try {
      setIsExporting(true);
      const blob = await generateXcodeZip();
      downloadBlob(blob, 'SchoolAlarm-iOS-SwiftUI.zip');
    } catch (err) {
      console.error('Failed to export:', err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-blue-600 selection:text-white">
      {/* Global Navigation Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOffline={isOffline}
        setIsOffline={setIsOffline}
      />

      {/* Main Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-8 flex flex-col">
        {activeTab === 'simulator' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left/Center: Realistic iPhone 16 Pro Simulator */}
            <div className="lg:col-span-6 flex flex-col items-center justify-center">
              <IPhoneSimulator
                isOffline={isOffline}
                setIsOffline={setIsOffline}
              />
            </div>

            {/* Right: Live Interactive Inspection & Swift Architecture Panel */}
            <div className="lg:col-span-6 space-y-6">
              {/* Architecture Highlights Card */}
              <div className="p-6 bg-slate-900/90 border border-slate-800 rounded-3xl shadow-xl backdrop-blur-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
                      <Zap className="w-4 h-4" />
                    </div>
                    <div>
                      <h2 className="text-sm font-bold text-white">
                        Native iOS Architecture
                      </h2>
                      <p className="text-xs text-slate-400">
                        SwiftUI 5 + WebKit (WKWebView)
                      </p>
                    </div>
                  </div>

                  <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    iOS 15.0+ Ready
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed mb-4">
                  School Alarm wraps <span className="font-semibold text-blue-400">https://schoolalarms.blogspot.com</span> inside a native SwiftUI <code className="text-pink-300 bg-slate-950 px-1.5 py-0.5 rounded text-[11px]">UIViewRepresentable</code>. It features full disk caching, privacy usage descriptions, pull-to-refresh, media capture delegates, and native file download handling.
                </p>

                {/* Key Spec Badges */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800/80">
                    <div className="font-semibold text-slate-200 flex items-center gap-1.5 mb-1 text-[11px]">
                      <Globe className="w-3.5 h-3.5 text-blue-400" />
                      Target Portal
                    </div>
                    <div className="text-[11px] text-slate-400 truncate">
                      schoolalarms.blogspot.com
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800/80">
                    <div className="font-semibold text-slate-200 flex items-center gap-1.5 mb-1 text-[11px]">
                      <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                      Info.plist Privacy
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Camera, Mic, Photos, Location
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800/80">
                    <div className="font-semibold text-slate-200 flex items-center gap-1.5 mb-1 text-[11px]">
                      <FileDown className="w-3.5 h-3.5 text-emerald-400" />
                      PDF & Downloads
                    </div>
                    <div className="text-[11px] text-slate-400">
                      WKDownloadDelegate & Share Sheet
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800/80">
                    <div className="font-semibold text-slate-200 flex items-center gap-1.5 mb-1 text-[11px]">
                      <RotateCw className="w-3.5 h-3.5 text-purple-400" />
                      UIRefreshControl
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Native Pull-to-refresh & Slim Bar
                    </div>
                  </div>
                </div>
              </div>

              {/* Fast Spec Actions & Perm Tester */}
              <div className="p-6 bg-slate-900/90 border border-slate-800 rounded-3xl shadow-xl">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center justify-between">
                  <span>Simulate Native iOS Interactions</span>
                  <span className="text-[10px] text-blue-400 font-normal">Interactive Sandbox</span>
                </h3>

                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    onClick={() => setIsOffline(!isOffline)}
                    className="p-3 rounded-2xl bg-slate-950 hover:bg-slate-850 border border-slate-800 flex items-center gap-3 text-left transition-colors group"
                  >
                    <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center shrink-0">
                      <Zap className="w-4 h-4" />
                    </div>
                    <div className="truncate">
                      <div className="text-xs font-semibold text-slate-200 group-hover:text-white">
                        {isOffline ? 'Restore Network' : 'Drop Network (NWPath)'}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {isOffline ? 'Reconnect webview' : 'Trigger OfflineView'}
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => setActiveTab('code')}
                    className="p-3 rounded-2xl bg-slate-950 hover:bg-slate-850 border border-slate-800 flex items-center gap-3 text-left transition-colors group"
                  >
                    <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0">
                      <Code2 className="w-4 h-4" />
                    </div>
                    <div className="truncate">
                      <div className="text-xs font-semibold text-slate-200 group-hover:text-white">
                        Browse Swift Code
                      </div>
                      <div className="text-[11px] text-slate-500">
                        9 Xcode files ready
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => setActiveTab('specs')}
                    className="p-3 rounded-2xl bg-slate-950 hover:bg-slate-850 border border-slate-800 flex items-center gap-3 text-left transition-colors group"
                  >
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <div className="truncate">
                      <div className="text-xs font-semibold text-slate-200 group-hover:text-white">
                        Audit All 6 Specs
                      </div>
                      <div className="text-[11px] text-slate-500">
                        100% verified compliance
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={handleDownloadZip}
                    disabled={isExporting}
                    className="p-3 rounded-2xl bg-blue-600/15 hover:bg-blue-600/25 border border-blue-500/30 flex items-center gap-3 text-left transition-all group"
                  >
                    <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow">
                      <Download className="w-4 h-4" />
                    </div>
                    <div className="truncate">
                      <div className="text-xs font-semibold text-blue-200 group-hover:text-white">
                        {isExporting ? 'Packaging...' : 'Export Xcode ZIP'}
                      </div>
                      <div className="text-[11px] text-blue-400/80">
                        1-click full project archive
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Info.plist Privacy Description Reference */}
              <div className="p-5 bg-slate-900/70 border border-slate-800/90 rounded-3xl">
                <div className="flex items-center gap-2 mb-3 text-xs font-bold text-slate-300">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Configured Info.plist Privacy Strings:</span>
                </div>
                <div className="space-y-2 text-[11px] font-mono">
                  <div className="p-2 bg-slate-950 rounded-xl border border-slate-800/80 text-slate-300">
                    <span className="text-pink-400 font-semibold">NSCameraUsageDescription:</span> "School Alarm needs access to the camera to take and upload photos/documents."
                  </div>
                  <div className="p-2 bg-slate-950 rounded-xl border border-slate-800/80 text-slate-300">
                    <span className="text-pink-400 font-semibold">NSMicrophoneUsageDescription:</span> "School Alarm needs access to the microphone for audio recording."
                  </div>
                  <div className="p-2 bg-slate-950 rounded-xl border border-slate-800/80 text-slate-300">
                    <span className="text-pink-400 font-semibold">NSPhotoLibraryUsageDescription:</span> "School Alarm needs access to your photo library to attach files and save downloads."
                  </div>
                  <div className="p-2 bg-slate-950 rounded-xl border border-slate-800/80 text-slate-300">
                    <span className="text-pink-400 font-semibold">NSLocationWhenInUseUsageDescription:</span> "School Alarm uses location for location-enabled web features."
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'code' && (
          <div className="flex-1 flex flex-col">
            <CodeViewer />
          </div>
        )}

        {activeTab === 'specs' && (
          <div className="flex-1 flex flex-col">
            <SpecsChecklist
              onSelectSpecFile={() => setActiveTab('code')}
              onOpenSimulator={() => setActiveTab('simulator')}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="w-full bg-slate-950 border-t border-slate-900 py-6 px-4 lg:px-8 mt-auto text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-slate-400">
            <span className="font-semibold text-slate-200">School Alarm</span>
            <span>•</span>
            <span>Target Web Portal:</span>
            <a
              href="https://schoolalarms.blogspot.com"
              target="_blank"
              rel="noreferrer"
              className="text-blue-400 hover:underline flex items-center gap-1"
            >
              schoolalarms.blogspot.com
              <ArrowUpRight className="w-3 h-3" />
            </a>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span>SwiftUI + WebKit</span>
            <span>•</span>
            <span>Network NWPathMonitor</span>
            <span>•</span>
            <span>iOS 15.0+ Deployment</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
