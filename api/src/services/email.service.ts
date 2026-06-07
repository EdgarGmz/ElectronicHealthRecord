import nodemailer from 'nodemailer';
import logger from '../utils/logger';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_PORT === '465',
  auth: {
    user: process.env.SMTP_USER || 'your-email@example.com',
    pass: process.env.SMTP_PASS || 'your-app-password',
  },
});

export class EmailService {
  private frontendUrl = process.env.FRONTEND_URL || (process.env.CORS_ORIGIN && process.env.CORS_ORIGIN !== '*' ? process.env.CORS_ORIGIN : 'http://localhost:5173');

  private async sendMail(to: string, subject: string, html: string, simulationLog: string) {
    logger.info(simulationLog);

    const resendApiKey = process.env.RESEND_API_KEY;
    if (resendApiKey) {
      try {
        const from = process.env.SMTP_FROM || 'onboarding@resend.dev';
        const response = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${resendApiKey}`,
          },
          body: JSON.stringify({
            from,
            to,
            subject,
            html,
          }),
        });

        if (response.ok) {
          logger.info(`Email sent via Resend to ${to}`);
          return;
        } else {
          const errText = await response.text();
          logger.error(`Resend API returned error for ${to}: ${response.status} - ${errText}`);
        }
      } catch (error) {
        logger.error(`Failed to send email via Resend to ${to}:`, error);
      }
    }

    // Fallback to SMTP if configured
    try {
      if (process.env.SMTP_USER && process.env.SMTP_USER !== 'your-email@example.com') {
        await transporter.sendMail({
          from: process.env.SMTP_FROM || 'noreply@ehr-system.com',
          to,
          subject,
          html,
        });
        logger.info(`Email sent via SMTP to ${to}`);
      }
    } catch (error) {
      logger.error(`Failed to send email via SMTP to ${to}:`, error);
    }
  }

  async sendConfirmationEmail(email: string, username: string, tempPass: string, token: string) {
    const confirmUrl = `${this.frontendUrl}/confirm-account?token=${token}`;
    const subject = 'Confirmación de cuenta - UT Care';
    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
          <h2 style="color: #2b6cb0;">¡Bienvenido a UT Care!</h2>
          <p>Se ha creado una cuenta para ti en el Sistema de Expediente Clínico Electrónico.</p>
          <p>Tus credenciales de acceso temporal son las siguientes:</p>
          <div style="background-color: #f7fafc; padding: 15px; border-radius: 5px; border: 1px solid #edf2f7; margin-bottom: 20px;">
            <p style="margin: 5px 0;"><strong>Usuario:</strong> ${username}</p>
            <p style="margin: 5px 0;"><strong>Contraseña temporal:</strong> ${tempPass}</p>
          </div>
          <p>Para confirmar tu cuenta y poder iniciar sesión, haz clic en el siguiente botón:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${confirmUrl}" style="background-color: #3182ce; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Confirmar Cuenta</a>
          </div>
          <p style="color: #718096; font-size: 12px;">Si el botón no funciona, copia y pega el siguiente enlace en tu navegador:</p>
          <p style="color: #718096; font-size: 12px; word-break: break-all;">${confirmUrl}</p>
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 30px 0;">
          <p style="color: #a0aec0; font-size: 12px;">Por seguridad, se te pedirá cambiar tu contraseña temporal en el primer inicio de sesión.</p>
        </div>
    `;
    const simulationLog = `[Email simulation] Confirmation email for ${username} (${email}). Link: ${confirmUrl}`;

    await this.sendMail(email, subject, html, simulationLog);
  }

  async sendPasswordResetEmail(email: string, username: string, token: string) {
    const resetUrl = `${this.frontendUrl}/reset-password?token=${token}`;
    const subject = 'Restablecer contraseña - UT Care';
    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
          <h2 style="color: #2b6cb0;">Restablecer Contraseña</h2>
          <p>Hola ${username},</p>
          <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta de UT Care.</p>
          <p>Para restablecer tu contraseña, haz clic en el siguiente botón. <strong>Este enlace es válido sólo por 15 minutos:</strong></p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #dd6b20; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Restablecer Contraseña</a>
          </div>
          <p style="color: #718096; font-size: 12px;">Si el botón no funciona, copia y pega el siguiente enlace en tu navegador:</p>
          <p style="color: #718096; font-size: 12px; word-break: break-all;">${resetUrl}</p>
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 30px 0;">
          <p style="color: #a0aec0; font-size: 12px;">Si tú no solicitaste este cambio, puedes ignorar este correo de forma segura.</p>
        </div>
    `;
    const simulationLog = `[Email simulation] Password reset email for ${username} (${email}). Link: ${resetUrl}`;

    await this.sendMail(email, subject, html, simulationLog);
  }

  async sendWaitingListNotification(email: string, firstName: string, department: string) {
    const deptName = department === 'psicologia' ? 'Psicología' : 'Enfermería';
    const subject = 'Espacio disponible - UT Care';
    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
          <h2 style="color: #2b6cb0;">Espacio Disponible en UT Care</h2>
          <p>Hola ${firstName},</p>
          <p>Te escribimos porque estás en nuestra lista de espera y se ha liberado un espacio en el departamento de <strong>${deptName}</strong>.</p>
          <p>Por favor, ponte en contacto con el departamento correspondiente o inicia sesión en el sistema para agendar tu cita lo antes posible.</p>
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 30px 0;">
          <p style="color: #a0aec0; font-size: 12px;">Este es un mensaje automático, por favor no respondas a este correo.</p>
        </div>
    `;
    const simulationLog = `[Email simulation] Waiting list release email for ${firstName} (${email}) in ${deptName}`;

    await this.sendMail(email, subject, html, simulationLog);
  }
}

export default new EmailService();
