const fs = require('fs');
const path = require('path');

const applyHexTheme = (filePath, replacements) => {
  let content = fs.readFileSync(filePath, 'utf8');
  for (const [oldStr, newStr] of replacements) {
    content = content.split(oldStr).join(newStr);
  }
  fs.writeFileSync(filePath, content);
};

// Colors from user:
// 1. #5AA9E6 (Blue)
// 2. #7FC8F8 (Light Blue)
// 3. #F9F9F9 (Off-White)
// 4. #FFE45E (Yellow)
// 5. #FF6392 (Pink)

// 1. page.tsx
const pagePath = path.join(__dirname, 'src', 'app', 'page.tsx');
applyHexTheme(pagePath, [
  ['from-slate-200 via-indigo-100 to-purple-200', 'from-[#7FC8F8]/40 via-[#F9F9F9] to-[#5AA9E6]/20'],
  ['dark:from-slate-950 dark:to-slate-900', 'dark:from-[#5AA9E6]/20 dark:to-slate-900'],
  ['border-indigo-400', 'border-[#5AA9E6]'],
]);

// 2. ChefSelector.tsx (Blue theme: #5AA9E6)
const chefPath = path.join(__dirname, 'src', 'components', 'planner', 'ChefSelector.tsx');
applyHexTheme(chefPath, [
  ['bg-indigo-100/60', 'bg-[#5AA9E6]/20'],
  ['dark:bg-indigo-900/40', 'dark:bg-[#5AA9E6]/20'],
  ['text-slate-800 dark:text-slate-100', 'text-[#5AA9E6] dark:text-[#7FC8F8]'],
  ['text-violet-500', 'text-[#5AA9E6]'],
  ['hover:border-violet-400', 'hover:border-[#5AA9E6]'],
  ['hover:text-violet-600', 'hover:text-[#5AA9E6]'],
  ['bg-violet-600', 'bg-[#5AA9E6]'],
  ['hover:bg-violet-700', 'hover:bg-[#5AA9E6]/80'],
  ['border-slate-200', 'border-[#7FC8F8]/50'],
]);

// 3. BundleLibrary.tsx (Yellow theme: #FFE45E)
const bundlePath = path.join(__dirname, 'src', 'components', 'library', 'BundleLibrary.tsx');
applyHexTheme(bundlePath, [
  ['bg-amber-100/60', 'bg-[#FFE45E]/30'],
  ['dark:bg-amber-900/40', 'dark:bg-[#FFE45E]/20'],
  ['text-amber-900 dark:text-amber-100', 'text-[#FFE45E] dark:text-[#FFE45E]'], // or maybe dark gray for readability
  ['text-amber-700', 'text-slate-700 dark:text-slate-200'],
  ['bg-amber-50 dark:bg-amber-900/60', 'bg-[#FFE45E]/10 dark:bg-[#FFE45E]/20'],
  ['hover:bg-slate-200', 'hover:bg-[#FFE45E]/50'],
  ['group-hover:bg-violet-50', 'group-hover:bg-[#FFE45E]/30'],
  ['hover:border-violet-300', 'hover:border-[#FFE45E]'],
  ['hover:text-violet-600', 'hover:text-slate-800'],
  ['text-amber-500', 'text-slate-700'],
  ['border-slate-200', 'border-[#FFE45E]/50'],
]);

// 4. RecipeLibrary.tsx (Pink theme: #FF6392)
const recipePath = path.join(__dirname, 'src', 'components', 'library', 'RecipeLibrary.tsx');
applyHexTheme(recipePath, [
  ['bg-purple-100/60', 'bg-[#FF6392]/20'],
  ['dark:bg-purple-900/40', 'dark:bg-[#FF6392]/20'],
  ['text-purple-900 dark:text-purple-100', 'text-[#FF6392] dark:text-[#FF6392]'],
  ['from-purple-500 to-indigo-600', 'from-[#FF6392] to-[#5AA9E6]'],
  ['hover:border-violet-300', 'hover:border-[#FF6392]'],
  ['group-hover:bg-violet-50', 'group-hover:bg-[#FF6392]/20'],
  ['hover:text-violet-600', 'hover:text-[#FF6392]'],
  ['text-violet-500', 'text-[#FF6392]'],
  ['border-slate-200', 'border-[#FF6392]/30'],
]);

// 5. GroceryDrawer.tsx (Pink theme: #FF6392)
const groceryPath = path.join(__dirname, 'src', 'components', 'grocery', 'GroceryDrawer.tsx');
applyHexTheme(groceryPath, [
  ['bg-purple-100/80', 'bg-[#FF6392]/20'],
  ['dark:bg-purple-900/40', 'dark:bg-[#FF6392]/20'],
  ['text-purple-900 dark:text-purple-100', 'text-[#FF6392] dark:text-[#FF6392]'],
  ['text-purple-400', 'text-[#FF6392]'],
  ['hover:border-purple-200', 'hover:border-[#FF6392]'],
  ['border-purple-50/50', 'border-[#FF6392]/30'],
  ['text-indigo-400', 'text-[#5AA9E6]'],
  ['text-indigo-500', 'text-[#5AA9E6]'],
  ['text-indigo-600', 'text-[#5AA9E6]'],
  ['hover:text-indigo-700', 'hover:text-[#5AA9E6]'],
  ['from-purple-500 to-indigo-600', 'from-[#FF6392] to-[#5AA9E6]'],
]);

// 6. MealCalendar.tsx (Using the whole palette!)
const calendarPath = path.join(__dirname, 'src', 'components', 'planner', 'MealCalendar.tsx');
applyHexTheme(calendarPath, [
  // Backgrounds
  ['bg-gradient-to-b from-indigo-50 to-white dark:from-indigo-950/50 dark:to-slate-900', 'bg-gradient-to-b from-[#7FC8F8]/30 to-white dark:from-[#5AA9E6]/20 dark:to-slate-900'],
  ['bg-slate-50 dark:bg-slate-800/30', 'bg-[#F9F9F9] dark:bg-slate-800/30'],
  ['bg-slate-50 dark:bg-slate-800/40', 'bg-[#F9F9F9] dark:bg-slate-800/40'],
  // Drop zones
  ['ring-indigo-400 bg-indigo-50/50 dark:bg-indigo-900/30', 'ring-[#5AA9E6] bg-[#5AA9E6]/20 dark:bg-[#5AA9E6]/10'],
  ['ring-purple-400 bg-purple-50/50 dark:bg-purple-900/30', 'ring-[#FF6392] bg-[#FF6392]/20 dark:bg-[#FF6392]/10'],
  ['bg-violet-50/30 dark:bg-slate-800/50 ring-2 ring-violet-200', 'bg-[#7FC8F8]/20 dark:bg-slate-800/50 ring-2 ring-[#7FC8F8]'],
  // Text accents
  ['text-violet-500', 'text-[#5AA9E6]'],
  ['hover:text-violet-600', 'hover:text-[#5AA9E6]'],
  ['text-amber-500', 'text-[#FFE45E]'],
  ['text-amber-600', 'text-[#FFE45E]'],
  ['bg-amber-50', 'bg-[#FFE45E]/20'],
  ['border-amber-200', 'border-[#FFE45E]/50'],
  ['hover:bg-amber-500', 'hover:bg-[#FFE45E]'],
  ['hover:text-amber-500', 'hover:text-[#FFE45E]'],
  ['bg-amber-100', 'bg-[#FFE45E]/30'],
  ['text-sky-500', 'text-[#5AA9E6]'],
  ['bg-sky-50', 'bg-[#5AA9E6]/20'],
  ['border-sky-200', 'border-[#5AA9E6]/50'],
  // hover states
  ['hover:border-violet-400', 'hover:border-[#5AA9E6]'],
]);

console.log("Applied custom HEX theme successfully!");
