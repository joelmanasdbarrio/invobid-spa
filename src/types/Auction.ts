import type { Invoice } from './Invoice'

export type Auction = {
  id: string;
  invoice: Invoice;
  startingPrice: number;
  endingPrice: number;
  discount: number;
  profitability: number;
  auctionDate: AuctionDate;
  status: AuctionStatus;
  lastCommunication?: string;
  pausedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string;
}

export type AuctionDate = {
  auctionDateStart: string;
  auctionDateEnd: string;
}

export enum AuctionStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  LIVE = 'live',
  PAUSED = 'paused',
  FINISHED = 'finished',
  CANCELLED = 'cancelled',
}
