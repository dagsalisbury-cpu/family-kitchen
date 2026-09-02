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
      <div className="p-4 border-b border-white/40 dark:border-slate-800 flex justify-between items-center bg-amber-50/50 dark:bg-amber-900/10">
        <h2 className="text-sm font-black text-amber-800 dark:text-amber-200 flex items-center gap-2 uppercase tracking-wider">
          <PackageOpen className="w-4 h-4 text-amber-500" /> Item Bundles
        </h2>
        <button onClick={() => openNewModal('bundle')} className="p-1 text-amber-600 bg-amber-100 hover:bg-amber-200 rounded-lg transition-colors">
          <Plus className="w-4 h-4 font-bold" />
        </button>
      </div>
      <div className="p-4 space-y-2 max-h-[40%] overflow-y-auto bg-amber-50/20">
        {data?.bundles?.map((bundle) => (
          <DraggableItem
            key={bundle.id}
            id={`bundle-${bundle.id}`}
            type="bundle"
            data={{ id: bundle.id }}
            className="bg-white/90 dark:bg-slate-800 rounded-xl p-2.5 border-2 border-transparent hover:border-amber-300 shadow-sm cursor-grab active:cursor-grabbing group flex items-center gap-2"
          >
            <div className="p-1 bg-amber-50 dark:bg-amber-900/50 rounded-lg group-hover:bg-amber-100 transition-colors">
              <GripVertical className="w-3 h-3 text-amber-400" />
            </div>
            <div className="flex-1 truncate cursor-pointer" onClick={() => openEditModal(bundle.id, 'bundle')}>
              <h3 className="font-bold text-slate-800 dark:text-slate-100 text-xs truncate hover:text-amber-600 transition-colors">{bundle.name}</h3>
            </div>
          </DraggableItem>
        ))}
      </div>
    </>
  );
}
