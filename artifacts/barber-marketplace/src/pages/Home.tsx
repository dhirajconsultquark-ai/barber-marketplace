import { Link } from "wouter";
import { Navbar } from "@/components/layout/Navbar";
import { ShopCard } from "@/components/ui/ShopCard";
import { useListShops } from "@workspace/api-client-react";
import { Search, MapPin, Calendar, Star, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const { data: shopsData, isLoading } = useListShops({ limit: 6 });

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-24 pb-32 lg:pt-36 lg:pb-40 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img 
            src={`${import.meta.env.BASE_URL}images/hero-bg.png`}
            alt="Premium Barbershop"
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/80 to-background" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl md:text-7xl font-serif font-bold tracking-tight mb-6">
              Master Your <span className="gold-text-gradient italic">Style</span>.
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
              Discover and book the finest barbers in your city. Premium grooming experiences tailored to the modern gentleman.
            </p>

            {/* Search Bar */}
            <div className="max-w-3xl mx-auto bg-card/80 backdrop-blur-xl border border-white/10 rounded-full p-2 flex flex-col sm:flex-row gap-2 shadow-2xl">
              <div className="flex-1 flex items-center px-4 bg-background/50 rounded-full border border-transparent focus-within:border-primary/50 transition-colors">
                <Search className="w-5 h-5 text-muted-foreground mr-3" />
                <input 
                  type="text" 
                  placeholder="Search for barbers, styles, or services..." 
                  className="w-full bg-transparent border-none py-4 text-foreground focus:outline-none placeholder:text-muted-foreground/60"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Link 
                href={`/shops${searchQuery ? `?search=${encodeURIComponent(searchQuery)}` : ''}`}
                className="px-8 py-4 rounded-full gold-gradient text-primary-foreground font-bold whitespace-nowrap hover:shadow-lg hover:shadow-primary/20 transition-all sm:w-auto w-full text-center"
              >
                Find Barber
              </Link>
            </div>
          </motion.div>

          {/* Features */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto"
          >
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-2xl bg-secondary border border-white/5 flex items-center justify-center mb-4 text-primary">
                <MapPin className="w-6 h-6" />
              </div>
              <h3 className="font-bold mb-2">Local Experts</h3>
              <p className="text-sm text-muted-foreground">Find top-rated professionals right in your neighborhood.</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-2xl bg-secondary border border-white/5 flex items-center justify-center mb-4 text-primary">
                <Calendar className="w-6 h-6" />
              </div>
              <h3 className="font-bold mb-2">Instant Booking</h3>
              <p className="text-sm text-muted-foreground">Secure your spot 24/7 without making a single phone call.</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-2xl bg-secondary border border-white/5 flex items-center justify-center mb-4 text-primary">
                <Star className="w-6 h-6" />
              </div>
              <h3 className="font-bold mb-2">Verified Reviews</h3>
              <p className="text-sm text-muted-foreground">Read genuine feedback from real clients before you book.</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Featured Shops Section */}
      <section className="py-24 bg-secondary/30 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">Premium <span className="text-primary italic">Barbershops</span></h2>
              <p className="text-muted-foreground">The highest-rated grooming destinations.</p>
            </div>
            <Link href="/shops" className="hidden md:flex items-center gap-2 text-primary font-medium hover:underline">
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-96 rounded-2xl bg-secondary animate-pulse border border-white/5"></div>
              ))}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {shopsData?.shops.map(shop => (
                  <ShopCard key={shop.id} shop={shop} />
                ))}
              </div>
              <div className="mt-12 text-center md:hidden">
                <Link href="/shops" className="inline-flex items-center gap-2 text-primary font-medium hover:underline">
                  View all barbershops <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </>
          )}
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 gold-gradient opacity-10"></div>
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <h2 className="text-4xl font-serif font-bold mb-6">Are you a Master Barber?</h2>
          <p className="text-xl text-muted-foreground mb-10">
            Join LuxeCuts to manage your bookings, showcase your portfolio, and grow your high-end clientele.
          </p>
          <Link 
            href="/register?role=barber"
            className="inline-block px-10 py-5 rounded-full bg-foreground text-background font-bold text-lg hover:scale-105 transition-transform duration-300"
          >
            Partner With Us
          </Link>
        </div>
      </section>
    </div>
  );
}
