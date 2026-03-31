import { supabase } from '@/lib/supabase';
import type { Offer } from '@/lib/types';

export const offerService = {
  async getForFarmer(farmerId: string) {
    const { data, error } = await supabase
      .from('offers')
      .select(`
        *,
        crop:crops!crop_id(id, name, quantity, price_per_unit, farmer_id),
        buyer:profiles!buyer_id(id, full_name, phone),
        processor:profiles!processor_id(id, full_name, phone)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    // Filter for farmer's crops
    return (data || []).filter((o: any) => o.crop?.farmer_id === farmerId);
  },

  async getByBuyer(buyerId: string) {
    const { data, error } = await supabase
      .from('offers')
      .select('*, crop:crops!crop_id(id, name, quantity, price_per_unit, farmer_id, farmer:profiles!farmer_id(full_name))')
      .eq('buyer_id', buyerId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async getByProcessor(processorId: string) {
    const { data, error } = await supabase
      .from('offers')
      .select('*, crop:crops!crop_id(id, name, quantity, price_per_unit, farmer_id, farmer:profiles!farmer_id(full_name))')
      .eq('processor_id', processorId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async create(offer: Partial<Offer>) {
    const { data, error } = await supabase.from('offers').insert(offer).select().single();
    if (error) throw error;
    return data;
  },

  async updateStatus(offerId: string, status: 'accepted' | 'rejected') {
    const { data, error } = await supabase
      .from('offers')
      .update({ status })
      .eq('id', offerId)
      .select(`
        *,
        crop:crops!crop_id(id, name, farmer_id, price_per_unit)
      `)
      .single();
    if (error) throw error;
    return data;
  },
};
