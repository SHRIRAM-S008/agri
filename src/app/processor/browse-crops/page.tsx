'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/PageHeader';
import { cropService } from '@/services/crops';
import { processingService } from '@/services/processing';
import { useAuth } from '@/contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, X, Factory } from 'lucide-react';
import toast from 'react-hot-toast';
import type { Crop } from '@/lib/types';

const processingTypes = ['Tomato Paste', 'Tomato Powder', 'Tomato Juice', 'Onion Powder', 'Potato Chips', 'Potato Flour', 'Rice Flour', 'Wheat Flour', 'Sugarcane Juice', 'Fruit Jam', 'Dried Herbs', 'Cold Pressed Oil', 'Other'];

export default function BrowseCropsPage() {
  const { profile } = useAuth();
  const [crops, setCrops] = useState<Crop[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCrop, setSelectedCrop] = useState<Crop | null>(null);
  const [form, setForm] = useState({ processingType: '', quantity: '', proposedPrice: '', expectedOutput: '', message: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    cropService.getAll({ status: 'available' }).then(data => {
      setCrops((data || []) as Crop[]);
      setLoading(false);
    });
  }, []);

  const filtered = crops.filter(c => !search || c.name.toLowerCase().includes(search.toLowerCase()));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCrop || !profile) return;
    setSubmitting(true);
    try {
      await processingService.create({
        processor_id: profile.id,
        crop_id: selectedCrop.id,
        processing_type: form.processingType,
        quantity: parseFloat(form.quantity),
        proposed_price: parseFloat(form.proposedPrice),
        expected_output: form.expectedOutput || undefined,
        message: form.message || undefined,
        status: 'pending',
      });
      toast.success('Processing request sent to farmer! 🏭');
      setSelectedCrop(null);
      setForm({ processingType: '', quantity: '', proposedPrice: '', expectedOutput: '', message: '' });
    } catch (err: any) {
      toast.error(err.message ?? 'Failed to submit request');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout allowedRoles={['processor']}>
      <PageHeader title="Browse Raw Crops" subtitle="Find crops to process into value-added products" />

      <div className="flex gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/80" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} className="input-field pl-9" placeholder="Search crops..." />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40"><div className="spinner" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground/80">No crops available for processing.</div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {filtered.map((crop, i) => {
            const processingMap: Record<string, string> = {
              Tomato: 'Tomato Paste / Powder / Juice',
              Onion: 'Onion Powder / Flakes',
              Potato: 'Chips / Flour',
              Mango: 'Pulp / Jam / Dried',
              Banana: 'Banana Chips / Flour',
            };
            return (
              <motion.div
                key={crop.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="glass-card p-5 rounded-2xl hover:border-orange-600/40 transition-all duration-300"
              >
                <div className="text-3xl mb-3">🌾</div>
                <h3 className="font-semibold text-foreground text-lg font-display mb-1">{crop.name}</h3>
                <div className="flex items-center gap-1 text-xs text-muted-foreground/80 mb-2">
                  <MapPin size={12} /> {crop.location}
                </div>
                {processingMap[crop.name] && (
                  <div className="glass-card px-3 py-2 rounded-lg mb-3">
                    <p className="text-xs text-orange-400">⚙️ Can be processed into:</p>
                    <p className="text-xs text-gray-600 mt-0.5">{processingMap[crop.name]}</p>
                  </div>
                )}
                <div className="flex items-center justify-between mb-4">
                  <span className="text-muted-foreground text-sm">{crop.quantity} {crop.unit}</span>
                  <div className="text-right">
                    <span className="text-primary font-bold">₹{crop.price_per_unit}</span>
                    <span className="text-muted-foreground/80 text-xs">/{crop.unit}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 mb-4">
                  <span className={`text-xs px-2 py-0.5 rounded-full badge-${crop.status}`}>{crop.status}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-muted-foreground">{crop.quality}</span>
                </div>
                <button
                  onClick={() => { setSelectedCrop(crop); setForm({ processingType: '', quantity: '', proposedPrice: String(crop.price_per_unit), expectedOutput: '', message: '' }); }}
                  className="btn-primary w-full text-sm"
                >
                  <Factory size={14} className="inline mr-1.5" />
                  Request Processing
                </button>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Processing Request Modal */}
      <AnimatePresence>
        {selectedCrop && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/10 backdrop-blur-none z-50 flex items-center justify-center p-4"
            onClick={e => e.target === e.currentTarget && setSelectedCrop(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-card p-8 rounded-2xl w-full max-w-md"
            >
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold text-foreground font-display">Processing Request</h3>
                  <p className="text-muted-foreground text-sm">{selectedCrop.name} · {selectedCrop.quantity} {selectedCrop.unit} available</p>
                </div>
                <button onClick={() => setSelectedCrop(null)} className="text-muted-foreground/80 hover:text-white"><X size={20} /></button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">Processing Type</label>
                  <select value={form.processingType} onChange={e => setForm(f => ({ ...f, processingType: e.target.value }))} className="input-field" required>
                    <option value="">Select processing type...</option>
                    {processingTypes.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm text-muted-foreground mb-2 block">Quantity ({selectedCrop.unit})</label>
                    <input type="number" value={form.quantity} onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))} className="input-field" max={selectedCrop.quantity} min="1" required />
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground mb-2 block">Your Price (₹/{selectedCrop.unit})</label>
                    <input type="number" value={form.proposedPrice} onChange={e => setForm(f => ({ ...f, proposedPrice: e.target.value }))} className="input-field" step="0.5" required />
                  </div>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">Expected Output (optional)</label>
                  <input type="text" value={form.expectedOutput} onChange={e => setForm(f => ({ ...f, expectedOutput: e.target.value }))} className="input-field" placeholder="e.g. 300kg tomato paste..." />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">Message to Farmer</label>
                  <textarea value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} className="input-field resize-none" rows={2} placeholder="Details about your processing offer..." />
                </div>
                <div className="flex gap-3">
                  <button type="submit" disabled={submitting} className="btn-primary flex-1">
                    {submitting ? 'Submitting...' : '🏭 Send Request'}
                  </button>
                  <button type="button" onClick={() => setSelectedCrop(null)} className="btn-secondary px-5">Cancel</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}
