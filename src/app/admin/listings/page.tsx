'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/PageHeader';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Sprout, MapPin, CalendarDays, QrCode } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function AdminListingsPage() {
  const [crops, setCrops] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const { data } = await supabase
        .from('crops')
        .select('*, farmer:profiles!farmer_id(full_name, location)')
        .order('created_at', { ascending: false });
      setCrops(data || []);
    } catch {
      toast.error('Failed to load listings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const removeListing = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to permanently remove "${name}" from the platform?`)) return;
    const { error } = await supabase.from('crops').delete().eq('id', id);
    if (!error) { toast.success(`${name} listing removed successfully`); load(); }
    else toast.error('Failed to remove listing from database');
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'available':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-emerald-100 text-emerald-800 border border-emerald-200">Available</span>;
      case 'sold':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-slate-100 text-slate-600 border border-slate-200">Sold Out</span>;
      case 'hidden':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-orange-100 text-orange-800 border border-orange-200">Hidden</span>;
      default:
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-secondary text-muted-foreground border border-border">{status}</span>;
    }
  };

  return (
    <DashboardLayout allowedRoles={['admin']}>
      <PageHeader title="Platform Listings" subtitle={`${crops.length} active crop inventories verified`} />

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="premium-card bg-white border border-border shadow-sm rounded-xl overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="border-b border-border bg-secondary/40">
                <th className="px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Commodity</th>
                <th className="px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Vendor Details</th>
                <th className="px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Inventory & Value</th>
                <th className="px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Parameters</th>
                <th className="px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-right">Moderation Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              <AnimatePresence initial={false}>
                {crops.map((crop, i) => (
                  <motion.tr 
                    key={crop.id} 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ delay: Math.min(i * 0.03, 0.4) }}
                    className="hover:bg-secondary/30 transition-colors group"
                  >
                    {/* Commodity */}
                    <td className="px-5 py-4 align-top">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center border border-emerald-100 shrink-0">
                          <Sprout size={18} className="text-emerald-700" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-foreground text-sm">{crop.name}</span>
                          </div>
                          <div className="text-xs text-muted-foreground mt-0.5">{crop.id.slice(0, 8).toUpperCase()}</div>
                        </div>
                      </div>
                    </td>
                    
                    {/* Vendor */}
                    <td className="px-5 py-4 align-top">
                      <div className="text-sm font-semibold text-foreground">{crop.farmer?.full_name ?? '—'}</div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                         <MapPin size={12} /> {crop.location}
                      </div>
                    </td>

                    {/* Inventory & Value */}
                    <td className="px-5 py-4 align-top">
                      <div className="text-sm font-bold text-foreground">{crop.quantity.toLocaleString('en-IN')} <span className="text-xs font-normal text-muted-foreground">kg</span></div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        <span className="font-semibold text-primary">₹{crop.price_per_unit}</span> / kg
                      </div>
                    </td>

                    {/* Parameters */}
                    <td className="px-5 py-4 align-top">
                      <div className="flex flex-wrap gap-2 mb-2">
                        {getStatusBadge(crop.status)}
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-secondary text-foreground border border-border">
                          {crop.quality}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-[11px] text-muted-foreground font-medium">
                        <CalendarDays size={12} /> Listed on {new Date(crop.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4 align-top">
                      <div className="flex items-center justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                         <Link 
                            href={`/trace/${crop.id}`}
                            className="bg-white border border-border text-muted-foreground hover:bg-secondary hover:text-foreground hover:border-border/80 transition-all font-medium rounded-lg text-xs px-3 py-1.5 flex items-center justify-center gap-1.5"
                            title="Print Cargo Tag"
                         >
                            <QrCode size={14} /> Tag
                         </Link>
                         <button 
                            onClick={() => removeListing(crop.id, crop.name)} 
                            className="bg-white border border-border text-muted-foreground hover:bg-red-50 hover:text-red-700 hover:border-red-200 transition-all font-medium rounded-lg text-xs px-3 py-1.5 flex items-center justify-center gap-1.5 shadow-sm"
                            title="Remove Listing"
                          >
                           <Trash2 size={14} /> Remove
                         </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
          
          {crops.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 px-4">
                <Trash2 size={32} className="text-muted-foreground opacity-50 mb-3" />
                <h3 className="text-sm font-semibold text-foreground">No active listings</h3>
                <p className="text-xs text-muted-foreground mt-1">Platform inventory is completely empty.</p>
            </div>
          )}
        </div>
      )}
    </DashboardLayout>
  );
}
