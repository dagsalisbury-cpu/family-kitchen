const fs = require('fs');
const path = require('path');
const pagePath = path.join(__dirname, 'src', 'app', 'page.tsx');
let pageContent = fs.readFileSync(pagePath, 'utf8');

// 1. Add Vaul imports
pageContent = pageContent.replace(
  'import { DndContext, DragEndEvent } from "@dnd-kit/core";',
  'import { DndContext, DragEndEvent } from "@dnd-kit/core";\nimport { Drawer } from "vaul";'
);

// 2. Add Mobile Nav icons
pageContent = pageContent.replace(
  'import { Plus, Play, Loader2, Sparkles, ChefHat, CalendarDays, ShoppingBag, X, GripVertical, Coffee, Sun, Moon, Lock, CheckCircle2, Cookie, Trash2, Edit2, Users, User, Baby, PackageOpen, AlertCircle, Search, Info } from "lucide-react";',
  'import { Plus, Play, Loader2, Sparkles, ChefHat, CalendarDays, ShoppingBag, X, GripVertical, Coffee, Sun, Moon, Lock, CheckCircle2, Cookie, Trash2, Edit2, Users, User, Baby, PackageOpen, AlertCircle, Search, Info, Menu } from "lucide-react";'
);

// 3. Update main layout wrapper to include bottom padding on mobile
pageContent = pageContent.replace(
  /<div className="flex flex-1 overflow-hidden h-\[calc\(100vh-64px\)\] p-6 gap-6 w-full max-w-\[1800px\] mx-auto z-10">/g,
  '<div className="flex flex-1 overflow-hidden h-[calc(100vh-64px)] p-4 lg:p-6 pb-20 lg:pb-6 gap-4 lg:gap-6 w-full max-w-[1800px] mx-auto z-10">'
);

// 4. Hide Left Sidebar on mobile
pageContent = pageContent.replace(
  /<div className="w-\[300px\] flex-shrink-0 border-r-4 border-white\/50/g,
  '<div className="hidden lg:flex w-[300px] flex-shrink-0 border-r-4 border-white/50'
);

// 5. Hide Right Sidebar on mobile
// In page.tsx, it's just: <GroceryDrawer ... />
// GroceryDrawer's root div is in GroceryDrawer.tsx. Wait! In page.tsx, it's just rendering the component. 
// GroceryDrawer itself has the classes. Let's look at GroceryDrawer.tsx to confirm. 
// If GroceryDrawer is self-contained, I should wrap it or modify GroceryDrawer.tsx.
