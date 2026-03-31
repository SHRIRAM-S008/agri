import { supabase } from '@/lib/supabase';
import type { Order } from '@/lib/types';

export const orderService = {
  async createFromOffer(offer: any) {
    const isProcessor = !!offer.processor_id;
    const orderData: Partial<Order> = {
      offer_id: offer.id,
      farmer_id: offer.crop.farmer_id,
      buyer_id: isProcessor ? undefined : offer.buyer_id,
      processor_id: isProcessor ? offer.processor_id : undefined,
      crop_id: offer.crop_id,
      type: isProcessor ? 'raw' : 'raw',
      quantity: offer.quantity,
      total_price: offer.offer_price * offer.quantity,
      status: 'confirmed',
    };

    const { data, error } = await supabase.from('orders').insert(orderData).select().single();
    if (error) throw error;

    // Update crop status to processing/sold
    await supabase.from('crops').update({
      status: isProcessor ? 'processing' : 'sold'
    }).eq('id', offer.crop_id);

    // Update traceability
    const { data: trace } = await supabase
      .from('traceability_logs')
      .select('id, events')
      .eq('crop_id', offer.crop_id)
      .single();

    if (trace) {
      const newEvent = {
        type: isProcessor ? 'PROCESSING_STARTED' : 'SOLD',
        timestamp: new Date().toISOString(),
        actor: isProcessor ? offer.processor_id : offer.buyer_id,
        description: isProcessor ? 'Crop sent for processing' : 'Crop sold to buyer',
        metadata: { order_id: data.id, price: offer.offer_price }
      };
      await supabase.from('traceability_logs').update({
        events: [...(trace.events || []), newEvent]
      }).eq('id', trace.id);
    }

    return data;
  },

  async getByParty(userId: string, role: string) {
    let query = supabase
      .from('orders')
      .select(`
        *,
        farmer:profiles!farmer_id(id, full_name),
        buyer:profiles!buyer_id(id, full_name),
        processor:profiles!processor_id(id, full_name),
        crop:crops!crop_id(id, name, location),
        product:products!product_id(id, name, processing_type)
      `)
      .order('created_at', { ascending: false });

    if (role === 'farmer') query = query.eq('farmer_id', userId);
    else if (role === 'buyer') query = query.eq('buyer_id', userId);
    else if (role === 'processor') query = query.eq('processor_id', userId);

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async getAll() {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        farmer:profiles!farmer_id(id, full_name),
        buyer:profiles!buyer_id(id, full_name),
        processor:profiles!processor_id(id, full_name),
        crop:crops!crop_id(id, name)
      `)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async updateStatus(orderId: string, status: Order['status']) {
    const { data, error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', orderId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },
};
