'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/PageHeader';
import { useAuth } from '@/contexts/AuthContext';
import { orderService } from '@/services/orders';
import { processingService } from '@/services/processing';
import { motion } from 'framer-motion';
import { Factory } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ProcessorOrdersPage() {
  const { profile } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) return;
    orderService.getByParty(profile.id, 'processor').then(data => {
      setOrders(data || []);
      setLoading(false);
    });
  }, [profile]);

  const updateStatus = async (orderId: string, status: any) => {
    try {
      await orderService.updateStatus(orderId, status);
      toast.success(`Status updated to ${status}`);
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
    } catch { toast.error('Update failed'); }
  };

  const statusFlow = ['confirmed', 'packed', 'in_transit', 'delivered'];

  return (
    <DashboardLayout allowedRoles={['processor']}>
      <PageHeader title="Processing Orders" subtitle="Active and completed processing jobs" />

      {loading ? (
        <div className="flex items-center justify-center h-40"><div className="spinner" /></div>
      ) : orders.length === 0 ? (
        <div className="glass-card rounded-2xl p-16 text-center">
          <Factory size={48} className="text-orange-400 mx-auto mb-4 opacity-50" />
          <h3 className="text-xl font-semibold text-white mb-2 font-display">No Orders Yet</h3>
          <p className="text-muted-foreground">Orders appear here when farmers accept your processing requests.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order, i) => {
            const currentIdx = statusFlow.indexOf(order.status);
            const nextStatus = statusFlow[currentIdx + 1] as any;
            return (
              <motion.div key={order.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="glass-card p-6 rounded-2xl">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xl">🏭</span>
                      <p className="font-semibold text-foreground">{order.crop?.name} Processing</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full badge-${order.status}`}>{order.status}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">From: {order.farmer?.full_name} · {order.quantity} kg</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="font-bold text-primary text-lg">₹{order.total_price.toLocaleString('en-IN')}</p>
                    </div>
                    {nextStatus && (
                      <button onClick={() => updateStatus(order.id, nextStatus)} className="btn-primary text-sm py-2">
                        Mark {nextStatus.replace('_', ' ')} →
                      </button>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 pt-4 border-t border-border">
                  {statusFlow.map((s, idx) => (
                    <div key={s} className="flex items-center gap-2 flex-1">
                      <div className={`w-3 h-3 rounded-full shrink-0 ${idx <= currentIdx ? 'bg-orange-500' : 'bg-white/10'}`} />
                      <span className={`text-xs ${idx <= currentIdx ? 'text-orange-400' : 'text-muted-foreground/80'}`}>{s.replace('_', ' ')}</span>
                      {idx < statusFlow.length - 1 && <div className={`flex-1 h-px ${idx < currentIdx ? 'bg-orange-700' : 'bg-white/10'}`} />}
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
