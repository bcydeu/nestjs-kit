export interface EmailPayload {
  to: string[];
  subject: string;
  from?: string;
  html: string;
}
