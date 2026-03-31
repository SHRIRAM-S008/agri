import { supabase } from '@/lib/supabase';
import type { Crop } from '@/lib/types';

export const cropService = {
  async getAll(filters?: { status?: string; name?: string; maxPrice?: number; location?: string }) {
    let query = supabase
      .from('crops')
      .select('*, farmer:profiles!farmer_id(id, full_name, location, phone)')
      .order('created_at', { ascending: false });

    if (filters?.status) query = query.eq('status', filters.status);
    if (filters?.name) query = query.ilike('name', `%${filters.name}%`);
    if (filters?.maxPrice) query = query.lte('price_per_unit', filters.maxPrice);
    if (filters?.location) query = query.ilike('location', `%${filters.location}%`);

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('crops')
      .select('*, farmer:profiles!farmer_id(id, full_name, location, phone)')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },

  async getByFarmer(farmerId: string) {
    const { data, error } = await supabase
      .from('crops')
      .select('*')
      .eq('farmer_id', farmerId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async create(crop: Partial<Crop>) {
    const { data, error } = await supabase.from('crops').insert(crop).select().single();
    if (error) throw error;
    // Create traceability log
    await supabase.from('traceability_logs').insert({
      crop_id: data.id,
      events: [{
        type: 'CROP_LISTED',
        timestamp: new Date().toISOString(),
        actor: crop.farmer_id,
        description: `Crop "${crop.name}" listed by farmer`,
      }],
    });
    return data;
  },

  async update(id: string, updates: Partial<Crop>) {
    const { data, error } = await supabase.from('crops').update(updates).eq('id', id).select().single();
    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase.from('crops').delete().eq('id', id);
    if (error) throw error;
  },
};
