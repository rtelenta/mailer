export interface TemplateRecord {
  id: string;
  userId: string;
  name: string;
  mjml: string;
  subject: string;
  fromName: string;
  replyTo: string | null;
  preheader: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface TemplateListItem {
  id: string;
  name: string;
  subject: string;
  fromName: string;
  replyTo: string | null;
  preheader: string | null;
  createdAt: Date;
}

export interface CreateTemplateInput {
  name: string;
  mjml: string;
  subject: string;
  fromName: string;
  replyTo?: string;
  preheader?: string;
}
