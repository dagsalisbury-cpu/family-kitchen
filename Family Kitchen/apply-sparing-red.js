const fs = require('fs');
const path = require('path');

const walkSync = (dir, filelist = []) => {
  fs.readdirSync(dir).forEach(file => {
    const dirFile = path.join(dir, file);
    if (fs.statSync(dirFile).isDirectory()) {
      filelist = walkSync(dirFile, filelist);
    } else if (dirFile.endsWith('.tsx') || dirFile.endsWith('.ts') || dirFile.endsWith('.js')) {
      filelist.push(dirFile);
    }
  });
  return filelist;
};

const files = walkSync(path.join(__dirname, 'src'));

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');

  // Map back to the requested palette
  content = content.replace(/#4ECDC4/gi, '#5AA9E6'); // Strong Cyan -> Blue
  content = content.replace(/#A594F9/gi, '#7FC8F8'); // Periwinkle -> Sky Blue
  content = content.replace(/#F7FFF7/gi, '#F9F9F9'); // Mint Cream -> Off-White
  content = content.replace(/#FFE66D/gi, '#FFE45E'); // Royal Gold -> Yellow

  // Revert the jet black to a standard slate color for text/backgrounds
  content = content.replace(/text-\[#292F36\]/gi, 'text-slate-800');
  content = content.replace(/bg-\[#292F36\]/gi, 'bg-slate-800');
  content = content.replace(/border-\[#292F36\]/gi, 'border-slate-800');
  
  // Now inject the Red (#FF6392) sparingly as accents.
  // We'll target specific X buttons and remove icons.
  // 1. Meal Calendar X buttons (remove dinner)
  content = content.replace(/bg-amber-100 text-amber-500 hover:bg-amber-500/g, 'bg-[#FF6392]/20 text-[#FF6392] hover:bg-[#FF6392]');
  // 2. Chef slot X button (remove chef)
  content = content.replace(/text-amber-500 hover:bg-amber-50 rounded-full/g, 'text-[#FF6392] hover:bg-[#FF6392]/20 rounded-full');
  
  fs.writeFileSync(file, content);
});

// For Grocery Drawer, let's make the "remove item" trash icon Red
const groceryPath = path.join(__dirname, 'src', 'components', 'grocery', 'GroceryDrawer.tsx');
if (fs.existsSync(groceryPath)) {
  let groceryContent = fs.readFileSync(groceryPath, 'utf8');
  groceryContent = groceryContent.replace(/hover:text-\[#5AA9E6\] transition-opacity p-1/g, 'hover:text-[#FF6392] transition-opacity p-1');
  fs.writeFileSync(groceryPath, groceryContent);
}

// For Recipe Library and Grocery Drawer, change the gradient to not use pink, but instead use Blues.
const recipePath = path.join(__dirname, 'src', 'components', 'library', 'RecipeLibrary.tsx');
if (fs.existsSync(recipePath)) {
  let recipeContent = fs.readFileSync(recipePath, 'utf8');
  // Make the "New Recipe" button a nice blue gradient
  recipeContent = recipeContent.replace(/from-\[#7FC8F8\] to-\[#5AA9E6\]/g, 'from-[#7FC8F8] to-[#5AA9E6]'); 
  fs.writeFileSync(recipePath, recipeContent);
}

console.log("Reverted to original vibrant palette with sparing red accents!");
