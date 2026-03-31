'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/PageHeader';
import { cropService } from '@/services/crops';
import { offerService } from '@/services/offers';
import { useAuth } from '@/contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, X, Leaf, User2 } from 'lucide-react';
import toast from 'react-hot-toast';
import type { Crop } from '@/lib/types';

export default function MarketplacePage() {
  const { profile } = useAuth();
  const [crops, setCrops] = useState<Crop[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [selectedCrop, setSelectedCrop] = useState<Crop | null>(null);
  const [offerForm, setOfferForm] = useState({ price: '', quantity: '', message: '' });
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    try {
      const data = await cropService.getAll({ status: 'available' });
      setCrops((data || []) as Crop[]);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load marketplace data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = crops.filter(c => {
    const matchSearch = !search || c.name.toLowerCase().includes(search.toLowerCase());
    const matchLocation = !locationFilter || (c.location || '').toLowerCase().includes(locationFilter.toLowerCase());
    const matchPrice = !maxPrice || c.price_per_unit <= parseFloat(maxPrice);
    return matchSearch && matchLocation && matchPrice;
  });

  const handleOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCrop || !profile) return;
    const qty = parseFloat(offerForm.quantity);
    if (qty > selectedCrop.quantity) {
      toast.error(`Only ${selectedCrop.quantity} ${selectedCrop.unit} available`);
      return;
    }
    setSubmitting(true);
    try {
      await offerService.create({
        crop_id: selectedCrop.id,
        buyer_id: profile.id,
        offer_price: parseFloat(offerForm.price),
        quantity: qty,
        message: offerForm.message || undefined,
        status: 'pending',
      });
      toast.success('Offer submitted securely');
      setSelectedCrop(null);
      setOfferForm({ price: '', quantity: '', message: '' });
    } catch (err: any) {
      toast.error(err.message ?? 'Failed to submit offer');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout allowedRoles={['buyer']}>
      <PageHeader
        title="Marketplace"
        subtitle={`Viewing ${filtered.length} active listings`}
      />

      {/* SaaS Search Bar */}
      <div className="flex bg-white border border-border rounded-xl mb-8 shadow-sm">
        <div className="relative flex-1 group">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-transparent border-none rounded-l-xl pl-11 pr-4 py-3.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-0"
            placeholder="Search by product name..."
          />
        </div>
        
        <div className="w-px bg-border my-2" />
        
        <div className="flex items-center gap-1.5 px-2 relative min-w-[200px]">
           <MapPin size={16} className="absolute left-4 text-muted-foreground" />
           <input
              type="text"
              value={locationFilter}
              onChange={e => setLocationFilter(e.target.value)}
              className="w-full bg-transparent border-none rounded-r-xl pl-8 pr-4 py-3.5 text-sm text-foreground outline-none focus:ring-0 placeholder:text-muted-foreground"
              placeholder="Any location"
            />
            {(search || locationFilter || maxPrice) && (
              <button 
                onClick={() => { setSearch(''); setLocationFilter(''); setMaxPrice(''); }} 
                className="text-muted-foreground hover:text-foreground p-2 mr-1 transition-colors"
                title="Clear filters"
              >
                <X size={16} />
              </button>
            )}
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 space-y-4">
           <div className="spinner" />
           <p className="text-sm font-medium text-muted-foreground">Syncing marketplace...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="premium-card p-24 text-center rounded-xl flex flex-col items-center justify-center border-dashed border-2">
            <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mb-4">
                <Search size={24} className="text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground tracking-tight mb-1">No matches found</h3>
            <p className="text-sm text-muted-foreground">Adjust your search parameters to find available listings.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((crop, i) => (
            <motion.div
              key={crop.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="premium-card p-6 rounded-xl flex flex-col justify-between hover:shadow-lg transition-all duration-300"
            >
              <div>
                <div className="flex items-start justify-between mb-5">
                  <div className="w-12 h-12 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                     <Leaf size={24} className="text-primary" strokeWidth={1.5} />
                  </div>
                  <div className="flex gap-2">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-secondary text-foreground capitalize">
                      {crop.quality} Grade
                    </span>
                  </div>
                </div>
                
                <h3 className="font-semibold text-foreground text-xl capitalize tracking-tight mb-1">{crop.name}</h3>
                <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground mb-6">
                  <MapPin size={14} /> 
                  <span className="truncate">{(crop as any).farmer?.location || crop.location || 'Global'}</span>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-secondary/50 rounded-lg p-3 border border-border/50">
                    <span className="text-xs font-medium text-muted-foreground block mb-1">Volume</span>
                    <span className="text-foreground font-semibold text-lg">{crop.quantity} <span className="text-sm text-muted-foreground font-medium">{crop.unit}</span></span>
                  </div>
                  <div className="bg-secondary/50 rounded-lg p-3 border border-border/50">
                    <span className="text-xs font-medium text-muted-foreground block mb-1">Unit Price</span>
                    <div className="text-foreground font-semibold text-lg hover:text-primary transition-colors">
                      ₹{crop.price_per_unit} <span className="text-sm text-muted-foreground font-medium">/{crop.unit}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-3 mb-5 border-t border-border pt-4">
                  <div className="w-8 h-8 rounded-full bg-secondary border border-border flex items-center justify-center shrink-0">
                    <User2 size={14} className="text-muted-foreground" />
                  </div>
                  <div className="overflow-hidden">
                      <p className="text-xs text-muted-foreground mb-0.5 font-medium">Verified Supplier</p>
                      <p className="text-sm text-foreground font-semibold truncate">{(crop as any).farmer?.full_name ?? 'Farm Corp'}</p>
                  </div>
                </div>

                <button
                  onClick={() => { setSelectedCrop(crop); setOfferForm({ price: String(crop.price_per_unit), quantity: '', message: '' }); }}
                  className="btn-primary w-full py-2.5 rounded-lg text-sm font-semibold tracking-wide transition-all"
                >
                  Make Offer
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Offer Modal */}
      <AnimatePresence>
        {selectedCrop && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white shadow-xl p-8 rounded-xl w-full max-w-lg border border-border"
            >
              <div className="flex items-start justify-between mb-8">
                <div>
                  <h3 className="text-2xl font-semibold text-foreground tracking-tight mb-1">Initiate Offer</h3>
                  <p className="text-sm font-medium text-muted-foreground">
                    {selectedCrop.name} · {selectedCrop.quantity} {selectedCrop.unit} available
                  </p>
                </div>
                <button onClick={() => setSelectedCrop(null)} className="p-2 bg-secondary hover:bg-secondary/80 rounded-md text-muted-foreground transition-all">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleOffer} className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="text-xs font-semibold text-foreground uppercase tracking-wider mb-2 block">Offer Price / {selectedCrop.unit}</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₹</span>
                      <input
                        type="number"
                        value={offerForm.price}
                        onChange={e => setOfferForm(f => ({ ...f, price: e.target.value }))}
                        className="input-field pl-8"
                        step="0.5"
                        min="1"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-foreground uppercase tracking-wider mb-2 block">Buy Volume</label>
                    <input
                      type="number"
                      value={offerForm.quantity}
                      onChange={e => setOfferForm(f => ({ ...f, quantity: e.target.value }))}
                      className="input-field"
                      max={selectedCrop.quantity}
                      min="1"
                      required
                    />
                  </div>
                </div>

                <div className="bg-emerald-50 rounded-lg p-6 border border-emerald-100 flex flex-col items-center justify-center mt-2">
                    <p className="text-emerald-800 text-xs font-semibold uppercase tracking-wider mb-1">Total Value</p>
                    <p className="text-emerald-950 font-semibold text-4xl tracking-tight">
                      ₹{(parseFloat(offerForm.price || '0') * parseFloat(offerForm.quantity || '0')).toLocaleString('en-IN')}
                    </p>
                </div>

                <div className="flex items-center gap-3 pt-4">
                  <button type="button" onClick={() => setSelectedCrop(null)} className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-foreground bg-secondary hover:bg-secondary/80 transition-colors">
                    Cancel
                  </button>
                  <button type="submit" disabled={submitting} className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white bg-primary hover:bg-primary/90 shadow-sm transition-all focus:ring-2 focus:ring-primary focus:ring-offset-2">
                    {submitting ? 'Submitting...' : 'Submit Offer'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}
