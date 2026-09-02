"use client";

import { ShoppingBag, Loader2, ChefHat, Trash2, Play } from "lucide-react";

export default function GroceryDrawer({
  isCalculating,
  isCalculated,
  generatedList,
  generateList,
  removeGeneratedItem,
  startCheckoutFlow,
  loading,
  isHost,
  className,
}: {
  isCalculating: boolean;
  isCalculated: boolean;
  generatedList: any[];
  generateList: () => void;
  removeGeneratedItem: (id: string) => void;
  startCheckoutFlow: () => void;
  loading: boolean;
  isHost?: boolean;
  className?: string;
}) {
  return (
    <div className={`w-[300px] flex-shrink-0 border-l-4 border-white/50 dark:border-slate-800/50 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl flex flex-col h-full overflow-hidden shadow-[-5px_0_15px_-3px_rgba(0,0,0,0.05)] z-10 ${className || ""}`.replace("w-[300px]", className?.includes("w-") ? "" : "w-[300px]")}>
      <div className="p-4 border-b border-white/40 dark:border-slate-800 bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30">
        <h2 className="text-lg font-black text-emerald-900 dark:text-emerald-100 flex items-center gap-2">
          <ShoppingBag className="w-5 h-5 text-emerald-500" /> Shopping List
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {isCalculating ? (
          <div className="h-full flex flex-col justify-center items-center text-center text-slate-500 relative overflow-hidden bg-gradient-to-br from-indigo-50/10 via-white/50 to-purple-50/10 dark:from-indigo-950/20 dark:via-slate-900/50 dark:to-purple-950/20 rounded-[1.5rem] border border-indigo-100/30 dark:border-slate-800 p-6 shadow-inner">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-indigo-500/15 to-transparent animate-wave-sweep pointer-events-none" style={{ backgroundSize: '200% 100%' }} />
            
            <div className="relative mb-4 flex items-center justify-center">
              <ChefHat className="w-16 h-16 text-indigo-500 animate-bounce" />
            </div>
            <p className="text-indigo-600 dark:text-indigo-400 font-black text-lg animate-pulse">Gathering ingredients...</p>
            <p className="text-xs text-slate-500 mt-1 font-medium">Consolidating your weekly grocery packs...</p>
          </div>
        ) : !isCalculated || generatedList.length === 0 ? (
          <div className="h-full flex flex-col justify-center items-center text-center text-slate-500">
            <ShoppingBag className="w-12 h-12 text-slate-300 dark:text-slate-700 mb-3 animate-bounce" />
            <p className="font-bold text-sm text-slate-400">List Not Gathered</p>
            <p className="text-xs px-2 mt-1 font-medium mb-4">Add your meals to the calendar, then gather your ingredients.</p>
            <button 
              onClick={generateList}
              className="bg-indigo-600 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-md hover:bg-indigo-700 active:scale-95 transition-all"
            >
              Gather Ingredients
            </button>
          </div>
        ) : (
          <div className="flex flex-col h-full">
            <div className="flex justify-between items-center mb-3">
               <span className="text-xs font-bold text-slate-500">{generatedList.length} Items</span>
               <button onClick={generateList} className="text-[10px] uppercase tracking-wider font-bold text-indigo-500 hover:text-indigo-700">Regather</button>
            </div>
            <ul className="space-y-2 flex-1 pb-4">
              {generatedList.map((item) => (
                <li key={item.id} className="bg-white/90 dark:bg-slate-800 p-2.5 rounded-xl text-xs border-2 border-emerald-50/50 dark:border-slate-700 flex justify-between shadow-sm items-center hover:border-emerald-200 transition-colors group">
                  <div className="flex flex-col flex-1 pr-2 truncate">
                    <span className="font-bold text-slate-700 dark:text-slate-200 truncate">{item.name}</span>
                    {item.isConsolidated && item.rawUnit !== 'pack(s)' && (
                      <span className="text-[10px] text-slate-500 font-medium">Covers {item.rawQuantity} {item.rawUnit} total</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-emerald-600 dark:text-emerald-400 font-black bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded-md">{item.quantity} {item.unit}</span>
                    <button 
                      onClick={() => removeGeneratedItem(item.id)} 
                      className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-emerald-500 transition-opacity p-1"
                      title="Remove from list (e.g. already in pantry)"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {generatedList.length > 0 && isHost && (
        <div className="p-4 border-t border-white/40 dark:border-slate-800 bg-white/50 dark:bg-slate-900">
          <button 
            onClick={startCheckoutFlow}
            disabled={loading}
            className="w-full flex justify-center items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-black py-3 rounded-xl hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-emerald-500/30 disabled:opacity-50 disabled:scale-100"
          >
            <Play className="w-5 h-5 fill-current" />
            Shop Now ✨
          </button>
        </div>
      )}
    </div>
  );
}
