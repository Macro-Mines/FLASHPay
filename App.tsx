
import React, { useState, useEffect } from 'react';
import { AppMode, GlobalState, Transaction } from './types';
import SmartphoneUPI from './components/SmartphoneUPI';
import Smartwatch from './components/Smartwatch';
import MerchantApp from './components/MerchantApp';

const STORAGE_KEY = 'flashpay_prototype_state';

const initialState: GlobalState = {
  userWallet: {
    balance: 0,
    phoneBalance: 10000,
    transactions: [],
    pendingSync: [],
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
  connectivity: {
    isBluetoothOn: false,
    isWifiOn: false,
  }
};

const App: React.FC = () => {
  const [activeMode, setActiveMode] = useState<AppMode>(AppMode.UPI);
  const [state, setState] = useState<GlobalState>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : initialState;
  });

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

  const setConnectivity = (type: 'bluetooth' | 'wifi', value: boolean) => {
    setState(prev => ({
      ...prev,
      connectivity: {
        ...prev.connectivity,
        [type === 'bluetooth' ? 'isBluetoothOn' : 'isWifiOn']: value
      }
    }));
  };

  const loadWatchWallet = (amount: number) => {
    if (!state.connectivity.isWifiOn) return alert("Please turn on Wi-Fi to connect to bank server");
    if (!state.connectivity.isBluetoothOn) return alert("Please connect Watch via Bluetooth to transfer funds");
    if (amount <= 0 || amount > 500) return alert("Amount must be between 1 and 500");
    if (state.userWallet.balance + amount > 500) return alert("Watch wallet limit is ₹500");
    if (state.userWallet.phoneBalance < amount) return alert("Insufficient bank balance");

    const txId = `TXN-LOAD-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    const tx: Transaction = {
      id: txId,
      amount: amount,
      timestamp: Date.now(),
      type: 'CREDIT',
      peer: 'Primary Bank',
    };

    setState(prev => ({
      ...prev,
      userWallet: {
        ...prev.userWallet,
        balance: prev.userWallet.balance + amount,
        phoneBalance: prev.userWallet.phoneBalance - amount,
        transactions: [tx, ...prev.userWallet.transactions],
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
    setActiveMode(AppMode.WATCH);
  };

  const processPayment = (approve: boolean) => {
    if (!approve) {
      setState(prev => ({ ...prev, pendingPaymentRequest: null }));
      return;
    }

    const request = state.pendingPaymentRequest;
    if (!request) return;

    // BUSINESS RULES VALIDATION
    if (!state.userWallet.isActive) {
      return alert("Watch is deactivated. Tap the center dot to activate.");
    }
    
    if (state.userWallet.balance < request.amount) {
      return alert(`Insufficient Funds!\n\nYour balance: ₹${state.userWallet.balance.toFixed(2)}\nRequired: ₹${request.amount.toFixed(2)}`);
    }
    
    if (state.userWallet.offlineCount >= 5) {
      return alert("Offline Limit Reached!\n\nYou have completed 5 offline transactions. Please sync with your FLASHPay UPI app to continue.");
    }

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
        pendingSync: [tx, ...prev.userWallet.pendingSync],
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
    if (!state.connectivity.isBluetoothOn) return alert("Connect Watch via Bluetooth to sync data");
    
    setState(prev => ({
      ...prev,
      userWallet: {
        ...prev.userWallet,
        transactions: [...prev.userWallet.pendingSync, ...prev.userWallet.transactions],
        pendingSync: [],
        offlineCount: 0,
      }
    }));
    alert("Synced with Phone successfully. Offline counter reset.");
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
          <button onClick={() => setActiveMode(AppMode.UPI)} className={`px-4 py-2 rounded-lg transition-all ${activeMode === AppMode.UPI ? 'bg-indigo-600 shadow-lg' : 'hover:bg-slate-800'}`}>
            <i className="fas fa-mobile-alt mr-2"></i> UPI App
          </button>
          <button onClick={() => setActiveMode(AppMode.WATCH)} className={`px-4 py-2 rounded-lg transition-all ${activeMode === AppMode.WATCH ? 'bg-indigo-600 shadow-lg' : 'hover:bg-slate-800'}`}>
            <i className="fas fa-clock mr-2"></i> Watch
          </button>
          <button onClick={() => setActiveMode(AppMode.MERCHANT)} className={`px-4 py-2 rounded-lg transition-all ${activeMode === AppMode.MERCHANT ? 'bg-indigo-600 shadow-lg' : 'hover:bg-slate-800'}`}>
            <i className="fas fa-store mr-2"></i> Merchant
          </button>
        </nav>
      </header>

      <main className="w-full flex-1 flex flex-col items-center justify-center gap-8 animate-in fade-in duration-500">
        {activeMode === AppMode.UPI && (
          <SmartphoneUPI 
            userWallet={state.userWallet} 
            connectivity={state.connectivity}
            onLoadMoney={loadWatchWallet} 
            onSync={syncWatch}
            onToggleConnectivity={setConnectivity}
          />
        )}
        
        {activeMode === AppMode.WATCH && (
          <Smartwatch 
            userWallet={state.userWallet} 
            pendingRequest={state.pendingPaymentRequest}
            isMobileConnected={state.connectivity.isBluetoothOn}
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
    </div>
  );
};

export default App;
