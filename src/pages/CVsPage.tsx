import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Search, Filter, Eye, Download, User, Briefcase, MapPin, Calendar } from 'lucide-react';
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
import api from '@/lib/api';
import { Alert } from '@/components/ui/alert';

// Définir le type CV basé sur la réponse de l'API
interface CV {
  id: string;
  userName: string;
  targetPosition: string;
  sector: string;
  city: string;
  channel: 'direct' | 'partner' | 'commercial';
  status: 'draft' | 'ready' | 'exploited';
  experienceLevel: 'junior' | 'intermediate' | 'senior' | 'expert';
  creationDate: string;
}

const statusLabels: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  draft: { label: 'Brouillon', variant: 'secondary' },
  ready: { label: 'Prêt', variant: 'default' },
  exploited: { label: 'Exploité', variant: 'outline' },
};

const channelLabels: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' }> = {
  direct: { label: 'Direct', variant: 'default' },
  partner: { label: 'Partenaire', variant: 'secondary' },
  commercial: { label: 'Commercial', variant: 'outline' },
};

const experienceLabels: Record<string, string> = {
  junior: 'Junior (0-2 ans)',
  intermediate: 'Intermédiaire (2-5 ans)',
  senior: 'Senior (5-10 ans)',
  expert: 'Expert (10+ ans)',
};

export default function CVsPage() {
  const [cvs, setCVs] = useState<CV[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [channelFilter, setChannelFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sectorFilter, setSectorFilter] = useState<string>('all');

  useEffect(() => {
    const fetchCVs = async () => {
      try {
        setIsLoading(true);
        const response = await api.get('/cvs');
        setCVs(response.data);
      } catch (err) {
        setError('Impossible de charger les CVs.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCVs();
  }, []);

  const sectors = [...new Set(cvs.map(cv => cv.sector))];

  const filteredCVs = cvs.filter((cv) => {
    const matchesSearch =
      cv.userName.toLowerCase().includes(search.toLowerCase()) ||
      cv.targetPosition.toLowerCase().includes(search.toLowerCase()) ||
      cv.sector.toLowerCase().includes(search.toLowerCase()) ||
      cv.city.toLowerCase().includes(search.toLowerCase());

    const matchesChannel = channelFilter === 'all' || cv.channel === channelFilter;
    const matchesStatus = statusFilter === 'all' || cv.status === statusFilter;
    const matchesSector = sectorFilter === 'all' || cv.sector === sectorFilter;

    return matchesSearch && matchesChannel && matchesStatus && matchesSector;
  });

  const columns: Column<CV>[] = [
    {
      key: 'user',
      header: 'Utilisateur',
      cell: (cv) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-accent">
            <User className="w-4 h-4" />
          </div>
          <div>
            <p className="font-medium text-foreground">{cv.userName}</p>
            <p className="text-sm text-muted-foreground">{cv.id}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'position',
      header: 'Poste ciblé',
      cell: (cv) => (
        <div>
          <div className="flex items-center gap-2">
            <Briefcase className="w-3 h-3 text-muted-foreground" />
            <span className="font-medium text-foreground">{cv.targetPosition}</span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">{cv.sector}</p>
        </div>
      ),
    },
    {
      key: 'experience',
      header: 'Expérience',
      cell: (cv) => (
        <span className="text-sm text-foreground">{experienceLabels[cv.experienceLevel]}</span>
      ),
    },
    {
      key: 'location',
      header: 'Ville',
      cell: (cv) => (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="w-3 h-3" />
          {cv.city}
        </div>
      ),
    },
    {
      key: 'channel',
      header: 'Canal',
      cell: (cv) => (
        <Badge variant={channelLabels[cv.channel].variant}>
          {channelLabels[cv.channel].label}
        </Badge>
      ),
    },
    {
      key: 'creationDate',
      header: 'Création',
      cell: (cv) => (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="w-3 h-3" />
          {new Date(cv.creationDate).toLocaleDateString('fr-CM')}
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Statut',
      cell: (cv) => <StatusBadge status={cv.status} labels={statusLabels} />,
    },
    {
      key: 'actions',
      header: '',
      cell: (cv) => (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Eye className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Download className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <DashboardLayout>
      <PageHeader
        title="CVs"
        description={`${cvs.length} CVs créés`}
        icon={<FileText className="w-6 h-6" />}
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
            placeholder="Rechercher par utilisateur, poste, secteur..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={sectorFilter} onValueChange={setSectorFilter}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Secteur" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous secteurs</SelectItem>
            {sectors.map((sector) => (
              <SelectItem key={sector} value={sector}>{sector}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={channelFilter} onValueChange={setChannelFilter}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Canal" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous canaux</SelectItem>
            <SelectItem value="direct">Direct</SelectItem>
            <SelectItem value="partner">Partenaire</SelectItem>
            <SelectItem value="commercial">Commercial</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous statuts</SelectItem>
            <SelectItem value="draft">Brouillon</SelectItem>
            <SelectItem value="ready">Prêt</SelectItem>
            <SelectItem value="exploited">Exploité</SelectItem>
          </SelectContent>
        </Select>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
      >
        <div className="forge-card p-4">
          <p className="text-sm text-muted-foreground">Total CVs</p>
          <p className="text-2xl font-bold text-foreground">{cvs.length}</p>
        </div>
        <div className="forge-card p-4">
          <p className="text-sm text-muted-foreground">Prêts</p>
          <p className="text-2xl font-bold text-primary">{cvs.filter(cv => cv.status === 'ready').length}</p>
        </div>
        <div className="forge-card p-4">
          <p className="text-sm text-muted-foreground">Brouillons</p>
          <p className="text-2xl font-bold text-warning">{cvs.filter(cv => cv.status === 'draft').length}</p>
        </div>
        <div className="forge-card p-4">
          <p className="text-sm text-muted-foreground">Exploités</p>
          <p className="text-2xl font-bold text-success">{cvs.filter(cv => cv.status === 'exploited').length}</p>
        </div>
      </motion.div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {isLoading ? (
          <div className="text-center p-8">Chargement des CVs...</div>
        ) : error ? (
          <Alert variant="destructive">{error}</Alert>
        ) : (
          <DataTable
            data={filteredCVs}
            columns={columns}
            keyExtractor={(cv) => cv.id}
            emptyMessage="Aucun CV trouvé"
          />
        )}
      </motion.div>
    </DashboardLayout>
  );
}
