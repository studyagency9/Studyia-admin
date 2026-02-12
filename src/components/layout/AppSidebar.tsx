import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  FileText,
  Handshake,
  UserCheck,
  Receipt,
  Calculator,
  History,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Shield,
  Briefcase,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { UserRole } from '@/data/mockData';

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  permission: string;
  badge?: number;
}

const navItems: NavItem[] = [
  { title: 'Dashboard', href: '/', icon: LayoutDashboard, permission: 'view_dashboard' },
  { title: 'Utilisateurs', href: '/users', icon: Users, permission: 'view_users' },
  { title: 'CV', href: '/cvs', icon: FileText, permission: 'view_cvs' },
  { title: 'Partenaires', href: '/partners', icon: Handshake, permission: 'view_partners', badge: 3 },
  { title: 'Commerciaux', href: '/commercials', icon: UserCheck, permission: 'view_commercials' },
  { title: 'Facturation', href: '/invoices', icon: Receipt, permission: 'view_invoices', badge: 2 },
  { title: 'Comptabilité', href: '/accounting', icon: Calculator, permission: 'view_accounting' },
  { title: 'Logs', href: '/logs', icon: History, permission: 'view_logs' },
  { title: 'Paramètres', href: '/settings', icon: Settings, permission: 'view_settings' },
];

const roleLabels: Record<UserRole, { label: string; color: string }> = {
  admin: { label: 'Administrateur', color: 'bg-primary' },
  secretary: { label: 'Secrétaire', color: 'bg-warning' },
  accountant: { label: 'Comptable', color: 'bg-success' },
};

export function AppSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout, hasPermission } = useAuth();
  const role = user?.role;
  const location = useLocation();

  const filteredNavItems = navItems.filter(item => hasPermission(item.permission));

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 80 : 280 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="fixed left-0 top-0 h-screen forge-sidebar flex flex-col border-r border-sidebar-border z-50"
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-6 border-b border-sidebar-border">
        <motion.div
          className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Sparkles className="w-5 h-5 text-white" />
        </motion.div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col"
            >
              <span className="font-bold text-lg text-sidebar-foreground">Studya</span>
              <span className="text-xs text-primary font-medium tracking-wider">FORGE</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Role Display */}
      {role && (
        <div className="px-4 py-4">
          {collapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center mx-auto",
                  roleLabels[role].color
                )}>
                  <Shield className="w-4 h-4 text-white" />
                </div>
              </TooltipTrigger>
              <TooltipContent side="right">
                {roleLabels[role].label}
              </TooltipContent>
            </Tooltip>
          ) : (
            <div className={cn(
              "w-full text-center py-2 rounded-lg text-sm font-semibold text-white",
              roleLabels[role].color
            )}>
              {roleLabels[role].label}
            </div>
          )}
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-2">
        <ul className="space-y-1">
          {filteredNavItems.map((item) => {
            const isActive = location.pathname === item.href;
            const Icon = item.icon;

            return (
              <li key={item.href}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <NavLink
                      to={item.href}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative",
                        isActive
                          ? "bg-primary text-white shadow-lg shadow-primary/25"
                          : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
                      )}
                    >
                      <Icon className={cn("w-5 h-5 flex-shrink-0", isActive && "text-white")} />
                      <AnimatePresence>
                        {!collapsed && (
                          <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="font-medium text-sm"
                          >
                            {item.title}
                          </motion.span>
                        )}
                      </AnimatePresence>
                      {item.badge && !collapsed && (
                        <Badge
                          variant="destructive"
                          className="ml-auto text-xs px-1.5 py-0.5 min-w-[20px] h-5 flex items-center justify-center"
                        >
                          {item.badge}
                        </Badge>
                      )}
                      {item.badge && collapsed && (
                        <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
                      )}
                    </NavLink>
                  </TooltipTrigger>
                  {collapsed && (
                    <TooltipContent side="right" className="flex items-center gap-2">
                      {item.title}
                      {item.badge && (
                        <Badge variant="destructive" className="text-xs">
                          {item.badge}
                        </Badge>
                      )}
                    </TooltipContent>
                  )}
                </Tooltip>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Section */}
      <div className="border-t border-sidebar-border p-4">
        {collapsed ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="w-10 h-10 rounded-full bg-sidebar-accent flex items-center justify-center mx-auto cursor-pointer">
                <span className="text-sm font-semibold text-sidebar-foreground">
                  {user?.name?.charAt(0) ?? 'U'}
                </span>
              </div>
            </TooltipTrigger>
            <TooltipContent side="right">
              {user?.name}
            </TooltipContent>
          </Tooltip>
        ) : (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-sidebar-accent flex items-center justify-center">
              <span className="text-sm font-semibold text-sidebar-foreground">
                {user?.name?.charAt(0) ?? 'U'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">
                {user?.name}
              </p>
              <p className="text-xs text-sidebar-foreground/50 truncate">
                {user?.email}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={logout}
              className="text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-accent"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Collapse Toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
      >
        {collapsed ? (
          <ChevronRight className="w-4 h-4" />
        ) : (
          <ChevronLeft className="w-4 h-4" />
        )}
      </button>
    </motion.aside>
  );
}
