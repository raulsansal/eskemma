// lib/emailService.ts
import nodemailer from "nodemailer";

// Configurar transportador
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

/**
 * Email de verificación con link para confirmar suscripción
 */
export async function sendVerificationEmail(email: string, verificationLink: string) {
  const mailOptions = {
    from: `"Eskemma - El Baúl de Fouché" <${process.env.GMAIL_USER}>`,
    to: email,
    subject: "Confirma tu suscripción al Baúl de Fouché",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #2D7A6E 0%, #1F5A51 100%); color: white; padding: 40px 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: white; padding: 40px 30px; border: 1px solid #e0e0e0; border-top: none; }
            .button { display: inline-block; background: #2D7A6E; color: white !important; padding: 16px 40px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 25px 0; font-size: 16px; }
            .button:hover { background: #1F5A51; }
            .footer { text-align: center; color: #666; font-size: 13px; margin-top: 30px; padding: 20px; }
            .highlight { background: #f0f9ff; border-left: 4px solid #2D7A6E; padding: 15px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0; font-size: 28px;">¡Bienvenido al Baúl de Fouché!</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9;">Estás a un paso de recibir nuestro newsletter</p>
            </div>
            <div class="content">
              <h2 style="color: #2D7A6E; margin-top: 0;">Confirma tu suscripción</h2>
              
              <p style="font-size: 16px; line-height: 1.6; color: #333;">
                Gracias por tu interés en <strong>El Baúl de Fouché</strong>, el newsletter de Eskemma con análisis político y estratégico.
              </p>

              <div class="highlight">
                <p style="margin: 0; font-size: 15px; color: #1F5A51;">
                  📧 <strong>Recibirás:</strong><br>
                  • Artículos sobre estrategia política<br>
                  • Análisis electoral y de opinión pública<br>
                  • Contenido exclusivo para suscriptores
                </p>
              </div>

              <p style="font-size: 16px; line-height: 1.6; color: #333;">
                Para completar tu suscripción, confirma tu correo haciendo clic en el botón:
              </p>
              
              <div style="text-align: center;">
                <a href="${verificationLink}" class="button">Confirmar mi suscripción</a>
              </div>
              
              <p style="margin-top: 30px; color: #666; font-size: 14px; line-height: 1.6;">
                Si no solicitaste esta suscripción, simplemente ignora este correo.
              </p>

              <p style="margin-top: 20px; color: #999; font-size: 13px;">
                Este enlace expirará en 48 horas.
              </p>
            </div>
            <div class="footer">
              <p><strong>Eskemma</strong> - Comunicación Política Digital</p>
              <p style="margin: 5px 0;">Si el botón no funciona, copia y pega este enlace:</p>
              <p style="font-size: 11px; word-break: break-all; color: #2D7A6E;">${verificationLink}</p>
            </div>
          </div>
        </body>
      </html>
    `,
  };

  await transporter.sendMail(mailOptions);
  console.log(`📧 Email de verificación enviado a: ${email}`);
}

/**
 * Email de bienvenida después de confirmar suscripción
 */
export async function sendWelcomeEmail(email: string) {
  const mailOptions = {
    from: `"Eskemma - El Baúl de Fouché" <${process.env.GMAIL_USER}>`,
    to: email,
    subject: "¡Bienvenido al Baúl de Fouché! 🎉",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #2D7A6E 0%, #1F5A51 100%); color: white; padding: 40px 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: white; padding: 40px 30px; border: 1px solid #e0e0e0; border-top: none; }
            .button { display: inline-block; background: #2D7A6E; color: white !important; padding: 16px 40px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 25px 0; font-size: 16px; }
            .footer { text-align: center; color: #666; font-size: 13px; margin-top: 30px; padding: 20px; }
            .feature { background: #f8fafb; border-radius: 8px; padding: 20px; margin: 15px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0; font-size: 32px;">🎉 ¡Suscripción confirmada!</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9; font-size: 18px;">Ya eres parte del Baúl de Fouché</p>
            </div>
            <div class="content">
              <h2 style="color: #2D7A6E; margin-top: 0;">¡Gracias por unirte!</h2>
              
              <p style="font-size: 16px; line-height: 1.7; color: #333;">
                Nos emociona tenerte en nuestra comunidad de análisis político y estratégico. 
              </p>

              <div class="feature">
                <h3 style="color: #1F5A51; margin-top: 0; font-size: 18px;">📬 ¿Qué puedes esperar?</h3>
                <ul style="color: #333; line-height: 1.8; padding-left: 20px;">
                  <li><strong>Artículos semanales</strong> sobre estrategia política y comunicación</li>
                  <li><strong>Análisis electoral</strong> con datos y tendencias</li>
                  <li><strong>Contenido exclusivo</strong> para suscriptores</li>
                  <li><strong>Recursos descargables</strong> y herramientas prácticas</li>
                </ul>
              </div>

              <p style="font-size: 16px; line-height: 1.7; color: #333;">
                Mientras tanto, explora nuestros artículos más recientes:
              </p>
              
              <div style="text-align: center;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/blog" class="button">Explorar el blog</a>
              </div>

              <p style="margin-top: 30px; color: #666; font-size: 14px; line-height: 1.6; text-align: center;">
                Si tienes dudas o sugerencias, responde a este correo. ¡Nos encanta escuchar a nuestros lectores!
              </p>
            </div>
            <div class="footer">
              <p><strong>Eskemma</strong> - Comunicación Política Digital</p>
              <p style="margin: 10px 0; font-size: 12px;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/blog" style="color: #2D7A6E; text-decoration: none;">Visitar blog</a> | 
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/newsletter/unsubscribe?email=${encodeURIComponent(email)}" style="color: #999; text-decoration: none;">Cancelar suscripción</a>
              </p>
            </div>
          </div>
        </body>
      </html>
    `,
  };

  await transporter.sendMail(mailOptions);
  console.log(`📧 Email de bienvenida enviado a: ${email}`);
}