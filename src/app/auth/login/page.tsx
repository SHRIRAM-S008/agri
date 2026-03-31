'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { motion } from 'framer-motion';
import { Loader2, Eye, EyeOff, LayoutDashboard, Compass, Zap, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import type { Role } from '@/lib/types';

const DEMO_USERS: { role: Role; email: string; password: string; name: string; icon: any; label: string }[] = [
  { role: 'farmer',    email: 'demo.farmer.agrichainx@gmail.com',    password: 'Demo@Farmer123',    name: 'Ramesh Kumar',   icon: ShieldCheck, label: 'Farmer Portal' },
  { role: 'buyer',     email: 'demo.buyer.agrichainx@gmail.com',     password: 'Demo@Buyer123',     name: 'Priya Exports',  icon: Compass,     label: 'Buyer Market' },
  { role: 'processor', email: 'demo.processor.agrichainx@gmail.com', password: 'Demo@Processor123', name: 'Tamil Agro Ltd', icon: Zap,         label: 'Processor Hub' },
  { role: 'admin',     email: 'demo.admin.agrichainx@gmail.com',     password: 'Demo@Admin123',     name: 'Admin',          icon: LayoutDashboard, label: 'Admin View' },
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState<Role | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', data.user.id).single();
      toast.success('Sign in successful');
      router.push(`/${(profile as any)?.role ?? 'buyer'}/dashboard`);
    } catch (err: any) {
      toast.error(err.message ?? 'Sign in failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (demo: typeof DEMO_USERS[number]) => {
    setDemoLoading(demo.role);
    const toastId = toast.loading(`Connecting to ${demo.label}...`);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email: demo.email, password: demo.password });
      if (error) throw error;
      toast.success(`${demo.label} Connected`, { id: toastId });
      router.push(`/${demo.role}/dashboard`);
    } catch (err: any) {
      toast.error(err.message ?? 'Demo login failed', { id: toastId });
    } finally {
      setDemoLoading(null);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-secondary/30 relative overflow-hidden">
      
      {/* Centered Container */}
      <div className="w-full max-w-[420px] relative z-10 flex flex-col items-center">
        
        {/* Brand Header */}
        <div className="mb-8 flex flex-col items-center">
            <Link href="/" className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-white mb-5 shadow-sm">
                <LayoutDashboard size={24} strokeWidth={2} className="opacity-90 max-w-full" />
            </Link>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">Sign in to AgriOx</h1>
            <p className="text-sm text-muted-foreground mt-1.5 font-medium">Enter your details to access your dashboard</p>
        </div>

        {/* Login Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full bg-white border border-border shadow-sm rounded-xl overflow-hidden p-8"
        >
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Email address</label>
              <input 
                type="email" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                className="w-full px-3 py-2.5 rounded-lg border border-border bg-transparent text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors" 
                placeholder="name@company.com" 
                required 
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                 <label className="text-sm font-medium text-foreground">Password</label>
                 <Link href="#" className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors">Forgot password?</Link>
              </div>
              <div className="relative">
                <input 
                  type={showPwd ? 'text' : 'password'} 
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  className="w-full pl-3 pr-10 py-2.5 rounded-lg border border-border bg-transparent text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors" 
                  placeholder="••••••••" 
                  required 
                />
                <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            
            <button type="submit" disabled={loading || !!demoLoading} className="w-full py-2.5 bg-foreground text-white rounded-lg text-sm font-medium hover:bg-foreground/90 transition-colors focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:ring-offset-1 disabled:opacity-50 mt-2">
              {loading ? <Loader2 size={16} className="animate-spin mx-auto" /> : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Don't have an account?{' '}
            <Link href="/auth/register" className="text-primary font-semibold hover:text-primary/80 transition-colors">Request Access</Link>
          </p>
        </motion.div>

        {/* Demo Users Section */}
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="w-full mt-10"
        >
            <div className="flex items-center gap-4 mb-6">
                <div className="h-px flex-1 bg-border" />
                <span className="text-xs font-medium text-muted-foreground">Or sign in with a demo role</span>
                <div className="h-px flex-1 bg-border" />
            </div>

            <div className="grid grid-cols-2 gap-3 w-full">
                {DEMO_USERS.map((demo, i) => (
                    <button
                        key={demo.role}
                        onClick={() => handleDemoLogin(demo)}
                        disabled={!!demoLoading || loading}
                        className="group flex items-center gap-3 p-3 bg-white border border-border rounded-lg hover:border-primary/40 hover:shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary/20"
                    >
                        <div className={`w-10 h-10 rounded-md flex items-center justify-center shrink-0 border border-border/50 transition-colors ${demoLoading === demo.role ? 'bg-primary text-white border-primary' : 'bg-secondary text-muted-foreground group-hover:bg-primary/5 group-hover:text-primary'}`}>
                            {demoLoading === demo.role ? <Loader2 size={16} className="animate-spin" /> : <demo.icon size={18} strokeWidth={2} />}
                        </div>
                        <div className="text-left flex-1 min-w-0">
                            <p className="text-sm font-semibold text-foreground truncate">{demo.name}</p>
                            <p className="text-xs text-muted-foreground capitalize truncate group-hover:text-primary/80 transition-colors">{demo.role}</p>
                        </div>
                    </button>
                ))}
            </div>
        </motion.div>

      </div>
    </div>
  );
}
