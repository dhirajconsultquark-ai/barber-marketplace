import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Navbar } from "@/components/layout/Navbar";
import { useListBookings, useUpdateBookingStatus, useCreateReview } from "@workspace/api-client-react";
import { Calendar, Clock, Scissors, Star, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

export default function MyBookings() {
  const { data: bookings, isLoading, refetch } = useListBookings();
  const updateStatus = useUpdateBookingStatus();
  const createReview = useCreateReview();
  const { toast } = useToast();

  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [activeBooking, setActiveBooking] = useState<any>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const handleCancel = (bookingId: number) => {
    if (confirm("Are you sure you want to cancel this appointment?")) {
      updateStatus.mutate({ bookingId, data: { status: 'cancelled' } }, {
        onSuccess: () => {
          toast({ title: "Cancelled", description: "Booking has been cancelled." });
          refetch();
        }
      });
    }
  };

  const submitReview = () => {
    if (!activeBooking) return;
    createReview.mutate({
      shopId: activeBooking.shopId,
      data: { rating, comment }
    }, {
      onSuccess: () => {
        toast({ title: "Review Submitted", description: "Thanks for your feedback!" });
        setReviewModalOpen(false);
        setComment("");
        setRating(5);
      },
      onError: (err) => {
        toast({ title: "Error", description: err.message, variant: "destructive" });
      }
    });
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'confirmed': return 'text-green-500 bg-green-500/10 border-green-500/20';
      case 'pending': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
      case 'cancelled': return 'text-red-500 bg-red-500/10 border-red-500/20';
      case 'completed': return 'text-primary bg-primary/10 border-primary/20';
      default: return 'text-muted-foreground bg-secondary';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-serif font-bold mb-8 border-b border-white/5 pb-4">My Appointments</h1>

        {isLoading ? (
          <div className="space-y-4">
            {[1,2,3].map(i => <div key={i} className="h-32 bg-secondary animate-pulse rounded-2xl"></div>)}
          </div>
        ) : bookings?.length === 0 ? (
          <div className="text-center py-20 glass-panel rounded-3xl">
            <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-2xl font-serif font-bold mb-2">No upcoming appointments</h3>
            <p className="text-muted-foreground mb-6">Time for a fresh cut?</p>
            <Link href="/shops" className="px-6 py-3 rounded-full gold-gradient text-primary-foreground font-bold">
              Find a Barber
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {bookings?.map(booking => {
              const date = new Date(booking.scheduledAt);
              return (
                <div key={booking.id} className="glass-panel p-6 rounded-2xl flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
                  
                  <div className="flex gap-6">
                    <div className="hidden sm:flex flex-col items-center justify-center w-20 h-20 rounded-xl bg-secondary border border-white/5 shrink-0">
                      <span className="text-xs text-muted-foreground uppercase">{format(date, 'MMM')}</span>
                      <span className="text-2xl font-serif font-bold text-primary">{format(date, 'dd')}</span>
                    </div>
                    
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <Link href={`/shops/${booking.shopId}`} className="text-xl font-bold hover:text-primary transition-colors">
                          {booking.shopName}
                        </Link>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border uppercase tracking-wider ${getStatusColor(booking.status)}`}>
                          {booking.status}
                        </span>
                      </div>
                      
                      <p className="text-foreground font-medium mb-3">{booking.serviceName}</p>
                      
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> {format(date, 'EEEE, MMMM do, yyyy')}</div>
                        <div className="flex items-center gap-1.5 text-primary font-medium"><Clock className="w-4 h-4" /> {format(date, 'h:mm a')}</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-row md:flex-col gap-3 w-full md:w-auto mt-4 md:mt-0 border-t border-white/5 pt-4 md:border-0 md:pt-0">
                    <div className="text-xl font-serif font-bold text-right md:mb-2 w-full md:w-auto">${booking.servicePrice}</div>
                    
                    {['pending', 'confirmed'].includes(booking.status) && (
                      <button 
                        onClick={() => handleCancel(booking.id)}
                        className="text-xs text-destructive hover:bg-destructive/10 px-4 py-2 rounded-lg transition-colors whitespace-nowrap"
                      >
                        Cancel
                      </button>
                    )}
                    
                    {booking.status === 'completed' && (
                      <button 
                        onClick={() => { setActiveBooking(booking); setReviewModalOpen(true); }}
                        className="text-xs text-primary bg-primary/10 hover:bg-primary/20 px-4 py-2 rounded-lg transition-colors whitespace-nowrap border border-primary/20"
                      >
                        Leave a Review
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Review Modal */}
      {reviewModalOpen && activeBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-card border border-white/10 rounded-2xl w-full max-w-md p-6 relative">
            <button onClick={() => setReviewModalOpen(false)} className="absolute top-4 right-4 text-muted-foreground hover:text-white">
              <XCircle className="w-6 h-6" />
            </button>
            <h2 className="text-2xl font-serif font-bold mb-2">Review your experience</h2>
            <p className="text-muted-foreground mb-6">How was your cut at {activeBooking.shopName}?</p>
            
            <div className="flex justify-center gap-2 mb-6">
              {[1, 2, 3, 4, 5].map(star => (
                <button key={star} onClick={() => setRating(star)}>
                  <Star className={`w-10 h-10 transition-colors ${rating >= star ? 'text-primary fill-primary' : 'text-secondary fill-secondary'}`} />
                </button>
              ))}
            </div>

            <textarea 
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder="Tell us about the service, barber, atmosphere..."
              className="w-full bg-secondary border border-white/5 rounded-xl p-4 mb-6 min-h-[120px] focus:outline-none focus:border-primary"
            />

            <button 
              onClick={submitReview}
              disabled={createReview.isPending}
              className="w-full py-3 rounded-xl gold-gradient text-primary-foreground font-bold"
            >
              {createReview.isPending ? "Submitting..." : "Post Review"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
