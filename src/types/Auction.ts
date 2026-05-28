import type { Bid } from './Bid'
import type { Invoice } from './Invoice'

export type Auction = {
  id: string;
  invoice: Invoice;
  bids: Bid[];
  price: AuctionPrice;
  discount: AuctionDiscount;
  profitability: AuctionProfitability;
  date: AuctionDate;
  status: AuctionStatus;
  lastCommunication?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string;
}

export type AuctionPrice = {
  start: number;
  end?: number;
}

export type AuctionDiscount = {
  start: number;
  end?: number;
}

export type AuctionProfitability = {
  start: number;
  end?: number;
}

export type AuctionDate = {
  start?: string;
  end: string;
}

export enum AuctionStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  TRANSITIONING = 'transitioning',
  FINISHED = 'finished',
  CANCELLED = 'cancelled',
}
