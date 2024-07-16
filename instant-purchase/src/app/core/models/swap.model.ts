import { Blockchain } from './exhibition.model';
import { Payment } from './payment.model';

export enum SwapStatus {
  created = 'created',
  payment = 'payment',
  processing = 'processing',
  cancelled = 'cancelled',
  complete = 'complete',
  failed = 'failed',
}

export interface Swap {
  id: string;
  artworkID: string;
  seriesID: string;
  currency: string;
  artworkIndex: number;
  ownerAccount: string;
  fee: number;
  recipientAddress: string;
  status: string;
  contractName: string;
  contractAddress: string;
  token: string;
  expiredAt: string;
  createdAt: string;
  updatedAt: string;
  payment: Payment;
  blockchainType: Blockchain;
}
