import type { Debtor } from './Debtor'
import type { Document } from './Document'
import type { Investor } from './User'

export type Invoice = {
  id: string;
  invoiceId: string;
  sellerInvestor: Investor;
  buyerInvestor?: Investor;
  status: InvoiceStatus;
  lastCommunication?: string;
  document: Document;
  debtor: Debtor;
  amount: number;
  currency: Currency;
  dueDate: string;
  transactionFee: TransactionFee;
  rating?: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string;
}

export type TransactionFee = {
  sellerPercentage: number;
  buyerPercentage: number;
}

export enum InvoiceStatus {
  PENDING = 'pending',
  VERIFIED = 'verified',
  CORRECTION = 'correction',
  DENIED = 'denied'
}

export enum Currency {
  EUR = 'EUR',
  USD = 'USD',
}
