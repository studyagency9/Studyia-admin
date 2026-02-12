import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: ReactNode;
  trend?: {
    value: number;
    direction: 'up' | 'down';
  };
  variant?: 'default' | 'primary' | 'gradient' | 'success' | 'warning' | 'info' | 'destructive';
  delay?: number;
  unit?: string;
}

export function KPICard({
  title,
  value,
  subtitle,
  icon,
  trend,
  variant = 'default',
  delay = 0,
  unit,
}: KPICardProps) {
  const formatValue = (val: string | number): string => {
    if (typeof val === 'number') {
      if (unit) {
        // Si une unité est spécifiée, formater avec l'unité
        return `${val.toLocaleString('fr-FR')} ${unit}`;
      }
      // Si aucune unité n'est spécifiée, retourner juste le nombre formaté
      return val.toLocaleString('fr-FR');
    }
    return val;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
      className={cn(
        "forge-kpi-card group",
        variant === 'gradient' && "bg-gradient-to-br from-primary to-accent text-white border-0",
        variant === 'success' && "bg-gradient-to-br from-success to-success/80 text-white border-0",
        variant === 'warning' && "bg-gradient-to-br from-warning to-warning/80 text-white border-0",
        variant === 'info' && "bg-gradient-to-br from-info to-info/80 text-white border-0",
        variant === 'destructive' && "bg-gradient-to-br from-destructive to-destructive/80 text-white border-0"
      )}
    >
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 opacity-5 pointer-events-none">
        {icon && (
          <div className="w-full h-full flex items-center justify-center text-current scale-[3] translate-x-4 -translate-y-4">
            {icon}
          </div>
        )}
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            {icon && (
              <div className={cn(
                "p-2.5 rounded-xl transition-colors",
                variant === 'gradient' 
                  ? "bg-white/20" 
                  : variant === 'success' || variant === 'warning' || variant === 'info' || variant === 'destructive'
                  ? "bg-white/20"
                  : "bg-primary/10 group-hover:bg-primary/15"
              )}>
                <div className={cn(
                  "w-5 h-5",
                  variant === 'gradient' || variant === 'success' || variant === 'warning' || variant === 'info' || variant === 'destructive' 
                    ? "text-white" 
                    : "text-primary"
                )}>
                  {icon}
                </div>
              </div>
            )}
            <span className={cn(
              "text-sm font-medium",
              variant === 'gradient' || variant === 'success' || variant === 'warning' || variant === 'info' || variant === 'destructive' 
                ? "text-white/80" 
                : "text-muted-foreground"
            )}>
              {title}
            </span>
          </div>
          {trend && (
            <div className={cn(
              "flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full",
              trend.direction === 'up' 
                ? variant === 'gradient' 
                  ? "bg-white/20 text-white" 
                  : "bg-success/10 text-success"
                : variant === 'gradient'
                  ? "bg-white/20 text-white"
                  : "bg-destructive/10 text-destructive"
            )}>
              {trend.direction === 'up' ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
              {trend.value > 0 ? '+' : ''}{trend.value}%
            </div>
          )}
        </div>

        {/* Value */}
        <div className={cn(
          "text-3xl lg:text-4xl font-bold tracking-tight mb-1",
          variant === 'gradient' || variant === 'success' || variant === 'warning' || variant === 'info' || variant === 'destructive' 
            ? "text-white" 
            : "forge-kpi-value"
        )}>
          {formatValue(value)}
        </div>

        {/* Subtitle */}
        {subtitle && (
          <p className={cn(
            "text-sm",
            variant === 'gradient' || variant === 'success' || variant === 'warning' || variant === 'info' || variant === 'destructive' 
              ? "text-white/70" 
              : "text-muted-foreground"
          )}>
            {subtitle}
          </p>
        )}
      </div>
    </motion.div>
  );
}
