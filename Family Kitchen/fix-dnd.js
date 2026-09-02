const fs = require('fs');
const path = require('path');
const pagePath = path.join(__dirname, 'src', 'app', 'page.tsx');
let pageContent = fs.readFileSync(pagePath, 'utf8');

pageContent = pageContent.replace(/<\/DndContext>/g, ''); // remove any stray DndContext closing tags
pageContent = pageContent.replace(/<\/div>\n  \);\n}/, '    </div>\n    </DndContext>\n  );\n}');

fs.writeFileSync(pagePath, pageContent);
console.log("Fixed DndContext closing tag");
