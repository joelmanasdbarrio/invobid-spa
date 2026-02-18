import type { Document } from './Document'
import type { Invoice } from './Invoice'
import type { Investor } from './User'

export type Debtor = {
  id: string;
  investor: Investor;
  email: string;
  phoneNumber: number;
  companyName: string;
  taxId: string;
  status: DebtorStatus;
  lastCommunication?: string;
  documents: Array<Document>;
  invoices: Array<Invoice>;
  createdAt: string;
  updatedAt: string;
  deletedAt: string;
}

export enum DebtorStatus {
  PENDING = 'pending',
  VERIFIED = 'verified',
  CORRECTION = 'correction',
  DENIED = 'denied'
}
