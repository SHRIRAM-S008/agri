'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/PageHeader';
import { orderService } from '@/services/orders';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, Truck, CheckCircle2, Factory, Sprout, QrCode } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const data = await orderService.getAll();
      setOrders(data || []);
    } catch {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const updateStatus = async (orderId: string, status: any) => {
    try {
      await orderService.updateStatus(orderId, status);
      toast.success(`Order updated to ${status}`);
      load();
    } catch { toast.error('Update failed'); }
  };

  const statusOptions = ['pending', 'confirmed', 'packed', 'in_transit', 'delivered'];

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'in_transit': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'packed': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'confirmed': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-secondary text-muted-foreground border-border';
    }
  };

  return (
    <DashboardLayout allowedRoles={['admin']}>
      <PageHeader title="Platform Transactions" subtitle={`${orders.length} total orders across the platform`} />

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="premium-card bg-white border border-border shadow-sm rounded-xl overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="border-b border-border bg-secondary/40">
                <th className="px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Product</th>
                <th className="px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Origin (Farmer)</th>
                <th className="px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Destination (Client)</th>
                <th className="px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Parameters</th>
                <th className="px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Financials</th>
                <th className="px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Type</th>
                <th className="px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-right">Update Flow</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              <AnimatePresence initial={false}>
                {orders.map((order, i) => (
                  <motion.tr 
                    key={order.id} 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    transition={{ delay: Math.min(i * 0.03, 0.3) }}
                    className="hover:bg-secondary/30 transition-colors group"
                  >
                    <td className="px-5 py-4 align-top">
                      <div className="font-semibold text-sm text-foreground">{order.crop?.name ?? order.product?.name ?? 'Unknown'}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{order.id.slice(0, 8).toUpperCase()}</div>
                    </td>
                    <td className="px-5 py-4 align-top">
                      <div className="text-sm font-medium text-foreground">{order.farmer?.full_name ?? '—'}</div>
                    </td>
                    <td className="px-5 py-4 align-top">
                      <div className="text-sm font-medium text-foreground">{order.buyer?.full_name ?? order.processor?.full_name ?? '—'}</div>
                      <span className="text-[10px] text-muted-foreground px-1.5 py-0.5 rounded bg-secondary mt-1 inline-block border border-border">
                        {order.buyer_id ? 'Buyer' : 'Processor'}
                      </span>
                    </td>
                    <td className="px-5 py-4 align-top">
                      <div className="text-sm font-medium text-foreground">{order.quantity} <span className="text-xs text-muted-foreground font-normal">kg</span></div>
                      <div className="text-xs text-muted-foreground mt-0.5">{new Date(order.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                    </td>
                    <td className="px-5 py-4 align-top">
                      <div className="text-sm font-bold text-foreground">₹{order.total_price?.toLocaleString('en-IN')}</div>
                      <div className="text-[10px] text-muted-foreground mt-0.5">₹{(order.total_price / order.quantity).toFixed(2)} / kg</div>
                    </td>
                    <td className="px-5 py-4 align-top">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold border ${
                        order.type === 'raw' 
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                          : 'bg-orange-50 text-orange-700 border-orange-200'
                      }`}>
                        {order.type === 'raw' ? <Sprout size={12} className="mr-1" /> : <Factory size={12} className="mr-1" />}
                        {order.type}
                      </span>
                    </td>
                    <td className="px-5 py-4 align-top">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase border ${getStatusBadge(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 align-top text-right flex flex-col items-end gap-2">
                      <select
                        value={order.status}
                        onChange={e => updateStatus(order.id, e.target.value)}
                        className="bg-white border border-border rounded-lg px-2.5 py-1.5 text-xs text-foreground font-medium focus:outline-none focus:ring-2 focus:ring-primary shadow-sm hover:border-primary/50 transition-colors w-full max-w-[130px]"
                      >
                        {statusOptions.map(s => <option key={s} value={s}>{s.replace('_', ' ').toUpperCase()}</option>)}
                      </select>
                      <Link href={`/trace/${order.crop_id || order.id}`} className="text-[10px] text-primary hover:underline flex items-center justify-end gap-1 font-bold tracking-wider uppercase mt-1">
                         <QrCode size={12} /> Trace
                      </Link>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
          
          {orders.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 px-4">
                <Package size={32} className="text-muted-foreground opacity-50 mb-3" />
                <h3 className="text-sm font-semibold text-foreground">No orders tracked yet</h3>
                <p className="text-xs text-muted-foreground mt-1">Platform transactions will appear here.</p>
            </div>
          )}
        </div>
      )}
    </DashboardLayout>
  );
}
