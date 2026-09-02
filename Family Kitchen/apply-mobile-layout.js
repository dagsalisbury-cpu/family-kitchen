const fs = require('fs');
const path = require('path');

const pagePath = path.join(__dirname, 'src', 'app', 'page.tsx');
let content = fs.readFileSync(pagePath, 'utf8');

// 1. Add lucide-react imports if missing (BookOpen, Calendar, ShoppingCart)
if (!content.includes('BookOpen') && !content.includes('import { BookOpen')) {
  content = content.replace(/import \{ ([^}]+) \} from "lucide-react";/, 'import { $1, BookOpen, Calendar, ShoppingCart } from "lucide-react";');
}

// 2. Replace Left Sidebar
const leftSidebarRegex = /\{\/\* LEFT SIDEBAR \*\/\}\s*<div className="w-\[300px\] flex-shrink-0[^>]+>([\s\S]*?)<\/div>\s*\{\/\* CENTER COLUMN \*\/\}/;
content = content.replace(leftSidebarRegex, `{/* LEFT SIDEBAR */}
        {/* Mobile overlay background */}
        {isMobileLibraryOpen && (
          <div className="md:hidden fixed inset-0 bg-black/20 z-40" onClick={() => setIsMobileLibraryOpen(false)} />
        )}
        <div className={\`absolute md:relative left-0 top-0 bottom-0 z-50 md:z-10 w-[300px] flex-shrink-0 border-r-4 border-slate-200/50 dark:border-slate-800/50 bg-white/60 dark:bg-slate-900/40 backdrop-blur-md flex flex-col h-full overflow-hidden shadow-[5px_0_15px_-3px_rgba(0,0,0,0.05)] transition-transform duration-300 \${isMobileLibraryOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}\`}>
$1
        </div>

        {/* CENTER COLUMN */}`);

// 3. Replace Center Column className
// MealCalendar needs a className prop in page.tsx
content = content.replace(/<MealCalendar \n/, `<MealCalendar \n          className={\`\${mobileTab === 'planner' ? 'flex' : 'hidden'} md:flex\`} \n`);

// 4. Replace Right Sidebar className
content = content.replace(/<GroceryDrawer \n/, `<GroceryDrawer \n          className={\`\${mobileTab === 'list' ? 'flex w-full' : 'hidden'} md:flex md:w-[300px]\`} \n`);

// 5. Add Bottom Nav Bar before closing DragOverlay DndContext
const endDndContextRegex = /<\/DndContext>/;
content = content.replace(endDndContextRegex, `  {/* MOBILE BOTTOM NAV */}
      <div className="md:hidden bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex shrink-0 pb-safe">
        <button 
          onClick={() => setIsMobileLibraryOpen(true)}
          className="flex-1 py-3 flex flex-col items-center justify-center text-slate-500 hover:text-slate-800 dark:hover:text-white"
        >
          <BookOpen className="w-5 h-5 mb-1" />
          <span className="text-[10px] font-bold">Library</span>
        </button>
        <button 
          onClick={() => setMobileTab('planner')}
          className={\`flex-1 py-3 flex flex-col items-center justify-center \${mobileTab === 'planner' ? 'text-[#5AA9E6]' : 'text-slate-500'}\`}
        >
          <Calendar className="w-5 h-5 mb-1" />
          <span className="text-[10px] font-bold">Planner</span>
        </button>
        <button 
          onClick={() => setMobileTab('list')}
          className={\`flex-1 py-3 flex flex-col items-center justify-center \${mobileTab === 'list' ? 'text-[#5AA9E6]' : 'text-slate-500'}\`}
        >
          <ShoppingCart className="w-5 h-5 mb-1" />
          <span className="text-[10px] font-bold">Shop</span>
        </button>
      </div>
    </DndContext>`);

fs.writeFileSync(pagePath, content);
console.log("Mobile layout updated in page.tsx!");
