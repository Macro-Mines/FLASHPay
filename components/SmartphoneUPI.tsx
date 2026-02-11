
import React, { useState } from 'react';
import { GlobalState, Transaction } from '../types';

interface Props {
  userWallet: GlobalState['userWallet'];
  onLoadMoney: (amount: number) => void;
  onSync: () => void;
}

const SmartphoneUPI: React.FC<Props> = ({ userWallet, onLoadMoney, onSync }) => {
  const [amount, setAmount] = useState<string>('');
  const [showHistory, setShowHistory] = useState(false);

  return (
    <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-[3rem] p-8 shadow-2xl relative overflow-hidden">
      {/* Phone Notch */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-950 rounded-b-2xl"></div>

      <div className="mt-6 flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-slate-400 text-sm">Hello, User</p>
            <h2 className="text-xl font-bold">Welcome back</h2>
          </div>
          <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700">
            <i className="fas fa-user"></i>
          </div>
        </div>

        {/* Balance Card */}
        <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
          <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
          <p className="text-indigo-100 text-xs uppercase tracking-widest mb-1">Watch Wallet Balance</p>
          <h3 className="text-3xl font-bold">₹{userWallet.balance.toFixed(2)}</h3>
          
          <div className="mt-4 pt-4 border-t border-white/20 flex justify-between items-center">
            <div>
              <p className="text-indigo-200 text-[10px] uppercase">Bank Balance</p>
              <p className="font-medium">₹{userWallet.phoneBalance.toLocaleString()}</p>
            </div>
            <div className="text-right">
              <p className="text-indigo-200 text-[10px] uppercase">Connected Device</p>
              <p className="font-medium text-xs"><i className="fas fa-bluetooth mr-1 text-blue-300"></i> FLASH Watch Pro</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1 space-y-2">
              <label className="text-xs text-slate-400 px-1">Amount (Max ₹500)</label>
              <input 
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="₹ 0.00"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-lg font-semibold"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={() => {
                onLoadMoney(Number(amount));
                setAmount('');
              }}
              className="bg-indigo-600 hover:bg-indigo-500 transition-colors py-3 rounded-xl font-semibold flex items-center justify-center gap-2"
            >
              <i className="fas fa-plus"></i> Load Watch
            </button>
            <button 
              onClick={onSync}
              className="bg-slate-800 hover:bg-slate-700 transition-colors py-3 rounded-xl font-semibold flex items-center justify-center gap-2"
            >
              <i className="fas fa-sync"></i> Sync Data
            </button>
          </div>
        </div>

        {/* Transactions list */}
        <div className="space-y-3">
          <div className="flex justify-between items-center px-1">
            <h4 className="font-semibold">Recent Transactions</h4>
            <button 
              onClick={() => setShowHistory(!showHistory)}
              className="text-xs text-indigo-400 hover:text-indigo-300"
            >
              {showHistory ? 'Hide' : 'View All'}
            </button>
          </div>
          
          <div className="max-h-48 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
            {userWallet.transactions.length === 0 ? (
              <p className="text-center text-slate-500 text-sm py-4">No transactions yet</p>
            ) : (
              (showHistory ? userWallet.transactions : userWallet.transactions.slice(0, 3)).map(tx => (
                <div key={tx.id} className="bg-slate-800/50 p-3 rounded-xl flex items-center justify-between border border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs ${tx.type === 'CREDIT' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                      <i className={`fas ${tx.type === 'CREDIT' ? 'fa-arrow-down' : 'fa-arrow-up'}`}></i>
                    </div>
                    <div>
                      <p className="text-sm font-medium">{tx.peer}</p>
                      <p className="text-[10px] text-slate-500">{new Date(tx.timestamp).toLocaleTimeString()}</p>
                    </div>
                  </div>
                  <p className={`font-bold ${tx.type === 'CREDIT' ? 'text-green-500' : 'text-slate-100'}`}>
                    {tx.type === 'CREDIT' ? '+' : '-'}₹{tx.amount}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Watch Indicator */}
        <div className="mt-2 bg-slate-950/50 border border-slate-800 rounded-xl p-3 flex items-center justify-between">
           <div className="flex items-center gap-2 text-xs text-slate-400">
              <i className="fas fa-shield-alt text-indigo-500"></i>
              <span>Secure Offline Limit: {5 - userWallet.offlineCount} left</span>
           </div>
           {userWallet.offlineCount > 0 && (
             <span className="text-[10px] bg-amber-500/20 text-amber-500 px-2 py-0.5 rounded-full">Requires Sync</span>
           )}
        </div>
      </div>
      
      {/* Home Indicator */}
      <div className="mt-8 flex justify-center">
        <div className="w-24 h-1 bg-slate-800 rounded-full"></div>
      </div>
    </div>
  );
};

export default SmartphoneUPI;
