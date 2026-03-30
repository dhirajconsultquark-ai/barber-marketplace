import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Navbar } from "@/components/layout/Navbar";
import { useGetMyShop, useListShopBookings, useUpdateBookingStatus, useCreateService, useDeleteService } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { Plus, Settings, Store, Calendar, Scissors, Check, X, Clock, Trash2 } from "lucide-react";
import { format } from "date-fns";

export default function BarberDashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const { data: myShop, isLoading: shopLoading, error, refetch: refetchShop } = useGetMyShop({ query: { retry: false } });
  
  // Only fetch bookings if shop exists
  const { data: bookings, refetch: refetchBookings } = useListShopBookings(myShop?.id || 0, {
    query: { enabled: !!myShop }
  });

  const updateStatus = useUpdateBookingStatus();
  const createService = useCreateService();
  const deleteService = useDeleteService();

  const [activeTab, setActiveTab] = useState<'bookings'|'services'>('bookings');
  const [showAddService, setShowAddService] = useState(false);
  
  // New service state
  const [newSvcName, setNewSvcName] = useState("");
  const [newSvcDesc, setNewSvcDesc] = useState("");
  const [newSvcPrice, setNewSvcPrice] = useState("");
  const [newSvcDur, setNewSvcDur] = useState("");

  if (shopLoading) return <div className="min-h-screen bg-background"></div>;

  // No shop created yet
  if (!myShop || error) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center glass-panel p-10 rounded-3xl max-w-lg w-full">
            <Store className="w-16 h-16 text-primary mx-auto mb-6" />
            <h1 className="text-3xl font-serif font-bold mb-4">Welcome to LuxeCuts</h1>
            <p className="text-muted-foreground mb-8 text-lg">You need to set up your shop profile before you can manage services and bookings.</p>
            <Link href="/barber/shop" className="inline-block w-full py-4 rounded-xl gold-gradient text-primary-foreground font-bold">
              Create Shop Profile
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleStatusUpdate = (bookingId: number, status: 'confirmed' | 'completed' | 'cancelled') => {
    updateStatus.mutate({ bookingId, data: { status } }, {
      onSuccess: () => {
        toast({ title: "Updated", description: `Booking marked as ${status}` });
        refetchBookings();
      }
    });
  };

  const handleAddService = (e: React.FormEvent) => {
    e.preventDefault();
    createService.mutate({
      shopId: myShop.id,
      data: {
        name: newSvcName,
        description: newSvcDesc,
        price: Number(newSvcPrice),
        durationMinutes: Number(newSvcDur)
      }
    }, {
      onSuccess: () => {
        toast({ title: "Added", description: "Service added successfully" });
        setShowAddService(false);
        setNewSvcName(""); setNewSvcDesc(""); setNewSvcPrice(""); setNewSvcDur("");
        refetchShop();
      },
      onError: (err) => toast({ title: "Error", description: err.message, variant: "destructive" })
    });
  };

  const handleDeleteService = (serviceId: number) => {
    if(confirm("Delete this service?")) {
      deleteService.mutate({ shopId: myShop.id, serviceId }, {
        onSuccess: () => {
          toast({ title: "Deleted", description: "Service removed" });
          refetchShop();
        }
      });
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <Navbar />

      <div className="bg-card border-b border-white/5 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-6">
            {myShop.imageUrl ? (
              <img src={myShop.imageUrl} alt="Shop" className="w-20 h-20 rounded-full object-cover border-2 border-primary/20" />
            ) : (
              <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center border-2 border-white/5"><Store className="w-8 h-8 text-muted-foreground" /></div>
            )}
            <div>
              <h1 className="text-3xl font-serif font-bold">{myShop.name}</h1>
              <div className="flex items-center gap-3 mt-2 text-sm">
                <span className={`px-2.5 py-0.5 rounded-full border uppercase tracking-wider font-medium ${myShop.status === 'approved' ? 'text-green-500 border-green-500/30 bg-green-500/10' : myShop.status === 'rejected' ? 'text-red-500 border-red-500/30 bg-red-500/10' : 'text-yellow-500 border-yellow-500/30 bg-yellow-500/10'}`}>
                  {myShop.status}
                </span>
                <span className="text-muted-foreground">{myShop.city}</span>
              </div>
            </div>
          </div>
          <Link href="/barber/shop" className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-white/10 hover:bg-white/5 transition-colors">
            <Settings className="w-4 h-4" /> Edit Profile
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {myShop.status === 'rejected' && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl mb-8">
            <strong className="font-bold">Application Rejected:</strong> {myShop.rejectionReason}
            <p className="mt-2 text-sm text-red-500/80">Please edit your profile to address these issues, or contact support.</p>
          </div>
        )}

        {myShop.status === 'pending' && (
          <div className="bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 p-4 rounded-xl mb-8">
            <strong className="font-bold">Pending Approval:</strong> Your shop is currently being reviewed by administrators. You cannot accept bookings until approved.
          </div>
        )}

        {/* Dashboard Tabs */}
        <div className="flex gap-4 border-b border-white/10 mb-8">
          <button 
            onClick={() => setActiveTab('bookings')}
            className={`pb-4 px-4 font-medium transition-colors border-b-2 ${activeTab === 'bookings' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
          >
            <div className="flex items-center gap-2"><Calendar className="w-4 h-4" /> Bookings</div>
          </button>
          <button 
            onClick={() => setActiveTab('services')}
            className={`pb-4 px-4 font-medium transition-colors border-b-2 ${activeTab === 'services' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
          >
            <div className="flex items-center gap-2"><Scissors className="w-4 h-4" /> Services</div>
          </button>
        </div>

        {/* Bookings View */}
        {activeTab === 'bookings' && (
          <div className="space-y-4">
            {bookings?.length === 0 ? (
              <div className="text-center py-20 text-muted-foreground">No bookings yet.</div>
            ) : (
              bookings?.sort((a,b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()).map(booking => (
                <div key={booking.id} className="glass-panel p-5 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-6 w-full md:w-auto">
                    <div className="w-16 h-16 bg-secondary rounded-xl flex flex-col items-center justify-center shrink-0">
                      <div className="text-xs text-muted-foreground">{format(new Date(booking.scheduledAt), 'MMM')}</div>
                      <div className="text-xl font-bold text-primary">{format(new Date(booking.scheduledAt), 'dd')}</div>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-lg">{booking.customerName}</span>
                        <span className="text-muted-foreground px-2 py-0.5 rounded text-xs bg-white/5 border border-white/10">{booking.status}</span>
                      </div>
                      <div className="text-sm text-muted-foreground">{booking.serviceName} • {format(new Date(booking.scheduledAt), 'h:mm a')}</div>
                      {booking.notes && <div className="text-xs text-primary/80 mt-1 italic">Note: {booking.notes}</div>}
                    </div>
                  </div>
                  
                  <div className="flex gap-2 w-full md:w-auto justify-end border-t border-white/5 pt-4 md:border-0 md:pt-0">
                    {booking.status === 'pending' && (
                      <>
                        <button onClick={() => handleStatusUpdate(booking.id, 'confirmed')} className="p-2 text-green-500 hover:bg-green-500/10 rounded-lg" title="Confirm"><Check className="w-5 h-5" /></button>
                        <button onClick={() => handleStatusUpdate(booking.id, 'cancelled')} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg" title="Reject"><X className="w-5 h-5" /></button>
                      </>
                    )}
                    {booking.status === 'confirmed' && (
                      <button onClick={() => handleStatusUpdate(booking.id, 'completed')} className="px-4 py-2 bg-primary/20 text-primary border border-primary/30 rounded-lg font-medium hover:bg-primary/30 transition-colors">
                        Mark Completed
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Services View */}
        {activeTab === 'services' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Menu Setup</h2>
              <button 
                onClick={() => setShowAddService(!showAddService)}
                className="flex items-center gap-2 text-primary font-medium bg-primary/10 px-4 py-2 rounded-xl hover:bg-primary/20 transition-colors"
              >
                <Plus className="w-4 h-4" /> Add Service
              </button>
            </div>

            {showAddService && (
              <form onSubmit={handleAddService} className="glass-panel p-6 rounded-2xl mb-8 border border-primary/30">
                <h3 className="font-bold mb-4">New Service Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <input required placeholder="Service Name (e.g. Skin Fade)" value={newSvcName} onChange={e=>setNewSvcName(e.target.value)} className="bg-background border border-white/10 rounded-lg px-4 py-2 focus:ring-1 focus:ring-primary outline-none" />
                  <input placeholder="Short Description (optional)" value={newSvcDesc} onChange={e=>setNewSvcDesc(e.target.value)} className="bg-background border border-white/10 rounded-lg px-4 py-2 focus:ring-1 focus:ring-primary outline-none" />
                  <input required type="number" placeholder="Price ($)" value={newSvcPrice} onChange={e=>setNewSvcPrice(e.target.value)} className="bg-background border border-white/10 rounded-lg px-4 py-2 focus:ring-1 focus:ring-primary outline-none" />
                  <input required type="number" placeholder="Duration (minutes)" value={newSvcDur} onChange={e=>setNewSvcDur(e.target.value)} className="bg-background border border-white/10 rounded-lg px-4 py-2 focus:ring-1 focus:ring-primary outline-none" />
                </div>
                <div className="flex justify-end gap-2">
                  <button type="button" onClick={() => setShowAddService(false)} className="px-4 py-2 text-muted-foreground hover:text-white">Cancel</button>
                  <button type="submit" disabled={createService.isPending} className="px-6 py-2 bg-primary text-primary-foreground font-bold rounded-lg">{createService.isPending ? 'Saving...' : 'Save Service'}</button>
                </div>
              </form>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myShop.services?.map(svc => (
                <div key={svc.id} className="glass-panel p-6 rounded-2xl relative group">
                  <button onClick={() => handleDeleteService(svc.id)} className="absolute top-4 right-4 text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-red-500 transition-all"><Trash2 className="w-4 h-4" /></button>
                  <h3 className="text-lg font-bold text-foreground pr-8">{svc.name}</h3>
                  <div className="text-2xl font-serif text-primary font-bold my-2">${svc.price}</div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3"><Clock className="w-3.5 h-3.5" /> {svc.durationMinutes} min</div>
                  {svc.description && <p className="text-sm text-muted-foreground border-t border-white/5 pt-3">{svc.description}</p>}
                </div>
              ))}
            </div>
            {myShop.services?.length === 0 && !showAddService && (
              <div className="text-center py-20 text-muted-foreground border border-dashed border-white/10 rounded-3xl">
                Add services so clients can book appointments.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
