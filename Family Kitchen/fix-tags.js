const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'src', 'components', 'planner', 'MealCalendar.tsx');
let content = fs.readFileSync(file, 'utf8');

// Replace the end tags
content = content.replace(
  '                    </div>\n                  </div>\n                </DroppableZone>',
  '                    </div>\n                  </DroppableZone>\n                </div>'
);

fs.writeFileSync(file, content);
console.log('Fixed tags');
