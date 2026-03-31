'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/PageHeader';
import { useAuth } from '@/contexts/AuthContext';
import { orderService } from '@/services/orders';
import { motion } from 'framer-motion';
import { ShoppingBag, Package, QrCode } from 'lucide-react';
import Link from 'next/link';

const statusFlow = ['confirmed', 'packed', 'in_transit', 'delivered'];
const statusLabels: Record<string, string> = {
  confirmed: '✅ Confirmed',
  packed: '📦 Packed',
  in_transit: '🚚 In Transit',
  delivered: '🎉 Delivered',
};

export default function BuyerOrdersPage() {
  const { profile } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) return;
    orderService.getByParty(profile.id, 'buyer').then(data => {
      setOrders(data || []);
      setLoading(false);
    });
  }, [profile]);

  return (
    <DashboardLayout allowedRoles={['buyer']}>
      <PageHeader title="My Orders" subtitle="Track your orders and deliveries" />

      {loading ? (
        <div className="flex items-center justify-center h-40"><div className="spinner" /></div>
      ) : orders.length === 0 ? (
        <div className="glass-card rounded-2xl p-16 text-center">
          <ShoppingBag size={48} className="text-primary mx-auto mb-4 opacity-50" />
          <h3 className="text-xl font-semibold text-white mb-2 font-display">No Orders Yet</h3>
          <p className="text-muted-foreground">Your orders will appear here once farmers accept your offers.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order, i) => {
            const currentIdx = statusFlow.indexOf(order.status);
            return (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="premium-card p-6 rounded-lg"
              >
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-secondary/80 border border-border flex items-center justify-center shrink-0 mt-1">
                      <Package size={22} className="text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-foreground text-lg">{order.crop?.name ?? order.product?.name}</p>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold badge-${order.status} border capitalize`}>
                          {statusLabels[order.status] || order.status}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-muted-foreground">
                        From: <span className="text-foreground">{order.farmer?.full_name}</span> · {order.quantity} kg · {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex flex-col items-end">
                    <p className="text-2xl font-semibold text-foreground tracking-tight">₹{order.total_price.toLocaleString('en-IN')}</p>
                    <Link href={`/trace/${order.crop_id}`} className="text-sm text-primary hover:text-primary/80 flex items-center gap-1 mt-2 font-medium transition-colors">
                      <QrCode size={14} /> View Trace
                    </Link>
                  </div>
                </div>

                {/* Status Timeline - SaaS Style */}
                <div className="pt-5 border-t border-border flex items-center justify-between relative mt-4">
                   <div className="absolute top-[29px] left-4 right-4 h-0.5 bg-secondary z-0"></div>
                   <div className="absolute top-[29px] left-4 h-0.5 bg-primary z-0 transition-all duration-500" style={{ width: `${(currentIdx / (statusFlow.length - 1)) * 100}%` }}></div>
                   
                   {statusFlow.map((s, idx) => {
                     const isCompleted = idx <= currentIdx;
                     const isCurrent = idx === currentIdx;
                     
                     return (
                      <div key={s} className="relative z-10 flex flex-col items-center gap-2">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center border-2 bg-white ${isCompleted ? 'border-primary' : 'border-border'} ${isCurrent ? 'ring-4 ring-primary/10' : ''}`}>
                          {isCompleted && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                        </div>
                        <span className={`text-xs font-semibold uppercase tracking-wider ${isCompleted ? 'text-primary' : 'text-muted-foreground'}`}>
                          {s.replace('_', ' ')}
                        </span>
                      </div>
                    )
                   })}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </DashboardLayout>
  );
}
