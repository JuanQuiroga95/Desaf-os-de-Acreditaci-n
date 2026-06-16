const fs = require('fs');

let c = fs.readFileSync('src/app/docente/unidad/[id]/page.tsx', 'utf-8');

// Imports
if (!c.includes('import { createEncounter')) {
  c = c.replace(
    'import { deleteChallenge, createChallenge, updateChallenge } from "@/app/actions/admin";',
    'import { deleteChallenge, createChallenge, updateChallenge, getAllUsers } from "@/app/actions/admin";\nimport { createEncounter, deleteEncounter, updateEncounterStatus } from "@/app/actions/encounters";'
  );
}

if (!c.includes('getEncountersByUnit')) {
  c = c.replace(
    'import { getUnitById, getMaterialsByUnit, getChallengesByUnit } from "@/app/actions/units";',
    'import { getUnitById, getMaterialsByUnit, getChallengesByUnit, getEncountersByUnit } from "@/app/actions/units";'
  );
}

if (!c.includes('Users2')) {
  c = c.replace('Sparkles, Zap, Eye, EyeOff } from "lucide-react";', 'Sparkles, Zap, Eye, EyeOff, Users2, Calendar, CheckCircle2 } from "lucide-react";');
}

// Tab Type
c = c.replace(
  'type Tab = "THEORY" | "VIDEO" | "EXERCISE" | "PROMPT" | "RUBRIC" | "TP_TEMPLATE" | "CHALLENGES";',
  'type Tab = "THEORY" | "VIDEO" | "EXERCISE" | "PROMPT" | "RUBRIC" | "TP_TEMPLATE" | "CHALLENGES" | "ENCOUNTER";'
);

// TABS array
if (!c.includes('key: "ENCOUNTER"')) {
  c = c.replace(
    'const TABS: { key: Tab; label: string; icon: React.ElementType; color: string }[] = [',
    'const TABS: { key: Tab; label: string; icon: React.ElementType; color: string }[] = [\n  { key: "ENCOUNTER", label: "Encuentros", icon: Users2, color: "text-indigo-400" },'
  );
}

// State
if (!c.includes('const [encounters, setEncounters]')) {
  c = c.replace(
    'const [challenges, setChallenges] = useState<any[]>([]);',
    'const [challenges, setChallenges] = useState<any[]>([]);\n  const [encounters, setEncounters] = useState<any[]>([]);\n  const [students, setStudents] = useState<any[]>([]);'
  );
}

// Form state
if (!c.includes('studentId: ""')) {
  c = c.replace(
    'file: null as File | null,',
    'file: null as File | null,\n    studentId: "",\n    date: "",'
  );
}
c = c.replace(
  'setForm({ title: "", content: "", level: "BASICO", videoMode: "url", theoryMode: "text", file: null });',
  'setForm({ title: "", content: "", level: "BASICO", videoMode: "url", theoryMode: "text", file: null, studentId: "", date: "" });'
);

// loadData
c = c.replace(
  'const [mats, challs, unitRes] = await Promise.all([',
  'const [mats, challs, unitRes, encRes, usersRes] = await Promise.all([\n'
);
c = c.replace(
  'getUnitById(unitId),\n      ]);',
  'getUnitById(unitId),\n        getEncountersByUnit(unitId),\n        getAllUsers(),\n      ]);'
);
if (!c.includes('if (encRes.success)')) {
  c = c.replace(
    'if (challs.success) setChallenges(challs.challenges || []);',
    'if (challs.success) setChallenges(challs.challenges || []);\n      if (encRes.success) setEncounters(encRes.encounters || []);\n      setStudents(usersRes.filter((u: any) => u.role === "STUDENT"));'
  );
}

// handleSubmit
if (!c.includes('activeTab === "ENCOUNTER"')) {
  const submitLogic = `
      if (activeTab === "ENCOUNTER") {
        if (!form.studentId || !form.date) { showToast("Faltan datos", "error"); setIsSaving(false); return; }
        const res = await createEncounter({
          subjectId, unitId, studentId: form.studentId, date: form.date, notes: form.content, status: "PENDING", type: "VIRTUAL", teacherId: user.id
        });
        if (res.success) { showToast("Encuentro creado", "success"); resetForm(); loadData(); }
        else { showToast("Error al crear", "error"); }
        setIsSaving(false);
        return;
      }
`;
  c = c.replace('let fileUrl: string | undefined;', submitLogic + '      let fileUrl: string | undefined;');
}
if(!c.includes('activeTab === "ENCOUNTER" ? "Encuentro con..."')){
  c = c.replace(
    'activeTab === "THEORY" ? "Ej: Fracciones y operaciones básicas" :',
    'activeTab === "ENCOUNTER" ? "Notas del encuentro (opcional)" :\n                        activeTab === "THEORY" ? "Ej: Fracciones y operaciones básicas" :'
  );
}

// Encounter actions
if (!c.includes('const handleDeleteEncounter')) {
  const actions = `
  const handleDeleteEncounter = async (id: string) => {
    if (!confirm("¿Eliminar este encuentro?")) return;
    const res = await deleteEncounter(id);
    if (res.success) { showToast("Encuentro eliminado", "success"); loadData(); }
    else showToast("Error al eliminar", "error");
  };

  const handleUpdateEncounterStatus = async (id: string, status: string) => {
    const res = await updateEncounterStatus(id, status);
    if (res.success) { showToast("Estado actualizado", "success"); loadData(); }
    else showToast("Error al actualizar", "error");
  };
`;
  c = c.replace('const tabMaterials = materials.filter((m) => m.type === activeTab);', actions + '\n  const tabMaterials = materials.filter((m) => m.type === activeTab);');
}

// Count
c = c.replace(
  'const count = tab.key === "CHALLENGES" ? challenges.length : materials.filter((m) => m.type === tab.key).length;',
  'const count = tab.key === "CHALLENGES" ? challenges.length : tab.key === "ENCOUNTER" ? encounters.length : materials.filter((m) => m.type === tab.key).length;'
);

// Empty state condition
c = c.replace(
  '(activeTab === "CHALLENGES" ? challenges.length === 0 : tabMaterials.length === 0) && !showForm',
  '(activeTab === "CHALLENGES" ? challenges.length === 0 : activeTab === "ENCOUNTER" ? encounters.length === 0 : tabMaterials.length === 0) && !showForm'
);

// Render Encounters list
if (!c.includes('activeTab === "ENCOUNTER" ? (')) {
  const encounterList = `
            activeTab === "ENCOUNTER" ? (
              encounters.map((enc: any) => (
                <motion.div key={enc.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border rounded-[2rem] p-6 shadow-sm">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-black text-lg">{enc.student.name}</h4>
                      <div className="flex gap-3 text-xs text-muted-foreground mt-1">
                        <span className="flex items-center gap-1"><Calendar size={12}/> {new Date(enc.date).toLocaleDateString()}</span>
                        <span>{enc.type}</span>
                        {enc.notes && <span>· {enc.notes}</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={\`px-3 py-1 text-[10px] rounded-lg border font-black uppercase \${
                        enc.status === "COMPLETED" ? "bg-green-500/10 text-green-500 border-green-500/20" :
                        enc.status === "ABSENT" ? "bg-red-500/10 text-red-500 border-red-500/20" :
                        "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
                      }\`}>{enc.status}</span>
                      <button onClick={() => handleUpdateEncounterStatus(enc.id, "COMPLETED")} className="p-2 hover:bg-green-500/20 rounded-xl text-green-500 border border-border"><CheckCircle2 size={16}/></button>
                      <button onClick={() => handleDeleteEncounter(enc.id)} className="p-2 hover:bg-red-500/20 rounded-xl text-red-500 border border-border"><Trash2 size={16}/></button>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : `;
  c = c.replace('activeTab === "CHALLENGES" ? (', encounterList + 'activeTab === "CHALLENGES" ? (');
}

// Modify form to render studentId & date for ENCOUNTER
if (!c.includes('activeTab === "ENCOUNTER" && (')) {
  const encounterFields = `
                  {activeTab === "ENCOUNTER" && (
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 block">Alumno</label>
                        <select required value={form.studentId} onChange={e => setForm({...form, studentId: e.target.value})} className="w-full bg-secondary/30 border border-border rounded-xl p-4 font-bold outline-none focus:ring-2 focus:ring-primary/50">
                          <option value="">Seleccionar...</option>
                          {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 block">Fecha</label>
                        <input type="date" required value={form.date} onChange={e => setForm({...form, date: e.target.value})} className="w-full bg-secondary/30 border border-border rounded-xl p-4 font-bold outline-none focus:ring-2 focus:ring-primary/50" style={{colorScheme: 'dark'}} />
                      </div>
                    </div>
                  )}
`;
  // Insert before title
  c = c.replace('<div>\n                    <label className="text-[10px]', encounterFields + '\n                  {activeTab !== "ENCOUNTER" && (<div>\n                    <label className="text-[10px]');
  // close the div
  c = c.replace('placeholder={', 'placeholder={'); // no-op
  c = c.replace('/>\n                  </div>', '/>\n                  </div>)}');
}

fs.writeFileSync('src/app/docente/unidad/[id]/page.tsx', c);
