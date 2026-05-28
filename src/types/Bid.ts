import type { Auction } from './Auction'
import type { Investor } from './User'

export type Bid = {
  id: string;
  auction?: Auction;
  investor?: Investor;
  amount: number;
  discount: number;
  profitability: number;
  createdAt: string;
}
