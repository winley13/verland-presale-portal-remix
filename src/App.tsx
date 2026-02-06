import { useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import MapComponent from './components/MapComponent';
import { Navbar } from './components/Navbar';
import { CartSidebar } from './components/CartSidebar';
import { useAppKitAccount } from '@reown/appkit/react';

function App() {
  const [selectedTiles, setSelectedTiles] = useState<string[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { isConnected } = useAppKitAccount();

  const handleTileSelect = useCallback((tiles: string[]) => {
    setSelectedTiles(tiles);
    if (tiles.length > 0) {
      // Optional: auto-open cart or show small hint
    }
  }, []);

  const handleRemoveTile = (id: string) => {
    setSelectedTiles(prev => prev.filter(t => t !== id));
  };

  const handleConfirmPurchase = async () => {
    if (!isConnected) {
      toast.error('Connect your wallet to participate in the presale', {
        style: {
          background: '#09090b',
          color: '#fff',
          border: '1px solid rgba(182, 254, 5, 0.2)',
        },
      });
      return;
    }

    const toastId = toast.loading('Waiting for wallet confirmation...', {
      style: {
        background: '#09090b',
        color: '#fff',
        border: '1px solid rgba(182, 254, 5, 0.2)',
      },
    });
    
    try {
      // Simulate blockchain delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.loading('Minting your Land NFT...', { id: toastId });
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      toast.success('Minting Successful! Welcome to Verland.', { 
        id: toastId,
        duration: 5000,
        icon: '🚀'
      });
      
      setSelectedTiles([]);
      setIsCartOpen(false);
    } catch (error) {
      toast.error('Minting failed. Please check your balance and try again.', { id: toastId });
    }
  };

  return (
    <div className="relative min-h-screen bg-background overflow-hidden selection:bg-primary selection:text-black">
      
      <Navbar 
        cartCount={selectedTiles.length} 
        onCartClick={() => setIsCartOpen(true)} 
      />

      <main className="w-full h-screen relative">
        <MapComponent 
          onTileSelect={handleTileSelect} 
          selectedTiles={selectedTiles} 
        />
        
        {/* Map HUD Elements */}
        <div className="absolute top-24 right-8 z-30 pointer-events-none">
          <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-4 space-y-4">
            <div className="flex items-center justify-between gap-8">
              <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Map Mode</span>
              <span className="text-[10px] font-bold text-primary uppercase">Presale</span>
            </div>
            <div className="w-full h-px bg-white/5" />
            <div className="space-y-1">
              <div className="flex justify-between items-center text-xs">
                <span className="text-white/40">Scale</span>
                <span className="text-white/80">1 : 500</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-white/40">Grid</span>
                <span className="text-white/80">10m x 10m</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Quick Selection Stats (Floating) */}
      {selectedTiles.length > 0 && !isCartOpen && (
        <div className="fixed bottom-24 right-8 p-6 bg-zinc-950/80 backdrop-blur-xl border border-primary/20 rounded-3xl shadow-2xl animate-slide-up z-40">
          <div className="flex items-center gap-6">
            <div>
              <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest">Selected Land</p>
              <p className="text-xl font-black text-primary">{selectedTiles.length} Tiles</p>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div>
              <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest">Subtotal</p>
              <p className="text-xl font-black text-white">{(selectedTiles.length * 0.02).toFixed(2)} ETH</p>
            </div>
            <button 
              onClick={() => setIsCartOpen(true)}
              className="relative overflow-hidden px-8 py-4 bg-primary text-black font-black rounded-2xl hover:scale-105 active:scale-95 transition-all duration-300 shadow-[0_0_40px_rgba(182,254,5,0.2)] hover:shadow-[0_0_60px_rgba(182,254,5,0.4)] group"
            >
              <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-[-20deg]" />
              <span className="relative z-10 flex items-center gap-2">
                Review Selection
                <div className="w-6 h-6 bg-black/10 rounded-full flex items-center justify-center text-[10px]">
                  {selectedTiles.length}
                </div>
              </span>
            </button>
          </div>
        </div>
      )}

      <CartSidebar 
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        selectedTiles={selectedTiles}
        onRemoveTile={handleRemoveTile}
        onConfirmPurchase={handleConfirmPurchase}
      />
      
      {/* Decorative Overlays */}
      <div className="fixed inset-0 pointer-events-none border-[12px] border-white/5 z-40" />
      <div className="fixed top-20 left-8 z-40 space-y-2">
        <div className="px-3 py-1 bg-primary text-black text-[10px] font-black uppercase tracking-tighter rounded-sm animate-pulse">Phase 1: Presale</div>
        <div className="px-3 py-1 bg-white/5 backdrop-blur-md text-white/60 text-[10px] font-bold uppercase tracking-tighter rounded-sm border border-white/5">Available: 8,421 / 10,000</div>
        {isConnected && (
          <div className="px-3 py-1 bg-emerald-500/10 backdrop-blur-md text-emerald-500 text-[10px] font-bold uppercase tracking-tighter rounded-sm border border-emerald-500/20 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Wallet Connected
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
