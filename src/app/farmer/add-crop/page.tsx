'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/PageHeader';
import { useAuth } from '@/contexts/AuthContext';
import { cropService } from '@/services/crops';
import { motion } from 'framer-motion';
import { Banknote, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const cropTypes = ['Tomato', 'Onion', 'Potato', 'Rice', 'Wheat', 'Sugarcane', 'Cotton', 'Corn', 'Cabbage', 'Carrot', 'Brinjal', 'Chilli', 'Mango', 'Banana', 'Turmeric'];

export default function AddCropPage() {
  const { profile } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    customName: '',
    quantity: '',
    unit: 'kg',
    price_per_unit: '',
    location: profile?.location ?? '',
    harvest_date: '',
    quality: 'Grade A' as const,
    description: '',
  });

  const update = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setLoading(true);
    try {
      const cropName = form.name === 'Other' ? form.customName : form.name;
      await cropService.create({
        farmer_id: profile.id,
        name: cropName,
        quantity: parseFloat(form.quantity),
        unit: form.unit,
        price_per_unit: parseFloat(form.price_per_unit),
        location: form.location,
        harvest_date: form.harvest_date || undefined,
        quality: form.quality,
        description: form.description,
        status: 'available',
      });
      toast.success(`${cropName} published successfully`);
      router.push('/farmer/my-crops');
    } catch (err: any) {
      toast.error(err.message ?? 'Failed to add crop');
    } finally {
      setLoading(false);
    }
  };

  // Price suggestion (simulated market intelligence)
  const priceSuggestion: Record<string, number> = {
    Tomato: 28, Onion: 22, Potato: 18, Rice: 40, Wheat: 25,
    Sugarcane: 3, Cotton: 65, Corn: 20, Mango: 80, Banana: 30, Turmeric: 110,
  };
  const suggested = form.name && priceSuggestion[form.name] ? priceSuggestion[form.name] : null;

  return (
    <DashboardLayout allowedRoles={['farmer']}>
      <div className="max-w-3xl mx-auto">
        <PageHeader
          title="List New Crop"
          subtitle="Add your fresh produce to the AgriOx marketplace"
        />

        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="premium-card p-8 rounded-xl bg-white border border-border shadow-sm"
        >
          {suggested && (
            <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-4 mb-6 flex items-start gap-3">
              <Banknote size={18} className="text-primary mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="text-sm text-emerald-900 font-semibold mb-0.5">Market Price Insight</p>
                <p className="text-xs font-medium text-emerald-800/80">
                  {form.name} is currently trading at <span className="text-emerald-900 font-bold">₹{suggested}/kg</span>. Use this price to increase your chances of a quick sale.
                </p>
              </div>
              <button
                type="button"
                onClick={() => update('price_per_unit', String(suggested))}
                className="text-xs bg-white border border-emerald-200 text-emerald-800 font-semibold py-1.5 px-3 rounded-md hover:bg-emerald-100 transition-colors shrink-0 shadow-sm"
              >
                Apply Price
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-sm font-medium text-foreground block mb-1.5">Crop Type</label>
              <select
                value={form.name}
                onChange={e => update('name', e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-border bg-transparent text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors appearance-none"
                required
              >
                <option value="">Select crop...</option>
                {cropTypes.map(c => <option key={c} value={c}>{c}</option>)}
                <option value="Other">Other</option>
              </select>
            </div>

            {form.name === 'Other' && (
              <div>
                <label className="text-sm font-medium text-foreground block mb-1.5">Custom Crop Name</label>
                <input 
                  type="text" 
                  value={form.customName} 
                  onChange={e => update('customName', e.target.value)} 
                  className="w-full px-3 py-2.5 rounded-lg border border-border bg-transparent text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors" 
                  placeholder="E.g. Dragon Fruit" 
                  required 
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground block mb-1.5">Quantity</label>
                <input 
                  type="number" 
                  value={form.quantity} 
                  onChange={e => update('quantity', e.target.value)} 
                  className="w-full px-3 py-2.5 rounded-lg border border-border bg-transparent text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors" 
                  placeholder="0" 
                  min="1" 
                  required 
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground block mb-1.5">Unit</label>
                <select 
                  value={form.unit} 
                  onChange={e => update('unit', e.target.value)} 
                  className="w-full px-3 py-2.5 rounded-lg border border-border bg-transparent text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors appearance-none"
                >
                  <option value="kg">Kilogram (kg)</option>
                  <option value="quintal">Quintal</option>
                  <option value="ton">Metric Ton</option>
                  <option value="piece">Piece</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground block mb-1.5">Price per Unit (₹)</label>
                <input 
                  type="number" 
                  value={form.price_per_unit} 
                  onChange={e => update('price_per_unit', e.target.value)} 
                  className="w-full px-3 py-2.5 rounded-lg border border-border bg-transparent text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors" 
                  placeholder="0.00" 
                  min="1" 
                  step="0.5" 
                  required 
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground block mb-1.5">Quality Grade</label>
                <select 
                  value={form.quality} 
                  onChange={e => update('quality', e.target.value as any)} 
                  className="w-full px-3 py-2.5 rounded-lg border border-border bg-transparent text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors appearance-none"
                >
                  <option value="Grade A">Grade A (Premium)</option>
                  <option value="Grade B">Grade B (Standard)</option>
                  <option value="Grade C">Grade C (Basic)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground block mb-1.5">Location</label>
                <input 
                  type="text" 
                  value={form.location} 
                  onChange={e => update('location', e.target.value)} 
                  className="w-full px-3 py-2.5 rounded-lg border border-border bg-transparent text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors" 
                  placeholder="E.g. Madurai, TN" 
                  required 
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground block mb-1.5">Harvest Date</label>
                <input 
                  type="date" 
                  value={form.harvest_date} 
                  onChange={e => update('harvest_date', e.target.value)} 
                  className="w-full px-3 py-2.5 rounded-lg border border-border bg-transparent text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors" 
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground block mb-1.5">Description (optional)</label>
              <textarea
                value={form.description}
                onChange={e => update('description', e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-border bg-transparent text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors resize-none"
                rows={3}
                placeholder="Details about seed variety, organic status, or delivery terms."
              />
            </div>

            <div className="flex gap-3 pt-6 border-t border-border mt-6">
              <button type="button" onClick={() => router.back()} className="flex-1 py-2.5 rounded-lg text-sm font-medium text-foreground bg-secondary hover:bg-secondary/80 transition-colors border border-border focus:outline-none focus:ring-2 focus:ring-secondary/50">
                Cancel
              </button>
              <button type="submit" disabled={loading} className="flex-[2] py-2.5 rounded-lg text-sm font-semibold text-white bg-primary hover:bg-primary/90 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 shadow-sm disabled:opacity-50 flex items-center justify-center">
                {loading ? <Loader2 size={16} className="animate-spin" /> : 'Publish Listing'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
