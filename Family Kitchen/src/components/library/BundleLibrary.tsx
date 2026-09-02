"use client";

import { PackageOpen, GripVertical, Plus } from "lucide-react";
import { useStore } from "@/lib/store";
import { DraggableItem } from "@/components/ui/DraggableItem";

export default function BundleLibrary({
  openNewModal,
  openEditModal,
}: {
  openNewModal: (type: 'recipe' | 'bundle') => void;
  openEditModal: (id: string, type: 'recipe' | 'bundle') => void;
}) {
  const { data } = useStore();

  return (
    <>
      <div className="p-4 border-b border-white/40 dark:border-slate-800 flex justify-between items-center bg-[#FFE45E]/30 dark:bg-[#FFE45E]/20">
        <h2 className="text-sm font-black text-slate-800 dark:text-slate-100 flex items-center gap-2 uppercase tracking-wider">
          <PackageOpen className="w-4 h-4 text-[#5AA9E6]" /> Item Bundles
        </h2>
        <button onClick={() => openNewModal('bundle')} className="p-1 text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-[#FFE45E]/50 rounded-lg transition-colors">
          <Plus className="w-4 h-4 font-bold" />
        </button>
      </div>
      <div className="p-4 space-y-2 max-h-[40%] overflow-y-auto bg-transparent">
        {data?.bundles?.map((bundle) => (
          <DraggableItem
            key={bundle.id}
            id={`bundle-${bundle.id}`}
            type="bundle"
            data={{ id: bundle.id, name: bundle.name }}
            className="bg-white/90 dark:bg-slate-800 rounded-xl p-2.5 border-2 border-transparent hover:border-[#FFE45E] shadow-sm cursor-grab active:cursor-grabbing group flex items-center gap-2"
          >
            <div className="p-1 bg-[#FFE45E]/10 dark:bg-[#FFE45E]/20 rounded-lg group-hover:bg-slate-100 transition-colors">
              <GripVertical className="w-3 h-3 text-slate-400" />
            </div>
            <div className="flex-1 truncate cursor-pointer" onClick={() => openEditModal(bundle.id, 'bundle')}>
              <h3 className="font-bold text-slate-800 dark:text-slate-100 text-xs truncate hover:text-slate-700 dark:text-slate-200 transition-colors">{bundle.name}</h3>
            </div>
          </DraggableItem>
        ))}
      </div>
    </>
  );
}
