'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import StatCard from '@/components/StatCard';
import PageHeader from '@/components/PageHeader';
import { useAuth } from '@/contexts/AuthContext';
import { offerService } from '@/services/offers';
import { orderService } from '@/services/orders';
import { Store, Handshake, ShoppingBag, IndianRupee } from 'lucide-react';
import Link from 'next/link';

export default function BuyerDashboard() {
  const { profile } = useAuth();
  const [stats, setStats] = useState({ offers: 0, orders: 0, spent: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) return;
    async function load() {
      const [offers, orders] = await Promise.all([
        offerService.getByBuyer(profile!.id),
        orderService.getByParty(profile!.id, 'buyer'),
      ]);
      const spent = (orders || []).filter(o => o.status === 'delivered').reduce((s: number, o: any) => s + (o.total_price || 0), 0);
      setStats({ offers: (offers || []).length, orders: (orders || []).length, spent });
      setLoading(false);
    }
    load();
  }, [profile]);

  return (
    <DashboardLayout allowedRoles={['buyer']}>
      <PageHeader
        title={`Hello, ${profile?.full_name?.split(' ')[0] ?? 'Buyer'} 👋`}
        subtitle="Your buying dashboard"
        action={<Link href="/buyer/marketplace" className="btn-primary text-sm px-5 py-2.5">Browse Marketplace →</Link>}
      />
      {loading ? (
        <div className="flex items-center justify-center h-40"><div className="spinner" /></div>
      ) : (
        <div className="grid grid-cols-3 gap-4 mb-8">
          <StatCard icon={Handshake} label="Offers Made" value={stats.offers} color="blue" delay={0} />
          <StatCard icon={ShoppingBag} label="Total Orders" value={stats.orders} color="purple" delay={0.1} />
          <StatCard icon={IndianRupee} label="Total Spent" value={`₹${stats.spent.toLocaleString('en-IN')}`} color="gold" delay={0.2} sub="Delivered orders" />
        </div>
      )}
      <div className="glass-card p-6 rounded-2xl">
        <h3 className="font-semibold text-foreground font-display mb-3">Quick Links</h3>
        <div className="grid grid-cols-3 gap-3">
          {[
            { href: '/buyer/marketplace', label: '🛒 Browse Marketplace', desc: 'Find available crops & products' },
            { href: '/buyer/offers', label: '🤝 My Offers', desc: 'Track your submitted offers' },
            { href: '/buyer/orders', label: '📦 My Orders', desc: 'Track delivery status' },
          ].map(link => (
            <Link key={link.href} href={link.href} className="p-4 bg-secondary rounded-xl hover:bg-gray-100 transition-all border border-border hover:border-green-700/30">
              <p className="font-medium text-foreground text-sm">{link.label}</p>
              <p className="text-xs text-muted-foreground/80 mt-1">{link.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
