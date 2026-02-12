import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface AlertItem {
  id: string;
  title: string;
  subtitle?: string;
  value?: string | number;
  type?: 'danger' | 'warning' | 'info';
}

interface AlertCardProps {
  title: string;
  icon?: ReactNode;
  items: AlertItem[];
  onViewAll?: () => void;
  variant?: 'danger' | 'warning' | 'info';
  delay?: number;
}

const variantStyles = {
  danger: {
    bg: 'bg-destructive/5 border-destructive/20',
    iconBg: 'bg-destructive/10',
    iconColor: 'text-destructive',
    badge: 'bg-destructive text-white',
  },
  warning: {
    bg: 'bg-warning/5 border-warning/20',
    iconBg: 'bg-warning/10',
    iconColor: 'text-warning',
    badge: 'bg-warning text-white',
  },
  info: {
    bg: 'bg-primary/5 border-primary/20',
    iconBg: 'bg-primary/10',
    iconColor: 'text-primary',
    badge: 'bg-primary text-white',
  },
};

export function AlertCard({
  title,
  icon,
  items,
  onViewAll,
  variant = 'warning',
  delay = 0,
}: AlertCardProps) {
  const styles = variantStyles[variant];

  const formatValue = (val: string | number): string => {
    if (typeof val === 'number') {
      return new Intl.NumberFormat('fr-CM', {
        style: 'currency',
        currency: 'XAF',
        maximumFractionDigits: 0,
      }).format(val);
    }
    return val;
  };

  if (items.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className={cn("forge-card p-5 border", styles.bg)}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={cn("p-2 rounded-lg", styles.iconBg)}>
            <div className={cn("w-4 h-4", styles.iconColor)}>
              {icon || <AlertTriangle className="w-4 h-4" />}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-foreground">{title}</span>
            <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full", styles.badge)}>
              {items.length}
            </span>
          </div>
        </div>
        {onViewAll && (
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-muted-foreground hover:text-foreground"
            onClick={onViewAll}
          >
            Voir tout
            <ArrowRight className="w-3 h-3 ml-1" />
          </Button>
        )}
      </div>

      {/* Items */}
      <div className="space-y-3">
        {items.slice(0, 4).map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: delay + 0.1 + index * 0.05 }}
            className="flex items-center justify-between py-2 border-b border-border/50 last:border-0"
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {item.title}
              </p>
              {item.subtitle && (
                <p className="text-xs text-muted-foreground truncate">
                  {item.subtitle}
                </p>
              )}
            </div>
            {item.value && (
              <span className={cn("text-sm font-semibold ml-4", styles.iconColor)}>
                {formatValue(item.value)}
              </span>
            )}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
