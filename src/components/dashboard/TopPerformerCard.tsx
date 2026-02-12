import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Crown, Medal } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TopPerformerCardProps {
  title: string;
  name: string;
  subtitle?: string;
  value: number;
  icon?: ReactNode;
  rank?: 1 | 2 | 3;
  delay?: number;
}

export function TopPerformerCard({
  title,
  name,
  subtitle,
  value,
  icon,
  rank = 1,
  delay = 0,
}: TopPerformerCardProps) {
  const formatValue = (val: number): string => {
    return new Intl.NumberFormat('fr-CM', {
      style: 'currency',
      currency: 'XAF',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const RankIcon = rank === 1 ? Crown : rank === 2 ? Medal : Trophy;
  const rankColors = {
    1: 'text-yellow-500',
    2: 'text-gray-400',
    3: 'text-amber-600',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      whileHover={{ y: -2 }}
      className="forge-card p-5 relative overflow-hidden group"
    >
      {/* Rank badge */}
      <div className="absolute top-4 right-4">
        <RankIcon className={cn("w-6 h-6", rankColors[rank])} />
      </div>

      {/* Content */}
      <div className="flex items-start gap-4">
        {icon && (
          <div className="p-3 rounded-xl bg-primary/10 text-primary">
            {icon}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
            {title}
          </p>
          <h3 className="text-lg font-bold text-foreground truncate mb-0.5">
            {name}
          </h3>
          {subtitle && (
            <p className="text-sm text-muted-foreground truncate mb-3">
              {subtitle}
            </p>
          )}
          <div className="forge-kpi-value text-2xl">
            {formatValue(value)}
          </div>
        </div>
      </div>

      {/* Decorative gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-accent to-primary opacity-0 group-hover:opacity-100 transition-opacity" />
    </motion.div>
  );
}
