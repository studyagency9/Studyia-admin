import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  DollarSign,
  Calendar,
  CalendarDays,
  Wallet,
  Handshake,
  UserCheck,
  AlertTriangle,
  CreditCard,
  FileWarning,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/ui/PageHeader';
import { KPICard } from '@/components/dashboard/KPICard';
import { useAuth } from '@/contexts/AuthContext';
import { dashboardService } from '@/lib/api';
import { Alert } from '@/components/ui/alert';
import { Navigate } from 'react-router-dom';

// Import du dashboard spécialisé pour les assistants
import DashboardAssistant from './Dashboard-Assistant';

// Define types for the dashboard data based on your API response
interface DashboardData {
  cvCreated: {
    today: number;
    thisWeek: number;
    thisMonth: number;
  };
  revenue: {
    today: number;
    thisWeek: number;
    thisMonth: number;
  };
  newPartners: {
    today: number;
    thisWeek: number;
    thisMonth: number;
  };
  newAssociates: {
    today: number;
    thisWeek: number;
    thisMonth: number;
  };
  pendingWithdrawals: number;
}

export default function Dashboard() {
  const { user, hasPermission } = useAuth();
  
  // Si l'utilisateur est un assistant, rediriger vers le dashboard spécialisé
  if (user?.role === 'secretary') {
    return <DashboardAssistant />;
  }
  
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        console.log('=== DASHBOARD API CALL ===');
        console.log('Calling dashboardService.getStats()...');
        
        const response = await dashboardService.getStats();
        
        console.log('Raw API Response:', response);
        console.log('Response data:', response.data);
        console.log('Response data.data:', response.data?.data);
        console.log('Full response structure:', JSON.stringify(response, null, 2));
        
        setData(response.data.data); // Accéder aux données dans response.data.data
      } catch (err) {
        console.error('=== DASHBOARD API ERROR ===');
        console.error('Full error:', err);
        console.error('Error response:', (err as any).response);
        console.error('Error data:', (err as any).response?.data);
        console.error('Error status:', (err as any).response?.status);
        
        setError('Impossible de charger les données du tableau de bord.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <DashboardLayout>
        <PageHeader
          title="Chargement..."
          description="Chargement des données du tableau de bord"
        />
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="forge-card p-6 animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-muted rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <PageHeader
          title="Erreur"
          description="Un problème est survenu"
        />
        <Alert variant="destructive">{error}</Alert>
      </DashboardLayout>
    );
  }

  if (!data) return null;

  const { 
    cvCreated, 
    revenue, 
    newPartners, 
    newAssociates, 
    pendingWithdrawals 
  } = data;

  return (
    <DashboardLayout>
      <PageHeader
        title={`Bienvenue, ${user?.name}!`}
        description="Vue d'ensemble de votre activité"
      />

      {/* Main KPIs - Money First */}
      {hasPermission('view_revenue') && (
        <section className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            <KPICard
              title="Aujourd'hui"
              value={revenue.today}
              icon={<DollarSign className="w-5 h-5" />}
              variant="success"
              unit="FCFA"
              delay={0}
            />
            <KPICard
              title="Cette semaine"
              value={revenue.thisWeek}
              icon={<Calendar className="w-5 h-5" />}
              variant="warning"
              unit="FCFA"
              delay={0.1}
            />
            <KPICard
              title="Ce mois"
              value={revenue.thisMonth}
              icon={<CalendarDays className="w-5 h-5" />}
              variant="info"
              unit="FCFA"
              delay={0.2}
            />
            <KPICard
              title="Retraits en attente"
              value={pendingWithdrawals}
              icon={<Wallet className="w-5 h-5" />}
              subtitle="Demandes en attente"
              variant="destructive"
              unit="FCFA"
              delay={0.3}
            />
          </div>
        </section>
      )}

      {/* Additional KPIs */}
      <section className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <KPICard
            title="CVs Créés"
            value={cvCreated.thisMonth}
            icon={<FileWarning className="w-5 h-5" />}
            subtitle="Ce mois"
            delay={0.4}
          />
          <KPICard
            title="Nouveaux Partenaires"
            value={newPartners.thisMonth}
            icon={<Handshake className="w-5 h-5" />}
            subtitle="Ce mois"
            delay={0.5}
          />
          <KPICard
            title="Nouveaux Associés"
            value={newAssociates.thisMonth}
            icon={<UserCheck className="w-5 h-5" />}
            subtitle="Ce mois"
            delay={0.6}
          />
        </div>
      </section>

      {/* Recent Activity */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-6">Activité Récente</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="forge-card p-6 bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20">
            <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
              <div className="p-2 bg-primary/20 rounded-lg">
                <FileWarning className="w-5 h-5 text-primary" />
              </div>
              Activité CVs
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-white/50 rounded-lg">
                <span className="text-sm font-medium text-muted-foreground">Aujourd'hui</span>
                <span className="font-bold text-lg text-primary">{cvCreated.today}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-white/50 rounded-lg">
                <span className="text-sm font-medium text-muted-foreground">Cette semaine</span>
                <span className="font-bold text-lg text-success">{cvCreated.thisWeek}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-white/50 rounded-lg">
                <span className="text-sm font-medium text-muted-foreground">Ce mois</span>
                <span className="font-bold text-lg text-info">{cvCreated.thisMonth}</span>
              </div>
            </div>
          </div>
          
          <div className="forge-card p-6 bg-gradient-to-br from-warning/5 to-warning/10 border border-warning/20">
            <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
              <div className="p-2 bg-warning/20 rounded-lg">
                <Handshake className="w-5 h-5 text-warning" />
              </div>
              Nouveaux Partenaires
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-white/50 rounded-lg">
                <span className="text-sm font-medium text-muted-foreground">Aujourd'hui</span>
                <span className="font-bold text-lg text-primary">{newPartners.today}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-white/50 rounded-lg">
                <span className="text-sm font-medium text-muted-foreground">Cette semaine</span>
                <span className="font-bold text-lg text-success">{newPartners.thisWeek}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-white/50 rounded-lg">
                <span className="text-sm font-medium text-muted-foreground">Ce mois</span>
                <span className="font-bold text-lg text-info">{newPartners.thisMonth}</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Nouveaux Associés */}
        <div className="mt-6">
          <div className="forge-card p-6 bg-gradient-to-br from-success/5 to-success/10 border border-success/20">
            <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
              <div className="p-2 bg-success/20 rounded-lg">
                <UserCheck className="w-5 h-5 text-success" />
              </div>
              Nouveaux Associés
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-white/50 rounded-lg">
                <div className="text-2xl font-bold text-primary">{newAssociates.today}</div>
                <div className="text-sm text-muted-foreground mt-1">Aujourd'hui</div>
              </div>
              <div className="text-center p-4 bg-white/50 rounded-lg">
                <div className="text-2xl font-bold text-success">{newAssociates.thisWeek}</div>
                <div className="text-sm text-muted-foreground mt-1">Cette semaine</div>
              </div>
              <div className="text-center p-4 bg-white/50 rounded-lg">
                <div className="text-2xl font-bold text-info">{newAssociates.thisMonth}</div>
                <div className="text-sm text-muted-foreground mt-1">Ce mois</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Financial Summary */}
      <section>
        <h2 className="text-2xl font-semibold mb-6">Résumé Financier</h2>
        <div className="forge-card p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center p-4 bg-success/5 rounded-xl border border-success/20">
              <div className="text-2xl font-bold text-success">{revenue.today.toLocaleString('fr-FR')} FCFA</div>
              <div className="text-sm text-muted-foreground mt-1">Revenus aujourd'hui</div>
            </div>
            <div className="text-center p-4 bg-warning/5 rounded-xl border border-warning/20">
              <div className="text-2xl font-bold text-warning">{revenue.thisWeek.toLocaleString('fr-FR')} FCFA</div>
              <div className="text-sm text-muted-foreground mt-1">Cette semaine</div>
            </div>
            <div className="text-center p-4 bg-info/5 rounded-xl border border-info/20">
              <div className="text-2xl font-bold text-info">{revenue.thisMonth.toLocaleString('fr-FR')} FCFA</div>
              <div className="text-sm text-muted-foreground mt-1">Ce mois</div>
            </div>
            <div className="text-center p-4 bg-primary/5 rounded-xl border border-primary/20">
              <div className="text-2xl font-bold text-primary">{pendingWithdrawals.toLocaleString('fr-FR')} FCFA</div>
              <div className="text-sm text-muted-foreground mt-1">Retraits en attente</div>
            </div>
          </div>
        </div>
      </section>
    </DashboardLayout>
  );
}
