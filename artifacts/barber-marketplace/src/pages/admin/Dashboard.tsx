import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Navbar } from "@/components/layout/Navbar";
import { useAdminListShops, useApproveShop, useRejectShop, useGetMe } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, XCircle, Store, ShieldAlert } from "lucide-react";

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const { data: user, isLoading: userLoading } = useGetMe({ query: { retry: false } });
  
  const [statusFilter, setStatusFilter] = useState<'pending'|'approved'|'rejected'>('pending');
  
  const { data: shopsData, isLoading, refetch } = useAdminListShops({ status: statusFilter });
  const approve = useApproveShop();
  const reject = useRejectShop();

  if (userLoading) return <div className="min-h-screen bg-background"></div>;

  if (user?.role !== 'admin') {
    setLocation('/');
    return null;
  }

  const handleApprove = (shopId: number) => {
    approve.mutate({ shopId }, {
      onSuccess: () => {
        toast({ title: "Approved", description: "Shop has been approved." });
        refetch();
      }
    });
  };

  const handleReject = (shopId: number) => {
    const reason = prompt("Enter reason for rejection:");
    if (reason) {
      reject.mutate({ shopId, data: { reason } }, {
        onSuccess: () => {
          toast({ title: "Rejected", description: "Shop application rejected." });
          refetch();
        }
      });
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <Navbar />

      <div className="bg-secondary/50 border-b border-white/5 py-8 mb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-4">
          <ShieldAlert className="w-10 h-10 text-primary" />
          <div>
            <h1 className="text-3xl font-serif font-bold">Admin Portal</h1>
            <p className="text-muted-foreground">Manage marketplace operations and approvals.</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex gap-4 border-b border-white/10 mb-8">
          {(['pending', 'approved', 'rejected'] as const).map(status => (
            <button 
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`pb-4 px-4 font-medium capitalize transition-colors border-b-2 ${statusFilter === status ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
            >
              {status} Shops
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1,2,3].map(i => <div key={i} className="h-24 bg-secondary rounded-xl animate-pulse"></div>)}
          </div>
        ) : shopsData?.shops.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground border border-dashed border-white/10 rounded-3xl">
            No {statusFilter} shops found.
          </div>
        ) : (
          <div className="space-y-4">
            {shopsData?.shops.map(shop => (
              <div key={shop.id} className="glass-panel p-6 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6">
                
                <div className="flex items-center gap-6 w-full md:w-auto">
                  {shop.imageUrl ? (
                    <img src={shop.imageUrl} alt={shop.name} className="w-16 h-16 rounded-full object-cover" />
                  ) : (
                    <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center"><Store className="w-6 h-6 text-muted-foreground" /></div>
                  )}
                  
                  <div>
                    <Link href={`/shops/${shop.id}`} className="text-xl font-bold hover:text-primary transition-colors">{shop.name}</Link>
                    <div className="text-sm text-muted-foreground">{shop.city} • {shop.address}</div>
                    <div className="text-xs text-muted-foreground mt-1">Owner ID: {shop.ownerId} • Created: {new Date(shop.createdAt).toLocaleDateString()}</div>
                  </div>
                </div>

                {statusFilter === 'pending' && (
                  <div className="flex gap-3 w-full md:w-auto">
                    <button 
                      onClick={() => handleReject(shop.id)}
                      className="px-6 py-2 rounded-xl text-red-500 bg-red-500/10 hover:bg-red-500/20 font-medium transition-colors border border-red-500/20"
                    >
                      Reject
                    </button>
                    <button 
                      onClick={() => handleApprove(shop.id)}
                      className="px-6 py-2 rounded-xl text-green-500 bg-green-500/10 hover:bg-green-500/20 font-medium transition-colors border border-green-500/20"
                    >
                      Approve
                    </button>
                  </div>
                )}
                
                {statusFilter === 'rejected' && shop.rejectionReason && (
                  <div className="text-sm text-red-400 bg-red-500/10 p-3 rounded-lg max-w-sm">
                    Reason: {shop.rejectionReason}
                  </div>
                )}
                
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
