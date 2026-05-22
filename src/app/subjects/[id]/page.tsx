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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-6">
          <ChallengeGrid subject={subject} onOpenChallenge={handleOpenChallenge} />
        </div>
        <MaterialsSidebar subject={subject} onSelectMaterial={setSelectedMaterial} />
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
