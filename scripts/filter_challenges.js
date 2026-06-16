const fs = require('fs');
let c = fs.readFileSync('src/app/docente/unidad/[id]/page.tsx', 'utf-8');

// Filter challenges to standalone ones
if (!c.includes('const standaloneChallenges')) {
  c = c.replace(
    'const tabMaterials = materials.filter((m) => m.type === activeTab);',
    'const standaloneChallenges = challenges.filter((c) => !materials.some((m) => m.challengeId === c.id));\n  const tabMaterials = materials.filter((m) => m.type === activeTab);'
  );

  // Replace challenges.length with standaloneChallenges.length for COUNT
  c = c.replace(
    'const count = tab.key === "CHALLENGES" ? challenges.length : tab.key === "ENCOUNTER" ? encounters.length : materials.filter((m) => m.type === tab.key).length;',
    'const count = tab.key === "CHALLENGES" ? standaloneChallenges.length : tab.key === "ENCOUNTER" ? encounters.length : materials.filter((m) => m.type === tab.key).length;'
  );

  // Replace challenges.length in summary
  c = c.replace(
    'Guía digital del módulo · {materials.length + challenges.length} recursos cargados',
    'Guía digital del módulo · {materials.length + standaloneChallenges.length} recursos cargados'
  );

  // Replace challenges map for rendering
  c = c.replace(
    'activeTab === "CHALLENGES" ? (\n              challenges.map((chall) => (',
    'activeTab === "CHALLENGES" ? (\n              standaloneChallenges.map((chall) => ('
  );

  // Replace challenges map for empty state
  c = c.replace(
    '(activeTab === "CHALLENGES" ? challenges.length === 0 : activeTab === "ENCOUNTER" ? encounters.length === 0 : tabMaterials.length === 0) && !showForm',
    '(activeTab === "CHALLENGES" ? standaloneChallenges.length === 0 : activeTab === "ENCOUNTER" ? encounters.length === 0 : tabMaterials.length === 0) && !showForm'
  );
}

fs.writeFileSync('src/app/docente/unidad/[id]/page.tsx', c);
console.log('Done!');
