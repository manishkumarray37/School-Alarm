import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Wifi,
  WifiOff,
  Battery,
  RotateCw,
  Share2,
  Camera,
  Mic,
  Image as ImageIcon,
  MapPin,
  ExternalLink,
  FileText,
  Download,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  Calendar,
  Bell,
  Sparkles,
  Smartphone,
  Globe,
  X,
  Play
} from 'lucide-react';
import { DownloadModalData, PermissionModalData } from '../types';

interface IPhoneSimulatorProps {
  isOffline: boolean;
  setIsOffline: (val: boolean) => void;
  onOpenDownload?: (data: DownloadModalData) => void;
  onOpenPermission?: (data: PermissionModalData) => void;
}

export const IPhoneSimulator: React.FC<IPhoneSimulatorProps> = ({
  isOffline,
  setIsOffline,
}) => {
  // Simulator states
  const [showSplash, setShowSplash] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isPulling, setIsPulling] = useState(false);
  const [pullY, setPullY] = useState(0);
  const [activeDownload, setActiveDownload] = useState<DownloadModalData | null>(null);
  const [activePermission, setActivePermission] = useState<PermissionModalData | null>(null);
  const [iframeError, setIframeError] = useState(false);
  const [portalMode, setPortalMode] = useState<'live' | 'native_mock'>('live');
  const [notificationBanner, setNotificationBanner] = useState<string | null>(null);

  const pullStartRef = useRef<number | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Splash screen initial launch
  useEffect(() => {
    const timer1 = setTimeout(() => {
      setShowSplash(false);
    }, 2200);

    return () => clearTimeout(timer1);
  }, []);

  const triggerReload = () => {
    setIsLoading(true);
    setLoadingProgress(0.15);

    const step1 = setTimeout(() => setLoadingProgress(0.45), 200);
    const step2 = setTimeout(() => setLoadingProgress(0.85), 500);
    const step3 = setTimeout(() => {
      setLoadingProgress(1.0);
      setTimeout(() => {
        setIsLoading(false);
        setLoadingProgress(0);
      }, 250);
    }, 850);

    return () => {
      clearTimeout(step1);
      clearTimeout(step2);
      clearTimeout(step3);
    };
  };

  const restartSplashScreen = () => {
    setShowSplash(true);
    setTimeout(() => {
      setShowSplash(false);
    }, 2200);
  };

  // Pull-to-refresh handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    if (scrollContainerRef.current && scrollContainerRef.current.scrollTop === 0) {
      pullStartRef.current = e.touches[0].clientY;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (pullStartRef.current !== null) {
      const delta = e.touches[0].clientY - pullStartRef.current;
      if (delta > 0) {
        setPullY(Math.min(delta * 0.45, 65));
        setIsPulling(true);
      }
    }
  };

  const handleTouchEnd = () => {
    if (pullY > 40) {
      triggerReload();
    }
    pullStartRef.current = null;
    setIsPulling(false);
    setPullY(0);
  };

  const handleSimulateDownload = (docName: string, size: string, type: 'pdf' | 'doc' | 'image') => {
    setActiveDownload({
      isOpen: true,
      filename: docName,
      size,
      fileType: type,
      url: `https://schoolalarms.blogspot.com/${docName.toLowerCase().replace(/\s+/g, '-')}`,
    });
  };

  const handleSimulatePermission = (type: 'camera' | 'microphone' | 'photo' | 'location') => {
    const permMap = {
      camera: {
        title: '“School Alarm” Would Like to Access the Camera',
        description: 'School Alarm needs access to the camera to take and upload photos/documents.',
      },
      microphone: {
        title: '“School Alarm” Would Like to Access the Microphone',
        description: 'School Alarm needs access to the microphone for audio recording.',
      },
      photo: {
        title: '“School Alarm” Would Like to Access Your Photos',
        description: 'School Alarm needs access to your photo library to attach files and save downloads.',
      },
      location: {
        title: 'Allow “School Alarm” to Use Your Location?',
        description: 'School Alarm uses location for location-enabled web features.',
      },
    };

    const target = permMap[type];
    setActivePermission({
      isOpen: true,
      type,
      title: target.title,
      description: target.description,
    });
  };

  return (
    <div className="flex flex-col items-center justify-center w-full py-2">
      {/* Simulator Control Bar */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-4 p-2 bg-slate-900/50 backdrop-blur rounded-2xl border border-slate-800 text-xs text-slate-300 shadow-sm max-w-2xl">
        <span className="font-semibold text-slate-400 px-2 flex items-center gap-1.5">
          <Smartphone className="w-3.5 h-3.5 text-blue-400" />
          iOS Controls:
        </span>
        
        <button
          id="btn-toggle-offline"
          onClick={() => setIsOffline(!isOffline)}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-medium transition-all ${
            isOffline
              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
          }`}
          title="Simulates network drop for NWPathMonitor"
        >
          {isOffline ? <WifiOff className="w-3.5 h-3.5 text-rose-400" /> : <Wifi className="w-3.5 h-3.5 text-emerald-400" />}
          {isOffline ? 'Offline Active' : 'Simulate Offline'}
        </button>

        <button
          id="btn-relaunch-splash"
          onClick={restartSplashScreen}
          className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-200 transition-colors"
          title="Test native animated launch splash screen"
        >
          <Play className="w-3.5 h-3.5 text-amber-400" />
          Relaunch Splash
        </button>

        <button
          id="btn-trigger-refresh"
          onClick={triggerReload}
          className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-200 transition-colors"
          title="Test UIRefreshControl pull-to-refresh & slim progress bar"
        >
          <RotateCw className="w-3.5 h-3.5 text-blue-400" />
          Pull-to-Refresh
        </button>

        <button
          onClick={() => handleSimulatePermission('camera')}
          className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-200 transition-colors"
          title="Simulate iOS Camera Permission dialog"
        >
          <Camera className="w-3.5 h-3.5 text-indigo-400" />
          Test Camera
        </button>

        <button
          onClick={() => handleSimulateDownload('School-Circular-2026.pdf', '2.1 MB', 'pdf')}
          className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-200 transition-colors"
          title="Simulate iOS Native Download & Share Sheet"
        >
          <Download className="w-3.5 h-3.5 text-emerald-400" />
          Test Download
        </button>
      </div>

      {/* iPhone 16 Pro Frame */}
      <div className="relative w-[380px] h-[780px] bg-slate-950 rounded-[52px] p-3 shadow-2xl border-[5px] border-slate-700/80 ring-1 ring-white/10 select-none">
        {/* Outer chassis highlights */}
        <div className="absolute inset-0 rounded-[48px] pointer-events-none border border-white/15" />
        
        {/* Left buttons (Volume & Action) */}
        <div className="absolute -left-[9px] top-28 w-[4px] h-10 bg-slate-700 rounded-l-sm" />
        <div className="absolute -left-[9px] top-44 w-[4px] h-12 bg-slate-700 rounded-l-sm" />
        <div className="absolute -left-[9px] top-60 w-[4px] h-12 bg-slate-700 rounded-l-sm" />
        {/* Right Power button */}
        <div className="absolute -right-[9px] top-36 w-[4px] h-16 bg-slate-700 rounded-r-sm" />

        {/* Screen Container with Safe Area */}
        <div className="relative w-full h-full bg-white dark:bg-slate-900 rounded-[42px] overflow-hidden flex flex-col font-sans">
          {/* Status Bar */}
          <div className="relative z-30 h-11 px-7 flex items-center justify-between bg-white/95 dark:bg-slate-900/95 backdrop-blur-md text-slate-900 dark:text-white text-[13px] font-semibold tracking-tight">
            {/* Clock */}
            <span>9:41</span>

            {/* Dynamic Island */}
            <div className="absolute left-1/2 -translate-x-1/2 top-2.5 w-[110px] h-[30px] bg-black rounded-full flex items-center justify-between px-3 text-white shadow-inner">
              <div className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-700/80" />
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-blue-500/80 animate-pulse" />
              </div>
            </div>

            {/* Icons */}
            <div className="flex items-center gap-1.5 text-slate-800 dark:text-slate-200">
              <span className="text-[11px] font-bold">5G</span>
              {isOffline ? (
                <WifiOff className="w-3.5 h-3.5 text-rose-500" />
              ) : (
                <Wifi className="w-3.5 h-3.5" />
              )}
              <div className="w-5 h-2.5 border border-current rounded-[3px] p-[1px] flex items-center">
                <div className="h-full w-4/5 bg-current rounded-[1px]" />
              </div>
            </div>
          </div>

          {/* Slim Loading Progress Bar (Specification #6) */}
          <div className="relative z-20 h-[3px] w-full bg-transparent overflow-hidden">
            {isLoading && (
              <motion.div
                className="h-full bg-blue-600 shadow-[0_0_8px_rgba(37,99,235,0.8)]"
                initial={{ width: '10%' }}
                animate={{ width: `${Math.max(loadingProgress * 100, 20)}%` }}
                transition={{ ease: 'easeInOut', duration: 0.3 }}
              />
            )}
          </div>

          {/* Main App Content Area */}
          <div
            ref={scrollContainerRef}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            className="relative flex-1 w-full overflow-y-auto overflow-x-hidden bg-slate-50 dark:bg-slate-950 flex flex-col"
          >
            {/* Pull-To-Refresh Indicator */}
            {isPulling && (
              <div
                className="flex items-center justify-center py-2 text-blue-600 text-xs font-medium"
                style={{ height: `${pullY}px`, transition: 'height 0.1s' }}
              >
                <RotateCw className={`w-4 h-4 mr-1.5 ${pullY > 35 ? 'animate-spin' : ''}`} />
                {pullY > 35 ? 'Release to refresh portal' : 'Pull to refresh'}
              </div>
            )}

            {/* Offline View Screen (Specification #5) */}
            {isOffline ? (
              <div className="flex-1 flex flex-col items-center justify-center px-6 py-10 text-center bg-white dark:bg-slate-900">
                <div className="w-24 h-24 rounded-full bg-rose-50 dark:bg-rose-950/40 border border-rose-100 dark:border-rose-900/50 flex items-center justify-center mb-6 shadow-inner">
                  <WifiOff className="w-12 h-12 text-rose-500 animate-pulse" />
                </div>

                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight">
                  No Internet Connection
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 leading-relaxed max-w-[280px]">
                  School Alarm needs an active network connection to load updates, circulars, and notices.
                </p>

                <button
                  id="btn-simulator-retry"
                  onClick={() => {
                    setIsOffline(false);
                    triggerReload();
                  }}
                  className="w-full max-w-[260px] py-3.5 px-5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl font-semibold shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
                >
                  <RotateCw className="w-4 h-4" />
                  Retry Connection
                </button>

                <div className="mt-8 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-left text-xs text-slate-600 dark:text-slate-300 w-full max-w-[260px]">
                  <div className="flex items-center gap-1.5 font-semibold text-slate-800 dark:text-slate-200 mb-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" />
                    Native Disk Cache:
                  </div>
                  Cached circulars and schedules remain available locally in URLCache storage.
                </div>
              </div>
            ) : (
              /* Live Web Portal Container: Pure, clean, edge-to-edge iOS Web-to-App */
              <div className="flex-1 w-full h-full relative flex flex-col bg-white dark:bg-slate-900">
                {!iframeError ? (
                  <iframe
                    src="https://schoolalarms.blogspot.com"
                    title="School Alarm Web Portal"
                    className="w-full h-full flex-1 border-0"
                    allow="camera; microphone; geolocation"
                    sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-downloads"
                    onError={() => setIframeError(true)}
                  />
                ) : (
                  <div className="flex-1 p-6 flex flex-col items-center justify-center text-center space-y-4">
                    <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center">
                      <Globe className="w-7 h-7" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
                        School Alarm Portal
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 max-w-[260px]">
                        Web-to-App direct wrapper for schoolalarms.blogspot.com
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => { setIframeError(false); triggerReload(); }}
                        className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700 transition-colors flex items-center gap-1.5"
                      >
                        <RotateCw className="w-3.5 h-3.5" /> Reload
                      </button>
                      <a
                        href="https://schoolalarms.blogspot.com"
                        target="_blank"
                        rel="noreferrer"
                        className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold hover:bg-slate-200 transition-colors flex items-center gap-1.5"
                      >
                        <ExternalLink className="w-3.5 h-3.5" /> Open Portal
                      </a>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Bottom Home Indicator Bar (Honoring Safe Area) */}
          <div className="h-6 w-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm flex items-center justify-center">
            <div className="w-32 h-1 bg-slate-400 dark:bg-slate-600 rounded-full" />
          </div>

          {/* Native Animated Splash Screen (Specification #6) */}
          <AnimatePresence>
            {showSplash && (
              <motion.div
                initial={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className="absolute inset-0 z-50 bg-[#0c1322] flex flex-col items-center justify-center p-6 text-center"
              >
                {/* Ambient glow */}
                <div className="absolute w-48 h-48 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />

                {/* Pulsing rings */}
                <div className="relative mb-6">
                  <motion.div
                    animate={{ scale: [1, 1.25, 1], opacity: [0.4, 0.1, 0.4] }}
                    transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
                    className="absolute -inset-4 rounded-3xl border border-blue-400/30"
                  />
                  
                  {/* App Icon Container */}
                  <div className="relative w-24 h-24 rounded-3xl bg-gradient-to-tr from-blue-700 via-blue-600 to-indigo-500 p-0.5 shadow-2xl shadow-blue-500/40">
                    <div className="w-full h-full rounded-[22px] bg-gradient-to-br from-blue-600 to-indigo-800 flex items-center justify-center text-white">
                      <Bell className="w-12 h-12 text-white fill-white/20 animate-bounce" />
                    </div>
                  </div>
                </div>

                <motion.h1
                  initial={{ y: 8, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-2xl font-bold text-white tracking-wide mb-1"
                >
                  School Alarm
                </motion.h1>

                <motion.p
                  initial={{ y: 8, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-xs font-medium text-blue-200/80 mb-8"
                >
                  Official Updates, Timetables & Circulars
                </motion.p>

                {/* Loading indicator */}
                <div className="flex items-center gap-2 text-[11px] text-blue-300/70">
                  <div className="w-2 h-2 rounded-full bg-blue-400 animate-ping" />
                  <span>Loading WKWebView Engine...</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Native iOS UIActivityViewController (Share/Download Sheet) (Specification #4) */}
          <AnimatePresence>
            {activeDownload && (
              <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 220 }}
                className="absolute inset-x-0 bottom-0 z-40 bg-slate-100/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-t-[28px] border-t border-slate-300/60 dark:border-slate-700/60 p-4 shadow-2xl"
              >
                <div className="w-10 h-1 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto mb-3" />

                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow">
                      PDF
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-[200px]">
                        {activeDownload.filename}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {activeDownload.size} • School Alarm Document
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveDownload(null)}
                    className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center hover:bg-slate-300"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* AirDrop & Sharing row */}
                <div className="text-[11px] font-semibold text-slate-500 mb-2">Share via UIActivityViewController:</div>
                <div className="grid grid-cols-4 gap-2 mb-4 text-center text-[10px] text-slate-700 dark:text-slate-300 font-medium">
                  <div className="flex flex-col items-center gap-1.5 p-2 rounded-xl bg-white dark:bg-slate-800 shadow-sm">
                    <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center">
                      <Share2 className="w-4 h-4" />
                    </div>
                    <span>AirDrop</span>
                  </div>
                  <div className="flex flex-col items-center gap-1.5 p-2 rounded-xl bg-white dark:bg-slate-800 shadow-sm">
                    <div className="w-8 h-8 rounded-full bg-indigo-500 text-white flex items-center justify-center">
                      <FileText className="w-4 h-4" />
                    </div>
                    <span>Save to Files</span>
                  </div>
                  <div className="flex flex-col items-center gap-1.5 p-2 rounded-xl bg-white dark:bg-slate-800 shadow-sm">
                    <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                      <Download className="w-4 h-4" />
                    </div>
                    <span>Save PDF</span>
                  </div>
                  <div className="flex flex-col items-center gap-1.5 p-2 rounded-xl bg-white dark:bg-slate-800 shadow-sm">
                    <div className="w-8 h-8 rounded-full bg-slate-600 text-white flex items-center justify-center">
                      <ExternalLink className="w-4 h-4" />
                    </div>
                    <span>Print</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setActiveDownload(null);
                    setNotificationBanner(`Downloaded: ${activeDownload.filename}`);
                    setTimeout(() => setNotificationBanner(null), 3000);
                  }}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl transition-colors shadow-sm"
                >
                  Save to iPhone Documents
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Native iOS Permission Prompt Dialog (Specification #2 & #3) */}
          <AnimatePresence>
            {activePermission && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-6"
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="w-[270px] bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-200/70 dark:border-slate-700/70 overflow-hidden text-center"
                >
                  <div className="p-4">
                    <h4 className="text-[15px] font-bold text-slate-900 dark:text-white leading-tight mb-2">
                      {activePermission.title}
                    </h4>
                    <p className="text-[12px] text-slate-600 dark:text-slate-300 leading-normal">
                      {activePermission.description}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 border-t border-slate-200 dark:border-slate-700 text-[14px]">
                    <button
                      onClick={() => setActivePermission(null)}
                      className="py-2.5 font-normal text-blue-600 dark:text-blue-400 border-r border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700/50"
                    >
                      Don't Allow
                    </button>
                    <button
                      onClick={() => {
                        setActivePermission(null);
                        setNotificationBanner(`Permission Granted: ${activePermission.type}`);
                        setTimeout(() => setNotificationBanner(null), 3000);
                      }}
                      className="py-2.5 font-bold text-blue-600 dark:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-700/50"
                    >
                      OK
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Toast Banner */}
          <AnimatePresence>
            {notificationBanner && (
              <motion.div
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -50, opacity: 0 }}
                className="absolute top-12 left-4 right-4 z-40 bg-slate-900/90 dark:bg-slate-100/90 text-white dark:text-slate-900 px-3 py-2 rounded-xl text-xs font-medium shadow-lg flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="truncate">{notificationBanner}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
