import { notFound } from "next/navigation";
import { getActivity } from "@/lib/activities";
import GameSession from "@/components/learning/GameSession";

export default async function ExploreGamePage({ params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;
  if (!getActivity(key)) notFound();
  return <GameSession activityKey={key} />;
}
