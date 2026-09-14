import React, { useState } from 'react';
import { SWIFT_FILES } from '../data/swiftCode';
import { CodeFile } from '../types';
import {
  FileCode2,
  Copy,
  Check,
  Download,
  FolderOpen,
  Terminal,
  ShieldCheck,
  ChevronRight,
  Code2,
  FileText
} from 'lucide-react';
import { generateXcodeZip, downloadBlob } from '../utils/xcodeZip';

export const CodeViewer: React.FC = () => {
  const [selectedFileId, setSelectedFileId] = useState<string>(SWIFT_FILES[0].id);
  const [copied, setCopied] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);

  const activeFile = SWIFT_FILES.find((f) => f.id === selectedFileId) || SWIFT_FILES[0];

  const handleCopy = () => {
    navigator.clipboard.writeText(activeFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadSingle = () => {
    const blob = new Blob([activeFile.content], { type: 'text/plain;charset=utf-8' });
    downloadBlob(blob, activeFile.name);
  };

  const handleExportZip = async () => {
    try {
      setIsExporting(true);
      const blob = await generateXcodeZip();
      downloadBlob(blob, 'SchoolAlarm-iOS-SwiftUI.zip');
    } catch (err) {
      console.error('Export error:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const lines = activeFile.content.split('\n');

  return (
    <div className="w-full h-full flex flex-col bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
      {/* Top action bar */}
      <div className="px-4 py-3 bg-slate-950 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <FolderOpen className="w-4 h-4 text-blue-400" />
          <span className="text-xs font-semibold text-slate-200">
            Xcode Project Source Tree
          </span>
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono">
            Swift 5.9 / SwiftUI
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="btn-copy-code"
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied to Clipboard' : 'Copy File'}
          </button>

          <button
            id="btn-download-single-file"
            onClick={handleDownloadSingle}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Save .swift
          </button>

          <button
            id="btn-export-full-xcode"
            onClick={handleExportZip}
            disabled={isExporting}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm transition-all active:scale-[0.98]"
          >
            <Download className="w-3.5 h-3.5" />
            {isExporting ? 'Generating Zip...' : 'Download Full Xcode Project (.zip)'}
          </button>
        </div>
      </div>

      {/* Main split view */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-[550px]">
        {/* File Navigator Sidebar */}
        <div className="w-full md:w-64 bg-slate-950/60 border-b md:border-b-0 md:border-r border-slate-800 p-3 overflow-y-auto shrink-0">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 px-2 mb-2 flex items-center gap-1.5">
            <Terminal className="w-3 h-3 text-slate-400" />
            SchoolAlarm Target
          </div>

          <div className="space-y-1">
            {SWIFT_FILES.map((file) => {
              const isSelected = file.id === selectedFileId;
              return (
                <button
                  key={file.id}
                  id={`file-item-${file.id}`}
                  onClick={() => setSelectedFileId(file.id)}
                  className={`w-full text-left px-2.5 py-2 rounded-xl text-xs flex items-center justify-between group transition-all ${
                    isSelected
                      ? 'bg-blue-600/15 text-blue-300 border border-blue-500/30 font-medium'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    {file.name.endsWith('.plist') ? (
                      <ShieldCheck className={`w-3.5 h-3.5 ${isSelected ? 'text-amber-400' : 'text-slate-500'}`} />
                    ) : (
                      <FileCode2 className={`w-3.5 h-3.5 ${isSelected ? 'text-blue-400' : 'text-slate-500'}`} />
                    )}
                    <span className="truncate">{file.name}</span>
                  </div>
                  <ChevronRight className={`w-3 h-3 opacity-0 group-hover:opacity-100 ${isSelected ? 'opacity-100 text-blue-400' : 'text-slate-600'}`} />
                </button>
              );
            })}
          </div>

          <div className="mt-6 p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] text-slate-400">
            <div className="font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
              <Code2 className="w-3.5 h-3.5 text-blue-400" />
              Ready for Xcode
            </div>
            Drop these files straight into any Xcode 15+ iOS project. All delegates, network monitors, and Info.plist permissions are configured.
          </div>
        </div>

        {/* Code Content Area */}
        <div className="flex-1 flex flex-col bg-slate-900 overflow-hidden">
          {/* File Header Metadata */}
          <div className="px-4 py-2.5 bg-slate-900/90 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2">
            <div>
              <div className="text-xs font-bold text-slate-200 font-mono">
                {activeFile.path}
              </div>
              <div className="text-[11px] text-slate-400">
                {activeFile.description}
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                {activeFile.specRequirement}
              </span>
            </div>
          </div>

          {/* Syntax Code View */}
          <div className="flex-1 overflow-auto p-4 font-mono text-[12.5px] leading-relaxed select-text bg-[#0d1117] text-slate-300">
            <table className="w-full border-collapse">
              <tbody>
                {lines.map((line, idx) => (
                  <tr key={idx} className="hover:bg-white/[0.03]">
                    <td className="w-10 text-right pr-4 text-slate-600 select-none text-[11px] align-top py-0.5">
                      {idx + 1}
                    </td>
                    <td className="whitespace-pre py-0.5 font-mono">
                      {/* Highlighting simple keywords */}
                      {renderHighlightedLine(line)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

function renderHighlightedLine(line: string) {
  // Simple token highlight for swift
  if (line.trim().startsWith('//') || line.trim().startsWith('<!--')) {
    return <span className="text-slate-500 italic">{line}</span>;
  }
  if (line.includes('import ')) {
    const parts = line.split('import ');
    return (
      <>
        <span>{parts[0]}</span>
        <span className="text-pink-400 font-semibold">import </span>
        <span className="text-amber-300">{parts[1]}</span>
      </>
    );
  }
  if (line.includes('struct ') || line.includes('class ') || line.includes('protocol ')) {
    return <span className="text-blue-300">{line}</span>;
  }
  if (line.includes('@State') || line.includes('@ObservedObject') || line.includes('@EnvironmentObject') || line.includes('@Published') || line.includes('@main')) {
    return <span className="text-purple-400 font-medium">{line}</span>;
  }
  return <span>{line}</span>;
}
