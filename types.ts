
export enum AppMode {
  UPI = 'UPI',
  WATCH = 'WATCH',
  MERCHANT = 'MERCHANT'
}

export interface Transaction {
  id: string;
  amount: number;
  timestamp: number;
  type: 'CREDIT' | 'DEBIT';
  peer: string; // Merchant name or Phone number
}

export interface GlobalState {
  userWallet: {
    balance: number;
    phoneBalance: number;
    transactions: Transaction[];
    offlineCount: number;
    isActive: boolean;
  };
  merchantWallet: {
    balance: number;
    bankBalance: number;
    transactions: Transaction[];
    isActive: boolean;
  };
  pendingPaymentRequest: {
    from: string;
    amount: number;
    timestamp: number;
  } | null;
}
