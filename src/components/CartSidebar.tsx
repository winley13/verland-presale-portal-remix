import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag, CreditCard, Coins, Zap, ShieldCheck } from 'lucide-react';
import { Button } from './ui/button';
import { Separator } from './ui/separator';

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTiles: string[];
  onRemoveTile: (id: string) => void;
  onConfirmPurchase: () => void;
}

export const CartSidebar: React.FC<CartSidebarProps> = ({ 
  isOpen, 
  onClose, 
  selectedTiles, 
  onRemoveTile,
  onConfirmPurchase
}) => {
  const pricePerTile = 0.02;
  const totalPrice = selectedTiles.length * pricePerTile;
  const networkFee = 0.002;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
          />
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-zinc-950 border-l border-white/5 z-[101] flex flex-col"
          >
            <div className="p-6 flex items-center justify-between border-b border-white/5 bg-primary/5">
              <div className="flex items-center gap-3">
                <ShoppingBag className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-bold">Purchase Land</h2>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-white/5">
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <section className="space-y-4">
                <h3 className="text-sm font-semibold text-white/40 uppercase tracking-wider">Selected Parcels</h3>
                {selectedTiles.length === 0 ? (
                  <div className="text-center py-12 border-2 border-dashed border-white/5 rounded-2xl">
                    <p className="text-white/40">No land selected on map</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    {selectedTiles.map(id => (
                      <div key={id} className="p-3 bg-white/5 rounded-xl border border-white/5 flex items-center justify-between group">
                        <span className="text-xs font-mono text-white/60">ID: {id}</span>
                        <button 
                          onClick={() => onRemoveTile(id)}
                          className="text-white/20 hover:text-destructive transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              <Separator className="bg-white/5" />

              <section className="space-y-4">
                <h3 className="text-sm font-semibold text-white/40 uppercase tracking-wider">Payment Method</h3>
                <div className="grid grid-cols-3 gap-3">
                  <button className="flex flex-col items-center gap-2 p-4 bg-primary/10 border-2 border-primary rounded-2xl">
                    <Coins className="w-6 h-6 text-primary" />
                    <span className="text-xs font-bold">ETH</span>
                  </button>
                  <button className="flex flex-col items-center gap-2 p-4 bg-white/5 border-2 border-transparent hover:border-white/10 rounded-2xl grayscale">
                    <CreditCard className="w-6 h-6 text-white/40" />
                    <span className="text-xs font-bold text-white/40">CARD</span>
                  </button>
                  <button className="flex flex-col items-center gap-2 p-4 bg-white/5 border-2 border-transparent hover:border-white/10 rounded-2xl grayscale">
                    <Zap className="w-6 h-6 text-white/40" />
                    <span className="text-xs font-bold text-white/40">USDT</span>
                  </button>
                </div>
              </section>

              <section className="p-6 bg-primary/5 rounded-2xl border border-primary/20 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-white/60">Selected Tiles ({selectedTiles.length})</span>
                  <span className="font-bold">{totalPrice.toFixed(3)} ETH</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/60">Network Fee</span>
                  <span className="font-bold">~{networkFee} ETH</span>
                </div>
                <Separator className="bg-white/10" />
                <div className="flex justify-between items-center">
                  <span className="text-base font-bold text-primary">Total Price</span>
                  <span className="text-2xl font-black text-primary">{(totalPrice + networkFee).toFixed(3)} ETH</span>
                </div>
              </section>

              <div className="flex items-start gap-3 p-4 bg-zinc-900 rounded-xl">
                <ShieldCheck className="w-5 h-5 text-emerald-500 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-xs font-bold text-emerald-500">Secure Transaction</p>
                  <p className="text-[10px] text-white/40">Smart contract verified on mainnet. All purchases are final and minted as NFTs.</p>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-white/5 bg-zinc-950">
              <Button 
                disabled={selectedTiles.length === 0}
                onClick={onConfirmPurchase}
                className="relative overflow-hidden w-full h-16 bg-primary hover:bg-primary/90 text-black font-black text-lg rounded-2xl shadow-[0_0_30px_rgba(182,254,5,0.2)] hover:shadow-[0_0_50px_rgba(182,254,5,0.4)] transition-all duration-300 group"
              >
                <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-[-20deg]" />
                <span className="relative z-10 flex items-center justify-center gap-2">
                  <Zap className="w-5 h-5 fill-current" />
                  Confirm Land Purchase
                </span>
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
