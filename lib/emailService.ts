// lib/emailService.ts
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },

  tls: {
    rejectUnauthorized: false,
  },
  debug: true,
  logger: true,
});

transporter.verify(function (error, success) {
  if (error) {
    console.error("❌ Error en configuración de email:", error);
  } else {
    console.log("✅ Servidor de email listo para enviar mensajes");
  }
});

/**
 * Email de verificación personalizado con nombre
 */
export async function sendVerificationEmail(
  email: string,
  name: string,
  verificationLink: string
) {
  const firstName = name.split(" ")[0];

  const mailOptions = {
    from: `"Eskemma - El Baúl de Fouché" <${process.env.GMAIL_USER}>`,
    to: email,
    subject: `${firstName}, confirma tu suscripción al Baúl de Fouché`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width,initial-scale=1">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #3C95C6 0%, #006988 100%); color: white; padding: 40px 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: white; padding: 40px 30px; border: 1px solid #F4F8FC; border-top: none; }
            .button { display: inline-block; background: #3C95C6; color: white !important; padding: 16px 40px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 25px 0; font-size: 16px; }
            .button:hover { background: #006988; }
            .footer { text-align: center; color: #666; font-size: 13px; margin-top: 30px; padding: 20px; }
            .highlight { background: #F9F8F8; border-left: 4px solid #3C95C6; padding: 15px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0; font-size: 28px;">¡Hola, ${firstName}!</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9;">Te damos la bienvenida al Baúl de Fouché</p>
            </div>
            <div class="content">
              <h2 style="color: #3C95C6; margin-top: 0;">Confirma tu suscripción</h2>
              
              <p style="font-size: 16px; line-height: 1.6; color: #333;">
                Gracias por tu interés en <strong>El Baúl de Fouché</strong>, nuestro newsletter de comunicación política y los secretos del poder contemporáneo.
              </p>

              <div class="highlight">
                <p style="margin: 0; font-size: 15px; color: #006988;">
                  <strong>Recibirás:</strong><br>
                  • Artículos sobre estrategia política y electoral<br>
                  • Análisis de datos y de opinión pública<br>
                  • Novedades sobre herramientas para tu proyecto político<br>
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
              <p><strong>Eskemma</strong> - El espacio digital para tu proyecto político</p>
              <p style="margin: 5px 0;">Si el botón no funciona, copia y pega el siguiente enlace:</p>
              <p style="font-size: 11px; word-break: break-all; color: #3C95C6;">${verificationLink}</p>
            </div>
          </div>
        </body>
      </html>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`📧 Email de verificación enviado a: ${email}`);
    console.log(`📬 Message ID: ${info.messageId}`);
    console.log(`✅ Response: ${info.response}`);
    return { success: true, messageId: info.messageId };
  } catch (error: any) {
    console.error(`❌ Error al enviar email a ${email}:`, error);
    console.error(`❌ Error detallado:`, error.message);
    throw error;
  }
}

/**
 * Email de bienvenida personalizado con nombre
 */
export async function sendWelcomeEmail(email: string, name: string) {
  const firstName = name.split(" ")[0];

  const mailOptions = {
    from: `"Eskemma - El Baúl de Fouché" <${process.env.GMAIL_USER}>`,
    to: email,
    subject: `¡Te damos la bienvenida, ${firstName}! Ya eres parte del Baúl de Fouché.`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width,initial-scale=1">
          <style>
            body { 
              margin: 0; 
              padding: 0; 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
            }
            .container { 
              max-width: 600px; 
              margin: 0 auto; 
              padding: 20px; 
            }
            .header { 
              background: linear-gradient(135deg, #3C95C6 0%, #006988 100%); 
              color: white; 
              padding: 40px 30px; 
              text-align: center; 
              border-radius: 10px 10px 0 0; 
            }
            .content { 
              background: white; 
              padding: 40px 30px; 
              border: 1px solid #F4F8FC; 
              border-top: none; 
            }
            .button { 
              display: inline-block; 
              background: #3C95C6; 
              color: white !important; 
              padding: 16px 40px; 
              text-decoration: none; 
              border-radius: 8px; 
              font-weight: 600; 
              margin: 25px 0; 
              font-size: 16px; 
            }
            .button:hover { 
              background: #006988; 
            }
            .footer { 
              text-align: center; 
              color: #666; 
              font-size: 13px; 
              margin-top: 20px;
              padding: 20px; 
            }
            .feature { 
              background: #F9F8F8; 
              border-radius: 8px; 
              padding: 20px; 
              margin: 15px 0; 
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0; font-size: 32px;">¡Te damos la bienvenida, ${firstName}!</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9; font-size: 18px;">Ya eres parte del Baúl de Fouché</p>
            </div>
            
            <div class="content">
              <h2 style="color: #3C95C6; margin-top: 0;">¡Gracias por unirte!</h2>
              
              <p style="font-size: 16px; line-height: 1.7; color: #333;">
                ${firstName}, nos emociona tenerte en nuestro Newsletter.
              </p>

              <div class="feature">
                <h3 style="color: #006988; margin-top: 0; font-size: 18px;">¿Qué puedes esperar?</h3>
                <ul style="color: #333; line-height: 1.8; padding-left: 20px; margin: 10px 0;">
                  <li><strong>Artículos quincenales</strong> sobre estrategia y comunicación política</li>
                  <li><strong>Análisis político y de opinión pública</strong> con datos y tendencias</li>  
                  <li>Novedades sobre <strong>recursos descargables</strong></li>  
                  <li><strong>Herramientas</strong> para tu proyecto político</li>                
                  <li><strong>Contenido exclusivo</strong> para suscriptores</li>                  
                </ul>
              </div>

              <p style="font-size: 16px; line-height: 1.7; color: #333; margin-bottom: 10px;">
                Mientras tanto, explora nuestros artículos más recientes:
              </p>
              
              <div style="text-align: center;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/public/blog" class="button">Explorar el blog</a>
              </div>

              <p style="margin-top: 20px; margin-bottom: 0; color: #666; font-size: 14px; line-height: 1.6; text-align: center;">
                Si tienes dudas, ${firstName}, responde a este correo.<br>
                ¡Nos encanta escuchar a nuestros lectores!
              </p>
            </div>
            
            <div class="footer">
              <p style="margin: 0 0 5px 0;"><strong>Eskemma</strong> - El ecosistema digital para tu proyecto político</p>
              <p style="margin: 5px 0 0 0; font-size: 12px;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/public/home" style="color: #3C95C6; text-decoration: none;">Ir a página de inicio</a> | 
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