import { useState } from "react";
import { useRoute, useLocation, Link } from "wouter";
import { Navbar } from "@/components/layout/Navbar";
import { useGetShop, useCreateBooking, useGetMe } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { Calendar as CalendarIcon, Clock, Scissors, CheckCircle, ArrowLeft } from "lucide-react";

export default function CreateBooking() {
  const [, params] = useRoute("/book/:shopId");
  const shopId = parseInt(params?.shopId || "0");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  // URL params for pre-selected service
  const queryParams = new URLSearchParams(window.location.search);
  const initialServiceId = queryParams.get('service') ? parseInt(queryParams.get('service')!) : null;

  const { data: user, isLoading: userLoading } = useGetMe({ query: { retry: false } });
  const { data: shop, isLoading: shopLoading } = useGetShop(shopId);
  const createBooking = useCreateBooking();

  const [serviceId, setServiceId] = useState<number | null>(initialServiceId);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [notes, setNotes] = useState("");

  if (userLoading || shopLoading) return <div className="min-h-screen bg-background animate-pulse"></div>;
  
  if (!user) {
    setLocation(`/login?redirect=/book/${shopId}`);
    return null;
  }

  if (user.role === 'barber' || user.role === 'admin') {
    return (
      <div className="min-h-screen bg-background pt-20 text-center">
        <h1 className="text-2xl mb-4">Only customers can book appointments.</h1>
        <Link href="/" className="text-primary hover:underline">Return home</Link>
      </div>
    );
  }

  if (!shop) return <div className="min-h-screen bg-background pt-20 text-center">Shop not found</div>;

  const selectedService = shop.services?.find(s => s.id === serviceId);
  const totalDuration = selectedService?.durationMinutes || 0;
  const totalPrice = selectedService?.price || 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceId || !date || !time) {
      toast({ title: "Incomplete", description: "Please select a service, date, and time.", variant: "destructive" });
      return;
    }

    // Combine date and time into ISO string
    const scheduledAt = new Date(`${date}T${time}`).toISOString();

    createBooking.mutate({
      data: {
        shopId,
        serviceId,
        scheduledAt,
        notes: notes || undefined
      }
    }, {
      onSuccess: () => {
        toast({ title: "Booking Confirmed", description: "Your appointment has been requested." });
        setLocation("/my-bookings");
      },
      onError: (err) => {
        toast({ title: "Error", description: err.message, variant: "destructive" });
      }
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link href={`/shops/${shopId}`} className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to {shop.name}
        </Link>

        <div className="glass-panel p-8 md:p-12 rounded-3xl">
          <h1 className="text-3xl md:text-4xl font-serif font-bold mb-2">Book Appointment</h1>
          <p className="text-muted-foreground mb-10">Select your service and preferred time at <strong className="text-foreground">{shop.name}</strong>.</p>

          <form onSubmit={handleSubmit} className="space-y-10">
            
            {/* Step 1: Service */}
            <section>
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2 border-b border-white/5 pb-2">
                <span className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm">1</span> 
                Select Service
              </h2>
              <div className="grid gap-4">
                {shop.services?.map(service => (
                  <label 
                    key={service.id}
                    className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex justify-between items-center ${
                      serviceId === service.id 
                        ? 'border-primary bg-primary/5' 
                        : 'border-white/5 bg-secondary/50 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${serviceId === service.id ? 'border-primary' : 'border-muted-foreground'}`}>
                        {serviceId === service.id && <div className="w-3 h-3 rounded-full bg-primary" />}
                      </div>
                      <div>
                        <div className="font-bold text-lg">{service.name}</div>
                        <div className="text-muted-foreground text-sm flex items-center gap-3 mt-1">
                          <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {service.durationMinutes} min</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-xl font-serif font-bold">${service.price}</div>
                    <input 
                      type="radio" 
                      name="service" 
                      value={service.id} 
                      className="hidden"
                      checked={serviceId === service.id}
                      onChange={() => setServiceId(service.id)}
                    />
                  </label>
                ))}
              </div>
            </section>

            {/* Step 2: Date & Time */}
            <section className={!serviceId ? 'opacity-50 pointer-events-none' : ''}>
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2 border-b border-white/5 pb-2">
                <span className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm">2</span> 
                Select Date & Time
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Date</label>
                  <input 
                    type="date" 
                    required
                    min={new Date().toISOString().split('T')[0]}
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-secondary border border-white/10 rounded-xl px-4 py-3 text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
                    style={{ colorScheme: 'dark' }}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Time</label>
                  <input 
                    type="time" 
                    required
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full bg-secondary border border-white/10 rounded-xl px-4 py-3 text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
                    style={{ colorScheme: 'dark' }}
                  />
                </div>
              </div>
            </section>

            {/* Step 3: Details */}
            <section className={!date || !time ? 'opacity-50 pointer-events-none' : ''}>
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2 border-b border-white/5 pb-2">
                <span className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm">3</span> 
                Additional Notes
              </h2>
              <textarea 
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Any special requests or details your barber should know?"
                className="w-full bg-secondary border border-white/10 rounded-xl p-4 text-foreground focus:ring-2 focus:ring-primary focus:outline-none min-h-[100px]"
              />
            </section>

            {/* Summary & Submit */}
            <div className="mt-10 bg-background/50 rounded-2xl p-6 border border-white/5">
              <div className="flex justify-between items-end mb-6">
                <div>
                  <p className="text-muted-foreground text-sm mb-1">Total Due at Shop</p>
                  <p className="text-3xl font-serif font-bold text-primary">${totalPrice}</p>
                </div>
                <div className="text-right text-sm text-muted-foreground">
                  <p>{totalDuration} mins estimated</p>
                </div>
              </div>
              
              <button 
                type="submit"
                disabled={createBooking.isPending || !serviceId || !date || !time}
                className="w-full py-4 rounded-xl gold-gradient text-primary-foreground font-bold shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all flex justify-center items-center gap-2 disabled:opacity-50"
              >
                {createBooking.isPending ? "Processing..." : "Confirm Booking"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
