const fs = require('fs');

// 1. Fix docente/page.tsx
let p = fs.readFileSync('src/app/docente/page.tsx', 'utf-8');
p = p.replace(
  '<span className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-2">Encuentros</span>',
  '<span className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-2">Desafíos</span>'
);
fs.writeFileSync('src/app/docente/page.tsx', p);

// 2. Fix subjects/[id]/page.tsx
let s = fs.readFileSync('src/app/subjects/[id]/page.tsx', 'utf-8');

if (!s.includes('activeUnitId')) {
  s = s.replace(
    'const [selectedMaterial, setSelectedMaterial] = useState<any>(null);',
    'const [selectedMaterial, setSelectedMaterial] = useState<any>(null);\n  const [activeUnitId, setActiveUnitId] = useState<string | null>(null);\n\n  useEffect(() => {\n    if (subject?.units?.length > 0 && !activeUnitId) {\n      setActiveUnitId(subject.units[0].id);\n    }\n  }, [subject, activeUnitId]);'
  );

  s = s.replace(
    'const handleSelectMaterial = (mat: any) => {',
    'const handleSelectMaterial = (mat: any) => {\n    if ((mat.type === "EXERCISE" || mat.type === "TP_TEMPLATE") && mat.challengeId) {\n      const challenge = subject?.units?.flatMap((u: any) => u.challenges || []).find((c: any) => c.id === mat.challengeId);\n      if (challenge) {\n        handleOpenChallenge(challenge);\n        return;\n      }\n    }'
  );

  const unitLayout = `
        {subject?.units?.length > 0 && (
          <div className="flex gap-4 mb-8 overflow-x-auto pb-2 scrollbar-hide">
            {subject.units.map((unit: any) => (
              <button
                key={unit.id}
                onClick={() => setActiveUnitId(unit.id)}
                className={\`px-6 py-4 rounded-[2rem] font-black text-[10px] uppercase tracking-widest border transition-all whitespace-nowrap \${
                  activeUnitId === unit.id 
                    ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20" 
                    : "bg-secondary/30 border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
                }\`}
              >
                {unit.name}
              </button>
            ))}
          </div>
        )}
        
        {subject?.units?.length > 0 ? (
          subject.units.filter((u: any) => u.id === activeUnitId).map((unit: any) => {
            const standaloneChallenges = (unit.challenges || []).filter(
              (c: any) => !(unit.materials || []).some((m: any) => m.challengeId === c.id)
            );
            return (
            <div key={unit.id} className="bg-card border border-border rounded-[2.5rem] p-8 shadow-sm">
              <h2 className="text-3xl font-black mb-2">{unit.name}</h2>
              {unit.description && <p className="text-muted-foreground mb-6">{unit.description}</p>}
              
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-6">
                <div className="lg:col-span-8 space-y-6">
                  {standaloneChallenges.length > 0 ? (
                    <ChallengeGrid subject={{ ...subject, challenges: standaloneChallenges }} onOpenChallenge={handleOpenChallenge} />
                  ) : (
                    <div className="p-8 text-center bg-secondary/5 border-2 border-dashed border-border rounded-[2rem]">
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">No hay desafíos independientes en esta unidad</p>
                    </div>
                  )}
                  {unit.encounters?.length > 0 && (
                    <div className="mt-8">
                      <h3 className="text-sm font-black uppercase tracking-widest mb-4">Encuentros</h3>
                      <div className="space-y-4">
                        {unit.encounters.map((enc: any) => (
                          <div key={enc.id} className="p-6 bg-secondary/10 border border-border rounded-2xl flex justify-between items-center">
                            <div>
                              <p className="font-bold text-lg">{enc.type === "PRESENCIAL" ? "Presencial" : "Virtual"}</p>
                              <p className="text-xs text-muted-foreground">{new Date(enc.date).toLocaleDateString()}</p>
                            </div>
                            <span className={\`px-3 py-1 text-[10px] rounded-lg border font-bold uppercase \${
                                    enc.status === "COMPLETED" ? "bg-green-500/10 text-green-500 border-green-500/20" :
                                    enc.status === "ABSENT" ? "bg-red-500/10 text-red-500 border-red-500/20" :
                                    "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
                                  }\`}>{enc.status}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <div className="lg:col-span-4">
                  {unit.materials.length > 0 ? (
                    <MaterialsSidebar subject={{ ...subject, materials: unit.materials }} onSelectMaterial={handleSelectMaterial} />
                  ) : (
                    <div className="p-8 text-center bg-secondary/5 border-2 border-dashed border-border rounded-[2rem]">
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">No hay materiales</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )})
        ) : (
`;
  
  s = s.replace(
    /{subject\?\.units\?\.length > 0 \? \(\s*subject\.units\.map\(\(unit: any\) => \(\s*<div key={unit\.id}[\s\S]*?(?=\s*<div className="grid grid-cols-1 lg:grid-cols-12 gap-8">)/,
    unitLayout + '          '
  );
  fs.writeFileSync('src/app/subjects/[id]/page.tsx', s);
}
