'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import StatCard from '@/components/StatCard';
import PageHeader from '@/components/PageHeader';
import { useAuth } from '@/contexts/AuthContext';
import { cropService } from '@/services/crops';
import { offerService } from '@/services/offers';
import { orderService } from '@/services/orders';
import { Sprout, Handshake, ClipboardList, IndianRupee, TrendingUp, Plus } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function FarmerDashboard() {
  const { profile } = useAuth();
  const [stats, setStats] = useState({ crops: 0, offers: 0, orders: 0, earnings: 0 });
  const [recentCrops, setRecentCrops] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) return;
    async function load() {
      const [crops, offers, orders] = await Promise.all([
        cropService.getByFarmer(profile!.id),
        offerService.getForFarmer(profile!.id),
        orderService.getByParty(profile!.id, 'farmer'),
      ]);
      const earnings = (orders || []).filter(o => o.status === 'delivered').reduce((s, o) => s + (o.total_price || 0), 0);
      setStats({
        crops: (crops || []).length,
        offers: (offers || []).filter(o => o.status === 'pending').length,
        orders: (orders || []).length,
        earnings,
      });
      setRecentCrops((crops || []).slice(0, 5));
      setLoading(false);
    }
    load();
  }, [profile]);

  const marketInsights = [
    { crop: 'Tomato', trend: '↑ 12%', price: '₹28/kg', sentiment: 'up' },
    { crop: 'Onion', trend: '↓ 5%', price: '₹22/kg', sentiment: 'down' },
    { crop: 'Potato', trend: '↑ 8%', price: '₹18/kg', sentiment: 'up' },
  ];

  return (
    <DashboardLayout allowedRoles={['farmer']}>
      <PageHeader
        title={`Welcome, ${profile?.full_name?.split(' ')[0] ?? 'Farmer'} 👋`}
        subtitle="Here's your farm dashboard overview"
        action={
          <Link href="/farmer/add-crop" className="btn-primary flex items-center gap-2 text-sm">
            <Plus size={16} /> Add Crop
          </Link>
        }
      />

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="spinner" />
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 mb-8">
            <StatCard icon={Sprout} label="Active Crops" value={stats.crops} color="green" delay={0} />
            <StatCard icon={Handshake} label="Pending Offers" value={stats.offers} color="orange" delay={0.1} />
            <StatCard icon={ClipboardList} label="Total Orders" value={stats.orders} color="blue" delay={0.2} />
            <StatCard icon={IndianRupee} label="Total Earnings" value={`₹${stats.earnings.toLocaleString('en-IN')}`} color="gold" delay={0.3} sub="From delivered orders" />
          </div>

          <div className="grid grid-cols-3 gap-6">
            {/* Recent Crops */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="col-span-2 glass-card p-6 rounded-2xl"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-foreground font-display">Recent Crops</h3>
                <Link href="/farmer/my-crops" className="text-sm text-primary hover:text-green-300">View all →</Link>
              </div>
              {recentCrops.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground/80">
                  <Sprout size={32} className="mx-auto mb-3 opacity-30" />
                  <p>No crops listed yet.</p>
                  <Link href="/farmer/add-crop" className="text-primary text-sm hover:underline mt-2 block">
                    Add your first crop →
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentCrops.map(crop => (
                    <div key={crop.id} className="flex items-center justify-between p-3 bg-secondary rounded-xl">
                      <div>
                        <p className="font-medium text-foreground">{crop.name}</p>
                        <p className="text-xs text-muted-foreground/80">{crop.quantity} {crop.unit} · {crop.location}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-primary font-semibold text-sm">₹{crop.price_per_unit}/{crop.unit}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full badge-${crop.status}`}>{crop.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Market Insights */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="glass-card p-6 rounded-2xl"
            >
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp size={18} className="text-primary" />
                <h3 className="font-semibold text-foreground font-display">Market Insights</h3>
              </div>
              <div className="space-y-4">
                {marketInsights.map(item => (
                  <div key={item.crop} className="flex items-center justify-between">
                    <div>
                      <p className="text-foreground text-sm font-medium">{item.crop}</p>
                      <p className="text-xs text-muted-foreground/80">Today</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-foreground">{item.price}</p>
                      <p className={`text-xs font-medium ${item.sentiment === 'up' ? 'text-primary' : 'text-red-400'}`}>
                        {item.trend}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-border">
                <p className="text-xs text-muted-foreground/80">💡 Tip: Process tomatoes into paste for 3× more profit</p>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </DashboardLayout>
  );
}
