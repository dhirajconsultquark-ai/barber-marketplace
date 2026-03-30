import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Navbar } from "@/components/layout/Navbar";
import { useGetMyShop, useCreateShop, useUpdateShop } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export default function ShopForm() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const { data: myShop, isLoading, refetch } = useGetMyShop({ 
    query: { retry: false }
  });
  
  const createShop = useCreateShop();
  const updateShop = useUpdateShop();

  const isEditing = !!myShop;

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    address: "",
    city: "",
    phone: "",
    imageUrl: ""
  });

  useEffect(() => {
    if (myShop) {
      setFormData({
        name: myShop.name,
        description: myShop.description,
        address: myShop.address,
        city: myShop.city,
        phone: myShop.phone,
        imageUrl: myShop.imageUrl || ""
      });
    }
  }, [myShop]);

  if (isLoading) return <div className="min-h-screen bg-background"></div>;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const payload = {
      ...formData,
      imageUrl: formData.imageUrl || null
    };

    if (isEditing) {
      updateShop.mutate({ shopId: myShop.id, data: payload }, {
        onSuccess: () => {
          toast({ title: "Updated", description: "Shop profile updated." });
          refetch();
          setLocation('/barber/dashboard');
        },
        onError: (err) => toast({ title: "Error", description: err.message, variant: "destructive" })
      });
    } else {
      createShop.mutate({ data: payload }, {
        onSuccess: () => {
          toast({ title: "Created", description: "Shop created successfully. Awaiting admin approval." });
          refetch();
          setLocation('/barber/dashboard');
        },
        onError: (err) => toast({ title: "Error", description: err.message, variant: "destructive" })
      });
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-serif font-bold mb-2">
          {isEditing ? 'Edit Shop Profile' : 'Set Up Your Shop'}
        </h1>
        <p className="text-muted-foreground mb-8">
          {isEditing ? 'Update your details to attract more clients.' : 'Provide details about your barbershop to start accepting bookings.'}
        </p>

        <form onSubmit={handleSubmit} className="glass-panel p-8 rounded-3xl space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Shop Name *</label>
            <input 
              required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
              className="w-full bg-secondary border border-white/5 rounded-xl px-4 py-3 text-foreground focus:ring-1 focus:ring-primary focus:outline-none"
              placeholder="The Gentleman's Lounge"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Description *</label>
            <textarea 
              required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}
              className="w-full bg-secondary border border-white/5 rounded-xl p-4 text-foreground focus:ring-1 focus:ring-primary focus:outline-none min-h-[120px]"
              placeholder="Tell clients what makes your shop special..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Address *</label>
              <input 
                required value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})}
                className="w-full bg-secondary border border-white/5 rounded-xl px-4 py-3 text-foreground focus:ring-1 focus:ring-primary focus:outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">City *</label>
              <input 
                required value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})}
                className="w-full bg-secondary border border-white/5 rounded-xl px-4 py-3 text-foreground focus:ring-1 focus:ring-primary focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Phone Number *</label>
              <input 
                required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})}
                className="w-full bg-secondary border border-white/5 rounded-xl px-4 py-3 text-foreground focus:ring-1 focus:ring-primary focus:outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Cover Image URL</label>
              <input 
                value={formData.imageUrl} onChange={e => setFormData({...formData, imageUrl: e.target.value})}
                className="w-full bg-secondary border border-white/5 rounded-xl px-4 py-3 text-foreground focus:ring-1 focus:ring-primary focus:outline-none"
                placeholder="https://images.unsplash.com/..."
              />
            </div>
          </div>

          {formData.imageUrl && (
            <div className="mt-4">
              <p className="text-sm mb-2 text-muted-foreground">Preview</p>
              <img src={formData.imageUrl} alt="Preview" className="h-40 w-full object-cover rounded-xl" onError={(e) => (e.currentTarget.style.display = 'none')} />
            </div>
          )}

          <div className="pt-6 border-t border-white/5">
            <button 
              type="submit" 
              disabled={createShop.isPending || updateShop.isPending}
              className="w-full py-4 rounded-xl gold-gradient text-primary-foreground font-bold shadow-lg flex justify-center items-center"
            >
              {(createShop.isPending || updateShop.isPending) ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save Shop Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
