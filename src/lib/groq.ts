import Groq from "groq-sdk";
import type { ChatCompletion, ChatCompletionCreateParamsNonStreaming } from "groq-sdk/resources/chat/completions";

/**
 * Modelos de IA en orden de preferencia. Groq dio de baja los Llama 3.x
 * (16/08/26), por eso usamos gpt-oss. Para cambiarlo sin tocar código,
 * definí GROQ_MODEL en Vercel: se prueba primero.
 */
export const GROQ_MODELS = [process.env.GROQ_MODEL, "openai/gpt-oss-120b", "openai/gpt-oss-20b"].filter(
  (m, i, all): m is string => Boolean(m) && all.indexOf(m) === i,
);

export const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || "" });

type Params = Omit<ChatCompletionCreateParamsNonStreaming, "model">;

/**
 * Pide una respuesta probando cada modelo de GROQ_MODELS. Solo pasa al
 * siguiente si el modelo no existe o no está habilitado (404/400).
 */
export async function groqCompletion(params: Params): Promise<ChatCompletion> {
  let lastError: unknown = null;
  for (const model of GROQ_MODELS) {
    const isReasoning = model.startsWith("openai/gpt-oss");
    try {
      return await groq.chat.completions.create({
        ...params,
        model,
        // gpt-oss "piensa" antes de responder y esos tokens cuentan en max_tokens:
        // razonamiento bajo y margen extra para que la respuesta no salga vacía.
        ...(isReasoning && { reasoning_effort: params.reasoning_effort ?? "low" }),
        ...(isReasoning && params.max_tokens && { max_tokens: params.max_tokens + 1024 }),
      });
    } catch (error) {
      lastError = error;
      console.error(`Groq error (${model}):`, error);
      const status = error instanceof Groq.APIError ? error.status : undefined;
      if (status !== 404 && status !== 400) break;
    }
  }
  throw lastError;
}
