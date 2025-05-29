export interface AlertRule {
  eventName: string;          // Name of the contract event to monitor
  condition?: (args: any[]) => boolean;  // Optional condition to check
  emailConfig: EmailConfig;   // Email notification configuration
}

export interface EmailConfig {
  from: string;             // Sender email address
  to: string[];             // List of email recipients
  subject: string;          // Email subject template
  body: string;             // Email body template
}

export interface AlertConfig {
  enabled: boolean;          // Whether alerting is enabled
  rules: AlertRule[];        // List of alert rules
  emailFrom: string;         // Sender email address
  smtpConfig: SmtpConfig;    // SMTP server configuration
  mockMode?: boolean;        // Whether to use mock mode for email sending
}

export interface SmtpConfig {
  host: string;             // SMTP server host
  port: number;             // SMTP server port
  secure: boolean;          // Use TLS
  auth: {
    user: string;           // SMTP username
    pass: string;           // SMTP password
  };
}
