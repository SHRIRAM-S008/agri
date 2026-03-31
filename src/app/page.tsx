'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, BarChart3, ShieldCheck, Zap, Globe, Layers, CheckCircle2, TrendingUp } from 'lucide-react';

// SaaS Features
const features = [
  { icon: Layers, title: 'Multi-Tier Connectivity', desc: 'Seamlessly link farmers, processors, and buyers in one unified namespace.' },
  { icon: BarChart3, title: 'Real-Time Insights', desc: 'Monitor shifting market demands and dynamic pricing algorithms.' },
  { icon: ShieldCheck, title: 'Immutable Provenance', desc: 'End-to-end QR traceability ensures compliance and builds buyer trust.' },
  { icon: Zap, title: 'Lightning Workflows', desc: 'Automated procurement and digital offers drastically reduce cycle times.' },
];

export default function LandingPage() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user && profile) {
      router.push(`/${profile.role}/dashboard`);
    }
  }, [loading, user, profile, router]);

  return (
    <div className="min-h-screen bg-background selection:bg-primary/20 selection:text-primary overflow-x-hidden font-sans">
      
      {/* SaaS Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center shrink-0 shadow-sm shadow-primary/20">
              <TrendingUp size={16} className="text-white" strokeWidth={2.5} />
            </div>
            <span className="text-lg font-bold text-foreground tracking-tight">AgriOx</span>
          </Link>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground transition-colors">
             <Link href="#features" className="hover:text-foreground">Features</Link>
             <Link href="#solutions" className="hover:text-foreground">Solutions</Link>
             <Link href="#pricing" className="hover:text-foreground">Pricing</Link>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/auth/login" className="text-sm font-semibold text-foreground hover:text-primary transition-colors">Sign In</Link>
            <Link href="/auth/register" className="btn-primary text-sm px-4 py-2">Get Started</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              AgriOx v2.0 is now live
            </div>
            <h1 className="text-5xl md:text-6xl font-extrabold text-foreground leading-[1.1] tracking-tight mb-6">
              The Operating System for <span className="text-primary">Agriculture</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed max-w-lg">
              Streamline your agricultural supply chain. AgriOx provides B2B infrastructure for verifiable sourcing, dynamic pricing, and seamless cross-tier transactions.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/auth/register" className="btn-primary text-base px-6 py-3 justify-center">
                Start Free Trial <ArrowRight size={18} />
              </Link>
              <Link href="/auth/login" className="btn-secondary text-base px-6 py-3 justify-center">
                Request Demo
              </Link>
            </div>
            <div className="mt-8 flex items-center gap-4 text-sm text-muted-foreground font-medium">
              <span className="flex items-center gap-1.5"><CheckCircle2 size={16} className="text-primary" /> No credit card required</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 size={16} className="text-primary" /> 14-day free trial</span>
            </div>
          </motion.div>

          {/* Dashboard Abstract Mockup */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
            className="relative lg:h-[500px] w-full bg-white rounded-xl border border-border shadow-2xl shadow-primary/5 overflow-hidden flex flex-col"
          >
             {/* Mockup Header */}
             <div className="h-12 border-b border-border bg-secondary/30 flex items-center px-4 gap-4">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                </div>
                <div className="flex-1 max-w-md mx-auto h-6 bg-white border border-border rounded-md" />
             </div>
             {/* Mockup Body */}
             <div className="flex flex-1">
                {/* Mockup Sidebar */}
                <div className="w-32 border-r border-border bg-secondary/10 p-4 space-y-3">
                   <div className="h-3 w-16 bg-border rounded-full mb-6" />
                   {[...Array(5)].map((_, i) => <div key={i} className="h-4 w-full bg-border/50 rounded-sm" />)}
                </div>
                {/* Mockup Main */}
                <div className="flex-1 p-6 space-y-6 bg-secondary/20">
                   <div className="flex justify-between items-center">
                     <div className="h-5 w-32 bg-border/80 rounded-full" />
                     <div className="h-6 w-20 bg-primary/20 rounded-md" />
                   </div>
                   <div className="grid grid-cols-3 gap-4">
                     {[...Array(3)].map((_, i) => <div key={i} className="h-20 bg-white rounded-lg border border-border shadow-sm p-3"><div className="w-8 h-8 rounded-md bg-secondary mb-2"/><div className="w-16 h-3 bg-border rounded-sm"/></div>)}
                   </div>
                   <div className="h-40 bg-white rounded-lg border border-border mt-4 p-4 shadow-sm">
                     <div className="h-4 w-24 bg-border/50 rounded-sm mb-4" />
                     <div className="space-y-2">
                       {[...Array(4)].map((_, i) => <div key={i} className="h-4 w-full bg-secondary/50 rounded-sm" />)}
                     </div>
                   </div>
                </div>
             </div>
          </motion.div>

        </div>
      </section>

      {/* Social Proof */}
      <section className="py-10 border-y border-border bg-secondary/30">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-center text-xs font-bold text-muted-foreground uppercase tracking-widest mb-6">Trusted by innovative supply chains worldwide</p>
          <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-50 grayscale">
            {['NexusAg', 'GreenHarvest', 'TerraYield', 'AgriCorp', 'BioSphere'].map((brand) => (
              <span key={brand} className="text-xl font-black text-foreground">{brand}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Features SaaS Grid */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-foreground tracking-tight mb-4">Enterprise-grade infrastructure</h2>
            <p className="text-muted-foreground text-lg">Everything you need to orchestrate complex agricultural networks, securely and efficiently.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <div key={i} className="premium-card p-6 border border-border hover:border-primary/50 transition-colors">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4 text-primary">
                  <f.icon size={20} />
                </div>
                <h3 className="font-semibold text-foreground mb-2 text-base">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <footer className="border-t border-border bg-white mt-12">
        <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="bg-foreground rounded-2xl p-10 md:p-16 text-center text-white relative overflow-hidden">
             <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-3xl rounded-full" />
             <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/20 blur-3xl rounded-full" />
             
             <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6 relative z-10">Deploy modern supply chains today.</h2>
             <p className="text-gray-400 font-medium text-lg max-w-xl mx-auto mb-8 relative z-10">Ensure compliance, maximize yield value, and streamline B2B purchasing.</p>
             <div className="flex flex-wrap justify-center gap-4 relative z-10">
               <Link href="/auth/register" className="bg-primary text-white font-semibold px-6 py-3 rounded-md hover:bg-primary/90 transition-all shadow-md">Create Workspace</Link>
               <Link href="/auth/login" className="bg-white/10 text-white font-semibold px-6 py-3 rounded-md hover:bg-white/20 transition-all">Contact Sales</Link>
             </div>
          </div>
          
          <div className="mt-16 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
               <div className="w-6 h-6 rounded-md bg-primary flex items-center justify-center shrink-0">
                 <TrendingUp size={12} className="text-white" strokeWidth={2.5} />
               </div>
               <span className="text-sm font-bold text-foreground tracking-tight">AgriOx</span>
            </div>
            <p className="text-xs text-muted-foreground">© 2026 AgriOx Technologies Inc. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
