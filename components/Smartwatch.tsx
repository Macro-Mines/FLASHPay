
import React, { useState, useEffect, useRef } from 'react';
import { GlobalState } from '../types';

interface Props {
  userWallet: GlobalState['userWallet'];
  pendingRequest: GlobalState['pendingPaymentRequest'];
  isMobileConnected: boolean;
  onToggleActive: () => void;
  onProcessPayment: (approve: boolean) => void;
}

const Smartwatch: React.FC<Props> = ({ userWallet, pendingRequest, isMobileConnected, onToggleActive, onProcessPayment }) => {
  const [time, setTime] = useState(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }));
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || !pendingRequest) return;
    
    const touchEndX = e.changedTouches[0].clientX;
    const deltaX = touchEndX - touchStartX.current;
    
    // Threshold of 50px for a left swipe
    if (deltaX < -50) {
      onProcessPayment(false); // Cancel payment
    }
    
    touchStartX.current = null;
  };

  // Bluetooth icon blinks blue when connected to mobile, and green when dealing with a merchant request
  const bluetoothColorClass = pendingRequest ? 'text-green-400 blinking-green' : (isMobileConnected ? 'text-blue-400 animate-pulse' : 'text-slate-700');

  return (
    <div className="relative flex flex-col items-center">
      {/* Watch Strap Top */}
      <div className="w-24 h-48 bg-slate-800 rounded-t-3xl border-x border-t border-slate-700 mb-[-60px] shadow-lg"></div>

      {/* Watch Case */}
      <div className="relative z-10 w-72 h-72 rounded-full border-4 border-slate-700 bg-slate-900 shadow-[0_0_50px_rgba(0,0,0,0.8)] flex items-center justify-center p-2">
        {/* Watch Face Screen */}
        <div 
          className="watch-face relative w-full h-full overflow-hidden flex flex-col items-center justify-center p-6 text-center select-none"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          
          {/* Top Status Area */}
          <div className="absolute top-6 flex flex-col items-center gap-0.5">
            <div className={`transition-colors duration-500 ${bluetoothColorClass}`}>
              <i className="fab fa-bluetooth-b text-base"></i>
            </div>
            <div className="text-[10px] font-bold text-slate-300 tracking-wider">
              {time}
            </div>
          </div>

          {pendingRequest ? (
            <div className="animate-in zoom-in duration-300 flex flex-col items-center gap-2 w-full mt-6">
              <p className="text-[10px] text-slate-400 uppercase tracking-tighter">Request From</p>
              <h4 className="text-xs font-semibold truncate max-w-full mb-1">{pendingRequest.from}</h4>
              <div className="text-2xl font-bold text-indigo-400 mb-2">₹{pendingRequest.amount}</div>
              <p className="text-[8px] text-slate-500 uppercase mb-2">Swipe left to cancel</p>
              <div className="flex gap-4 mt-2">
                <button 
                  onClick={() => onProcessPayment(false)}
                  className="w-10 h-10 rounded-full bg-slate-800 hover:bg-red-500/20 text-red-500 border border-red-500/30 flex items-center justify-center transition-all"
                >
                  <i className="fas fa-times text-lg"></i>
                </button>
                <button 
                  onClick={() => onProcessPayment(true)}
                  className="w-10 h-10 rounded-full bg-indigo-600 hover:bg-green-500 shadow-lg shadow-indigo-600/20 text-white flex items-center justify-center transition-all"
                >
                  <i className="fas fa-check text-lg"></i>
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
