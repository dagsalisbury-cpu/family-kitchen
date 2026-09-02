const fs = require('fs');
const path = require('path');

// 1. Make GroceryDrawer accept className
const groceryPath = path.join(__dirname, 'src', 'components', 'grocery', 'GroceryDrawer.tsx');
let groceryContent = fs.readFileSync(groceryPath, 'utf8');
groceryContent = groceryContent.replace(
  'isHost?: boolean;\n}) {',
  'isHost?: boolean;\n  className?: string;\n}) {'
);
groceryContent = groceryContent.replace(
  '<div className="w-[300px] flex-shrink-0 border-l-4',
  '<div className={`w-[300px] flex-shrink-0 border-l-4 border-white/50 dark:border-slate-800/50 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl flex flex-col h-full overflow-hidden shadow-[-5px_0_15px_-3px_rgba(0,0,0,0.05)] z-10 ${className || ""}`.replace("w-[300px]", className?.includes("w-") ? "" : "w-[300px]")}'
);
fs.writeFileSync(groceryPath, groceryContent);

// 2. Refactor page.tsx to add Vaul drawers for mobile
const pagePath = path.join(__dirname, 'src', 'app', 'page.tsx');
let pageContent = fs.readFileSync(pagePath, 'utf8');

if (!pageContent.includes('Drawer')) {
  pageContent = pageContent.replace(
    'import { DndContext, DragEndEvent } from "@dnd-kit/core";',
    'import { DndContext, DragEndEvent } from "@dnd-kit/core";\nimport { Drawer } from "vaul";'
  );
  
  // Mobile Nav Icons
  pageContent = pageContent.replace(
    'import { Plus, Play, Loader2, Sparkles, ChefHat, CalendarDays, ShoppingBag, X, GripVertical, Coffee, Sun, Moon, Lock, CheckCircle2, Cookie, Trash2, Edit2, Users, User, Baby, PackageOpen, AlertCircle, Search, Info } from "lucide-react";',
    'import { Plus, Play, Loader2, Sparkles, ChefHat, CalendarDays, ShoppingBag, X, GripVertical, Coffee, Sun, Moon, Lock, CheckCircle2, Cookie, Trash2, Edit2, Users, User, Baby, PackageOpen, AlertCircle, Search, Info, Menu } from "lucide-react";'
  );

  // Layout wrapper
  pageContent = pageContent.replace(
    '<div className="flex flex-1 overflow-hidden h-[calc(100vh-64px)] p-6 gap-6 w-full max-w-[1800px] mx-auto z-10">',
    '<div className="flex flex-1 overflow-hidden h-[calc(100vh-64px)] p-4 lg:p-6 pb-20 lg:pb-6 gap-4 lg:gap-6 w-full max-w-[1800px] mx-auto z-10">'
  );

  // Left sidebar hide
  pageContent = pageContent.replace(
    '<div className="w-[300px] flex-shrink-0 border-r-4 border-white/50 dark:border-slate-800/50 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md flex flex-col h-full overflow-hidden shadow-[5px_0_15px_-3px_rgba(0,0,0,0.05)] z-10">',
    '<div className="hidden lg:flex w-[300px] flex-shrink-0 border-r-4 border-white/50 dark:border-slate-800/50 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md flex-col h-full overflow-hidden shadow-[5px_0_15px_-3px_rgba(0,0,0,0.05)] z-10">'
  );

  // Right sidebar hide (GroceryDrawer instance in page.tsx)
  pageContent = pageContent.replace(
    '<GroceryDrawer \n          isCalculating',
    '<GroceryDrawer \n          className="hidden lg:flex"\n          isCalculating'
  );

  // Add Vaul Drawers & Bottom Nav before the closing </div> of the main flex container
  const mobileNav = `
        {/* MOBILE BOTTOM NAV */}
        <div className="fixed bottom-0 left-0 right-0 h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 flex items-center justify-around z-40 lg:hidden px-4">
          <Drawer.Root>
            <Drawer.Trigger asChild>
              <button className="flex flex-col items-center justify-center p-2 text-slate-500 hover:text-indigo-600 transition-colors">
                <Menu className="w-5 h-5 mb-1" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Library</span>
              </button>
            </Drawer.Trigger>
            <Drawer.Portal>
              <Drawer.Overlay className="fixed inset-0 bg-black/40 z-50" />
              <Drawer.Content className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-slate-900 dark:to-indigo-950 flex flex-col rounded-t-[2rem] h-[85vh] mt-24 fixed bottom-0 left-0 right-0 z-50 overflow-hidden shadow-2xl">
                <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-slate-300 dark:bg-slate-600 my-4" />
                <div className="flex-1 overflow-y-auto flex flex-col">
                  <ChefSelector />
                  <BundleLibrary openNewModal={openNewModal} openEditModal={openEditModal} />
                  <RecipeLibrary openNewModal={openNewModal} openEditModal={openEditModal} />
                </div>
              </Drawer.Content>
            </Drawer.Portal>
          </Drawer.Root>

          <button className="flex flex-col items-center justify-center p-2 text-indigo-600 font-bold -translate-y-4 bg-white dark:bg-slate-800 rounded-full w-14 h-14 shadow-lg border-4 border-indigo-100 dark:border-indigo-900/30">
            <CalendarDays className="w-6 h-6" />
          </button>

          <Drawer.Root>
            <Drawer.Trigger asChild>
              <button className="flex flex-col items-center justify-center p-2 text-slate-500 hover:text-emerald-600 transition-colors">
                <ShoppingBag className="w-5 h-5 mb-1" />
                <span className="text-[10px] font-bold uppercase tracking-wider">List</span>
              </button>
            </Drawer.Trigger>
            <Drawer.Portal>
              <Drawer.Overlay className="fixed inset-0 bg-black/40 z-50" />
              <Drawer.Content className="bg-white dark:bg-slate-900 flex flex-col rounded-t-[2rem] h-[85vh] mt-24 fixed bottom-0 left-0 right-0 z-50 overflow-hidden shadow-2xl">
                <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-slate-300 dark:bg-slate-600 my-4" />
                <GroceryDrawer 
                  className="w-full flex"
                  isCalculating={isCalculating}
                  isCalculated={isCalculated}
                  generatedList={generatedList}
                  generateList={generateList}
                  removeGeneratedItem={removeGeneratedItem}
                  startCheckoutFlow={startCheckoutFlow}
                  loading={loading}
                  isHost={isHost}
                />
              </Drawer.Content>
            </Drawer.Portal>
          </Drawer.Root>
        </div>
      </div>
  `;
  
  pageContent = pageContent.replace(
    '        />\n      </div>',
    '        />\n' + mobileNav
  );
  
  fs.writeFileSync(pagePath, pageContent);
  console.log("Refactored page.tsx for mobile navigation");
}
