const fs = require('fs');
const path = require('path');

const walkSync = (dir, filelist = []) => {
  fs.readdirSync(dir).forEach(file => {
    const dirFile = path.join(dir, file);
    if (fs.statSync(dirFile).isDirectory()) {
      filelist = walkSync(dirFile, filelist);
    } else if (dirFile.endsWith('.tsx') || dirFile.endsWith('.ts')) {
      filelist.push(dirFile);
    }
  });
  return filelist;
};

const files = walkSync(path.join(__dirname, 'src'));

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');

  // Replace OLD custom HEXes
  content = content.replace(/#5AA9E6/gi, '#4ECDC4');
  content = content.replace(/#7FC8F8/gi, '#BDA0BC'); // Or Mint Cream? Lilac is a good mid-tone.
  content = content.replace(/#F9F9F9/gi, '#F7FFF7');
  content = content.replace(/#FFE45E/gi, '#FFE66D');
  content = content.replace(/#FF6392/gi, '#BDA0BC'); 

  // Replace residual purple/violet/indigo
  content = content.replace(/violet-500/g, '[#4ECDC4]');
  content = content.replace(/violet-600/g, '[#4ECDC4]');
  content = content.replace(/violet-400/g, '[#4ECDC4]');
  content = content.replace(/violet-300/g, '[#4ECDC4]');
  content = content.replace(/violet-50/g, '[#BDA0BC]/20');
  
  content = content.replace(/purple-600/g, '[#BDA0BC]');
  content = content.replace(/purple-700/g, '[#BDA0BC]');
  content = content.replace(/purple-500/g, '[#BDA0BC]');
  content = content.replace(/purple-400/g, '[#BDA0BC]');
  content = content.replace(/purple-100/g, '[#BDA0BC]/30');
  content = content.replace(/purple-50/g, '[#BDA0BC]/10');
  
  content = content.replace(/indigo-700/g, '[#292F36]');
  content = content.replace(/indigo-600/g, '[#292F36]');
  content = content.replace(/indigo-500/g, '[#4ECDC4]');
  content = content.replace(/indigo-400/g, '[#4ECDC4]');
  content = content.replace(/indigo-100/g, '[#F7FFF7]');
  content = content.replace(/indigo-50/g, '[#F7FFF7]');

  fs.writeFileSync(file, content);
});

console.log("New palette applied globally!");
