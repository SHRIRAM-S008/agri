'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { motion } from 'framer-motion';
import { TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';
import type { Role } from '@/lib/types';

const roles: { value: Role; label: string; emoji: string; desc: string }[] = [
  { value: 'farmer', label: 'Farmer', emoji: '🌾', desc: 'List crops, get offers, track orders' },
  { value: 'processor', label: 'Processor', emoji: '🏭', desc: 'Buy raw crops, add value, sell products' },
  { value: 'buyer', label: 'Buyer / Exporter', emoji: '🛒', desc: 'Browse products, make offers, place orders' },
  { value: 'admin', label: 'Admin', emoji: '🏢', desc: 'Monitor and manage the full platform' },
];

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [role, setRole] = useState<Role>('farmer');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName, role }
        }
      });
      if (error) throw error;

      if (data.user) {
        await supabase.from('profiles').upsert({
          id: data.user.id,
          full_name: fullName,
          role,
          phone,
          location,
        });
      }

      toast.success('Onboarding Successful! Welcome to AgriOx');
      router.push(`/${role}/dashboard`);
    } catch (err: any) {
      toast.error(err.message ?? 'Onboarding failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-20 relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-[-5%] left-[-5%] w-96 h-96 bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-5%] right-[-5%] w-96 h-96 bg-emerald-400/5 blur-[120px] rounded-full pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="premium-card p-10 w-full max-w-xl bg-white/80 backdrop-blur-xl border border-white/20 relative z-10"
      >
        <div className="flex items-center gap-4 mb-10">
          <Link href="/" className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20 hover:scale-105 transition-transform">
            <TrendingUp size={24} className="text-white" strokeWidth={2.5} />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-foreground tracking-tight leading-none">Join AgriOx</h1>
            <p className="text-xs text-muted-foreground/80 font-bold uppercase tracking-widest mt-1.5">Create your professional profile</p>
          </div>
        </div>

        <form onSubmit={handleRegister} className="space-y-6">
          {/* Role Selection */}
          <div>
            <label className="text-[10px] font-black text-muted-foreground/80 mb-3 block tracking-[.25em] uppercase">Identity & Role</label>
            <div className="grid grid-cols-2 gap-4">
              {roles.map(r => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => setRole(r.value)}
                  className={`p-4 rounded-2xl border text-left transition-all duration-300 relative overflow-hidden ${
                    role === r.value
                      ? 'border-primary bg-primary/5 shadow-premium'
                      : 'border-border bg-white/50 text-muted-foreground/80 hover:border-primary/30 hover:bg-white'
                  }`}
                >
                  <div className="text-2xl mb-2">{r.emoji}</div>
                  <div className={`font-black text-sm tracking-tight ${role === r.value ? 'text-primary' : 'text-foreground'}`}>{r.label}</div>
                  <div className="text-[10px] font-medium leading-tight mt-1 opacity-70 truncate">{r.desc}</div>
                  {role === r.value && (
                    <motion.div layoutId="role-tick" className="absolute top-3 right-3 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                       <div className="w-1.5 h-1.5 bg-white rounded-full" />
                    </motion.div>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black text-muted-foreground/80 mb-2 block tracking-[.2em] uppercase">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                className="input-field bg-secondary/30 border-border focus:bg-white"
                placeholder="Ramesh Kumar"
                required
              />
            </div>
            <div>
              <label className="text-[10px] font-black text-muted-foreground/80 mb-2 block tracking-[.2em] uppercase">Phone</label>
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="input-field bg-secondary/30 border-border focus:bg-white"
                placeholder="+91 9876543210"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-black text-muted-foreground/80 mb-2 block tracking-[.2em] uppercase">Operational Location</label>
            <input
              type="text"
              value={location}
              onChange={e => setLocation(e.target.value)}
              className="input-field bg-secondary/30 border-border focus:bg-white"
              placeholder="Tamil Nadu, India"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black text-muted-foreground/80 mb-2 block tracking-[.2em] uppercase">Email Verification</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="input-field bg-secondary/30 border-border focus:bg-white"
                placeholder="you@example.com"
                required
              />
            </div>
            <div>
              <label className="text-[10px] font-black text-muted-foreground/80 mb-2 block tracking-[.2em] uppercase">Access Key</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="input-field bg-secondary/30 border-border focus:bg-white"
                placeholder="Min 6 characters"
                minLength={6}
                required
              />
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full py-4 text-sm font-bold mt-4 rounded-2xl shadow-xl shadow-primary/20">
            {loading ? 'Authorizing Profile...' : 'Authorize My Account'}
          </button>
        </form>

        <p className="text-center text-muted-foreground/80 text-[10px] font-black tracking-widest uppercase mt-10">
          Already authorized?{' '}
          <Link href="/auth/login" className="text-primary hover:underline underline-offset-4 decoration-primary/30 transition-all">
            Secure Sign-In
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
