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
  TRANSITIONING = 'transitioning',
  FINISHED = 'finished',
  CANCELLED = 'cancelled',
}
