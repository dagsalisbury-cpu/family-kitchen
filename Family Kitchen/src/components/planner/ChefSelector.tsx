"use client";

import { useState } from "react";
import { Users, X, Plus } from "lucide-react";
import { useStore } from "@/lib/store";
import { getChefAnimal } from "@/lib/utils";
import { DraggableItem } from "@/components/ui/DraggableItem";

export default function ChefSelector() {
  const { data, addChef, deleteChef } = useStore();
  const [newChefName, setNewChefName] = useState("");

  const handleAddChef = () => {
    if (!newChefName.trim()) return;
    addChef(newChefName);
    setNewChefName("");
  };

  return (
    <div className="p-4 border-b border-white/40 dark:border-slate-800 bg-[#5AA9E6]/20 dark:bg-[#5AA9E6]/20">
      <h2 className="text-sm font-black text-[#5AA9E6] dark:text-[#7FC8F8] flex items-center gap-2 mb-3 uppercase tracking-wider">
        <Users className="w-4 h-4 text-[#5AA9E6]" /> Chefs <span className="text-[10px] lowercase font-normal text-slate-500">(Dinners)</span>
      </h2>
      <div className="flex flex-wrap gap-2 mb-3">
        {data?.chefs?.map(chef => (
          <DraggableItem
            key={chef}
            id={`chef-${chef}`}
            type="chef"
            data={{ id: chef, name: chef }}
            className="bg-white dark:bg-slate-800 px-2 py-1.5 rounded-full text-xs font-bold text-slate-700 dark:text-slate-200 shadow-sm border-2 border-[#7FC8F8]/50 dark:border-slate-700 cursor-grab active:cursor-grabbing hover:border-[#5AA9E6] hover:shadow-md transition-all flex items-center gap-1.5 group"
          >
            <span className="text-sm shrink-0">{getChefAnimal(chef)}</span>
            <span className="pl-0.5">{chef}</span>
            <button 
              onPointerDown={(e) => e.stopPropagation()} 
              onClick={() => deleteChef(chef)} 
              className="opacity-0 group-hover:opacity-100 text-rose-300 hover:text-rose-500 hover:bg-rose-50 rounded-full p-0.5 transition-all ml-0.5"
              title={`Remove ${chef}`}
            >
              <X className="w-3 h-3" />
            </button>
          </DraggableItem>
        ))}
      </div>
      <div className="flex gap-2">
        <input 
          type="text" 
          placeholder="New chef..." 
          value={newChefName} 
          onChange={e => setNewChefName(e.target.value)} 
          className="flex-1 bg-white dark:bg-slate-800 text-xs font-bold rounded-xl px-3 py-1.5 border border-[#7FC8F8]/50 dark:border-slate-600 focus:outline-none focus:border-[#5AA9E6]"
          onKeyDown={(e) => e.key === 'Enter' && handleAddChef()}
        />
        <button 
          onClick={handleAddChef}
          disabled={!newChefName.trim()}
          className="bg-[#5AA9E6] hover:bg-[#5AA9E6]/80 text-white p-1.5 rounded-xl disabled:opacity-50 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
