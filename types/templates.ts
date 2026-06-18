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
  role: "owner" | "collaborator";
}

export interface TemplateListItem {
  id: string;
  name: string;
  subject: string;
  fromName: string;
  replyTo: string | null;
  preheader: string | null;
  createdAt: Date;
  role: "owner" | "collaborator";
}

export interface TemplateCollaborator {
  userId: string;
  email: string;
  name: string;
}

export interface AddShareInput {
  email: string;
}

export interface UpdateTemplateInput {
  name?: string;
  mjml?: string;
  subject?: string;
  fromName?: string;
  replyTo?: string | null;
  preheader?: string | null;
}

export interface CreateTemplateInput {
  name: string;
  mjml: string;
  subject: string;
  fromName: string;
  replyTo?: string;
  preheader?: string;
}
