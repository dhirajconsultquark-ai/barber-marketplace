import { Link } from "wouter";
import { Star, MapPin, Scissors } from "lucide-react";
import type { Shop } from "@workspace/api-client-react";

export function ShopCard({ shop }: { shop: Shop }) {
  return (
    <Link href={`/shops/${shop.id}`}>
      <div className="group h-full flex flex-col glass-panel rounded-2xl overflow-hidden hover:-translate-y-1 hover:shadow-primary/10 transition-all duration-300 cursor-pointer">
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-secondary">
          {shop.imageUrl ? (
            <img 
              src={shop.imageUrl} 
              alt={shop.name} 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center opacity-20">
              <Scissors className="w-16 h-16" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80" />
          
          {/* Status badge for admin views, otherwise rating */}
          <div className="absolute top-4 right-4">
            <div className="flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 text-sm font-medium">
              <Star className="w-4 h-4 text-primary fill-primary" />
              <span>{shop.averageRating ? shop.averageRating.toFixed(1) : "New"}</span>
              <span className="text-muted-foreground text-xs ml-1">({shop.reviewCount})</span>
            </div>
          </div>
        </div>

        <div className="p-6 flex flex-col flex-grow">
          <h3 className="text-xl font-serif font-bold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-1">
            {shop.name}
          </h3>
          
          <div className="flex items-center gap-2 text-muted-foreground mb-4">
            <MapPin className="w-4 h-4 flex-shrink-0" />
            <span className="text-sm line-clamp-1">{shop.address}, {shop.city}</span>
          </div>
          
          <p className="text-sm text-muted-foreground line-clamp-2 mb-6 flex-grow">
            {shop.description}
          </p>
          
          <div className="mt-auto flex items-center justify-between pt-4 border-t border-white/5">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {shop.status === 'approved' ? 'Accepting Bookings' : shop.status}
            </span>
            <span className="text-primary text-sm font-semibold group-hover:translate-x-1 transition-transform">
              View details &rarr;
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
