import type {Document} from '@/types/Document.ts'
import type {BankAccount} from '@/types/BankAccount.ts'

export type Investor = {
  id: string;
  email: string;
  name: string;
  type: string;
  phoneNumber: string;
  companyName: string;
  investorType: InvestorType;
  status: InvestorStatus;
  isOptedInNotificationsEmail: boolean;
  isOptedInNotificationsSMS: boolean;
  documents: Array<Document>;
  bankAccount: BankAccount;
}

export enum InvestorType {
  INDIVIDUAL = 'individual',
  COMPANY = 'company'
}

export enum InvestorStatus {
  PENDING = 'pending',
  VERIFIED = 'verified',
  CORRECTION = 'correction',
  DENIED = 'denied'
}
