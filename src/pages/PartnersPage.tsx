import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Handshake, Search, Plus, Building, Mail, Phone, TrendingUp, AlertCircle, FileText, Edit, Trash2 } from 'lucide-react';
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
  name: string;
  email: string;
  phone: string;
  company: string;
  country?: string;
  city?: string;
  status: 'active' | 'inactive' | 'pending';
  totalCVs: number;
  totalRevenue: number;
  referralCode: string;
  createdAt: string;
  lastLogin?: string;
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
    const matchesSearch =
      partner.name.toLowerCase().includes(search.toLowerCase()) ||
      partner.email.toLowerCase().includes(search.toLowerCase()) ||
      partner.company.toLowerCase().includes(search.toLowerCase());

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

  const totalRevenue = partners.reduce((sum, p) => sum + p.totalRevenue, 0);
  const totalCVs = partners.reduce((sum, p) => sum + p.totalCVs, 0);

  const handleFormSubmit = async (data: Omit<Partner, '_id' | 'totalCVs' | 'totalRevenue' | 'referralCode' | 'createdAt'> & { password?: string }) => {
    setIsSubmitting(true);
    try {
      if (selectedPartner) {
        // Update existing partner
        const response = await partnersService.update(selectedPartner._id, data);
        setPartners(partners.map(p => p._id === selectedPartner._id ? response.data.data : p));
      } else {
        // Create new partner
        const response = await partnersService.create(data);
        if (response.data?.data) {
          setPartners([...partners, response.data.data]);
          
          // Rediriger vers la page de récapitulatif avec les identifiants
          const credentials = {
            email: data.email,
            password: data.password || 'password123', // Mot de passe par défaut si non fourni
            name: data.name,
            role: 'partenaire',
            referralCode: response.data.data.referralCode || 'PARTNER001',
            createdAt: response.data.data.createdAt || new Date().toISOString()
          };
          
          navigate('/user-credentials', { state: { credentials } });
          return; // Sortir de la fonction pour ne pas fermer le modal
        }
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
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
      cell: (partner) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
            <Building className="w-4 h-4" />
          </div>
          <div>
            <p className="font-medium text-foreground">{partner.name}</p>
            <p className="text-sm text-muted-foreground">{partner.company}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'contact',
      header: 'Contact',
      cell: (partner) => (
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Mail className="w-3 h-3" />
            {partner.email}
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Phone className="w-3 h-3" />
            {partner.phone}
          </div>
        </div>
      ),
    },
    {
      key: 'totalCVs',
      header: 'CVs générés',
      cell: (partner) => (
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-muted-foreground" />
          <span className="font-semibold text-foreground">{partner.totalCVs}</span>
        </div>
      ),
    },
    {
      key: 'totalRevenue',
      header: 'CA généré',
      cell: (partner) => (
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-success" />
          <span className="font-semibold forge-gradient-text">{formatCurrency(partner.totalRevenue)}</span>
        </div>
      ),
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
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setSelectedPartner(partner); setIsModalOpen(true); }}>
            <Edit className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDeletePartner(partner._id)}>
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

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
      >
        <div className="forge-card p-4">
          <p className="text-sm text-muted-foreground">Partenaires actifs</p>
          <p className="text-2xl font-bold text-foreground">{partners.filter(p => p.status === 'active').length}</p>
        </div>
        <div className="forge-card p-4">
          <p className="text-sm text-muted-foreground">CA total généré</p>
          <p className="text-2xl font-bold forge-gradient-text">{formatCurrency(totalRevenue)}</p>
        </div>
        <div className="forge-card p-4">
          <p className="text-sm text-muted-foreground">CVs générés</p>
          <p className="text-2xl font-bold text-foreground">{totalCVs}</p>
        </div>
        <div className="forge-card p-4 border-success/20 bg-success/5">
          <p className="text-sm text-muted-foreground">Statut actifs</p>
          <p className="text-2xl font-bold text-success">{partners.filter(p => p.status === 'active').length}</p>
        </div>
      </motion.div>

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
        <DialogContent>
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
