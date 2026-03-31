export type Role = 'farmer' | 'processor' | 'buyer' | 'admin';
export type CropStatus = 'available' | 'sold' | 'processing';
export type OfferStatus = 'pending' | 'accepted' | 'rejected';
export type OrderStatus = 'confirmed' | 'packed' | 'in_transit' | 'delivered';
export type ProcessingStatus = 'pending' | 'approved' | 'rejected' | 'completed';
export type OrderType = 'raw' | 'processed';
export type Quality = 'Grade A' | 'Grade B' | 'Grade C';

export interface Profile {
  id: string;
  full_name: string;
  role: Role;
  phone?: string;
  location?: string;
  avatar_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Crop {
  id: string;
  farmer_id: string;
  name: string;
  quantity: number;
  unit: string;
  price_per_unit: number;
  location: string;
  harvest_date?: string;
  quality: Quality;
  description?: string;
  image_url?: string;
  status: CropStatus;
  created_at: string;
  updated_at: string;
  // joined
  farmer?: Profile;
}

export interface Product {
  id: string;
  processor_id: string;
  crop_id?: string;
  name: string;
  processing_type: string;
  quantity: number;
  unit: string;
  price_per_unit: number;
  quality: Quality;
  description?: string;
  image_url?: string;
  batch_id: string;
  status: 'available' | 'sold';
  created_at: string;
  updated_at: string;
  // joined
  processor?: Profile;
  crop?: Crop;
}

export interface Offer {
  id: string;
  crop_id: string;
  buyer_id?: string;
  processor_id?: string;
  offer_price: number;
  quantity: number;
  message?: string;
  status: OfferStatus;
  created_at: string;
  updated_at: string;
  // joined
  crop?: Crop;
  buyer?: Profile;
  processor?: Profile;
}

export interface Order {
  id: string;
  offer_id?: string;
  farmer_id: string;
  buyer_id?: string;
  processor_id?: string;
  crop_id?: string;
  product_id?: string;
  type: OrderType;
  quantity: number;
  total_price: number;
  status: OrderStatus;
  notes?: string;
  created_at: string;
  updated_at: string;
  // joined
  farmer?: Profile;
  buyer?: Profile;
  processor?: Profile;
  crop?: Crop;
  product?: Product;
}

export interface ProcessingRequest {
  id: string;
  processor_id: string;
  crop_id: string;
  processing_type: string;
  quantity: number;
  proposed_price: number;
  expected_output?: string;
  message?: string;
  status: ProcessingStatus;
  created_at: string;
  updated_at: string;
  // joined
  processor?: Profile;
  crop?: Crop;
}

export interface TraceabilityLog {
  id: string;
  crop_id?: string;
  product_id?: string;
  qr_code: string;
  events: TraceEvent[];
  farmer_info?: Record<string, unknown>;
  processor_info?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface TraceEvent {
  type: string;
  timestamp: string;
  actor: string;
  description: string;
  metadata?: Record<string, unknown>;
}

// Database type for Supabase client
export type Database = {
  public: {
    Tables: {
      profiles: { Row: Profile; Insert: Partial<Profile>; Update: Partial<Profile> };
      crops: { Row: Crop; Insert: Partial<Crop>; Update: Partial<Crop> };
      products: { Row: Product; Insert: Partial<Product>; Update: Partial<Product> };
      offers: { Row: Offer; Insert: Partial<Offer>; Update: Partial<Offer> };
      orders: { Row: Order; Insert: Partial<Order>; Update: Partial<Order> };
      processing_requests: { Row: ProcessingRequest; Insert: Partial<ProcessingRequest>; Update: Partial<ProcessingRequest> };
      traceability_logs: { Row: TraceabilityLog; Insert: Partial<TraceabilityLog>; Update: Partial<TraceabilityLog> };
    };
  };
};
