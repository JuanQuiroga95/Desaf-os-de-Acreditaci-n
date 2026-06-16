"use client";

import React, { useEffect, useState, use } from "react";
import confetti from "canvas-confetti";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { getSubjectChallenges, submitChallengeResponse } from "@/app/actions/student";
import { AnimatePresence } from "framer-motion";
import { useToast } from "@/context/ToastContext";
import { useUI } from "@/context/UIContext";

import { SubjectHeader } from "@/components/subject/SubjectHeader";
import { ChallengeGrid } from "@/components/subject/ChallengeGrid";
import { MaterialsSidebar } from "@/components/subject/MaterialsSidebar";
import { ChallengeModal } from "@/components/subject/ChallengeModal";
import { MaterialModal } from "@/components/subject/MaterialModal";

export default function SubjectPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { user, isLoading: authLoading } = useAuth();
  const { showToast } = useToast();
  const { setAIBlocked } = useUI();
  const router = useRouter();

  const [subject, setSubject] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState("Cargando Materia...");
  
  const [selectedChallenge, setSelectedChallenge] = useState<any>(null);
  const [selectedMaterial, setSelectedMaterial] = useState<any>(null);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const messages = ["Afilando los lápices...", "Preparando tus desafíos...", "Calculando probabilidades de éxito...", "Conectando neuronas...", "Buscando los apuntes perdidos..."];
    let i = Math.floor(Math.random() * messages.length);
    setLoadingMessage(messages[i]);
    const interval = setInterval(() => {
      i = (i + 1) % messages.length;
      setLoadingMessage(messages[i]);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (selectedChallenge) {
      if (selectedChallenge.type === "DIAGNOSTICO" || selectedChallenge.type === "AUTOEVALUACION") {
        setAIBlocked(true);
      } else {
        setAIBlocked(false);
      }
    } else {
      setAIBlocked(false);
    }
  }, [selectedChallenge, setAIBlocked]);

  useEffect(() => {
    if (user?.id) {
      loadData();
    }
  }, [user, resolvedParams.id]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const res = await getSubjectChallenges(resolvedParams.id, user!.id);
      if (res.success) {
        setSubject(res.subject);
      }
    } catch (error) {
      console.error("Error cargando materia:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenChallenge = (challenge: any) => {
    setSelectedChallenge(challenge);
    const initialAnswers: {[key: string]: string} = {};
    if (challenge.content?.questions) {
      challenge.content.questions.forEach((q: { id: string }) => {
        initialAnswers[q.id] = "";
      });
    }
    setAnswers(initialAnswers);
  };

  const handleSelectMaterial = (mat: any) => {
    if (mat.challengeId) {
      let challenge = subject?.challenges?.find((c: any) => c.id === mat.challengeId);
      if (!challenge && subject?.units) {
        for (const unit of subject.units) {
          challenge = unit.challenges?.find((c: any) => c.id === mat.challengeId);
          if (challenge) break;
        }
      }
      if (challenge) {
        handleOpenChallenge(challenge);
        return;
      }
    }
    setSelectedMaterial(mat);
  };

  const handleSubmitChallenge = async (e?: React.FormEvent | React.MouseEvent | null, isRoleplayFinished = false, chatLog?: any[], fileUrl?: string) => {
    if (e && (e as any).preventDefault) (e as any).preventDefault();
    if (!selectedChallenge) return;

    let payload = answers;

    if (selectedChallenge.type !== "ROLEPLAY") {
      const questions = selectedChallenge.content?.questions || [];
      const allAnswered = questions.every((q: { id: string }) => answers[q.id]?.trim());
      
      if (!allAnswered && !fileUrl) {
        showToast("Por favor responde todas las preguntas o sube un archivo", "error");
        return;
      }
    } else {
      if (!isRoleplayFinished) return;
      payload = { chatLog };
    }
    
    setIsSubmitting(true);
    try {
      const res = await submitChallengeResponse(selectedChallenge.id, user!.id, payload, fileUrl || null);
      if (res.success) {
        confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
        if (res.score !== undefined && res.score !== null) {
          showToast(`¡Desafío enviado! ${res.feedback} Calificación: ${res.score}/10`, "success");
        } else {
          showToast("¡Desafío enviado! Pendiente de corrección.", "success");
        }
        setSelectedChallenge(null);
        setAnswers({});
        loadData();
      }
    } catch (error) {
      showToast("Error al enviar el desafío", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (!authLoading && !isLoading && !user && typeof window !== "undefined") {
      router.push("/login");
    }
  }, [authLoading, isLoading, user, router]);

  if (authLoading || isLoading) return <div className="p-20 text-center font-black animate-pulse uppercase tracking-widest text-primary">{loadingMessage}</div>;
  if (!user) return null;

  return (
    <div className="p-8 max-w-7xl mx-auto pb-24">
      <SubjectHeader subject={subject} />

      <div className="space-y-12 mt-8">
        {subject?.units?.length > 0 ? (
          subject.units.map((unit: any) => (
            <div key={unit.id} className="bg-card border border-border rounded-[2.5rem] p-8 shadow-sm">
              <h2 className="text-3xl font-black mb-2">{unit.name}</h2>
              {unit.description && <p className="text-muted-foreground mb-6">{unit.description}</p>}
              
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-6">
                <div className="lg:col-span-8 space-y-6">
                  {unit.challenges.length > 0 ? (
                    <ChallengeGrid subject={{ ...subject, challenges: unit.challenges }} onOpenChallenge={handleOpenChallenge} />
                  ) : (
                    <div className="p-8 text-center bg-secondary/5 border-2 border-dashed border-border rounded-[2rem]">
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">No hay ejercicios en esta unidad</p>
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
                            <span className={`px-3 py-1 text-[10px] rounded-lg border font-bold uppercase ${
                                    enc.status === "COMPLETED" ? "bg-green-500/10 text-green-500 border-green-500/20" :
                                    enc.status === "ABSENT" ? "bg-red-500/10 text-red-500 border-red-500/20" :
                                    "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
                                  }`}>{enc.status}</span>
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
          ))
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 space-y-6">
              <ChallengeGrid subject={subject} onOpenChallenge={handleOpenChallenge} />
            </div>
            <MaterialsSidebar subject={subject} onSelectMaterial={handleSelectMaterial} />
          </div>
        )}
      </div>

      <AnimatePresence>
        {selectedChallenge && (
          <ChallengeModal 
            challenge={selectedChallenge}
            subject={subject}
            onClose={() => setSelectedChallenge(null)}
            onSubmit={handleSubmitChallenge}
            answers={answers}
            setAnswers={setAnswers}
            isSubmitting={isSubmitting}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedMaterial && (
          <MaterialModal 
            material={selectedMaterial}
            user={user}
            onClose={() => setSelectedMaterial(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
