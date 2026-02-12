import { useState } from 'react';
import { motion } from 'framer-motion';
import { History, Search, Filter, User, Clock, FileText, Settings as SettingsIcon, Edit, Plus, Eye, CreditCard, Download } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/ui/PageHeader';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { logs, LogEntry, UserRole } from '@/data/mockData';

const actionIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  CREATE: Plus,
  UPDATE: Edit,
  VIEW: Eye,
  PAYMENT: CreditCard,
  EXPORT: Download,
};

const actionLabels: Record<string, { label: string; color: string }> = {
  CREATE: { label: 'Création', color: 'bg-success/10 text-success' },
  UPDATE: { label: 'Modification', color: 'bg-warning/10 text-warning' },
  VIEW: { label: 'Consultation', color: 'bg-primary/10 text-primary' },
  PAYMENT: { label: 'Paiement', color: 'bg-emerald-500/10 text-emerald-500' },
  EXPORT: { label: 'Export', color: 'bg-purple-500/10 text-purple-500' },
};

const roleColors: Record<UserRole, string> = {
  admin: 'bg-primary text-white',
  secretary: 'bg-warning text-white',
  accountant: 'bg-success text-white',
};

const roleLabels: Record<UserRole, string> = {
  admin: 'Admin',
  secretary: 'Secrétaire',
  accountant: 'Comptable',
};

export default function LogsPage() {
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [roleFilter, setRoleFilter] = useState<string>('all');

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.userName.toLowerCase().includes(search.toLowerCase()) ||
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      log.target.toLowerCase().includes(search.toLowerCase()) ||
      (log.details?.toLowerCase().includes(search.toLowerCase()) ?? false);

    const matchesAction = actionFilter === 'all' || log.action === actionFilter;
    const matchesRole = roleFilter === 'all' || log.userRole === roleFilter;

    return matchesSearch && matchesAction && matchesRole;
  });

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return {
      date: date.toLocaleDateString('fr-CM', { day: '2-digit', month: 'short', year: 'numeric' }),
      time: date.toLocaleTimeString('fr-CM', { hour: '2-digit', minute: '2-digit' }),
    };
  };

  return (
    <DashboardLayout>
      <PageHeader
        title="Logs & Traçabilité"
        description="Historique des actions"
        icon={<History className="w-6 h-6" />}
      />

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col sm:flex-row gap-4 mb-6"
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher dans les logs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={actionFilter} onValueChange={setActionFilter}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Action" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes actions</SelectItem>
            <SelectItem value="CREATE">Création</SelectItem>
            <SelectItem value="UPDATE">Modification</SelectItem>
            <SelectItem value="VIEW">Consultation</SelectItem>
            <SelectItem value="PAYMENT">Paiement</SelectItem>
            <SelectItem value="EXPORT">Export</SelectItem>
          </SelectContent>
        </Select>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Rôle" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous rôles</SelectItem>
            <SelectItem value="admin">Administrateur</SelectItem>
            <SelectItem value="secretary">Secrétaire</SelectItem>
            <SelectItem value="accountant">Comptable</SelectItem>
          </SelectContent>
        </Select>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6"
      >
        <div className="forge-card p-4">
          <p className="text-sm text-muted-foreground">Total logs</p>
          <p className="text-2xl font-bold text-foreground">{logs.length}</p>
        </div>
        <div className="forge-card p-4">
          <p className="text-sm text-muted-foreground">Créations</p>
          <p className="text-2xl font-bold text-success">{logs.filter(l => l.action === 'CREATE').length}</p>
        </div>
        <div className="forge-card p-4">
          <p className="text-sm text-muted-foreground">Modifications</p>
          <p className="text-2xl font-bold text-warning">{logs.filter(l => l.action === 'UPDATE').length}</p>
        </div>
        <div className="forge-card p-4">
          <p className="text-sm text-muted-foreground">Consultations</p>
          <p className="text-2xl font-bold text-primary">{logs.filter(l => l.action === 'VIEW').length}</p>
        </div>
        <div className="forge-card p-4">
          <p className="text-sm text-muted-foreground">Exports</p>
          <p className="text-2xl font-bold text-purple-500">{logs.filter(l => l.action === 'EXPORT').length}</p>
        </div>
      </motion.div>

      {/* Timeline */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="forge-card"
      >
        <div className="divide-y divide-border">
          {filteredLogs.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              Aucun log trouvé
            </div>
          ) : (
            filteredLogs.map((log, index) => {
              const ActionIcon = actionIcons[log.action] || FileText;
              const actionConfig = actionLabels[log.action] || { label: log.action, color: 'bg-muted text-muted-foreground' };
              const { date, time } = formatDate(log.timestamp);

              return (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.02 * index }}
                  className="p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    {/* Action Icon */}
                    <div className={`p-2.5 rounded-xl ${actionConfig.color}`}>
                      <ActionIcon className="w-4 h-4" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <Badge variant="outline" className={roleColors[log.userRole]}>
                          {roleLabels[log.userRole]}
                        </Badge>
                        <span className="font-medium text-foreground">{log.userName}</span>
                        <span className="text-muted-foreground">•</span>
                        <Badge variant="secondary" className={actionConfig.color}>
                          {actionConfig.label}
                        </Badge>
                        <span className="text-muted-foreground">sur</span>
                        <span className="font-medium text-foreground capitalize">{log.target}</span>
                      </div>
                      {log.details && (
                        <p className="text-sm text-muted-foreground">{log.details}</p>
                      )}
                    </div>

                    {/* Timestamp */}
                    <div className="text-right text-sm text-muted-foreground flex-shrink-0">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {time}
                      </div>
                      <div className="text-xs">{date}</div>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </motion.div>
    </DashboardLayout>
  );
}
