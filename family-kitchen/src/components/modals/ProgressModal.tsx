"use client";

import { useEffect, useRef } from "react";
import { Loader2, CheckCircle2, X, Info, Search, Lock, Sparkles, AlertCircle, ShoppingBag } from "lucide-react";

export default function ProgressModal({
  isOpen,
  onClose,
  onCancel,
  loading,
  progressLogs,
  automationSuccess,
}: {
  isOpen: boolean;
  onClose: () => void;
  onCancel: () => void;
  loading: boolean;
  progressLogs: string[];
  automationSuccess: boolean;
}) {
  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logsEndRef.current) logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [progressLogs]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[130] flex items-center justify-center p-4">
      <div className="bg-slate-50 dark:bg-slate-900 border-4 border-[#F9F9F9] dark:border-slate-700 rounded-[2rem] shadow-2xl w-full max-w-xl overflow-hidden flex flex-col max-h-[85vh]">
        <div className="p-6 border-b-2 border-slate-200 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-slate-800">
          <div className="flex items-center gap-4">
             {loading ? (
               <div className="w-12 h-12 rounded-full bg-[#F9F9F9] dark:bg-indigo-900/40 flex items-center justify-center shadow-inner">
                  <Loader2 className="w-6 h-6 text-[#5AA9E6] animate-spin" />
               </div>
             ) : (
               <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center shadow-inner">
                  <CheckCircle2 className="w-6 h-6 text-emerald-500" />
               </div>
             )}
             <div>
               <h2 className="font-black text-xl text-slate-800 dark:text-white">
                 {loading ? "Robot is shopping..." : automationSuccess ? "Shopping Complete!" : "Automation Stopped"}
               </h2>
               <p className="text-xs font-bold text-slate-500">
                 {loading ? "You can cancel or close the browser at any time." : "Your grocery list has been fully processed."}
               </p>
             </div>
          </div>
          <button 
            onClick={loading ? onCancel : onClose} 
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-700 rounded-full p-2 hover:bg-rose-50 hover:text-rose-600 transition-colors"
            title={loading ? "Cancel Robot" : "Close"}
          >
            <X className="w-5 h-5 font-bold" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-5 bg-slate-50 dark:bg-slate-900/50 flex flex-col gap-3">
          {progressLogs.map((log, i) => {
            const isDaemonError = log.includes('daemon is not running');
            const isError = log.includes("ERROR:");
            const isSuccess = log.includes("SUCCESS:") || log.includes("VERIFIED:");
            const isNotice = log.includes("NOTICE:") || log.includes("WARNING:") || log.includes("🛑");
            
            // Clean up the string to remove prefixes and timestamps
            let cleanText = log.replace(/^\[.*?\]\s*/, '').replace(/^(PROGRESS|ERROR|SUCCESS|NOTICE):\s*/, '').trim();
            
            // Filter out boring/noisy logs to keep the UI clean
            if (cleanText.includes("Pre-add basket") || cleanText.includes("Proceeding to click")) return null;

            // Special render: daemon not running
            if (isDaemonError) {
              return (
                <div key={i} className="flex flex-col gap-3 p-4 rounded-xl border-2 border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-900/20 animate-in fade-in slide-in-from-bottom-2">
                  <div className="flex items-center gap-2 text-rose-700 dark:text-rose-300 font-black text-sm">
                    <X className="w-4 h-4 shrink-0" /> Supabase daemon is not running
                  </div>
                  <p className="text-xs text-rose-700 dark:text-rose-300 font-semibold">Open a new Terminal tab in the Family Kitchen folder and run:</p>
                  <code className="block bg-slate-900 text-emerald-400 text-xs font-mono px-4 py-3 rounded-lg select-all">
                    node scripts/supabase_daemon.js
                  </code>
                  <p className="text-xs text-rose-600 dark:text-rose-400">Then click <strong>Shop Now</strong> again once the daemon is running.</p>
                </div>
              );
            }

            let Icon = Info;
            let colorTheme = "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200";
            let iconTheme = "bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400";
            
            if (isError) {
               Icon = X;
               colorTheme = "bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300";
               iconTheme = "bg-rose-200 dark:bg-rose-800 text-rose-600 dark:text-rose-200";
            } else if (isSuccess) {
               Icon = CheckCircle2;
               colorTheme = "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 font-medium";
               iconTheme = "bg-emerald-200 dark:bg-emerald-800 text-emerald-600 dark:text-emerald-200";
            } else if (isNotice) {
               Icon = AlertCircle;
               colorTheme = "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300";
               iconTheme = "bg-amber-200 dark:bg-amber-800 text-amber-600 dark:text-amber-200";
            } else if (cleanText.includes("Searching") || cleanText.includes("Navigating")) {
               Icon = Search;
               colorTheme = "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300";
               iconTheme = "bg-blue-200 dark:bg-blue-800 text-blue-600 dark:text-blue-200";
            } else if (cleanText.includes("log in") || cleanText.includes("Credentials") || cleanText.includes("logged in")) {
               Icon = Lock;
               colorTheme = "bg-[#F9F9F9] dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800 text-indigo-800 dark:text-indigo-300";
               iconTheme = "bg-indigo-200 dark:bg-indigo-800 text-slate-800 dark:text-indigo-200";
            } else {
               Icon = Loader2;
               iconTheme = "bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400";
               // Only spin the last non-specific item if still loading
               if (i === progressLogs.length - 1 && loading) {
                  iconTheme += " animate-spin";
               }
            }

            return (
              <div key={i} className={`flex items-start gap-3 p-3 rounded-xl border-2 shadow-sm animate-in fade-in slide-in-from-bottom-2 ${colorTheme}`}>
                <div className={`p-1.5 rounded-lg shrink-0 ${iconTheme}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="text-sm font-semibold leading-tight pt-1">
                  {cleanText}
                </div>
              </div>
            );
          })}
          <div ref={logsEndRef} />
        </div>

        {loading && (
          <div className="p-4 bg-slate-100 dark:bg-slate-800/90 border-t-2 border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3">
            <p className="text-slate-800 dark:text-[#5AA9E6] font-bold text-xs uppercase tracking-wider animate-pulse flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Supervising browser...
            </p>
            <button
              onClick={onCancel}
              className="bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 dark:text-rose-300 font-black text-xs px-4 py-2 rounded-xl border border-rose-200 dark:border-rose-800 transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
            >
              <X className="w-3.5 h-3.5 stroke-[2.5]" /> Stop & Cancel Robot
            </button>
          </div>
        )}
        
        {automationSuccess && (
          <div className="p-6 bg-white dark:bg-slate-800 border-t-2 border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center gap-3">
            <a 
              href="https://www.tesco.com/groceries/en-GB/trolley" 
              target="_blank" 
              rel="noreferrer"
              className="w-full justify-center bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-black py-4 px-8 rounded-xl shadow-lg hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2"
            >
              <ShoppingBag className="w-6 h-6" /> Review Trolley & Checkout
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
