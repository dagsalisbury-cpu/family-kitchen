const fs = require('fs');
const path = require('path');
const p = path.join(__dirname, 'src', 'components', 'grocery', 'GroceryDrawer.tsx');
let c = fs.readFileSync(p, 'utf8');

c = c.replace(
  /<div className=\{\`w-\[300px\] flex-shrink-0 border-l-4 border-white\/50.*?z-10">/s,
  '<div className={`w-[300px] flex-shrink-0 border-l-4 border-white/50 dark:border-slate-800/50 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl flex flex-col h-full overflow-hidden shadow-[-5px_0_15px_-3px_rgba(0,0,0,0.05)] z-10 ${className || ""}`.replace("w-[300px]", className?.includes("w-") ? "" : "w-[300px]")}>'
);

fs.writeFileSync(p, c);
console.log('Fixed GroceryDrawer.tsx');
