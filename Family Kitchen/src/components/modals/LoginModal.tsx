"use client";

import { useState } from "react";
import { Lock, X } from "lucide-react";

export default function LoginModal({
  isOpen,
  onClose,
  onStart,
}: {
  isOpen: boolean;
  onClose: () => void;
  onStart: (email: string, pass: string) => void;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md z-[120] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl w-full max-w-sm overflow-hidden flex flex-col border-4 border-[#F9F9F9] dark:border-slate-700 animate-in fade-in zoom-in-95 duration-200">
        <div className="p-6 text-center border-b-2 border-slate-100 dark:border-slate-800 bg-gradient-to-b from-[#F9F9F9] to-white dark:from-indigo-950/30 dark:to-slate-900 relative">
          <div className="mx-auto bg-gradient-to-tr from-[#5AA9E6] to-[#7FC8F8] text-white w-12 h-12 rounded-2xl flex items-center justify-center mb-3 shadow-md">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="font-black text-xl text-slate-800 dark:text-white">Secure Login</h2>
          <p className="text-xs font-semibold text-slate-500 mt-1">Credentials are used only for this session and never saved.</p>
          <button 
            onClick={onClose} 
            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 flex flex-col gap-4">
          <div>
            <label className="block text-[10px] font-black text-slate-700 dark:text-slate-300 mb-1 uppercase tracking-wide">Email</label>
            <input 
              type="email" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              className="w-full border-2 border-slate-200 dark:border-slate-700 focus:border-[#5AA9E6] rounded-xl p-2.5 bg-slate-50 dark:bg-slate-800 font-semibold text-slate-800 dark:text-slate-100 outline-none text-xs" 
              placeholder="your@email.com" 
            />
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-700 dark:text-slate-300 mb-1 uppercase tracking-wide">Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              className="w-full border-2 border-slate-200 dark:border-slate-700 focus:border-[#5AA9E6] rounded-xl p-2.5 bg-slate-50 dark:bg-slate-800 font-semibold text-slate-800 dark:text-slate-100 outline-none text-xs" 
              placeholder="••••••••" 
            />
          </div>
          <div className="flex gap-2 pt-2">
            <button onClick={onClose} className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold py-3 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-xs">
              Cancel
            </button>
            <button 
              onClick={() => onStart(email, password)} 
              disabled={!email || !password} 
              className="flex-1 bg-gradient-to-r from-[#5AA9E6] to-[#7FC8F8] text-white font-black py-3 rounded-xl shadow-md hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 text-xs"
            >
              Start Robot 🤖
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
