
import React, { useState, useEffect, useCallback } from 'react';
import { AppMode, GlobalState, Transaction } from './types';
import SmartphoneUPI from './components/SmartphoneUPI';
import Smartwatch from './components/Smartwatch';
import MerchantApp from './components/MerchantApp';

const STORAGE_KEY = 'flashpay_prototype_state';

const initialState: GlobalState = {
  userWallet: {
    balance: 0,
    phoneBalance: 10000, // Starting demo bank balance
    transactions: [],
    offlineCount: 0,
    isActive: true,
  },
  merchantWallet: {
    balance: 0,
    bankBalance: 0,
    transactions: [],
    isActive: true,
  },
  pendingPaymentRequest: null,
};

const App: React.FC = () => {
  const [activeMode, setActiveMode] = useState<AppMode>(AppMode.UPI);
  const [state, setState] = useState<GlobalState>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : initialState;
  });

  // Persist state
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const toggleUserActive = () => {
    setState(prev => ({
      ...prev,
      userWallet: { ...prev.userWallet, isActive: !prev.userWallet.isActive }
    }));
  };

  const toggleMerchantActive = () => {
    setState(prev => ({
      ...prev,
      merchantWallet: { ...prev.merchantWallet, isActive: !prev.merchantWallet.isActive }
    }));
  };

  const loadWatchWallet = (amount: number) => {
    if (amount <= 0 || amount > 500) return alert("Amount must be between 1 and 500");
    if (state.userWallet.balance + amount > 500) return alert("Watch wallet limit is ₹500");
    if (state.userWallet.phoneBalance < amount) return alert("Insufficient bank balance");

    setState(prev => ({
      ...prev,
      userWallet: {
        ...prev.userWallet,
        balance: prev.userWallet.balance + amount,
        phoneBalance: prev.userWallet.phoneBalance - amount,
      }
    }));
  };

  const requestPayment = (amount: number) => {
    if (!state.merchantWallet.isActive) return alert("Merchant terminal is inactive");
    if (amount > 200) return alert("Single transaction limit is ₹200");
    
    setState(prev => ({
      ...prev,
      pendingPaymentRequest: {
        from: "Local Merchant",
        amount,
        timestamp: Date.now()
      }
    }));
    setActiveMode(AppMode.WATCH); // Auto-switch for demo flow
  };

  const processPayment = (approve: boolean) => {
    if (!approve) {
      setState(prev => ({ ...prev, pendingPaymentRequest: null }));
      return;
    }

    const request = state.pendingPaymentRequest;
    if (!request) return;

    if (!state.userWallet.isActive) return alert("Watch is deactivated!");
    if (state.userWallet.balance < request.amount) return alert("Insufficient watch balance");
    if (state.userWallet.offlineCount >= 5) return alert("Offline limit reached. Sync with phone.");

    const txId = `TXN-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    const tx: Transaction = {
      id: txId,
      amount: request.amount,
      timestamp: Date.now(),
      type: 'DEBIT',
      peer: request.from,
    };

    const merchantTx: Transaction = {
      ...tx,
      type: 'CREDIT',
      peer: 'FLASHPay User'
    };

    setState(prev => ({
      ...prev,
      userWallet: {
        ...prev.userWallet,
        balance: prev.userWallet.balance - request.amount,
        transactions: [tx, ...prev.userWallet.transactions],
        offlineCount: prev.userWallet.offlineCount + 1,
      },
      merchantWallet: {
        ...prev.merchantWallet,
        balance: prev.merchantWallet.balance + request.amount,
        transactions: [merchantTx, ...prev.merchantWallet.transactions],
      },
      pendingPaymentRequest: null
    }));
    
    alert("Payment Successful!");
  };

  const syncWatch = () => {
    setState(prev => ({
      ...prev,
      userWallet: {
        ...prev.userWallet,
        offlineCount: 0,
      }
    }));
    alert("Synced with Phone successfully.");
  };

  const withdrawMerchant = () => {
    const amount = state.merchantWallet.balance;
    if (amount <= 0) return alert("No funds to withdraw");
    
    setState(prev => ({
      ...prev,
      merchantWallet: {
        ...prev.merchantWallet,
        balance: 0,
        bankBalance: prev.merchantWallet.bankBalance + amount,
      }
    }));
    alert(`₹${amount} withdrawn to bank account.`);
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-slate-950 text-slate-100 p-4 md:p-8">
      <header className="w-full max-w-6xl flex justify-between items-center mb-8 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
            <i className="fas fa-bolt text-white text-xl"></i>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">FLASH<span className="text-indigo-400">Pay</span></h1>
        </div>
        
        <nav className="flex gap-2 bg-slate-900 p-1 rounded-xl">
          <button 
            onClick={() => setActiveMode(AppMode.UPI)}
            className={`px-4 py-2 rounded-lg transition-all ${activeMode === AppMode.UPI ? 'bg-indigo-600 shadow-lg' : 'hover:bg-slate-800'}`}
          >
            <i className="fas fa-mobile-alt mr-2"></i> UPI App
          </button>
          <button 
            onClick={() => setActiveMode(AppMode.WATCH)}
            className={`px-4 py-2 rounded-lg transition-all ${activeMode === AppMode.WATCH ? 'bg-indigo-600 shadow-lg' : 'hover:bg-slate-800'}`}
          >
            <i className="fas fa-clock mr-2"></i> Watch
          </button>
          <button 
            onClick={() => setActiveMode(AppMode.MERCHANT)}
            className={`px-4 py-2 rounded-lg transition-all ${activeMode === AppMode.MERCHANT ? 'bg-indigo-600 shadow-lg' : 'hover:bg-slate-800'}`}
          >
            <i className="fas fa-store mr-2"></i> Merchant
          </button>
        </nav>
      </header>

      <main className="w-full flex-1 flex flex-col items-center justify-center gap-8 animate-in fade-in duration-500">
        {activeMode === AppMode.UPI && (
          <SmartphoneUPI 
            userWallet={state.userWallet} 
            onLoadMoney={loadWatchWallet} 
            onSync={syncWatch}
          />
        )}
        
        {activeMode === AppMode.WATCH && (
          <Smartwatch 
            userWallet={state.userWallet} 
            pendingRequest={state.pendingPaymentRequest}
            onToggleActive={toggleUserActive}
            onProcessPayment={processPayment}
          />
        )}

        {activeMode === AppMode.MERCHANT && (
          <MerchantApp 
            wallet={state.merchantWallet}
            onRequestPayment={requestPayment}
            onToggleActive={toggleMerchantActive}
            onWithdraw={withdrawMerchant}
          />
        )}
      </main>

      <footer className="w-full max-w-4xl text-center mt-8 text-slate-500 text-sm">
        <p>FLASHPay POC Prototype - Micro-payments up to ₹500. Offline transaction limit: 5</p>
      </footer>
    </div>
  );
};

export default App;
