'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/PageHeader';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { UserCheck, UserX, Shield, Sprout, Compass, Zap, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import type { Profile } from '@/lib/types';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const load = async () => {
    const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    setUsers((data || []) as Profile[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const toggleActive = async (user: Profile) => {
    const { error } = await supabase.from('profiles').update({ is_active: !user.is_active } as never).eq('id', user.id);
    if (!error) {
      toast.success(`${user.full_name} ${!user.is_active ? 'activated' : 'deactivated'}`);
      load();
    } else {
      toast.error('Update failed');
    }
  };

  const filtered = users.filter(u => filter === 'all' || u.role === filter);

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'farmer': return <Sprout size={12} className="mr-1 inline" />;
      case 'buyer': return <Compass size={12} className="mr-1 inline" />;
      case 'processor': return <Zap size={12} className="mr-1 inline" />;
      case 'admin': return <Shield size={12} className="mr-1 inline" />;
      default: return null;
    }
  };

  const getRoleBadge = (role: string) => {
    let classes = 'bg-secondary text-muted-foreground border-border';
    if (role === 'farmer') classes = 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (role === 'buyer') classes = 'bg-blue-50 text-blue-700 border-blue-200';
    if (role === 'processor') classes = 'bg-orange-50 text-orange-700 border-orange-200';
    if (role === 'admin') classes = 'bg-purple-50 text-purple-700 border-purple-200';

    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold border capitalize ${classes}`}>
        {getRoleIcon(role)} {role}
      </span>
    );
  };

  return (
    <DashboardLayout allowedRoles={['admin']}>
      <PageHeader title="User Management" subtitle={`${users.length} total users registered on platform`} />

      <div className="mb-6 flex overflow-x-auto pb-2 -mx-4 px-4 sm:px-0 sm:mx-0 sm:overflow-visible sm:pb-0">
        <div className="bg-secondary/50 p-1 flex items-center gap-1 rounded-lg border border-border inline-flex shrink-0">
          {['all', 'farmer', 'buyer', 'processor', 'admin'].map(r => (
            <button
              key={r}
              onClick={() => setFilter(r)}
              className={`px-3.5 py-1.5 rounded-md text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                filter === r 
                  ? 'bg-white text-foreground shadow-sm' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-white/50'
              }`}
            >
              {r === 'all' ? 'All Users' : `${r.charAt(0).toUpperCase() + r.slice(1)}s`}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="premium-card bg-white border border-border shadow-sm rounded-xl overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-border bg-secondary/40">
                <th className="px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">User Details</th>
                <th className="px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Role</th>
                <th className="px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Contact & Location</th>
                <th className="px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              <AnimatePresence initial={false}>
                {filtered.map((user, i) => (
                  <motion.tr 
                    key={user.id} 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ delay: Math.min(i * 0.05, 0.5) }} // Cap delay to prevent long waits on huge lists
                    className="hover:bg-secondary/30 transition-colors group"
                  >
                    <td className="px-5 py-4 align-top">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 shrink-0 rounded-full bg-secondary border border-border flex items-center justify-center text-sm font-bold text-foreground overflow-hidden">
                          {user.full_name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                           <div className="text-sm font-semibold text-foreground">{user.full_name}</div>
                           <div className="text-xs text-muted-foreground mt-0.5">Joined {new Date(user.created_at).toLocaleDateString('en-IN')}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 align-top">
                      {getRoleBadge(user.role)}
                    </td>
                    <td className="px-5 py-4 align-top">
                      <div className="text-sm text-foreground font-medium">{user.phone ?? 'No phone provided'}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{user.location ?? 'No location set'}</div>
                    </td>
                    <td className="px-5 py-4 align-top">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase border ${
                        user.is_active 
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-200' 
                            : 'bg-red-100 text-red-800 border-red-200'
                        }`}>
                        {user.is_active ? 'Active' : 'Suspended'}
                      </span>
                    </td>
                    <td className="px-5 py-4 align-top text-right">
                      <button
                        onClick={() => toggleActive(user)}
                        className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border transition-all focus:outline-none focus:ring-2 disabled:opacity-50 ${
                          user.is_active
                            ? 'border-border bg-white text-muted-foreground hover:bg-red-50 hover:text-red-700 hover:border-red-200 focus:ring-red-500/20'
                            : 'border-border bg-white text-muted-foreground hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 focus:ring-emerald-500/20'
                        }`}
                      >
                        {user.is_active ? <><UserX size={14} /> Deactivate</> : <><UserCheck size={14} /> Activate</>}
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
          
          {filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 px-4">
                <Users size={32} className="text-muted-foreground opacity-50 mb-3" />
                <h3 className="text-sm font-semibold text-foreground">No users match criteria</h3>
                <p className="text-xs text-muted-foreground mt-1">Try adjusting the active filters.</p>
            </div>
          )}
        </div>
      )}
    </DashboardLayout>
  );
}
