import type { BankAccount } from '@/types/BankAccount.ts'
import type { Document } from '@/types/Document.ts'

export type User = Admin | Investor

export type Admin = {
  id: string;
  email: string;
  name: string;
  type: UserType;
  createdAt: string;
  updatedAt: string;
  deletedAt: string;
}

export type Investor = {
  id: string;
  email: string;
  name: string;
  type: UserType;
  phoneNumber: string;
  companyName: string;
  investorType: InvestorType;
  lastCommunication: string;
  status: InvestorStatus;
  isOptedInNotificationsEmail: boolean;
  isOptedInNotificationsSMS: boolean;
  documents: Array<Document>;
  bankAccount: BankAccount;
  createdAt: string;
  updatedAt: string;
  deletedAt: string;
}

export enum UserType {
  ADMIN = 'admin',
  INVESTOR = 'investor'
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
