"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChefHat, Lock, X, Menu } from "lucide-react";
import { verifyPin, checkIsHost, logout } from "@/app/actions/auth";

export default function Navigation() {
  const pathname = usePathname();
  const [isHost, setIsHost] = useState(false);
  const [isHostPinModalOpen, setIsHostPinModalOpen] = useState(false);
  const [hostPinInput, setHostPinInput] = useState("");

  useEffect(() => {
    checkIsHost().then(setIsHost);
    
    // Poll for isHost changes just in case another component updates it
    const interval = setInterval(() => {
      checkIsHost().then(setIsHost);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <header className="flex-shrink-0 h-16 bg-white/90 dark:bg-slate-900/70 backdrop-blur-xl border-b-4 border-slate-200/50 dark:border-slate-800 flex items-center px-6 justify-between z-40 shadow-sm relative">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="bg-gradient-to-br from-[#7FC8F8] to-[#292F36] text-white p-2.5 rounded-2xl shadow-lg shadow-[#7FC8F8]/25 transform -rotate-3 group-hover:rotate-0 transition-transform flex items-center justify-center">
              <ChefHat className="w-6 h-6 stroke-[2.2]" />
            </div>
            <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#7FC8F8] to-[#292F36] tracking-tight">
              Family Kitchen
            </h1>
          </Link>
          
          <nav className="hidden lg:flex items-center gap-2">
            <Link 
              href="/" 
              className={`px-4 py-2 rounded-xl font-bold text-sm transition-colors ${pathname === '/' ? 'bg-[#F9F9F9] text-slate-800 dark:bg-indigo-900/50 dark:text-indigo-300' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
            >
              Planner
            </Link>
            <Link 
              href="/recipes" 
              className={`px-4 py-2 rounded-xl font-bold text-sm transition-colors ${pathname.startsWith('/recipes') ? 'bg-[#F9F9F9] text-slate-800 dark:bg-indigo-900/50 dark:text-indigo-300' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
            >
              Recipes
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden lg:block">
            {isHost ? (
              <button 
                onClick={() => {
                  logout().then(() => setIsHost(false));
                }}
                className="flex items-center gap-2 bg-[#F9F9F9] text-slate-800 px-3 py-1.5 rounded-xl font-bold text-xs"
              >
                <Lock className="w-3.5 h-3.5" /> Host Mode
              </button>
            ) : (
              <button 
                onClick={() => setIsHostPinModalOpen(true)}
                className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-600 px-3 py-1.5 rounded-xl font-bold text-xs transition-colors"
              >
                <Lock className="w-3.5 h-3.5" /> Unlock Admin
              </button>
            )}
          </div>
          
          {/* Mobile Hamburger Menu */}
          <div className="lg:hidden relative">
            <button 
              onClick={() => {
                const el = document.getElementById('mobile-dropdown');
                if (el) el.classList.toggle('hidden');
              }}
              className="p-2 bg-slate-100 rounded-xl text-slate-600"
            >
              <Menu className="w-5 h-5" />
            </button>
            
            <div id="mobile-dropdown" className="hidden absolute top-full right-0 mt-2 w-48 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border-2 border-slate-100 dark:border-slate-800 flex flex-col overflow-hidden z-50">
              <button 
                onClick={() => {
                  window.dispatchEvent(new CustomEvent('nav-mobile-tab', { detail: 'planner' }));
                  document.getElementById('mobile-dropdown')?.classList.add('hidden');
                }}
                className="px-4 py-3 text-left font-bold text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 border-b border-slate-100 dark:border-slate-800"
              >
                Planner
              </button>
              <button 
                onClick={() => {
                  window.dispatchEvent(new CustomEvent('nav-mobile-tab', { detail: 'library' }));
                  document.getElementById('mobile-dropdown')?.classList.add('hidden');
                }}
                className="px-4 py-3 text-left font-bold text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 border-b border-slate-100 dark:border-slate-800"
              >
                Library / Recipes
              </button>
              <button 
                onClick={() => {
                  window.dispatchEvent(new CustomEvent('nav-mobile-tab', { detail: 'list' }));
                  document.getElementById('mobile-dropdown')?.classList.add('hidden');
                }}
                className="px-4 py-3 text-left font-bold text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 border-b border-slate-100 dark:border-slate-800"
              >
                Shopping List
              </button>
              <button 
                onClick={() => {
                  document.getElementById('mobile-dropdown')?.classList.add('hidden');
                  if (isHost) {
                    logout().then(() => setIsHost(false));
                  } else {
                    setIsHostPinModalOpen(true);
                  }
                }}
                className="px-4 py-3 text-left font-bold text-sm text-[#5AA9E6] hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                {isHost ? "Logout Host" : "Unlock Admin"}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* HOST PIN MODAL */}
      {isHostPinModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-md z-[120] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl w-full max-w-sm overflow-hidden flex flex-col border-4 border-slate-100 dark:border-slate-700">
            <div className="p-6 text-center relative border-b-2 border-slate-50 dark:border-slate-800 bg-slate-50 dark:bg-slate-800">
              <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-700 mx-auto flex items-center justify-center mb-3 text-slate-600 dark:text-slate-300">
                <Lock className="w-6 h-6" />
              </div>
              <h2 className="font-black text-xl text-slate-800 dark:text-white">Host Access</h2>
              <p className="text-xs font-semibold text-slate-500 mt-1">Enter PIN to unlock checkout actions.</p>
              <button 
                onClick={() => setIsHostPinModalOpen(false)} 
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
                      setIsHost(true);
                      setIsHostPinModalOpen(false);
                      setHostPinInput("");
                    } else {
                      alert("Invalid PIN");
                    }
                  }} 
                  disabled={!hostPinInput} 
                  className="flex-1 bg-slate-800 text-white font-black py-3 rounded-xl shadow-md hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 text-xs"
                >
                  Unlock
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
