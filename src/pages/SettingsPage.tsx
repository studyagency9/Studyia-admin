import { motion } from 'framer-motion';
import { Settings, Shield, Palette, Users, Bell, Database, Lock } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';

export default function SettingsPage() {
  const { user } = useAuth();
  const role = user?.role;

  const settingSections = [
    {
      title: 'Rôles & Permissions',
      description: 'Gérer les rôles utilisateurs et leurs permissions',
      icon: Shield,
      color: 'bg-primary/10 text-primary',
      adminOnly: true,
    },
    {
      title: 'Apparence',
      description: 'Personnaliser l\'interface du dashboard',
      icon: Palette,
      color: 'bg-purple-500/10 text-purple-500',
      adminOnly: false,
    },
    {
      title: 'Utilisateurs',
      description: 'Gérer les comptes utilisateurs du système',
      icon: Users,
      color: 'bg-emerald-500/10 text-emerald-500',
      adminOnly: true,
    },
    {
      title: 'Notifications',
      description: 'Configurer les alertes et notifications',
      icon: Bell,
      color: 'bg-warning/10 text-warning',
      adminOnly: false,
    },
    {
      title: 'Données',
      description: 'Export et sauvegarde des données',
      icon: Database,
      color: 'bg-blue-500/10 text-blue-500',
      adminOnly: true,
    },
    {
      title: 'Sécurité',
      description: 'Paramètres de sécurité et authentification',
      icon: Lock,
      color: 'bg-destructive/10 text-destructive',
      adminOnly: true,
    },
  ];

  const visibleSections = role === 'admin' 
    ? settingSections 
    : settingSections.filter(s => !s.adminOnly);

  return (
    <DashboardLayout>
      <PageHeader
        title="Paramètres"
        description="Configuration du système"
        icon={<Settings className="w-6 h-6" />}
      />

      {/* Settings Grid */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
      >
        {visibleSections.map((section, index) => {
          const Icon = section.icon;
          return (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.05 }}
              className="forge-card p-6 hover:shadow-lg transition-shadow cursor-pointer group"
            >
              <div className={`p-3 rounded-xl ${section.color} w-fit mb-4 group-hover:scale-110 transition-transform`}>
                <Icon className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-foreground mb-1">{section.title}</h3>
              <p className="text-sm text-muted-foreground">{section.description}</p>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Quick Settings */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="forge-card p-6"
      >
        <h3 className="font-semibold text-foreground mb-6">Paramètres rapides</h3>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="notifications" className="text-foreground">Notifications email</Label>
              <p className="text-sm text-muted-foreground">Recevoir des alertes par email</p>
            </div>
            <Switch id="notifications" defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="alerts" className="text-foreground">Alertes paiements</Label>
              <p className="text-sm text-muted-foreground">Notification pour les factures en retard</p>
            </div>
            <Switch id="alerts" defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="weekly-report" className="text-foreground">Rapport hebdomadaire</Label>
              <p className="text-sm text-muted-foreground">Recevoir un résumé chaque semaine</p>
            </div>
            <Switch id="weekly-report" />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="auto-export" className="text-foreground">Export automatique</Label>
              <p className="text-sm text-muted-foreground">Sauvegarder les données automatiquement</p>
            </div>
            <Switch id="auto-export" />
          </div>
        </div>
      </motion.div>

      {/* System Info */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mt-8 forge-card p-6"
      >
        <h3 className="font-semibold text-foreground mb-4">Informations système</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Version</p>
            <p className="font-medium text-foreground">1.0.0</p>
          </div>
          <div>
            <p className="text-muted-foreground">Environnement</p>
            <p className="font-medium text-foreground">Production</p>
          </div>
          <div>
            <p className="text-muted-foreground">Dernière mise à jour</p>
            <p className="font-medium text-foreground">{new Date().toLocaleDateString('fr-CM', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Statut</p>
            <p className="font-medium text-success">Opérationnel</p>
          </div>
        </div>
      </motion.div>
    </DashboardLayout>
  );
}
