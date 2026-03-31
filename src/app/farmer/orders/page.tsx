'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/PageHeader';
import { useAuth } from '@/contexts/AuthContext';
import { orderService } from '@/services/orders';
import { motion } from 'framer-motion';
import { ClipboardList, Package } from 'lucide-react';

const statusFlow = ['confirmed', 'packed', 'in_transit', 'delivered'];
const statusLabels: Record<string, string> = {
  confirmed: '✅ Confirmed',
  packed: '📦 Packed',
  in_transit: '🚚 In Transit',
  delivered: '🎉 Delivered',
};

export default function FarmerOrdersPage() {
  const { profile } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) return;
    orderService.getByParty(profile.id, 'farmer').then(data => {
      setOrders(data || []);
      setLoading(false);
    });
  }, [profile]);

  return (
    <DashboardLayout allowedRoles={['farmer']}>
      <PageHeader title="My Orders" subtitle="Track all your confirmed deals" />

      {loading ? (
        <div className="flex items-center justify-center h-40"><div className="spinner" /></div>
      ) : orders.length === 0 ? (
        <div className="glass-card rounded-2xl p-16 text-center">
          <ClipboardList size={48} className="text-primary mx-auto mb-4 opacity-50" />
          <h3 className="text-xl font-semibold text-white mb-2 font-display">No Orders Yet</h3>
          <p className="text-muted-foreground">Orders appear here once buyers accept your crop offers.</p>
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
                className="glass-card p-6 rounded-2xl"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Package size={16} className="text-primary" />
                      <p className="font-semibold text-foreground">{order.crop?.name ?? order.product?.name ?? 'Unknown Product'}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full badge-${order.status}`}>
                        {statusLabels[order.status]}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {order.buyer?.full_name ?? order.processor?.full_name ?? 'Buyer'} · {order.quantity} kg · {new Date(order.created_at).toLocaleDateString('en-IN')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-primary">₹{order.total_price.toLocaleString('en-IN')}</p>
                    <p className="text-xs text-muted-foreground/80">Total value</p>
                  </div>
                </div>

                {/* Status Timeline */}
                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border">
                  {statusFlow.map((s, idx) => (
                    <div key={s} className="flex items-center gap-2 flex-1">
                      <div className={`w-3 h-3 rounded-full shrink-0 ${
                        idx <= currentIdx ? 'bg-green-500' : 'bg-white/10'
                      } ${idx === currentIdx ? 'ring-2 ring-green-500/30' : ''}`} />
                      <span className={`text-xs ${idx <= currentIdx ? 'text-primary' : 'text-muted-foreground/80'}`}>
                        {s.replace('_', ' ')}
                      </span>
                      {idx < statusFlow.length - 1 && (
                        <div className={`flex-1 h-px ${idx < currentIdx ? 'bg-green-700' : 'bg-white/10'}`} />
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </DashboardLayout>
  );
}
