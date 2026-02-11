
import React from 'react';
import { GlobalState } from '../types';

interface Props {
  userWallet: GlobalState['userWallet'];
  pendingRequest: GlobalState['pendingPaymentRequest'];
  onToggleActive: () => void;
  onProcessPayment: (approve: boolean) => void;
}

const Smartwatch: React.FC<Props> = ({ userWallet, pendingRequest, onToggleActive, onProcessPayment }) => {
  return (
    <div className="relative flex flex-col items-center">
      {/* Watch Strap Top */}
      <div className="w-24 h-48 bg-slate-800 rounded-t-3xl border-x border-t border-slate-700 mb-[-60px] shadow-lg"></div>

      {/* Watch Case */}
      <div className="relative z-10 w-72 h-72 rounded-full border-4 border-slate-700 bg-slate-900 shadow-[0_0_50px_rgba(0,0,0,0.8)] flex items-center justify-center p-2">
        {/* Watch Face Screen */}
        <div className="watch-face relative w-full h-full overflow-hidden flex flex-col items-center justify-center p-6 text-center">
          
          {/* Bluetooth Icon */}
          <div className="absolute top-8 text-blue-400 animate-pulse text-xs">
            <i className="fas fa-bluetooth"></i>
          </div>

          {pendingRequest ? (
            <div className="animate-in zoom-in duration-300 flex flex-col items-center gap-2 w-full">
              <p className="text-xs text-slate-400 uppercase tracking-tighter">Request From</p>
              <h4 className="text-sm font-semibold truncate max-w-full mb-1">{pendingRequest.from}</h4>
              <div className="text-3xl font-bold text-indigo-400 mb-2">₹{pendingRequest.amount}</div>
              <div className="flex gap-4 mt-2">
                <button 
                  onClick={() => onProcessPayment(false)}
                  className="w-12 h-12 rounded-full bg-slate-800 hover:bg-red-500/20 text-red-500 border border-red-500/30 flex items-center justify-center transition-all"
                >
                  <i className="fas fa-times text-xl"></i>
                </button>
                <button 
                  onClick={() => onProcessPayment(true)}
                  className="w-12 h-12 rounded-full bg-indigo-600 hover:bg-green-500 shadow-lg shadow-indigo-600/20 text-white flex items-center justify-center transition-all"
                >
                  <i className="fas fa-check text-xl"></i>
                </button>
              </div>
            </div>
          ) : (
            <>
              <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em] mb-1">Flash Wallet</p>
              <h3 className="text-3xl font-bold mb-1">₹{userWallet.balance.toFixed(0)}</h3>
              <p className="text-[10px] text-slate-400 mb-4">{userWallet.isActive ? 'READY' : 'INACTIVE'}</p>
              
              {/* Central Blinking Dot Button */}
              <button 
                onClick={onToggleActive}
                className={`w-6 h-6 rounded-full flex items-center justify-center transition-all active:scale-90 ${userWallet.isActive ? 'blinking-green bg-green-500' : 'blinking-red bg-red-500'}`}
              >
                <div className="w-2 h-2 rounded-full bg-white"></div>
              </button>

              <div className="absolute bottom-10 flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <div 
                    key={i} 
                    className={`w-1.5 h-1.5 rounded-full ${i < userWallet.offlineCount ? 'bg-indigo-500' : 'bg-slate-700'}`}
                  ></div>
                ))}
              </div>
              <p className="absolute bottom-6 text-[8px] text-slate-600 uppercase">Offline Tokens Used</p>
            </>
          )}

          {/* Decorative Ring */}
          <div className="absolute inset-0 border border-slate-800/50 rounded-full pointer-events-none m-4"></div>
        </div>

        {/* Physical Crown */}
        <div className="absolute right-[-14px] top-1/2 -translate-y-1/2 w-4 h-10 bg-slate-700 rounded-r-lg border-y border-r border-slate-600"></div>
      </div>

      {/* Watch Strap Bottom */}
      <div className="w-24 h-48 bg-slate-800 rounded-b-3xl border-x border-b border-slate-700 mt-[-60px] shadow-lg"></div>
    </div>
  );
};

export default Smartwatch;
