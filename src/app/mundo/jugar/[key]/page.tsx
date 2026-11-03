import { notFound } from "next/navigation";
import { requireAuth } from "@/lib/session";
import { getActivity } from "@/lib/activities";
import GameSession from "@/components/learning/GameSession";

export default async function WorldGamePage({ params, searchParams }: {
  params: Promise<{ key: string }>;
  searchParams: Promise<{ modo?: string }>;
}) {
  await requireAuth(["student"]);
  const { key } = await params;
  if (!getActivity(key)) notFound();
  const { modo } = await searchParams;
  return <GameSession activityKey={key} initialPractice={modo === "practicar"} />;
}
