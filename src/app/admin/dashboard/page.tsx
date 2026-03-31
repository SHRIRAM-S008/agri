'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import StatCard from '@/components/StatCard';
import PageHeader from '@/components/PageHeader';
import { supabase } from '@/lib/supabase';
import { motion } from 'framer-motion';
import { Users, Sprout, Package, IndianRupee, TrendingUp, Activity } from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ farmers: 0, buyers: 0, processors: 0, crops: 0, orders: 0, revenue: 0 });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [profiles, crops, orders] = await Promise.all([
        supabase.from('profiles').select('id, role'),
        supabase.from('crops').select('id, status'),
        supabase.from('orders').select('id, total_price, status, created_at, farmer:profiles!farmer_id(full_name), buyer:profiles!buyer_id(full_name), crop:crops!crop_id(name)').order('created_at', { ascending: false }).limit(5),
      ]);

      const p = (profiles.data || []) as Array<{ id: string; role: string }>;
      const o_all = orders.data || [];
      const revenue = o_all.reduce((s: number, o: any) => o.status === 'delivered' ? s + (o.total_price || 0) : s, 0);

      // Get total orders count separately
      const { count: orderCount } = await supabase.from('orders').select('id', { count: 'exact', head: true });

      setStats({
        farmers: p.filter(u => u.role === 'farmer').length,
        buyers: p.filter(u => u.role === 'buyer').length,
        processors: p.filter(u => u.role === 'processor').length,
        crops: ((crops.data || []) as Array<{ id: string; status: string }>).filter(c => c.status === 'available').length,
        orders: orderCount ?? 0,
        revenue,
      });
      setRecentOrders(o_all.slice(0, 5));
      setLoading(false);
    }
    load();
  }, []);

  const performanceData = [
    { label: 'Platform Health', value: '98.5%', status: 'excellent' },
    { label: 'Avg Deal Value', value: stats.orders > 0 ? `₹${Math.round(stats.revenue / Math.max(stats.orders, 1)).toLocaleString('en-IN')}` : '₹0', status: 'good' },
    { label: 'Crops Available', value: stats.crops, status: 'good' },
    { label: 'Active Users', value: stats.farmers + stats.buyers + stats.processors, status: 'excellent' },
  ];

  return (
    <DashboardLayout allowedRoles={['admin']}>
      <PageHeader title="Admin Dashboard" subtitle="Full platform overview and monitoring" />

      {loading ? (
        <div className="flex items-center justify-center h-40"><div className="spinner" /></div>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <StatCard icon={Users} label="Total Farmers" value={stats.farmers} color="green" delay={0} />
            <StatCard icon={Users} label="Total Buyers" value={stats.buyers} color="blue" delay={0.1} />
            <StatCard icon={Users} label="Processors" value={stats.processors} color="orange" delay={0.2} />
          </div>
          <div className="grid grid-cols-3 gap-4 mb-8">
            <StatCard icon={Sprout} label="Active Listings" value={stats.crops} color="green" delay={0.3} />
            <StatCard icon={Package} label="Total Orders" value={stats.orders} color="purple" delay={0.4} />
            <StatCard icon={IndianRupee} label="Total Revenue" value={`₹${stats.revenue.toLocaleString('en-IN')}`} color="gold" delay={0.5} sub="Delivered orders" />
          </div>

          <div className="grid grid-cols-2 gap-6">
            {/* Recent Orders */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="glass-card p-6 rounded-2xl">
              <div className="flex items-center gap-2 mb-4">
                <Activity size={18} className="text-purple-400" />
                <h3 className="font-semibold text-foreground font-display">Recent Orders</h3>
              </div>
              {recentOrders.length === 0 ? (
                <p className="text-muted-foreground/80 text-sm">No orders yet</p>
              ) : (
                <div className="space-y-3">
                  {recentOrders.map(order => (
                    <div key={order.id} className="flex items-center justify-between p-3 bg-secondary rounded-xl">
                      <div>
                        <p className="text-sm text-foreground font-medium">{(order.crop as any)?.name ?? 'Product'}</p>
                        <p className="text-xs text-muted-foreground/80">{(order.farmer as any)?.full_name} → {(order.buyer as any)?.full_name ?? 'Processor'}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-primary font-semibold text-sm">₹{order.total_price?.toLocaleString('en-IN')}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full badge-${order.status}`}>{order.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Platform Performance */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} className="glass-card p-6 rounded-2xl">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp size={18} className="text-primary" />
                <h3 className="font-semibold text-foreground font-display">Platform Performance</h3>
              </div>
              <div className="space-y-4">
                {performanceData.map(item => (
                  <div key={item.label} className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{item.label}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-foreground">{item.value}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${item.status === 'excellent' ? 'bg-green-900/40 text-primary' : 'bg-blue-900/40 text-blue-400'}`}>
                        {item.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </DashboardLayout>
  );
}
