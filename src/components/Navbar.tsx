import React from 'react';
import { useAppKit, useAppKitAccount } from '@reown/appkit/react';
import { Wallet, Menu, Search, ShoppingCart, Globe } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

interface NavbarProps {
  cartCount: number;
  onCartClick: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ cartCount, onCartClick }) => {
  const { open } = useAppKit();
  const { address, isConnected } = useAppKitAccount();

  return (
    <nav className="fixed top-0 left-0 right-0 h-16 bg-background/80 backdrop-blur-md border-b border-white/5 z-50 flex items-center justify-between px-6">
      <div className="flex items-center gap-8">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Globe className="w-5 h-5 text-black" />
          </div>
          <span className="text-xl font-bold tracking-tighter uppercase">
            VER<span className="text-primary">LAND</span>
          </span>
        </div>
        
        <div className="hidden md:flex items-center gap-6 text-sm font-medium text-white/60">
          <a href="#" className="hover:text-primary transition-colors">Explorer</a>
          <a href="#" className="hover:text-primary transition-colors">Marketplace</a>
          <a href="#" className="hover:text-primary transition-colors">Whitepaper</a>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative group hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 group-focus-within:text-primary transition-colors" />
          <input 
            type="text" 
            placeholder="Search coordinates..." 
            className="h-10 w-64 bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 text-sm focus:outline-none focus:border-primary/50 transition-all"
          />
        </div>

        <Button 
          variant="outline" 
          size="icon" 
          className="relative rounded-xl border-white/10 hover:border-primary/50 hover:bg-primary/5"
          onClick={onCartClick}
        >
          <ShoppingCart className="w-5 h-5" />
          {cartCount > 0 && (
            <Badge className="absolute -top-2 -right-2 px-1.5 min-w-[20px] h-5 bg-primary text-black hover:bg-primary border-2 border-background font-bold">
              {cartCount}
            </Badge>
          )}
        </Button>

        <Button 
          onClick={() => {
            console.log('Opening wallet modal...');
            open();
          }} 
          className="relative overflow-hidden bg-primary hover:bg-primary/90 text-black font-black rounded-xl px-6 gap-2 group transition-all duration-300 hover:scale-[1.05] active:scale-[0.95] shadow-[0_0_20px_rgba(182,254,5,0.2)] hover:shadow-[0_0_40px_rgba(182,254,5,0.4)]"
        >
          <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500 skew-x-[-20deg]" />
          <Wallet className="w-4 h-4 relative z-10" />
          <span className="relative z-10">
            {isConnected ? `${address?.slice(0, 6)}...${address?.slice(-4)}` : 'Connect Wallet'}
          </span>
        </Button>
        
        <Button variant="ghost" size="icon" className="md:hidden text-white/60">
          <Menu className="w-6 h-6" />
        </Button>
      </div>
    </nav>
  );
};
