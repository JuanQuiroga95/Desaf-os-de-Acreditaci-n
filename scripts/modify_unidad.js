const fs = require('fs');

let content = fs.readFileSync('src/app/docente/unidad/[id]/page.tsx', 'utf-8');

// Update imports
content = content.replace(
  'import { getAllSubjects, getChallengesBySubject, deleteChallenge, createChallenge, updateChallenge } from "@/app/actions/admin";',
  'import { deleteChallenge, createChallenge, updateChallenge } from "@/app/actions/admin";\nimport { getUnitById, getMaterialsByUnit, getChallengesByUnit } from "@/app/actions/units";'
);

content = content.replace('export default function DocenteMaterialesPage', 'export default function DocenteUnidadPage');

// Change const { id: subjectId } = use(params); to const { id: unitId } = use(params);
content = content.replace('const { id: subjectId } = use(params);', 'const { id: unitId } = use(params);\n  const [subjectId, setSubjectId] = useState<string>("");');

// Update states
content = content.replace('const [subject, setSubject] = useState<any>(null);', 'const [unit, setUnit] = useState<any>(null);\n  const [subject, setSubject] = useState<any>(null);');

// Update loadData
const oldLoadData = `  const loadData = async () => {
    setIsLoading(true);
    try {
      const [mats, subs, challs] = await Promise.all([
        getMaterialsBySubject(subjectId),
        getAllSubjects(),
        getChallengesBySubject(subjectId),
      ]);
      if (mats.success) setMaterials(mats.materials || []);
      if (challs.success) setChallenges(challs.challenges || []);
      const found = (subs as any[]).find((s: any) => s.id === subjectId);
      setSubject(found || null);
    } finally {
      setIsLoading(false);
    }
  };`;

const newLoadData = `  const loadData = async () => {
    setIsLoading(true);
    try {
      const [mats, challs, unitRes] = await Promise.all([
        getMaterialsByUnit(unitId),
        getChallengesByUnit(unitId),
        getUnitById(unitId),
      ]);
      if (mats.success) setMaterials(mats.materials || []);
      if (challs.success) setChallenges(challs.challenges || []);
      if (unitRes.success && unitRes.unit) {
        setUnit(unitRes.unit);
        setSubject(unitRes.unit.subject);
        setSubjectId(unitRes.unit.subjectId);
      }
    } finally {
      setIsLoading(false);
    }
  };`;

content = content.replace(oldLoadData, newLoadData);

// Update loadData dependencies
content = content.replace('useEffect(() => {\n    if (user?.role === "teacher") loadData();\n  }, [user, subjectId]);', 'useEffect(() => {\n    if (user?.role === "teacher") loadData();\n  }, [user, unitId]);');

// Update createMaterial calls
content = content.replace('const res = await createMaterial({\n        subjectId,', 'const res = await createMaterial({\n        subjectId,\n        unitId,');

// Update createChallenge calls
// The old one was:
// const res = await createChallenge(form.title, 'Resuelve...', 'REGULAR', { ... }, subjectId, ...
content = content.replace('subjectId, // Subject ID', 'subjectId, // Subject ID\n        unitId, // Unit ID');

// Update titles
content = content.replace('Gestión de Materiales', 'Gestión de Unidad');
content = content.replace('Volver al Panel', 'Volver a Unidades');
content = content.replace('href="/docente"', 'href="/docente/unidades"');
content = content.replace(
  '<h1 className="text-5xl font-black tracking-tighter uppercase italic leading-none">{subject?.name}</h1>',
  '<h1 className="text-5xl font-black tracking-tighter uppercase italic leading-none">{unit?.name} <span className="text-primary text-3xl">({subject?.name})</span></h1>'
);

fs.writeFileSync('src/app/docente/unidad/[id]/page.tsx', content);
console.log('Script ran successfully');
