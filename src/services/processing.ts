import { supabase } from '@/lib/supabase';
import type { ProcessingRequest } from '@/lib/types';

export const processingService = {
  async getByProcessor(processorId: string) {
    const { data, error } = await supabase
      .from('processing_requests')
      .select(`
        *,
        crop:crops!crop_id(id, name, quantity, location, price_per_unit, farmer_id, farmer:profiles!farmer_id(full_name)),
        processor:profiles!processor_id(id, full_name)
      `)
      .eq('processor_id', processorId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async getForFarmer(farmerId: string) {
    const { data, error } = await supabase
      .from('processing_requests')
      .select(`
        *,
        crop:crops!crop_id(id, name, quantity, farmer_id),
        processor:profiles!processor_id(id, full_name, phone)
      `)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []).filter((r: any) => r.crop?.farmer_id === farmerId);
  },

  async create(request: Partial<ProcessingRequest>) {
    const { data, error } = await supabase.from('processing_requests').insert(request).select().single();
    if (error) throw error;
    return data;
  },

  async updateStatus(id: string, status: ProcessingRequest['status']) {
    const { data, error } = await supabase
      .from('processing_requests')
      .update({ status })
      .eq('id', id)
      .select('*, crop:crops!crop_id(id, farmer_id)')
      .single();
    if (error) throw error;

    if (status === 'approved') {
      await supabase.from('crops').update({ status: 'processing' }).eq('id', data.crop_id);
    }

    return data;
  },
};
