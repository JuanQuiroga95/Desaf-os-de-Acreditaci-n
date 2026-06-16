const fs = require('fs');
let c = fs.readFileSync('src/app/docente/unidad/[id]/page.tsx', 'utf-8');

c = c.replace(/label: "Encuentros"/g, 'label: "Desafíos"');
c = c.replace(/"Encuentros"/g, '"Desafíos"');
c = c.replace(/"Encuentro"/g, '"Desafío"');
c = c.replace(/"encuentro"/g, '"desafío"');
c = c.replace(/"encuentros"/g, '"desafíos"');

fs.writeFileSync('src/app/docente/unidad/[id]/page.tsx', c);
