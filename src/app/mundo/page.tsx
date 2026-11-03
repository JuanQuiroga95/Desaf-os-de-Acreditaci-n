import Link from "next/link";
import { getWorldData } from "@/app/actions/world";
import WorldExperience from "@/components/world/WorldExperience";

export const metadata = { title: "Mundo | Aula virtual" };
export const dynamic = "force-dynamic";

export default async function WorldPage() {
  const res = await getWorldData();
  if (!res.success)
    return (
      <div className="mx-auto max-w-xl p-8 text-center">
        <h1 className="text-2xl font-black">Mundo</h1>
        <p className="mt-3 text-muted-foreground">
          El mundo está disponible para alumnos. Si sos alumno, volvé a iniciar sesión.
        </p>
        <Link href="/" className="mt-6 inline-block font-bold text-primary hover:underline">
          Volver al inicio
        </Link>
      </div>
    );
  return <WorldExperience data={res.data} />;
}
