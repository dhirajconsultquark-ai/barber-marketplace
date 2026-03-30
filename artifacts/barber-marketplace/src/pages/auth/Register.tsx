import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useRegister } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { Scissors, ArrowRight, Loader2, User, Building } from "lucide-react";
import { motion } from "framer-motion";

export default function Register() {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const register = useRegister();
  
  // Get role from URL if present
  const queryParams = new URLSearchParams(window.location.search);
  const initialRole = queryParams.get('role') === 'barber' ? 'barber' : 'customer';

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<'customer'|'barber'>(initialRole);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    register.mutate({ data: { name, email, password, role } }, {
      onSuccess: (user) => {
        toast({ title: "Account created!", description: "Welcome to LuxeCuts." });
        if (user.role === 'barber') setLocation('/barber/shop');
        else setLocation('/shops');
      },
      onError: (err: any) => {
        toast({ 
          title: "Registration failed", 
          description: err.message || "Please check your inputs", 
          variant: "destructive" 
        });
      }
    });
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-16 xl:px-24 bg-background py-12 overflow-y-auto">
        <Link href="/" className="flex items-center gap-3 mb-12 w-fit group">
          <div className="w-10 h-10 rounded-full gold-gradient flex items-center justify-center">
            <Scissors className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-serif text-2xl font-bold tracking-wide">
            LUXE<span className="text-primary">CUTS</span>
          </span>
        </Link>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-4xl font-serif font-bold mb-2">Join the Club</h1>
          <p className="text-muted-foreground mb-8">Create an account to book appointments or manage your shop.</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Role Selection */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <button
                type="button"
                onClick={() => setRole('customer')}
                className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${
                  role === 'customer' 
                    ? 'border-primary bg-primary/10 text-primary' 
                    : 'border-border bg-secondary text-muted-foreground hover:border-white/20'
                }`}
              >
                <User className="w-6 h-6" />
                <span className="font-medium">Client</span>
              </button>
              <button
                type="button"
                onClick={() => setRole('barber')}
                className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${
                  role === 'barber' 
                    ? 'border-primary bg-primary/10 text-primary' 
                    : 'border-border bg-secondary text-muted-foreground hover:border-white/20'
                }`}
              >
                <Building className="w-6 h-6" />
                <span className="font-medium">Barber</span>
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Full Name</label>
              <input 
                type="text" 
                required
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-secondary border border-border focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-foreground"
                placeholder="John Doe"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Email Address</label>
              <input 
                type="email" 
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-secondary border border-border focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-foreground"
                placeholder="john@example.com"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Password (min 6 characters)</label>
              <input 
                type="password" 
                required
                minLength={6}
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-secondary border border-border focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-foreground"
                placeholder="••••••••"
              />
            </div>

            <button 
              type="submit" 
              disabled={register.isPending}
              className="w-full py-4 rounded-xl gold-gradient text-primary-foreground font-bold shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all flex justify-center items-center gap-2 disabled:opacity-50 mt-4"
            >
              {register.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : "Create Account"}
              {!register.isPending && <ArrowRight className="w-5 h-5" />}
            </button>
          </form>

          <p className="mt-8 text-center text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="text-primary font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>

      {/* Right side - Image */}
      <div className="hidden lg:block w-1/2 relative bg-secondary">
        <img 
          src={`${import.meta.env.BASE_URL}images/barber-tools.png`}
          alt="Barber tools" 
          className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-overlay"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
      </div>
    </div>
  );
}
