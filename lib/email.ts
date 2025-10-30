// lib/email.ts
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

interface ContactEmailData {
  name: string;
  email: string;
  message: string;
  userId?: string | null;
  userRole?: string | null;
}

/**
 * Envía una notificación por email cuando un usuario envía un mensaje de contacto
 */
export async function sendContactNotification(data: ContactEmailData) {
  try {
    const { name, email, message, userId, userRole } = data;

    // ⚠️ CAMBIAR ESTE EMAIL: Usa el email con el que te registraste en Resend
    const toEmail = "raul.sanchezs@politicas.unam.mx"; // 👈 CAMBIAR AQUÍ

    const { data: emailData, error } = await resend.emails.send({
      from: "Eskemma Contact <onboarding@resend.dev>",
      to: [toEmail],
      subject: `📧 Nuevo mensaje de contacto - ${name}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Nuevo mensaje de contacto</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f5f5f5; padding: 20px;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                  
                  <!-- Header -->
                  <tr>
                    <td style="background-color: #0A7373; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
                      <h1 style="color: #ffffff; margin: 0; font-size: 24px;">
                        📧 Nuevo Mensaje de Contacto
                      </h1>
                    </td>
                  </tr>
                  
                  <!-- Datos del usuario -->
                  <tr>
                    <td style="padding: 30px;">
                      <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                        <h2 style="color: #0A7373; margin: 0 0 15px 0; font-size: 18px;">
                          Información del Remitente
                        </h2>
                        <p style="margin: 8px 0; color: #333;">
                          <strong>Nombre:</strong> ${name}
                        </p>
                        <p style="margin: 8px 0; color: #333;">
                          <strong>Email:</strong> 
                          <a href="mailto:${email}" style="color: #0A7373; text-decoration: none;">
                            ${email}
                          </a>
                        </p>
                        ${userId ? `
                        <p style="margin: 8px 0; color: #333;">
                          <strong>Usuario ID:</strong> ${userId}
                        </p>
                        ` : `
                        <p style="margin: 8px 0; color: #999; font-style: italic;">
                          Usuario no autenticado
                        </p>
                        `}
                        ${userRole ? `
                        <p style="margin: 8px 0; color: #333;">
                          <strong>Rol:</strong> 
                          <span style="display: inline-block; background-color: #0A7373; color: white; padding: 2px 8px; border-radius: 4px; font-size: 12px;">
                            ${userRole}
                          </span>
                        </p>
                        ` : ''}
                      </div>
                      
                      <!-- Mensaje -->
                      <div style="backgroun<div style="background-color: #ffffff; padding: 20px; border-left: 4px solid #0A7373; margin-bottom: 20px;">
                        <h2 style="color: #0A7373; margin: 0 0 15px 0; font-size: 18px;">
                          Mensaje:
                        </h2>
                        <p style="color: #333; line-height: 1.6; white-space: pre-wrap; margin: 0;">
${message}
                        </p>
                      </div>
                      
                      <!-- Botón de acción -->
                      <div style="text-align: center; margin-top: 30px;">
                        <a href="mailto:${email}?subject=Re: Contacto desde Eskemma" 
                           style="display: inline-block; background-color: #FF6B35; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                          Responder a ${name}
                        </a>
                      </div>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 8px 8px;">
                      <p style="color: #666; font-size: 12px; margin: 0;">
                        Este mensaje fue enviado desde el formulario de contacto de 
                        <strong>Eskemma</strong>
                      </p>
                      <p style="color: #999; font-size: 11px; margin: 10px 0 0 0;">
                        ${new Date().toLocaleString('es-MX', { 
                          timeZone: 'America/Mexico_City',
                          dateStyle: 'full',
                          timeStyle: 'short'
                        })}
                      </p>
                    </td>
                  </tr>
                  
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
      // También incluir versión de texto plano
      text: `
Nuevo mensaje de contacto - Eskemma

Información del Remitente:
- Nombre: ${name}
- Email: ${email}
${userId ? `- Usuario ID: ${userId}` : '- Usuario no autenticado'}
${userRole ? `- Rol: ${userRole}` : ''}

Mensaje:
${message}

---
Este mensaje fue enviado desde el formulario de contacto de Eskemma.
      `.trim(),
    });

    if (error) {
      console.error("❌ Error al enviar email:", error);
      return { success: false, error };
    }

    console.log("✅ Email enviado exitosamente:", emailData);
    return { success: true, data: emailData };
  } catch (error) {
    console.error("❌ Error inesperado al enviar email:", error);
    return { success: false, error };
  }
}