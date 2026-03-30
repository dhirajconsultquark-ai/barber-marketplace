import { useState } from "react";
import { useLocation } from "wouter";
import { Navbar } from "@/components/layout/Navbar";
import { ShopCard } from "@/components/ui/ShopCard";
import { useListShops } from "@workspace/api-client-react";
import { Search, MapPin, SlidersHorizontal } from "lucide-react";
import { motion } from "framer-motion";

export default function ShopList() {
  const queryParams = new URLSearchParams(window.location.search);
  const initialSearch = queryParams.get('search') || "";
  
  const [search, setSearch] = useState(initialSearch);
  const [city, setCity] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearch);

  // Simple debounce
  useState(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(timer);
  }, [search]);

  const { data: shopsData, isLoading } = useListShops({
    search: debouncedSearch || undefined,
    city: city || undefined,
    limit: 50
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-12">
          <h1 className="text-4xl font-serif font-bold mb-4">Discover Barbershops</h1>
          <p className="text-muted-foreground text-lg">Find the perfect match for your style needs.</p>
        </div>

        {/* Filters */}
        <div className="glass-panel p-4 rounded-2xl mb-10 flex flex-col md:flex-row gap-4 relative z-20">
          <div className="flex-1 flex items-center px-4 bg-background rounded-xl border border-white/5 focus-within:border-primary/50 transition-colors">
            <Search className="w-5 h-5 text-muted-foreground mr-3" />
            <input 
              type="text" 
              placeholder="Search by name or style..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent border-none py-3 text-foreground focus:outline-none"
            />
          </div>
          
          <div className="md:w-1/3 flex items-center px-4 bg-background rounded-xl border border-white/5 focus-within:border-primary/50 transition-colors">
            <MapPin className="w-5 h-5 text-muted-foreground mr-3" />
            <input 
              type="text" 
              placeholder="City (e.g. New York)" 
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full bg-transparent border-none py-3 text-foreground focus:outline-none"
            />
          </div>
        </div>

        {/* Results */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-[400px] rounded-2xl bg-secondary animate-pulse border border-white/5"></div>
            ))}
          </div>
        ) : shopsData?.shops.length === 0 ? (
          <div className="text-center py-20 glass-panel rounded-3xl">
            <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4 text-muted-foreground">
              <Search className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-serif font-bold mb-2">No shops found</h3>
            <p className="text-muted-foreground">Try adjusting your search criteria or location.</p>
            <button 
              onClick={() => { setSearch(''); setCity(''); }}
              className="mt-6 text-primary hover:underline font-medium"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
          >
            {shopsData?.shops.map(shop => (
              <ShopCard key={shop.id} shop={shop} />
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
