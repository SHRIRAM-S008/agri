'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/PageHeader';
import { useAuth } from '@/contexts/AuthContext';
import { offerService } from '@/services/offers';
import { motion } from 'framer-motion';
import { Handshake } from 'lucide-react';

export default function BuyerOffersPage() {
  const { profile } = useAuth();
  const [offers, setOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) return;
    offerService.getByBuyer(profile.id).then(data => {
      setOffers(data || []);
      setLoading(false);
    });
  }, [profile]);

  return (
    <DashboardLayout allowedRoles={['buyer']}>
      <PageHeader title="My Offers" subtitle="Track all offers you've submitted" />

      {loading ? (
        <div className="flex items-center justify-center h-40"><div className="spinner" /></div>
      ) : offers.length === 0 ? (
        <div className="glass-card rounded-2xl p-16 text-center">
          <Handshake size={48} className="text-primary mx-auto mb-4 opacity-50" />
          <h3 className="text-xl font-semibold text-white mb-2 font-display">No Offers Yet</h3>
          <p className="text-muted-foreground">Browse the marketplace and make offers on crops you want.</p>
        </div>
      ) : (
        <div className="premium-card overflow-x-auto rounded-lg">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/80 text-muted-foreground">
                <th className="px-5 py-3 font-semibold text-xs tracking-wider uppercase">Crop</th>
                <th className="px-5 py-3 font-semibold text-xs tracking-wider uppercase">Farmer</th>
                <th className="px-5 py-3 font-semibold text-xs tracking-wider uppercase">Your Price</th>
                <th className="px-5 py-3 font-semibold text-xs tracking-wider uppercase">Quantity</th>
                <th className="px-5 py-3 font-semibold text-xs tracking-wider uppercase">Total</th>
                <th className="px-5 py-3 font-semibold text-xs tracking-wider uppercase">Status</th>
                <th className="px-5 py-3 font-semibold text-xs tracking-wider uppercase text-right">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-white">
              {offers.map((offer, i) => (
                <motion.tr 
                  key={offer.id} 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  transition={{ delay: i * 0.04 }}
                  className="hover:bg-secondary/30 transition-colors"
                >
                  <td className="px-5 py-4 text-foreground font-semibold">{offer.crop?.name}</td>
                  <td className="px-5 py-4 text-muted-foreground font-medium">{(offer.crop as any)?.farmer?.full_name ?? '—'}</td>
                  <td className="px-5 py-4 text-primary font-semibold">₹{offer.offer_price}/kg</td>
                  <td className="px-5 py-4 max-w-xs">{offer.quantity} kg</td>
                  <td className="px-5 py-4 font-semibold text-foreground">₹{(offer.offer_price * offer.quantity).toLocaleString('en-IN')}</td>
                  <td className="px-5 py-4">
                     <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold badge-${offer.status} border capitalize`}>
                       {offer.status}
                     </span>
                  </td>
                  <td className="px-5 py-4 text-muted-foreground/80 font-medium text-right whitespace-nowrap">
                    {new Date(offer.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </DashboardLayout>
  );
}
