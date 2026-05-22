"use server";

// mock until resend is installed and configured
export async function sendNotificationEmail(to: string, subject: string, htmlBody: string) {
  if (!process.env.RESEND_API_KEY) {
    console.log(`[EMAIL SIMULADO] Destino: ${to}`);
    console.log(`[EMAIL SIMULADO] Asunto: ${subject}`);
    console.log(`[EMAIL SIMULADO] Cuerpo: ${htmlBody}`);
    return { success: true, simulated: true };
  }

  try {
    const { Resend } = await import("resend");
    const resend = new Resend(process.env.RESEND_API_KEY);

    const data = await resend.emails.send({
      from: "Videla-Acredita <onboarding@resend.dev>", // Cambiar a dominio real luego
      to: [to],
      subject: subject,
      html: htmlBody,
    });

    return { success: true, data };
  } catch (error) {
    console.error("Error al enviar email:", error);
    return { success: false, error };
  }
}
