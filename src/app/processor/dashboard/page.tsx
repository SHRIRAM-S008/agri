'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import StatCard from '@/components/StatCard';
import PageHeader from '@/components/PageHeader';
import { useAuth } from '@/contexts/AuthContext';
import { processingService } from '@/services/processing';
import { Factory, ClipboardList, Leaf } from 'lucide-react';
import Link from 'next/link';

export default function ProcessorDashboard() {
  const { profile } = useAuth();
  const [stats, setStats] = useState({ pending: 0, active: 0, completed: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) return;
    processingService.getByProcessor(profile.id).then(data => {
      const reqs = data || [];
      setStats({
        pending: reqs.filter((r: any) => r.status === 'pending').length,
        active: reqs.filter((r: any) => r.status === 'approved').length,
        completed: reqs.filter((r: any) => r.status === 'completed').length,
      });
      setLoading(false);
    });
  }, [profile]);

  return (
    <DashboardLayout allowedRoles={['processor']}>
      <PageHeader
        title={`Welcome, ${profile?.full_name?.split(' ')[0] ?? 'Processor'} 🏭`}
        subtitle="Your processing operations dashboard"
        action={<Link href="/processor/browse-crops" className="btn-primary text-sm px-5 py-2.5">Browse Raw Crops →</Link>}
      />
      {!loading && (
        <div className="grid grid-cols-3 gap-4 mb-8">
          <StatCard icon={ClipboardList} label="Pending Requests" value={stats.pending} color="orange" delay={0} />
          <StatCard icon={Factory} label="Active Processing" value={stats.active} color="blue" delay={0.1} />
          <StatCard icon={Leaf} label="Completed Jobs" value={stats.completed} color="green" delay={0.2} />
        </div>
      )}
      <div className="glass-card p-6 rounded-2xl">
        <h3 className="font-semibold text-foreground font-display mb-3">Quick Links</h3>
        <div className="grid grid-cols-3 gap-3">
          {[
            { href: '/processor/browse-crops', label: '🌾 Browse Crops', desc: 'Find available raw materials' },
            { href: '/processor/requests', label: '📋 My Requests', desc: 'Track processing requests' },
            { href: '/processor/orders', label: '🏭 Processing Orders', desc: 'Active processing jobs' },
          ].map(link => (
            <Link key={link.href} href={link.href} className="p-4 bg-secondary rounded-xl hover:bg-gray-100 transition-all border border-border hover:border-orange-700/30">
              <p className="font-medium text-foreground text-sm">{link.label}</p>
              <p className="text-xs text-muted-foreground/80 mt-1">{link.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
