'use client';

import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  sub?: string;
  color?: 'green' | 'blue' | 'orange' | 'purple' | 'gold';
  delay?: number;
}

export default function StatCard({ icon: Icon, label, value, sub, delay = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay, ease: 'easeOut' }}
      className="premium-card p-5 flex flex-col justify-between"
    >
      <div className="flex items-start justify-between mb-4">
        <div>
           <p className="text-sm font-medium text-muted-foreground">{label}</p>
           <h3 className="text-2xl font-semibold text-foreground tracking-tight mt-1">{value}</h3>
           {sub && <p className="text-xs text-muted-foreground font-medium mt-1">{sub}</p>}
        </div>
        <div className="w-8 h-8 rounded-md bg-secondary/80 border border-border flex items-center justify-center shrink-0">
          <Icon size={16} className="text-muted-foreground" />
        </div>
      </div>
    </motion.div>
  );
}
