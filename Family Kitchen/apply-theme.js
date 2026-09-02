const fs = require('fs');
const path = require('path');

const applyTheme = (filePath, replacements) => {
  let content = fs.readFileSync(filePath, 'utf8');
  for (const [oldClass, newClass] of replacements) {
    content = content.replace(new RegExp(oldClass, 'g'), newClass);
  }
  fs.writeFileSync(filePath, content);
};

// 1. page.tsx background
const pagePath = path.join(__dirname, 'src', 'app', 'page.tsx');
applyTheme(pagePath, [
  ['from-cyan-100 via-purple-100 to-pink-100', 'from-slate-50 to-slate-100'],
  ['dark:from-slate-900 dark:via-purple-950 dark:to-slate-900', 'dark:from-slate-950 dark:to-slate-900'],
  ['bg-white/70', 'bg-white/90'],
  ['from-pink-500 via-rose-500 to-purple-600', 'from-violet-500 to-indigo-600'],
  ['shadow-pink-500/25', 'shadow-violet-500/25'],
  ['from-pink-600 via-purple-600 to-indigo-600', 'from-violet-700 to-indigo-700'],
  ['border-white/50', 'border-slate-200/50'],
  ['bg-white/40', 'bg-white/60'],
]);

// 2. ChefSelector.tsx
const chefPath = path.join(__dirname, 'src', 'components', 'planner', 'ChefSelector.tsx');
applyTheme(chefPath, [
  ['bg-indigo-50/50 dark:bg-indigo-900/20', 'bg-white/40 dark:bg-slate-900/40'],
  ['text-indigo-900 dark:text-indigo-100', 'text-slate-800 dark:text-slate-100'],
  ['text-indigo-500', 'text-violet-500'],
  ['text-indigo-600', 'text-slate-500'],
  ['border-indigo-100', 'border-slate-200'],
  ['hover:border-indigo-400', 'hover:border-violet-400'],
  ['bg-indigo-500 hover:bg-indigo-600', 'bg-violet-600 hover:bg-violet-700'],
  ['border-indigo-200', 'border-slate-200'],
  ['focus:border-indigo-500', 'focus:border-violet-500'],
]);

// 3. BundleLibrary.tsx
const bundlePath = path.join(__dirname, 'src', 'components', 'library', 'BundleLibrary.tsx');
applyTheme(bundlePath, [
  ['bg-amber-50/50 dark:bg-amber-900/10', 'bg-white/40 dark:bg-slate-900/40'],
  ['text-amber-800 dark:text-amber-200', 'text-slate-800 dark:text-slate-100'],
  ['text-amber-500', 'text-violet-500'],
  ['text-amber-600', 'text-slate-600'],
  ['bg-amber-100', 'bg-slate-100'],
  ['hover:bg-amber-200', 'hover:bg-slate-200'],
  ['bg-amber-50/20', 'bg-transparent'],
  ['hover:border-amber-300', 'hover:border-violet-300'],
  ['bg-amber-50 dark:bg-amber-900/50', 'bg-slate-100 dark:bg-slate-800'],
  ['group-hover:bg-amber-100', 'group-hover:bg-violet-50'],
  ['text-amber-400', 'text-slate-400'],
  ['hover:text-amber-600', 'hover:text-violet-600'],
]);

// 4. RecipeLibrary.tsx
const recipePath = path.join(__dirname, 'src', 'components', 'library', 'RecipeLibrary.tsx');
applyTheme(recipePath, [
  ['text-indigo-900 dark:text-indigo-100', 'text-slate-800 dark:text-slate-100'],
  ['text-indigo-500', 'text-violet-500'],
  ['from-indigo-400 to-indigo-600', 'from-violet-500 to-violet-600'],
  ['hover:border-indigo-300', 'hover:border-violet-300'],
  ['group-hover:bg-indigo-100', 'group-hover:bg-violet-50'],
  ['group-hover:text-indigo-500', 'group-hover:text-violet-500'],
  ['hover:text-indigo-600', 'hover:text-violet-600'],
  ['hover:bg-indigo-50', 'hover:bg-violet-50'],
]);
// Remove the crazy corner gradients in RecipeLibrary
let recipeContent = fs.readFileSync(recipePath, 'utf8');
recipeContent = recipeContent.replace(/<div className=\{\`absolute top-0 right-0 w-12 h-12 rounded-bl-full opacity-10 bg-gradient-to-br \$\{.*?\`\}><\/div>/g, '');
fs.writeFileSync(recipePath, recipeContent);

// 5. GroceryDrawer.tsx
const groceryPath = path.join(__dirname, 'src', 'components', 'grocery', 'GroceryDrawer.tsx');
applyTheme(groceryPath, [
  ['from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30', 'bg-white/40 dark:bg-slate-900/40'],
  ['text-emerald-900 dark:text-emerald-100', 'text-slate-800 dark:text-slate-100'],
  ['text-emerald-500', 'text-violet-500'],
  ['text-emerald-600', 'text-slate-600'],
  ['from-emerald-500 to-teal-500', 'from-violet-500 to-indigo-600'],
  ['shadow-emerald-200/50', 'shadow-violet-200/50'],
  ['shadow-emerald-900/50', 'shadow-violet-900/50'],
  ['bg-emerald-50 dark:bg-emerald-900/30', 'bg-slate-50 dark:bg-slate-800/50'],
  ['bg-emerald-500 hover:bg-emerald-600', 'bg-violet-600 hover:bg-violet-700'],
]);

// 6. MealCalendar.tsx
const calendarPath = path.join(__dirname, 'src', 'components', 'planner', 'MealCalendar.tsx');
applyTheme(calendarPath, [
  ['bg-indigo-50 dark:bg-indigo-900/20', 'bg-slate-50 dark:bg-slate-800/40'],
  ['text-indigo-600', 'text-slate-600'],
  ['text-indigo-700', 'text-slate-700'],
  ['bg-indigo-100/50', 'bg-slate-100/50'],
  ['border-indigo-200', 'border-slate-200'],
  ['text-indigo-900 dark:text-indigo-300', 'text-slate-800 dark:text-slate-200'],
  ['bg-indigo-50 dark:bg-indigo-900/30', 'bg-slate-50 dark:bg-slate-800/30'],
  ['border-indigo-800', 'border-slate-700'],
  ['hover:border-indigo-400', 'hover:border-violet-400'],
  ['group-hover:border-indigo-300/80', 'group-hover:border-violet-300'],
  ['text-indigo-400/40 dark:text-indigo-500/30', 'text-slate-300 dark:text-slate-600'],
  ['group-hover:text-indigo-500', 'group-hover:text-violet-500'],
  ['border-pink-200/70', 'border-slate-200'],
  ['hover:border-pink-400', 'hover:border-violet-400'],
  ['text-pink-600 dark:text-pink-400', 'text-violet-600 dark:text-violet-400'],
  ['bg-pink-50 dark:bg-pink-900/50', 'bg-violet-50 dark:bg-violet-900/30'],
  ['text-pink-400', 'text-slate-400'],
  ['hover:text-pink-600', 'hover:text-violet-600'],
  ['border-pink-100', 'border-slate-200'],
  ['text-indigo-400', 'text-slate-400'],
  ['hover:text-indigo-600', 'hover:text-violet-600'],
  ['bg-gradient-to-b from-indigo-50 to-white dark:from-indigo-950/30 dark:to-slate-800', 'bg-slate-50 dark:bg-slate-900'],
  ['border-indigo-100 dark:border-slate-700', 'border-slate-200 dark:border-slate-700'],
  ['text-indigo-500', 'text-violet-500'],
  ['activeClassName="bg-indigo-50/50 dark:bg-slate-800/50"', 'activeClassName="bg-violet-50/30 dark:bg-slate-800/50 ring-2 ring-violet-200"'],
  ['activeClassName="bg-white/50 dark:bg-slate-800/50"', 'activeClassName="bg-violet-50/30 dark:bg-slate-800/50 ring-2 ring-violet-200"'],
]);

console.log("Refactored theme colors");
