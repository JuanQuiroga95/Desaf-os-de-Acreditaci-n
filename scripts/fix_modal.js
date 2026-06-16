const fs = require('fs');

// 1. Fix teacher dashboard challenges count
let t = fs.readFileSync('src/app/actions/teacher.ts', 'utf-8');
t = t.replace(
  '        _count: {\n          select: { challenges: true }\n        },',
  '        _count: {\n          select: { challenges: { where: { materials: { none: {} } } } }\n        },'
);
fs.writeFileSync('src/app/actions/teacher.ts', t);

// 2. Fix sidebar count in unit page
let u = fs.readFileSync('src/app/docente/unidad/[id]/page.tsx', 'utf-8');
u = u.replace(
  'const count = tab.key === "CHALLENGES" ? challenges.length : materials.filter((m) => m.type === tab.key).length;',
  'const count = tab.key === "CHALLENGES" ? standaloneChallenges.length : tab.key === "ENCOUNTER" ? encounters.length : materials.filter((m) => m.type === tab.key).length;'
);
fs.writeFileSync('src/app/docente/unidad/[id]/page.tsx', u);

// 3. Fix ChallengeModal
let m = fs.readFileSync('src/components/subject/ChallengeModal.tsx', 'utf-8');
m = m.replace(
  '<FileText size={12} /> Teoría\n                </button>',
  '<FileText size={12} /> Teoría / Ejercicios\n                </button>'
);

const emptyStateResolution = `
                  {!challenge.content?.questions?.length && (
                    <div className="p-6 bg-card border border-border rounded-2xl shadow-sm hover:border-primary/20 transition-all group">
                      <label className="text-[11px] font-black uppercase text-foreground leading-relaxed tracking-widest pt-1.5 block mb-4">
                        Tu Resolución
                      </label>
                      <textarea 
                        required
                        disabled={isReadOnly}
                        value={answers["resolution"] || ""}
                        onChange={(e) => setAnswers({...answers, resolution: e.target.value})}
                        className="w-full bg-background border border-border rounded-xl p-4 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/50 transition-all shadow-inner disabled:opacity-70 disabled:bg-secondary/50 resize-none min-h-[200px]"
                        placeholder={isReadOnly ? "" : "Escribí o pegá tu respuesta acá..."}
                      />
                    </div>
                  )}
`;

m = m.replace(
  '{challenge.content?.questions?.map((q: any, index: number) => (',
  emptyStateResolution + '\n                    {challenge.content?.questions?.map((q: any, index: number) => ('
);

fs.writeFileSync('src/components/subject/ChallengeModal.tsx', m);
