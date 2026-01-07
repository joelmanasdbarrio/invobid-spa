export interface Document {
  id: string;
  title: string;
  filename: string;
  value: string;
  type: DocumentType;
  createdAt: string;
  updatedAt: string;
}

export enum DocumentType {
  IDENTIFICATION = 'identification',
  INVOICE = 'invoice',
}
