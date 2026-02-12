import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { UserCheck, Search, Plus, TrendingUp, CreditCard, FileText, Calendar, Edit, Trash2, Phone } from 'lucide-react';
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
import { associatesService } from '@/lib/api';
import { Alert } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { CommercialForm } from '@/components/commercials/CommercialForm';

// Define the Commercial type based on your API response
export interface Commercial {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  country?: string;
  city?: string;
  status: 'active' | 'inactive' | 'pending' | 'suspended';
  referralCode: string;
  totalSales: number;
  totalCommission: number;
  availableBalance: number;
  createdAt: string;
  lastLogin?: string;
}

const statusLabels: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  active: { label: 'Actif', variant: 'default' },
  inactive: { label: 'Inactif', variant: 'secondary' },
  pending: { label: 'En attente', variant: 'outline' },
  suspended: { label: 'Suspendu', variant: 'destructive' },
};

export default function CommercialsPage() {
  const navigate = useNavigate();
  const [commercials, setCommercials] = useState<Commercial[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCommercial, setSelectedCommercial] = useState<Commercial | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchCommercials = async () => {
      try {
        setIsLoading(true);
        console.log('=== ASSOCIATES API CALL ===');
        console.log('Calling associatesService.getList()...');
        
        const response = await associatesService.getList();
        
        console.log('Raw API Response:', response);
        console.log('Response data:', response.data);
        console.log('Response data.data:', response.data?.data);
        console.log('Full response structure:', JSON.stringify(response, null, 2));
        
        // Gérer la structure de réponse de l'API
        const responseData = response.data;
        
        if (responseData?.data?.associates) {
          console.log('Setting associates from response.data.data.associates:', responseData.data.associates);
          setCommercials(responseData.data.associates);
        } else if (responseData?.data) {
          console.log('Setting associates from response.data.data:', responseData.data);
          setCommercials(Array.isArray(responseData.data) ? responseData.data : []);
        } else if ((responseData as any)?.associates) {
          console.log('Setting associates from response.data.associates:', (responseData as any).associates);
          setCommercials((responseData as any).associates);
        } else {
          console.log('No associates found in response, using empty array');
          setCommercials([]);
        }
      } catch (err) {
        console.error('=== ASSOCIATES API ERROR ===');
        console.error('Full error:', err);
        console.error('Error response:', (err as any).response);
        console.error('Error data:', (err as any).response?.data);
        console.error('Error status:', (err as any).response?.status);
        
        setError('Impossible de charger les commerciaux.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCommercials();
  }, []);

  const filteredCommercials = commercials.filter((commercial) => {
    const matchesSearch =
      commercial.firstName.toLowerCase().includes(search.toLowerCase()) ||
      commercial.lastName.toLowerCase().includes(search.toLowerCase()) ||
      commercial.email.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'all' || commercial.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const formatCurrency = (val: number): string => {
    return new Intl.NumberFormat('fr-CM', {
      style: 'currency',
      currency: 'XAF',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const totalRevenue = commercials.reduce((sum, c) => sum + c.totalCommission, 0);
  const totalCommissionDue = commercials.reduce((sum, c) => sum + c.availableBalance, 0);
  const totalCVs = commercials.reduce((sum, c) => sum + c.totalSales, 0);

  const handleFormSubmit = async (data: Omit<Commercial, '_id' | 'totalCommission' | 'availableBalance' | 'totalSales' | 'createdAt' | 'referralCode'> & { password?: string }) => {
    setIsSubmitting(true);
    try {
      if (selectedCommercial) {
        // Update existing commercial
        const response = await associatesService.update(selectedCommercial._id, data);
        setCommercials(commercials.map(c => c._id === selectedCommercial._id ? response.data.data : c));
      } else {
        // Create new commercial
        const response = await associatesService.create(data);
        if (response.data?.data) {
          setCommercials([...commercials, response.data.data]);
          
          // Rediriger vers la page de récapitulatif avec les identifiants
          const credentials = {
            email: data.email,
            password: data.password || 'password123', // Mot de passe par défaut si non fourni
            name: `${data.firstName} ${data.lastName}`,
            role: 'associé',
            referralCode: response.data.data.referralCode || 'ASSOC001',
            createdAt: response.data.data.createdAt || new Date().toISOString()
          };
          
          navigate('/user-credentials', { state: { credentials } });
          return; // Sortir de la fonction pour ne pas fermer le modal
        }
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
      setError('Erreur lors de la sauvegarde du commercial.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCommercial = async (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce commercial ?')) {
      try {
        // Utiliser updateStatus pour désactiver au lieu de supprimer
        await associatesService.updateStatus(id, 'suspended');
        setCommercials(commercials.map(c => c._id === id ? { ...c, status: 'suspended' } : c));
      } catch (err) {
        console.error(err);
        setError('Erreur lors de la désactivation du commercial.');
      }
    }
  };

  const columns: Column<Commercial>[] = [
    {
      key: 'commercial',
      header: 'Commercial',
      cell: (commercial) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-500 font-semibold">
            {commercial.firstName.charAt(0)}{commercial.lastName.charAt(0)}
          </div>
          <div>
            <p className="font-medium text-foreground">{commercial.firstName} {commercial.lastName}</p>
            <p className="text-sm text-muted-foreground">{commercial.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'phone',
      header: 'Téléphone',
      cell: (commercial) => (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Phone className="w-3 h-3" />
          {commercial.phone}
        </div>
      ),
    },
    {
      key: 'totalSales',
      header: 'Ventes',
      cell: (commercial) => (
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-muted-foreground" />
          <span className="font-semibold text-foreground">{commercial.totalSales}</span>
        </div>
      ),
    },
    {
      key: 'revenue',
      header: 'Commission totale',
      cell: (commercial) => (
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-success" />
          <span className="font-semibold forge-gradient-text">{formatCurrency(commercial.totalCommission)}</span>
        </div>
      ),
    },
    {
      key: 'referralCode',
      header: 'Code',
      cell: (commercial) => (
        <Badge variant="outline">{commercial.referralCode}</Badge>
      ),
    },
    {
      key: 'availableBalance',
      header: 'Solde disponible',
      cell: (commercial) => (
        commercial.availableBalance > 0 ? (
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-warning" />
            <span className="font-semibold text-warning">{formatCurrency(commercial.availableBalance)}</span>
          </div>
        ) : (
          <span className="text-success font-medium">Payé</span>
        )
      ),
    },
    {
      key: 'createdAt',
      header: 'Inscription',
      cell: (commercial) => (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="w-3 h-3" />
          {new Date(commercial.createdAt).toLocaleDateString('fr-CM')}
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Statut',
      cell: (commercial) => <StatusBadge status={commercial.status} labels={statusLabels} />,
    },
    {
      key: 'actions',
      header: '',
      cell: (commercial) => (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setSelectedCommercial(commercial); setIsModalOpen(true); }}>
            <Edit className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDeleteCommercial(commercial._id)}>
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ];

  // Ranking by commission
  const rankedCommercials = [...commercials].sort((a, b) => b.totalCommission - a.totalCommission);

  return (
    <DashboardLayout>
      <PageHeader
        title="Commerciaux"
        description={`${commercials.length} commerciaux`}
        icon={<UserCheck className="w-6 h-6" />}
        actions={
          <Button className="forge-button-primary" onClick={() => { setSelectedCommercial(null); setIsModalOpen(true); }}>
            <Plus className="w-4 h-4 mr-2" />
            Nouveau commercial
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
          <p className="text-sm text-muted-foreground">Commerciaux actifs</p>
          <p className="text-2xl font-bold text-foreground">{commercials.filter(c => c.status === 'active').length}</p>
        </div>
        <div className="forge-card p-4">
          <p className="text-sm text-muted-foreground">CA total généré</p>
          <p className="text-2xl font-bold forge-gradient-text">{formatCurrency(totalRevenue)}</p>
        </div>
        <div className="forge-card p-4">
          <p className="text-sm text-muted-foreground">CVs générés</p>
          <p className="text-2xl font-bold text-foreground">{totalCVs}</p>
        </div>
        <div className="forge-card p-4 border-warning/20 bg-warning/5">
          <p className="text-sm text-muted-foreground">Commissions dues</p>
          <p className="text-2xl font-bold text-warning">{formatCurrency(totalCommissionDue)}</p>
        </div>
      </motion.div>

      {/* Ranking */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="mb-6"
      >
        <h3 className="text-sm font-semibold text-muted-foreground mb-3">Classement par performance</h3>
        <div className="flex gap-4 overflow-x-auto pb-2">
          {rankedCommercials.slice(0, 3).map((commercial, index) => (
            <div
              key={commercial._id}
              className={`forge-card p-4 min-w-[200px] flex items-center gap-3 ${
                index === 0 ? 'ring-2 ring-yellow-500/50 bg-yellow-500/5' : ''
              }`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : 'bg-amber-600'
              }`}>
                {index + 1}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground truncate">
                  {commercial.firstName} {commercial.lastName}
                </p>
                <p className="text-sm forge-gradient-text font-semibold">
                  {formatCurrency(commercial.totalCommission)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex flex-col sm:flex-row gap-4 mb-6"
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher par nom, email..."
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
        transition={{ delay: 0.25 }}
      >
        {isLoading ? (
        <div className="text-center p-8">Chargement des commerciaux...</div>
      ) : error ? (
        <Alert variant="destructive">{error}</Alert>
      ) : (
        <DataTable
          data={filteredCommercials}
          columns={columns}
          keyExtractor={(commercial) => commercial._id}
          emptyMessage="Aucun commercial trouvé"
        />
      )}
      </motion.div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedCommercial ? 'Modifier le commercial' : 'Créer un nouveau commercial'}</DialogTitle>
            <DialogDescription>
              Remplissez les informations ci-dessous.
            </DialogDescription>
          </DialogHeader>
          <CommercialForm
            commercial={selectedCommercial}
            onSubmit={handleFormSubmit}
            onCancel={() => setIsModalOpen(false)}
            isSubmitting={isSubmitting}
          />
        </DialogContent>
      </Dialog>

    </DashboardLayout>
  );
}
