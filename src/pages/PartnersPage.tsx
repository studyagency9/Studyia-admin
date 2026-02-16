import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Handshake, Search, Plus, Building, Mail, Phone, TrendingUp, AlertCircle, FileText, Edit, Trash2, Calendar } from 'lucide-react';
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
export interface Partner {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  country?: string;
  city?: string;
  status: 'active' | 'inactive' | 'pending';
  plan?: string;
  subscriptionStatus?: string;
  cvUsedThisMonth?: number;
  monthlyQuota?: number;
  nextQuotaReset?: string;
  totalCVs: number;
  totalRevenue?: number;
  referralCode: string;
  createdAt: string;
  lastLogin?: string;
  planRenewalDate?: string;
}

const statusLabels: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  active: { label: 'Actif', variant: 'default' },
  inactive: { label: 'Inactif', variant: 'secondary' },
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

  const filteredPartners = partners.filter((partner) => {
    const fullName = `${partner.firstName || ''} ${partner.lastName || ''}`.trim();
    const matchesSearch =
      fullName.toLowerCase().includes(search.toLowerCase()) ||
      (partner.email && partner.email.toLowerCase().includes(search.toLowerCase())) ||
      (partner.company && partner.company.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || partner.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const formatCurrency = (val: number): string => {
    return new Intl.NumberFormat('fr-CM', {
      style: 'currency',
      currency: 'XAF',
      maximumFractionDigits: 0,
    }).format(val);
  };

  // Fonction pour obtenir les informations de plan
  const getPlanInfo = (plan?: string) => {
    const plans = {
      starter: {
        name: 'Starter',
        color: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
        icon: '🌱',
        monthlyQuota: 10,
        features: ['10 CVs/mois', 'Support basic', 'Analytics simple']
      },
      pro: {
        name: 'Pro',
        color: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
        icon: '⚡',
        monthlyQuota: 50,
        features: ['50 CVs/mois', 'Support prioritaire', 'Analytics avancées', 'Export PDF']
      },
      business: {
        name: 'Business',
        color: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
        icon: '🚀',
        monthlyQuota: 200,
        features: ['200 CVs/mois', 'Support VIP', 'Analytics complètes', 'Export multi-format', 'API access']
      }
    };
    return plans[plan as keyof typeof plans] || plans.starter;
  };

  // Fonction pour calculer les CVs restants
  const getRemainingCVs = (partner: Partner) => {
    const planInfo = getPlanInfo(partner.plan);
    const used = partner.cvUsedThisMonth || 0;
    const quota = planInfo.monthlyQuota;
    return Math.max(0, quota - used);
  };

  // Fonction pour obtenir le pourcentage d'utilisation
  const getUsagePercentage = (partner: Partner) => {
    const planInfo = getPlanInfo(partner.plan);
    const used = partner.cvUsedThisMonth || 0;
    const quota = planInfo.monthlyQuota;
    return Math.min(100, (used / quota) * 100);
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
        return (
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 flex items-center justify-center text-emerald-500 border border-emerald-500/20">
              <Building className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-foreground">{`${partner.firstName || ''} ${partner.lastName || ''}`.trim()}</p>
              <p className="text-sm text-muted-foreground">{partner.company}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${planInfo.color}`}>
                  <span>{planInfo.icon}</span>
                  <span>{planInfo.name}</span>
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
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <Mail className="w-3 h-3 text-muted-foreground" />
            <span className="text-foreground">{partner.email}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Phone className="w-3 h-3 text-muted-foreground" />
            <span className="text-foreground">{partner.phone || 'Non défini'}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'usage',
      header: 'Utilisation CVs',
      cell: (partner) => {
        const planInfo = getPlanInfo(partner.plan);
        const used = partner.cvUsedThisMonth || 0;
        const remaining = getRemainingCVs(partner);
        const percentage = getUsagePercentage(partner);
        const isNearLimit = percentage >= 80;
        
        return (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Utilisation</span>
              <span className={`font-medium ${isNearLimit ? 'text-amber-500' : 'text-foreground'}`}>
                {used}/{planInfo.monthlyQuota}
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
              <div 
                className={`h-full transition-all duration-300 ${
                  percentage >= 90 ? 'bg-red-500' : 
                  percentage >= 80 ? 'bg-amber-500' : 
                  'bg-emerald-500'
                }`}
                style={{ width: `${percentage}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Restants</span>
              <span className={`font-medium ${remaining <= 2 ? 'text-red-500' : remaining <= 5 ? 'text-amber-500' : 'text-emerald-500'}`}>
                {remaining} CVs
              </span>
            </div>
          </div>
        );
      },
    },
    {
      key: 'renewal',
      header: 'Renouvellement',
      cell: (partner) => {
        const renewalDate = new Date(partner.planRenewalDate || '');
        const today = new Date();
        const daysUntilRenewal = Math.ceil((renewalDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        const isUrgent = daysUntilRenewal <= 7;
        
        return (
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="w-3 h-3 text-muted-foreground" />
              <span className="text-foreground">
                {renewalDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
            </div>
            <div className="text-xs">
              <span className={`font-medium ${
                isUrgent ? 'text-red-500' : 
                daysUntilRenewal <= 15 ? 'text-amber-500' : 
                'text-emerald-500'
              }`}>
                {isUrgent ? '⚠️ ' : ''}{daysUntilRenewal} jours
              </span>
            </div>
          </div>
        );
      },
    },
    {
      key: 'status',
      header: 'Statut',
      cell: (partner) => <StatusBadge status={partner.status} labels={statusLabels} />,
    },
    {
      key: 'actions',
      header: '',
      cell: (partner) => (
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 hover:bg-blue-500/10 hover:text-blue-500" 
            onClick={() => { setSelectedPartner(partner); setIsModalOpen(true); }}
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 hover:bg-red-500/10 hover:text-red-500" 
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

      {/* Enhanced Stats */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
      >
        <div className="forge-card p-4 border-l-4 border-l-emerald-500">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-muted-foreground">Partenaires actifs</p>
            <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center">
              <Building className="w-4 h-4 text-emerald-500" />
            </div>
          </div>
          <p className="text-2xl font-bold text-foreground">{partners.filter(p => p.status === 'active').length}</p>
          <p className="text-xs text-muted-foreground mt-1">sur {partners.length} total</p>
        </div>
        
        <div className="forge-card p-4 border-l-4 border-l-blue-500">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-muted-foreground">CVs ce mois</p>
            <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center">
              <FileText className="w-4 h-4 text-blue-500" />
            </div>
          </div>
          <p className="text-2xl font-bold text-foreground">{partners.reduce((sum, p) => sum + (p.cvUsedThisMonth || 0), 0)}</p>
          <p className="text-xs text-muted-foreground mt-1">utilisés ce mois</p>
        </div>
        
        <div className="forge-card p-4 border-l-4 border-l-purple-500">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-muted-foreground">Plans Pro+</p>
            <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-purple-500" />
            </div>
          </div>
          <p className="text-2xl font-bold text-foreground">
            {partners.filter(p => p.plan === 'pro' || p.plan === 'business').length}
          </p>
          <p className="text-xs text-muted-foreground mt-1">plans premium</p>
        </div>
        
        <div className="forge-card p-4 border-l-4 border-l-amber-500">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-muted-foreground">Renouvellements</p>
            <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center">
              <Calendar className="w-4 h-4 text-amber-500" />
            </div>
          </div>
          <p className="text-2xl font-bold text-foreground">
            {partners.filter(p => {
              const renewalDate = new Date(p.planRenewalDate || '');
              const today = new Date();
              const daysUntilRenewal = Math.ceil((renewalDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
              return daysUntilRenewal <= 7;
            }).length}
          </p>
          <p className="text-xs text-muted-foreground mt-1">dans 7 jours</p>
        </div>
      </motion.div>

      {/* Partner Details Cards */}
      {filteredPartners.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6"
        >
          {filteredPartners.slice(0, 4).map((partner, index) => {
            const planInfo = getPlanInfo(partner.plan);
            const used = partner.cvUsedThisMonth || 0;
            const remaining = getRemainingCVs(partner);
            const percentage = getUsagePercentage(partner);
            const renewalDate = new Date(partner.planRenewalDate || '');
            const daysUntilRenewal = Math.ceil((renewalDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
            
            return (
              <motion.div
                key={partner._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.05 }}
                className="forge-card p-6 border-l-4 border-l-emerald-500 hover:shadow-lg transition-all duration-300"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 flex items-center justify-center text-emerald-500 border border-emerald-500/20">
                      <Building className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg text-foreground">
                        {`${partner.firstName || ''} ${partner.lastName || ''}`.trim()}
                      </h3>
                      <p className="text-sm text-muted-foreground">{partner.company}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={partner.status} labels={statusLabels} />
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${planInfo.color}`}>
                      <span>{planInfo.icon}</span>
                      <span>{planInfo.name}</span>
                    </span>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="w-3 h-3 text-muted-foreground" />
                      <span className="text-foreground truncate">{partner.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="w-3 h-3 text-muted-foreground" />
                      <span className="text-foreground">{partner.phone || 'Non défini'}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-3 h-3 text-muted-foreground" />
                      <span className="text-foreground">
                        {renewalDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <TrendingUp className="w-3 h-3 text-muted-foreground" />
                      <span className={`font-medium ${
                        daysUntilRenewal <= 7 ? 'text-red-500' : 
                        daysUntilRenewal <= 15 ? 'text-amber-500' : 
                        'text-emerald-500'
                      }`}>
                        {daysUntilRenewal <= 7 ? '⚠️ ' : ''}{daysUntilRenewal} jours
                      </span>
                    </div>
                  </div>
                </div>

                {/* CV Usage Progress */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">Utilisation des CVs</span>
                    <span className="text-sm text-muted-foreground">
                      {used}/{planInfo.monthlyQuota} ce mois
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-500 ${
                        percentage >= 90 ? 'bg-red-500' : 
                        percentage >= 80 ? 'bg-amber-500' : 
                        'bg-emerald-500'
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Restants</span>
                    <span className={`font-semibold ${
                      remaining <= 2 ? 'text-red-500' : 
                      remaining <= 5 ? 'text-amber-500' : 
                      'text-emerald-500'
                    }`}>
                      {remaining} CVs
                    </span>
                  </div>
                </div>

                {/* Plan Features */}
                <div className="mt-4 pt-4 border-t border-border">
                  <p className="text-xs font-medium text-muted-foreground mb-2">Fonctionnalités du plan</p>
                  <div className="flex flex-wrap gap-1">
                    {planInfo.features.map((feature, idx) => (
                      <span key={idx} className="inline-block px-2 py-1 bg-muted/50 rounded text-xs text-muted-foreground">
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1 hover:bg-blue-500/10 hover:text-blue-500 hover:border-blue-500/20"
                    onClick={() => { setSelectedPartner(partner); setIsModalOpen(true); }}
                  >
                    <Edit className="w-3 h-3 mr-1" />
                    Modifier
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/20"
                    onClick={() => handleDeletePartner(partner._id)}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* Filters */}
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
