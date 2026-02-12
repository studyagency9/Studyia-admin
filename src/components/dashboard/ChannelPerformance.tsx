import { motion } from 'framer-motion';
import { Users, Handshake, UserCheck, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChannelData {
  key: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  revenue: number;
  percentage: number;
  cvsCount: number;
  color: string;
}

interface ChannelPerformanceProps {
  delay?: number;
  data: any;
}

export function ChannelPerformance({ delay = 0, data }: ChannelPerformanceProps) {
  const channels: ChannelData[] = [
    {
      key: 'direct',
      label: 'Utilisateurs directs',
      icon: Users,
      ...data.direct,
      color: 'from-blue-500 to-blue-600',
    },
    {
      key: 'partners',
      label: 'Partenaires',
      icon: Handshake,
      ...data.partners,
      color: 'from-emerald-500 to-emerald-600',
    },
    {
      key: 'commercials',
      label: 'Commerciaux',
      icon: UserCheck,
      ...data.commercials,
      color: 'from-purple-500 to-purple-600',
    },
  ];

  const mostProfitable = channels.reduce((max, c) => c.revenue > max.revenue ? c : max, channels[0]);

  const formatCurrency = (val: number): string => {
    return new Intl.NumberFormat('fr-CM', {
      style: 'currency',
      currency: 'XAF',
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="forge-card p-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Performance par canal</h3>
          <p className="text-sm text-muted-foreground">Répartition du chiffre d'affaires</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-success/10 text-success text-sm font-medium">
          <TrendingUp className="w-4 h-4" />
          Canal le plus rentable
        </div>
      </div>

      {/* Channels */}
      <div className="space-y-4">
        {channels.map((channel, index) => {
          const Icon = channel.icon;
          const isTop = channel.key === mostProfitable.key;

          return (
            <motion.div
              key={channel.key}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: delay + 0.1 + index * 0.1 }}
              className={cn(
                "p-4 rounded-xl border transition-all",
                isTop 
                  ? "border-primary/30 bg-primary/5" 
                  : "border-border/50 hover:border-border"
              )}
            >
              <div className="flex items-center gap-4">
                {/* Icon */}
                <div className={cn(
                  "p-3 rounded-xl bg-gradient-to-br text-white",
                  channel.color
                )}>
                  <Icon className="w-5 h-5" />
                </div>

                {/* Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-foreground">{channel.label}</span>
                    {isTop && (
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-primary text-white">
                        #1
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{channel.cvsCount} CVs</span>
                    <span>•</span>
                    <span>{channel.percentage}% du CA</span>
                  </div>
                </div>

                {/* Value */}
                <div className="text-right">
                  <div className="text-xl font-bold forge-gradient-text">
                    {formatCurrency(channel.revenue)}
                  </div>
                </div>
              </div>

              {/* Progress bar */}
              <div className="mt-3 h-2 bg-muted rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${channel.percentage}%` }}
                  transition={{ delay: delay + 0.3 + index * 0.1, duration: 0.5 }}
                  className={cn("h-full rounded-full bg-gradient-to-r", channel.color)}
                />
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
