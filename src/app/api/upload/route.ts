import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";

export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (
        pathname,
        /* clientPayload */
      ) => {
        // Autenticación opcional aquí (puedes verificar cookies/sesión)
        return {
          allowedContentTypes: ["video/mp4", "video/webm", "video/quicktime", "application/pdf"],
          tokenPayload: JSON.stringify({
            // Datos opcionales para onUploadCompleted
          }),
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        // Se ejecuta cuando el archivo ya está en Vercel Blob
        console.log("Upload completed", blob, tokenPayload);
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 }
    );
  }
}
