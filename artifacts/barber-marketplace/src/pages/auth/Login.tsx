import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useLogin } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { Scissors, ArrowRight, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export default function Login() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const login = useLogin();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login.mutate({ data: { email, password } }, {
      onSuccess: (user) => {
        toast({ title: "Welcome back!", description: "Successfully logged in." });
        if (user.role === 'admin') setLocation('/admin');
        else if (user.role === 'barber') setLocation('/barber/dashboard');
        else setLocation('/shops');
      },
      onError: (err: any) => {
        toast({ 
          title: "Login failed", 
          description: err.message || "Invalid credentials", 
          variant: "destructive" 
        });
      }
    });
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-16 xl:px-24 bg-background">
        <Link href="/" className="flex items-center gap-3 mb-16 w-fit group">
          <div className="w-10 h-10 rounded-full gold-gradient flex items-center justify-center">
            <Scissors className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-serif text-2xl font-bold tracking-wide">
            LUXE<span className="text-primary">CUTS</span>
          </span>
        </Link>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-4xl font-serif font-bold mb-2">Sign In</h1>
          <p className="text-muted-foreground mb-8">Enter your details to access your account.</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Email Address</label>
              <input 
                type="email" 
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-secondary border border-border focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-foreground"
                placeholder="gentleman@example.com"
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <label className="text-sm font-medium text-foreground">Password</label>
              </div>
              <input 
                type="password" 
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-secondary border border-border focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-foreground"
                placeholder="••••••••"
              />
            </div>

            <button 
              type="submit" 
              disabled={login.isPending}
              className="w-full py-4 rounded-xl gold-gradient text-primary-foreground font-bold shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all flex justify-center items-center gap-2 disabled:opacity-50"
            >
              {login.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sign In"}
              {!login.isPending && <ArrowRight className="w-5 h-5" />}
            </button>
          </form>

          <p className="mt-8 text-center text-muted-foreground">
            Don't have an account?{" "}
            <Link href="/register" className="text-primary font-medium hover:underline">
              Create one
            </Link>
          </p>
        </motion.div>
      </div>

      {/* Right side - Image */}
      <div className="hidden lg:block w-1/2 relative bg-secondary">
        {/* stock image of a premium barbershop interior */}
        <img 
          src="https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=1200&h=1600&fit=crop" 
          alt="Barbershop interior" 
          className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-overlay"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
      </div>
    </div>
  );
}
