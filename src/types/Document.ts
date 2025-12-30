export interface Document {
  id: string;
  title: string;
  filename: string;
  value: string;
  type: DocumentType;
}

export enum DocumentType {
  IDENTIFICATION = 'identification',
  INVOICE = 'invoice',
}
