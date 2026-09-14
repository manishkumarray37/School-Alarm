import React, { useState } from 'react';
import {
  Bell,
  Smartphone,
  Code2,
  CheckCircle2,
  Download,
  ExternalLink,
  WifiOff,
  Wifi
} from 'lucide-react';
import { SimulatorTab } from '../types';
import { generateXcodeZip, downloadBlob } from '../utils/xcodeZip';

interface HeaderProps {
  activeTab: SimulatorTab;
  setActiveTab: (tab: SimulatorTab) => void;
  isOffline: boolean;
  setIsOffline: (val: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  isOffline,
  setIsOffline,
}) => {
  const [isExporting, setIsExporting] = useState(false);

  const handleDownloadZip = async () => {
    try {
      setIsExporting(true);
      const blob = await generateXcodeZip();
      downloadBlob(blob, 'SchoolAlarm-iOS-SwiftUI.zip');
    } catch (err) {
      console.error('Failed to export zip:', err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-slate-950/80 backdrop-blur-md border-b border-slate-800 px-4 lg:px-8 py-3">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Logo & App Info */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-700 via-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Bell className="w-5 h-5 fill-white/20" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-white tracking-tight">
                  School Alarm
                </h1>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-300 font-semibold">
                  iOS Native • SwiftUI
                </span>
              </div>
              <p className="text-xs text-slate-400">
                WKWebView wrapper for <span className="text-slate-300 font-medium">schoolalarms.blogspot.com</span>
              </p>
            </div>
          </div>

          <a
            href="https://schoolalarms.blogspot.com"
            target="_blank"
            rel="noreferrer"
            className="md:hidden p-2 text-slate-400 hover:text-white rounded-lg bg-slate-900 border border-slate-800"
            title="Open blog portal"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center p-1 bg-slate-900/90 rounded-xl border border-slate-800 text-xs font-medium w-full md:w-auto justify-center">
          <button
            id="tab-simulator"
            onClick={() => setActiveTab('simulator')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg transition-all ${
              activeTab === 'simulator'
                ? 'bg-blue-600 text-white shadow-sm font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>Interactive Simulator</span>
          </button>

          <button
            id="tab-code"
            onClick={() => setActiveTab('code')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg transition-all ${
              activeTab === 'code'
                ? 'bg-blue-600 text-white shadow-sm font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code2 className="w-4 h-4" />
            <span>Swift Source Code</span>
          </button>

          <button
            id="tab-specs"
            onClick={() => setActiveTab('specs')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg transition-all ${
              activeTab === 'specs'
                ? 'bg-blue-600 text-white shadow-sm font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Specs Audit</span>
          </button>
        </div>

        {/* Right CTA Actions */}
        <div className="hidden md:flex items-center gap-2.5">
          <button
            onClick={() => setIsOffline(!isOffline)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
              isOffline
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                : 'bg-slate-900 text-slate-300 border border-slate-800 hover:bg-slate-850'
            }`}
            title="Simulate NWPathMonitor network state"
          >
            {isOffline ? <WifiOff className="w-3.5 h-3.5 text-rose-400" /> : <Wifi className="w-3.5 h-3.5 text-emerald-400" />}
            <span>{isOffline ? 'Offline' : 'Online'}</span>
          </button>

          <button
            id="btn-header-export-zip"
            onClick={handleDownloadZip}
            disabled={isExporting}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-md shadow-blue-500/20 transition-all active:scale-[0.98]"
          >
            <Download className="w-4 h-4" />
            <span>{isExporting ? 'Generating...' : 'Download Xcode (.zip)'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
