import { put } from "@vercel/blob";
import { NextResponse } from "next/server";

export async function POST(request: Request): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const filename = searchParams.get("filename");

  if (!filename) {
    return NextResponse.json({ error: "Nombre de archivo requerido" }, { status: 400 });
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      { error: "Vercel Blob no configurado. Agregá BLOB_READ_WRITE_TOKEN en las variables de entorno de Vercel." },
      { status: 503 }
    );
  }

  try {
    const blob = await put(filename, request.body!, { access: "public" });
    return NextResponse.json(blob);
  } catch {
    return NextResponse.json({ error: "Error al subir archivo" }, { status: 500 });
  }
}
