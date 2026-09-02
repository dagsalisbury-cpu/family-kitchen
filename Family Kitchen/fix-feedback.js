const fs = require('fs');
const path = require('path');

// --- 1. Fix Drag Overlay in page.tsx ---
const pagePath = path.join(__dirname, 'src', 'app', 'page.tsx');
let pageContent = fs.readFileSync(pagePath, 'utf8');

if (!pageContent.includes('DragOverlay')) {
  pageContent = pageContent.replace(
    'import { DndContext, DragEndEvent } from "@dnd-kit/core";',
    'import { DndContext, DragEndEvent, DragStartEvent, DragOverlay } from "@dnd-kit/core";'
  );

  pageContent = pageContent.replace(
    'const [isCalculated, setIsCalculated] = useState(false);',
    'const [isCalculated, setIsCalculated] = useState(false);\n  const [activeDragItem, setActiveDragItem] = useState<{ id: string, type: string, data: any } | null>(null);'
  );

  pageContent = pageContent.replace(
    'const onDragEnd = (event: DragEndEvent) => {',
    'const onDragStart = (event: DragStartEvent) => {\n    if (event.active?.data?.current) {\n      setActiveDragItem({ id: event.active.id as string, type: event.active.data.current.type, data: event.active.data.current });\n    }\n  };\n\n  const onDragEnd = (event: DragEndEvent) => {\n    setActiveDragItem(null);'
  );

  pageContent = pageContent.replace(
    '<DndContext onDragEnd={onDragEnd}>',
    '<DndContext onDragStart={onDragStart} onDragEnd={onDragEnd}>'
  );

  const overlayHtml = `
      <DragOverlay dropAnimation={{ duration: 250, easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)' }}>
        {activeDragItem ? (
          <div className="bg-white/95 dark:bg-slate-800 rounded-xl p-3 shadow-2xl border-2 border-indigo-400 opacity-90 scale-105 pointer-events-none min-w-[200px] flex items-center gap-2">
            <span className="font-bold text-sm text-slate-800 dark:text-slate-100 flex-1 truncate">
              {activeDragItem.type === 'chef' ? '👨‍🍳 ' + activeDragItem.id : 
               activeDragItem.type === 'bundle' ? '📦 Bundle' : '🍲 Recipe'}
            </span>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>`;
  
  pageContent = pageContent.replace('</DndContext>', overlayHtml);
}

// --- 2. Restore Friendly Colors ---
// page.tsx background
pageContent = pageContent.replace('from-slate-50 to-slate-100', 'from-amber-100 via-rose-100 to-fuchsia-100');
fs.writeFileSync(pagePath, pageContent);


// ChefSelector.tsx
const chefPath = path.join(__dirname, 'src', 'components', 'planner', 'ChefSelector.tsx');
let chefContent = fs.readFileSync(chefPath, 'utf8');
chefContent = chefContent.replace('bg-white/40 dark:bg-slate-900/40', 'bg-indigo-100/60 dark:bg-indigo-900/40');
fs.writeFileSync(chefPath, chefContent);

// BundleLibrary.tsx
const bundlePath = path.join(__dirname, 'src', 'components', 'library', 'BundleLibrary.tsx');
let bundleContent = fs.readFileSync(bundlePath, 'utf8');
bundleContent = bundleContent.replace('bg-white/40 dark:bg-slate-900/40', 'bg-amber-100/60 dark:bg-amber-900/40');
bundleContent = bundleContent.replace('bg-slate-100 dark:bg-slate-800', 'bg-amber-50 dark:bg-amber-900/60');
bundleContent = bundleContent.replace(/text-slate-600/g, 'text-amber-700');
fs.writeFileSync(bundlePath, bundleContent);

// RecipeLibrary.tsx
const recipePath = path.join(__dirname, 'src', 'components', 'library', 'RecipeLibrary.tsx');
let recipeContent = fs.readFileSync(recipePath, 'utf8');
recipeContent = recipeContent.replace('bg-white/30 dark:bg-slate-800/30', 'bg-rose-100/60 dark:bg-rose-900/40');
recipeContent = recipeContent.replace('text-slate-800 dark:text-slate-100', 'text-rose-900 dark:text-rose-100');
fs.writeFileSync(recipePath, recipeContent);

// GroceryDrawer.tsx
const groceryPath = path.join(__dirname, 'src', 'components', 'grocery', 'GroceryDrawer.tsx');
let groceryContent = fs.readFileSync(groceryPath, 'utf8');
groceryContent = groceryContent.replace('bg-white/40 dark:bg-slate-900/40', 'bg-emerald-100/80 dark:bg-emerald-900/40');
groceryContent = groceryContent.replace('text-slate-800 dark:text-slate-100', 'text-emerald-900 dark:text-emerald-100');
fs.writeFileSync(groceryPath, groceryContent);

// MealCalendar.tsx
const calendarPath = path.join(__dirname, 'src', 'components', 'planner', 'MealCalendar.tsx');
let calendarContent = fs.readFileSync(calendarPath, 'utf8');
calendarContent = calendarContent.replace('bg-slate-50 dark:bg-slate-900', 'bg-gradient-to-b from-indigo-50 to-white dark:from-indigo-950/50 dark:to-slate-900');
fs.writeFileSync(calendarPath, calendarContent);

console.log("Fixed Z-index and restored friendly colors!");
