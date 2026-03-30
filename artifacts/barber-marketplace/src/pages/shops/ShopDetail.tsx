import { useRoute, Link } from "wouter";
import { Navbar } from "@/components/layout/Navbar";
import { useGetShop, useListReviews, useGetMe } from "@workspace/api-client-react";
import { MapPin, Star, Phone, Clock, Calendar as CalendarIcon, User, MessageSquare } from "lucide-react";
import { useState } from "react";

export default function ShopDetail() {
  const [, params] = useRoute("/shops/:id");
  const shopId = parseInt(params?.id || "0");
  
  const { data: user } = useGetMe({ query: { retry: false } });
  const { data: shop, isLoading: shopLoading } = useGetShop(shopId);
  const { data: reviews, isLoading: reviewsLoading } = useListReviews(shopId);
  
  const [activeTab, setActiveTab] = useState<'services'|'reviews'>('services');

  if (shopLoading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (!shop) return (
    <div className="min-h-screen bg-background"><Navbar /><div className="p-20 text-center">Shop not found</div></div>
  );

  return (
    <div className="min-h-screen bg-background pb-20">
      <Navbar />

      {/* Hero Header */}
      <div className="relative h-[40vh] min-h-[300px] w-full bg-secondary">
        {shop.imageUrl ? (
          <img src={shop.imageUrl} alt={shop.name} className="w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-secondary to-background" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        
        <div className="absolute bottom-0 w-full">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-4">{shop.name}</h1>
              <div className="flex flex-wrap items-center gap-4 text-muted-foreground text-sm md:text-base">
                <div className="flex items-center gap-1.5">
                  <Star className="w-5 h-5 text-primary fill-primary" />
                  <span className="font-medium text-foreground">{shop.averageRating?.toFixed(1) || "New"}</span>
                  <span>({shop.reviewCount} reviews)</span>
                </div>
                <div className="w-1.5 h-1.5 rounded-full bg-border hidden sm:block"></div>
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-5 h-5 text-primary" />
                  {shop.address}, {shop.city}
                </div>
              </div>
            </div>
            
            {user?.role !== 'barber' && user?.role !== 'admin' && (
              <Link 
                href={`/book/${shop.id}`}
                className="px-8 py-4 rounded-xl gold-gradient text-primary-foreground font-bold shadow-lg shadow-primary/20 hover:-translate-y-1 transition-all text-center whitespace-nowrap"
              >
                Book Appointment
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <div className="mb-12">
            <h2 className="text-2xl font-serif font-bold mb-4">About</h2>
            <p className="text-muted-foreground leading-relaxed whitespace-pre-line text-lg">
              {shop.description}
            </p>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-white/10 mb-8">
            <button 
              onClick={() => setActiveTab('services')}
              className={`px-6 py-4 text-lg font-medium border-b-2 transition-colors ${activeTab === 'services' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
            >
              Services
            </button>
            <button 
              onClick={() => setActiveTab('reviews')}
              className={`px-6 py-4 text-lg font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'reviews' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
            >
              Reviews <span className="bg-secondary text-xs py-0.5 px-2 rounded-full">{shop.reviewCount}</span>
            </button>
          </div>

          {/* Services Tab */}
          {activeTab === 'services' && (
            <div className="space-y-4">
              {shop.services?.length === 0 ? (
                <div className="text-center py-12 glass-panel rounded-2xl">
                  <p className="text-muted-foreground">No services listed yet.</p>
                </div>
              ) : (
                shop.services?.map(service => (
                  <div key={service.id} className="glass-panel p-6 rounded-2xl flex justify-between items-center group hover:border-primary/30 transition-colors">
                    <div>
                      <h3 className="text-xl font-bold mb-1">{service.name}</h3>
                      {service.description && <p className="text-muted-foreground text-sm mb-3 max-w-md">{service.description}</p>}
                      <div className="flex items-center gap-2 text-sm text-primary font-medium">
                        <Clock className="w-4 h-4" />
                        {service.durationMinutes} mins
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold font-serif mb-3">${service.price}</div>
                      {user?.role !== 'barber' && user?.role !== 'admin' && (
                        <Link 
                          href={`/book/${shop.id}?service=${service.id}`}
                          className="px-6 py-2 rounded-lg bg-secondary text-foreground hover:bg-white hover:text-black font-medium transition-colors"
                        >
                          Select
                        </Link>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Reviews Tab */}
          {activeTab === 'reviews' && (
            <div className="space-y-6">
              {reviewsLoading ? (
                <div className="animate-pulse space-y-4">
                  {[1,2].map(i => <div key={i} className="h-32 bg-secondary rounded-2xl"></div>)}
                </div>
              ) : reviews?.length === 0 ? (
                <div className="text-center py-12 glass-panel rounded-2xl">
                  <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <p className="text-muted-foreground">No reviews yet. Be the first to experience and review!</p>
                </div>
              ) : (
                reviews?.map(review => (
                  <div key={review.id} className="glass-panel p-6 rounded-2xl">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                          <User className="w-5 h-5 text-muted-foreground" />
                        </div>
                        <div>
                          <div className="font-bold">{review.customerName}</div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex text-primary">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-primary' : 'text-muted/30'}`} />
                        ))}
                      </div>
                    </div>
                    {review.comment && (
                      <p className="text-muted-foreground leading-relaxed italic">"{review.comment}"</p>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Sidebar Info */}
        <div className="lg:col-span-1">
          <div className="glass-panel p-8 rounded-3xl sticky top-28">
            <h3 className="text-xl font-serif font-bold mb-6 border-b border-white/10 pb-4">Shop Information</h3>
            
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center shrink-0">
                  <User className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Master Barber</div>
                  <div className="font-medium">{shop.ownerName}</div>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Location</div>
                  <div className="font-medium">{shop.address}</div>
                  <div className="text-sm text-muted-foreground">{shop.city}</div>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Contact</div>
                  <div className="font-medium">{shop.phone}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
