
// Email template types
export type EmailTemplateType = 
  | 'welcome'
  | 'verification'
  | 'password-reset'
  | 'critical-error';

// Template data interfaces
export interface WelcomeTemplateData {
  recipientName: string;
}

export interface VerificationTemplateData {
  verificationLink: string;
}

export interface PasswordResetTemplateData {
  resetLink: string;
}

export interface CriticalErrorTemplateData {
  errorMessage: string;
}

// Template data type
export type EmailTemplateData = 
  | WelcomeTemplateData
  | VerificationTemplateData
  | PasswordResetTemplateData
  | CriticalErrorTemplateData;

// Email template functions
export function getWelcomeEmailTemplate(data: WelcomeTemplateData): { subject: string; html: string } {
  return {
    subject: "Welcome to FlowTechs!",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #1a56db; margin-bottom: 24px;">Welcome to FlowTechs!</h1>
        <p style="font-size: 16px; line-height: 1.5; color: #374151;">Hi ${data.recipientName},</p>
        <p style="font-size: 16px; line-height: 1.5; color: #374151;">
          Welcome to FlowTechs. We're excited to have you on board! 
          Start connecting your data sources and enjoy seamless data integration.
        </p>
        <div style="margin-top: 32px; padding-top: 16px; border-top: 1px solid #e5e7eb;">
          <p style="font-size: 14px; color: #6b7280;">
            This is an automated message from FlowTechs.
          </p>
        </div>
      </div>
    `
  };
}

export function getVerificationEmailTemplate(data: VerificationTemplateData): { subject: string; html: string } {
  return {
    subject: "Verify Your FlowTechs Account",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #1a56db; margin-bottom: 24px;">Verify Your FlowTechs Account</h1>
        <p style="font-size: 16px; line-height: 1.5; color: #374151;">
          Please verify your account by clicking the link below:
        </p>
        <p style="text-align: center; margin: 32px 0;">
          <a href="${data.verificationLink}" 
             style="background-color: #1a56db; color: white; padding: 12px 24px; 
                    text-decoration: none; border-radius: 4px; display: inline-block;">
            Verify Account
          </a>
        </p>
        <p style="font-size: 14px; line-height: 1.5; color: #6b7280;">
          If the button above doesn't work, copy and paste this link into your browser:
          <br>
          <a href="${data.verificationLink}" style="color: #1a56db; word-break: break-all;">
            ${data.verificationLink}
          </a>
        </p>
        <div style="margin-top: 32px; padding-top: 16px; border-top: 1px solid #e5e7eb;">
          <p style="font-size: 14px; color: #6b7280;">
            This is an automated message from FlowTechs.
          </p>
        </div>
      </div>
    `
  };
}

export function getPasswordResetEmailTemplate(data: PasswordResetTemplateData): { subject: string; html: string } {
  return {
    subject: "Reset Your FlowTechs Password",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #1a56db; margin-bottom: 24px;">Reset Your Password</h1>
        <p style="font-size: 16px; line-height: 1.5; color: #374151;">
          We received a request to reset your password. To reset your password, click the button below:
        </p>
        <p style="text-align: center; margin: 32px 0;">
          <a href="${data.resetLink}" 
             style="background-color: #1a56db; color: white; padding: 12px 24px; 
                    text-decoration: none; border-radius: 4px; display: inline-block;">
            Reset Password
          </a>
        </p>
        <p style="font-size: 14px; line-height: 1.5; color: #6b7280;">
          If the button above doesn't work, copy and paste this link into your browser:
          <br>
          <a href="${data.resetLink}" style="color: #1a56db; word-break: break-all;">
            ${data.resetLink}
          </a>
        </p>
        <p style="font-size: 14px; line-height: 1.5; color: #6b7280;">
          If you didn't request this password reset, you can safely ignore this email.
        </p>
        <div style="margin-top: 32px; padding-top: 16px; border-top: 1px solid #e5e7eb;">
          <p style="font-size: 14px; color: #6b7280;">
            This is an automated message from FlowTechs.
          </p>
        </div>
      </div>
    `
  };
}

export function getCriticalErrorEmailTemplate(data: CriticalErrorTemplateData): { subject: string; html: string } {
  return {
    subject: "Critical Error in Your FlowTechs Account",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #dc2626; margin-bottom: 24px;">Critical Error Detected</h1>
        <p style="font-size: 16px; line-height: 1.5; color: #374151;">
          A critical error has occurred in your FlowTechs account:
        </p>
        <div style="background-color: #fee2e2; border-left: 4px solid #dc2626; padding: 16px; margin: 16px 0; color: #991b1b;">
          ${data.errorMessage}
        </div>
        <p style="font-size: 16px; line-height: 1.5; color: #374151;">
          Please check your account immediately to resolve this issue.
        </p>
        <div style="margin-top: 32px; padding-top: 16px; border-top: 1px solid #e5e7eb;">
          <p style="font-size: 14px; color: #6b7280;">
            This is an automated message from FlowTechs.
          </p>
        </div>
      </div>
    `
  };
}

// Get email template based on type and data
export function getEmailTemplate(
  templateType: EmailTemplateType, 
  templateData: EmailTemplateData
): { subject: string; html: string } {
  switch (templateType) {
    case 'welcome':
      return getWelcomeEmailTemplate(templateData as WelcomeTemplateData);
    case 'verification':
      return getVerificationEmailTemplate(templateData as VerificationTemplateData);
    case 'password-reset':
      return getPasswordResetEmailTemplate(templateData as PasswordResetTemplateData);
    case 'critical-error':
      return getCriticalErrorEmailTemplate(templateData as CriticalErrorTemplateData);
    default:
      throw new Error(`Unknown email template type: ${templateType}`);
  }
}
