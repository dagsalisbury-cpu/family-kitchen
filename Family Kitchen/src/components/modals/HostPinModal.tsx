"use client";

import { useState } from "react";
import { Lock, X } from "lucide-react";
import { verifyPin } from "@/app/actions/auth";

export default function HostPinModal({
  isOpen,
  onClose,
  onSuccess,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [hostPinInput, setHostPinInput] = useState("");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-md z-[120] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl w-full max-w-sm overflow-hidden flex flex-col border-4 border-slate-100 dark:border-slate-700">
        <div className="p-6 text-center relative border-b-2 border-slate-50 dark:border-slate-800 bg-slate-50 dark:bg-slate-800">
          <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-700 mx-auto flex items-center justify-center mb-3 text-slate-600 dark:text-slate-300">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="font-black text-xl text-slate-800 dark:text-white">Host Access</h2>
          <p className="text-xs font-semibold text-slate-500 mt-1">Enter PIN to unlock checkout actions.</p>
          <button 
            onClick={onClose} 
            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 flex flex-col gap-4">
          <div>
            <input 
              type="password" 
              value={hostPinInput} 
              onChange={e => setHostPinInput(e.target.value)} 
              className="w-full border-2 border-slate-200 dark:border-slate-700 focus:border-slate-500 rounded-xl p-3 bg-slate-50 dark:bg-slate-800 font-black text-center tracking-[0.5em] text-slate-800 dark:text-slate-100 outline-none text-xl" 
              placeholder="••••" 
              maxLength={10}
            />
          </div>
          <div className="flex gap-2 pt-2">
            <button 
              onClick={async () => {
                const res = await verifyPin(hostPinInput);
                if (res.success) {
                  onSuccess();
                  setHostPinInput("");
                } else {
                  alert("Invalid PIN");
                }
              }} 
              disabled={!hostPinInput} 
              className="flex-1 bg-slate-800 text-white font-black py-3 rounded-xl shadow-md hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 text-xs"
            >
              Unlock Admin
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
