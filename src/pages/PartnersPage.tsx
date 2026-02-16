import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Handshake, Search, Plus, Building, Mail, Phone, TrendingUp, AlertCircle, FileText, Edit, Trash2, Calendar, Crown, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/ui/PageHeader';
import { DataTable, Column, StatusBadge } from '@/components/ui/DataTable';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { partnersService } from '@/lib/api';
import { Alert } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { PartnerForm } from '@/components/partners/PartnerForm';

// Define the Partner type based on your API response
// Interface Partner unifiée et professionnelle
export interface Partner {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  company: string;
  country?: string;
  city?: string;
  status: 'active' | 'suspended' | 'inactive' | 'pending';
  plan: 'starter' | 'pro' | 'business';
  cvQuota: number;
  cvUsedThisMonth: number;
  cvStats: {
    quota: number;
    used: number;
    remaining: number;
    percentageUsed: number;
    isLimitReached: boolean;
    plan: string;
  };
  planRenewalDate: string;
  subscriptionStatus?: string;
  totalCVs: number;
  totalRevenue?: number;
  referralCode: string;
  createdAt: string;
  lastLogin?: string;
  nextQuotaReset?: string;
}

const statusLabels: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  active: { label: 'Actif', variant: 'default' },
  suspended: { label: 'Suspendu', variant: 'destructive' },
  inactive: { label: 'Inactif', variant: 'secondary' },
  pending: { label: 'En attente', variant: 'outline' },
};

export default function PartnersPage() {
  const navigate = useNavigate();
  const [partners, setPartners] = useState<Partner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchPartners = async () => {
      try {
        setIsLoading(true);
        console.log('=== PARTNERS API CALL ===');
        console.log('Calling partnersService.getList()...');
        
        const response = await partnersService.getList();
        
        console.log('Raw API Response:', response);
        console.log('Response data:', response.data);
        console.log('Response data.data:', response.data?.data);
        console.log('Full response structure:', JSON.stringify(response, null, 2));
        
        // Gérer la structure de réponse de l'API
        const responseData = response.data;
        
        if (responseData?.data?.partners) {
          console.log('Setting partners from response.data.data.partners:', responseData.data.partners);
          setPartners(responseData.data.partners);
        } else if (responseData?.data) {
          console.log('Setting partners from response.data.data:', responseData.data);
          setPartners(Array.isArray(responseData.data) ? responseData.data : []);
        } else if ((responseData as any)?.partners) {
          console.log('Setting partners from response.data.partners:', (responseData as any).partners);
          // Log détaillé de chaque partenaire
          (responseData as any).partners.forEach((partner: any, index: number) => {
            console.log(`📋 Partner ${index + 1} - Full object:`, partner);
            console.log(`   - ID: ${partner._id}`);
            console.log(`   - Name: ${partner.firstName} ${partner.lastName}`);
            console.log(`   - Email: ${partner.email}`);
            console.log(`   - Company: ${partner.company}`);
            console.log(`   - Plan: ${partner.plan}`);
            console.log(`   - Status: ${partner.status}`);
            console.log(`   - CV Used This Month: ${partner.cvUsedThisMonth}`);
            console.log(`   - Plan Renewal Date: ${partner.planRenewalDate}`);
            console.log(`   - Created At: ${partner.createdAt}`);
            console.log(`   - Total Revenue: ${partner.totalRevenue}`);
            console.log(`   - Total CVs: ${partner.totalCVs}`);
            console.log('---');
          });
          setPartners((responseData as any).partners);
        } else {
          console.log('No partners found in response, using empty array');
          setPartners([]);
        }
      } catch (err) {
        console.error('=== PARTNERS API ERROR ===');
        console.error('Full error:', err);
        console.error('Error response:', (err as any).response);
        console.error('Error data:', (err as any).response?.data);
        console.error('Error status:', (err as any).response?.status);
        
        setError('Impossible de charger les partenaires.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPartners();
  }, []);

  // Fonctions utilitaires optimisées (déplacées avant le useMemo)
  const getPlanInfo = (plan: Partner['plan']) => {
    const plans = {
      starter: {
        name: 'Starter',
        color: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
        icon: '🌱',
        quota: 10,
        features: ['10 CVs/mois', 'Support basic', 'Analytics simple']
      },
      pro: {
        name: 'Pro',
        color: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
        icon: '⚡',
        quota: 50,
        features: ['50 CVs/mois', 'Support prioritaire', 'Analytics avancées', 'Export PDF']
      },
      business: {
        name: 'Business',
        color: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
        icon: '🚀',
        quota: 200,
        features: ['200 CVs/mois', 'Support VIP', 'Analytics complètes', 'Export multi-format', 'API access']
      }
    };
    return plans[plan];
  };

  const getDaysUntilRenewal = (renewalDate: string) => {
    const renewal = new Date(renewalDate);
    const today = new Date();
    return Math.ceil((renewal.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  };

  const getRenewalUrgency = (days: number) => {
    if (days <= 7) return { level: 'critical', color: 'text-red-500', icon: '⚠️' };
    if (days <= 15) return { level: 'warning', color: 'text-amber-500', icon: '⏰' };
    return { level: 'normal', color: 'text-emerald-500', icon: '' };
  };

  // Optimisations de performance
  const filteredPartners = useMemo(() => {
    return partners.filter((partner) => {
      const fullName = `${partner.firstName} ${partner.lastName}`.trim();
      const matchesSearch =
        fullName.toLowerCase().includes(search.toLowerCase()) ||
        partner.email.toLowerCase().includes(search.toLowerCase()) ||
        partner.company.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'all' || partner.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [partners, search, statusFilter]);

  const analyticsData = useMemo(() => {
    const activePartners = partners.filter(p => p.status === 'active');
    const criticalAlerts = partners.filter(p => {
      const days = getDaysUntilRenewal(p.planRenewalDate);
      return days <= 7 || p.cvStats?.isLimitReached;
    });
    const avgUsage = partners.length > 0 
      ? partners.reduce((sum, p) => sum + (p.cvStats?.percentageUsed || 0), 0) / partners.length
      : 0;
    
    return {
      activePartners: activePartners.length,
      criticalAlerts: criticalAlerts.length,
      avgUsage: Math.round(avgUsage),
      planDistribution: {
        starter: partners.filter(p => p.plan === 'starter').length,
        pro: partners.filter(p => p.plan === 'pro').length,
        business: partners.filter(p => p.plan === 'business').length,
      }
    };
  }, [partners]);

  const handlePartnerAction = useCallback((partner: Partner, action: 'edit' | 'delete') => {
    if (action === 'edit') {
      setSelectedPartner(partner);
      setIsModalOpen(true);
    } else if (action === 'delete') {
      handleDeletePartner(partner._id);
    }
  }, []);

  const formatCurrency = (val: number): string => {
    return new Intl.NumberFormat('fr-CM', {
      style: 'currency',
      currency: 'XAF',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const totalRevenue = partners.reduce((sum, p) => sum + (p.totalRevenue || 0), 0);
  const totalCVs = partners.reduce((sum, p) => sum + (p.totalCVs || 0), 0);

  const handleFormSubmit = async (data: {
    firstName: string;
    lastName: string;
    company: string;
    email: string;
    phone: string;
    country: string;
    city: string;
    password: string;
    plan: 'starter' | 'pro' | 'business';
  }) => {
    setIsSubmitting(true);
    try {
      console.log('🔄 Creating partner with data:', data);
      
      // Ajouter planRenewalDate (1 mois à partir d'aujourd'hui)
      const partnerData = {
        ...data,
        planRenewalDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      };
      
      console.log('📋 Final partner data to send:', partnerData);
      
      if (selectedPartner) {
        // Update existing partner
        console.log('📝 Updating existing partner:', selectedPartner._id);
        const response = await partnersService.update(selectedPartner._id, partnerData);
        console.log('✅ Partner updated:', response);
        setPartners(partners.map(p => p._id === selectedPartner._id ? response.data.data : p));
      } else {
        // Create new partner
        console.log('➕ Creating new partner...');
        const response = await partnersService.create(partnerData);
        console.log('✅ Partner API response:', response);
        console.log('📊 Response structure:', JSON.stringify(response.data, null, 2));
        
        if (response.data?.data) {
          const newPartner = response.data.data;
          console.log('🎉 New partner created:', newPartner);
          setPartners([...partners, newPartner]);
          
          // Rediriger vers la page de récapitulatif avec les identifiants
          const credentials = {
            email: data.email,
            password: data.password,
            name: `${data.firstName} ${data.lastName}`,
            role: 'partenaire',
            referralCode: newPartner.referralCode || 'PARTNER001',
            createdAt: newPartner.createdAt || new Date().toISOString(),
            plan: data.plan,
            planRenewalDate: partnerData.planRenewalDate,
            company: data.company
          };
          
          console.log('🔑 Generated credentials:', credentials);
          navigate('/user-credentials', { state: { credentials } });
          return; // Sortir de la fonction pour ne pas fermer le modal
        } else {
          console.error('❌ No data in response:', response);
        }
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error('❌ Error in partner creation:', err);
      console.error('📋 Full error details:', {
        message: err.message,
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data
      });
      setError('Erreur lors de la sauvegarde du partenaire.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePartner = async (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce partenaire ?')) {
      try {
        // Utiliser updateStatus pour désactiver au lieu de supprimer
        await partnersService.updateStatus(id, 'inactive');
        setPartners(partners.map(p => p._id === id ? { ...p, status: 'inactive' } : p));
      } catch (err) {
        console.error(err);
        setError('Erreur lors de la désactivation du partenaire.');
      }
    }
  };

  const columns: Column<Partner>[] = [
    {
      key: 'partner',
      header: 'Partenaire',
      cell: (partner) => {
        const planInfo = getPlanInfo(partner.plan);
        const createdDate = new Date(partner.createdAt);
        const isRecent = (Date.now() - createdDate.getTime()) < (7 * 24 * 60 * 60 * 1000); // Moins de 7 jours
        
        return (
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-600/20 flex items-center justify-center border border-blue-500/30">
                <Building className="w-7 h-7 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white dark:border-gray-800" />
              {isRecent && (
                <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-amber-500 border-2 border-white dark:border-gray-800 animate-pulse" />
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <p className="font-bold text-gray-900 dark:text-white text-lg">{partner.firstName} {partner.lastName}</p>
                <StatusBadge status={partner.status} labels={statusLabels} />
                {isRecent && (
                  <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">Nouveau</span>
                )}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 font-medium mb-2">{partner.company}</p>
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                  <span>{planInfo.icon}</span>
                  <span>{planInfo.name}</span>
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {createdDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
              </div>
            </div>
          </div>
        );
      },
    },
    {
      key: 'contact',
      header: 'Contact',
      cell: (partner) => (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <Mail className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">{partner.email}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Email professionnel</p>
            </div>
          </div>
          {partner.phone && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <Phone className="w-4 h-4 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{partner.phone}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Téléphone</p>
              </div>
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'usage',
      header: 'Utilisation CVs',
      cell: (partner) => {
        const cvStats = partner.cvStats || {
          used: partner.cvUsedThisMonth || 0,
          quota: getPlanInfo(partner.plan).quota,
          remaining: getPlanInfo(partner.plan).quota - (partner.cvUsedThisMonth || 0),
          percentageUsed: ((partner.cvUsedThisMonth || 0) / getPlanInfo(partner.plan).quota) * 100,
          isLimitReached: (partner.cvUsedThisMonth || 0) >= getPlanInfo(partner.plan).quota,
          plan: partner.plan
        };
        
        return (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-bold text-gray-900 dark:text-white">{cvStats.used}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">CVs créés</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-gray-900 dark:text-white">{cvStats.quota}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Quota mensuel</p>
              </div>
            </div>
            <div className="relative">
              <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                <div 
                  className={`h-full transition-all duration-500 rounded-full ${
                    cvStats.percentageUsed >= 90 ? 'bg-gradient-to-r from-red-500 to-red-600' : 
                    cvStats.percentageUsed >= 80 ? 'bg-gradient-to-r from-amber-500 to-amber-600' : 
                    'bg-gradient-to-r from-emerald-500 to-emerald-600'
                  }`}
                  style={{ width: `${Math.min(100, cvStats.percentageUsed)}%` }}
                />
              </div>
              <span className={`absolute -top-1 right-0 text-xs font-semibold px-2 py-0.5 rounded-full ${
                cvStats.isLimitReached ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' : 
                cvStats.percentageUsed >= 80 ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' : 
                'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'
              }`}>
                {cvStats.remaining} restants
              </span>
            </div>
            {cvStats.isLimitReached && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-2">
                <p className="text-xs font-medium text-red-600 dark:text-red-400">⚠️ Quota atteint</p>
              </div>
            )}
          </div>
        );
      },
    },
    {
      key: 'renewal',
      header: 'Renouvellement',
      cell: (partner) => {
        const daysUntilRenewal = getDaysUntilRenewal(partner.planRenewalDate);
        const renewalUrgency = getRenewalUrgency(daysUntilRenewal);
        const renewalDate = new Date(partner.planRenewalDate);
        
        return (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <Calendar className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {renewalDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Date de renouvellement</p>
              </div>
            </div>
            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${
              renewalUrgency.level === 'critical' ? 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800' :
              renewalUrgency.level === 'warning' ? 'bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800' :
              'bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800'
            }`}>
              <span className={`text-sm font-semibold ${
                renewalUrgency.level === 'critical' ? 'text-red-600 dark:text-red-400' :
                renewalUrgency.level === 'warning' ? 'text-amber-600 dark:text-amber-400' :
                'text-emerald-600 dark:text-emerald-400'
              }`}>
                {renewalUrgency.icon}{daysUntilRenewal} jours
              </span>
            </div>
          </div>
        );
      },
    },
    {
      key: 'actions',
      header: 'Actions',
      cell: (partner) => (
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 rounded-lg text-gray-600 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200" 
            onClick={() => { setSelectedPartner(partner); setIsModalOpen(true); }}
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 rounded-lg text-gray-600 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200" 
            onClick={() => handleDeletePartner(partner._id)}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <DashboardLayout>
      <PageHeader
        title="Partenaires"
        description={`${partners.length} partenaires actifs`}
        icon={<Handshake className="w-6 h-6" />}
        actions={
          <Button className="forge-button-primary" onClick={() => { setSelectedPartner(null); setIsModalOpen(true); }}>
            <Plus className="w-4 h-4 mr-2" />
            Nouveau partenaire
          </Button>
        }
      />

      {/* Dashboard Analytics Moderne */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
      >
        {/* Carte Partenaires */}
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300" />
          <div className="relative bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                <Building className="w-6 h-6 text-white" />
              </div>
              <div className="px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 rounded-full">
                <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">+12%</span>
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{partners.length}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Partenaires totaux</p>
              <div className="flex items-center gap-2 text-xs">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-emerald-600 dark:text-emerald-400">{partners.filter(p => p.status === 'active').length} actifs</span>
              </div>
            </div>
          </div>
        </div>

        {/* Carte Utilisation CV */}
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300" />
          <div className="relative bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                <span className="text-xs font-medium text-blue-600 dark:text-blue-400">+28%</span>
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                {partners.reduce((sum, p) => sum + (p.cvUsedThisMonth || 0), 0)}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">CVs créés ce mois</p>
              <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full" style={{ 
                  width: `${Math.min(100, (partners.reduce((sum, p) => sum + (p.cvUsedThisMonth || 0), 0) / (partners.length * 50)) * 100)}%` 
                }} />
              </div>
            </div>
          </div>
        </div>

        {/* Carte Plans Premium */}
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300" />
          <div className="relative bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg">
                <Crown className="w-6 h-6 text-white" />
              </div>
              <div className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                <span className="text-xs font-medium text-purple-600 dark:text-purple-400">Premium</span>
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                {partners.filter(p => p.plan === 'pro' || p.plan === 'business').length}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Plans Pro & Business</p>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-purple-600 dark:text-purple-400">
                  {Math.round((partners.filter(p => p.plan === 'pro' || p.plan === 'business').length / partners.length) * 100)}% des clients
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Carte Alertes */}
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 to-orange-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300" />
          <div className="relative bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center shadow-lg">
                <AlertTriangle className="w-6 h-6 text-white" />
              </div>
              <div className="px-2 py-1 bg-red-100 dark:bg-red-900/30 rounded-full">
                <span className="text-xs font-medium text-red-600 dark:text-red-400">Urgent</span>
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                {partners.filter(p => {
                  const days = getDaysUntilRenewal(p.planRenewalDate);
                  return days <= 7 || p.cvStats?.isLimitReached;
                }).length}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Actions requises</p>
              <div className="flex items-center gap-2 text-xs">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span className="text-red-600 dark:text-red-400">Attention requise</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Filtres et Actions */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="flex flex-col sm:flex-row gap-4 mb-6"
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher par nom, entreprise, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous statuts</SelectItem>
            <SelectItem value="active">Actif</SelectItem>
            <SelectItem value="inactive">Inactif</SelectItem>
          </SelectContent>
        </Select>
      </motion.div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {isLoading ? (
          <div className="text-center p-8">Chargement des partenaires...</div>
        ) : error ? (
          <Alert variant="destructive">{error}</Alert>
        ) : (
          <DataTable
            data={filteredPartners}
            columns={columns}
            keyExtractor={(partner) => partner._id}
            emptyMessage="Aucun partenaire trouvé"
          />
        )}
      </motion.div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedPartner ? 'Modifier le partenaire' : 'Créer un nouveau partenaire'}</DialogTitle>
            <DialogDescription>
              Remplissez les informations ci-dessous.
            </DialogDescription>
          </DialogHeader>
          <PartnerForm
            partner={selectedPartner}
            onSubmit={handleFormSubmit}
            onCancel={() => setIsModalOpen(false)}
            isSubmitting={isSubmitting}
          />
        </DialogContent>
      </Dialog>

    </DashboardLayout>
  );
}
