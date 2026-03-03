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
  MODELO_111 = 'modelo111',
  MODELO_303 = 'modelo303',
}
