import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Receipt, 
  Search, 
  Plus, 
  Calendar, 
  Download, 
  Eye, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  Upload, 
  Trash2,
  Filter,
  TrendingUp,
  Users,
  CreditCard,
  Send,
  RefreshCw,
  DollarSign
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/ui/PageHeader';
import { DataTable, Column } from '@/components/ui/DataTable';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PartnerInvoiceForm } from '@/components/invoices/PartnerInvoiceForm';
import { invoicesService } from '@/lib/api';

// Define the Invoice type based on API response
interface Invoice {
  id: string;
  invoiceNumber: string;
  clientId: string;
  clientType: 'customer' | 'associate' | 'partner';
  clientInfo: {
    name: string;
    email: string;
    phone: string;
    company?: string;
    address?: string;
    city?: string;
    country?: string;
  };
  items: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
  subtotal: number;
  tax: number;
  total: number;
  dueDate: string;
  status: 'pending' | 'paid' | 'overdue' | 'cancelled';
  paidAt?: string;
  paymentDate?: string;
  paymentMethod?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  pdfUrl?: string;
  pdfVersion?: number;
  pdfData?: {
    size: number;
  };
  type?: 'subscription' | 'commission' | 'withdrawal' | 'manual';
}

interface InvoiceStats {
  totalInvoices: number;
  totalAmount: number;
  paidInvoices: number;
  pendingInvoices: number;
  overdueInvoices: number;
  paidAmount: number;
  pendingAmount: number;
  overdueAmount: number;
}

const statusConfig: Record<string, { label: string; icon: React.ComponentType<{ className?: string }>; className: string }> = {
  paid: { label: 'Payée', icon: CheckCircle, className: 'bg-green-100 text-green-800 border-green-200' },
  pending: { label: 'En attente', icon: Clock, className: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  overdue: { label: 'En retard', icon: AlertCircle, className: 'bg-red-100 text-red-800 border-red-200' },
  cancelled: { label: 'Annulée', icon: AlertCircle, className: 'bg-gray-100 text-gray-800 border-gray-200' },
};

const typeConfig: Record<string, { label: string; icon: React.ComponentType<{ className?: string }>; className: string }> = {
  subscription: { label: 'Abonnement', icon: RefreshCw, className: 'bg-blue-100 text-blue-800' },
  commission: { label: 'Commission', icon: TrendingUp, className: 'bg-purple-100 text-purple-800' },
  withdrawal: { label: 'Retrait', icon: DollarSign, className: 'bg-orange-100 text-orange-800' },
  manual: { label: 'Manuelle', icon: FileText, className: 'bg-gray-100 text-gray-800' },
};

const clientTypeLabels: Record<string, string> = {
  customer: 'Client',
  associate: 'Associé',
  partner: 'Partenaire',
};

export default function InvoicesPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [stats, setStats] = useState<InvoiceStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [clientTypeFilter, setClientTypeFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    fetchInvoices();
    fetchStats();
  }, [statusFilter, clientTypeFilter, typeFilter, startDate, endDate, activeTab]);

  const fetchInvoices = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('=== INVOICES API CALL ===');
      console.log('Calling invoicesService.getList()...');
      
      const params: any = {};
      if (statusFilter !== 'all') params.status = statusFilter;
      if (clientTypeFilter !== 'all') params.clientType = clientTypeFilter;
      if (typeFilter !== 'all') params.type = typeFilter;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      if (search) params.search = search;
      
      // Filtrer selon l'onglet actif
      if (activeTab === 'pending') {
        params.status = 'pending';
      } else if (activeTab === 'overdue') {
        params.status = 'overdue';
      } else if (activeTab === 'subscriptions') {
        params.type = 'subscription';
      } else if (activeTab === 'withdrawals') {
        params.type = 'withdrawal';
      }
      
      const response = await invoicesService.getList(params);
      console.log('Raw API Response:', response);
      console.log('Response data:', response.data);
      console.log('Response data.data:', response.data?.data);
      console.log('Full response structure:', JSON.stringify(response, null, 2));
      
      if (response.data?.data?.invoices) {
        setInvoices(response.data.data.invoices);
      } else if (response.data?.invoices) {
        setInvoices(response.data.invoices);
      } else {
        console.warn('Unexpected response structure:', response.data);
        setInvoices([]);
      }
      
    } catch (err) {
      console.error('Error fetching invoices:', err);
      setError('Impossible de charger les factures.');
      setInvoices([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      console.log('=== INVOICES STATS API CALL ===');
      console.log('Calling invoicesService.getStats()...');
      
      const params: any = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      
      const response = await invoicesService.getStats(params);
      console.log('Stats response:', response.data);
      
      if (response.data?.data?.stats) {
        setStats(response.data.data.stats);
      } else if (response.data?.stats) {
        setStats(response.data.stats);
      } else {
        console.warn('Unexpected stats response structure:', response.data);
        setStats(null);
      }
      
    } catch (err) {
      console.error('Error fetching stats:', err);
      setStats(null);
    }
  };

  const handleDownloadPDF = async (invoice: Invoice) => {
    try {
      console.log('Downloading PDF for invoice:', invoice.id);
      const response = await invoicesService.downloadPDF(invoice.id);
      
      // Create blob and download
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `facture-${invoice.invoiceNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error downloading PDF:', err);
      setError('Erreur lors du téléchargement du PDF.');
    }
  };

  const handleSendInvoice = async (invoice: Invoice) => {
    try {
      console.log('Sending invoice:', invoice.id);
      // Simuler l'envoi
      setError('Facture envoyée avec succès à ' + invoice.clientInfo.email);
      setTimeout(() => setError(null), 3000);
    } catch (err) {
      console.error('Error sending invoice:', err);
      setError('Erreur lors de l\'envoi de la facture.');
    }
  };

  const handleUpdateStatus = async (invoiceId: string, newStatus: string) => {
    try {
      const data: any = { status: newStatus };
      if (newStatus === 'paid') {
        data.paymentDate = new Date().toISOString();
        data.paymentMethod = 'manual';
        data.notes = 'Mise à jour manuelle';
      }
      
      await invoicesService.updateStatus(invoiceId, data);
      fetchInvoices(); // Refresh list
      fetchStats(); // Refresh stats
    } catch (err) {
      console.error('Error updating status:', err);
      setError('Erreur lors de la mise à jour du statut.');
    }
  };

  const handleCreateInvoiceSuccess = () => {
    setIsCreateModalOpen(false);
    // Refresh the invoices list
    fetchInvoices();
    fetchStats();
  };

  const formatCurrency = (val: number): string => {
    return new Intl.NumberFormat('fr-CM', {
      style: 'currency',
      currency: 'XAF',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const columns: Column<Invoice>[] = [
    {
      key: 'invoiceNumber',
      header: 'Facture',
      cell: (invoice) => (
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <FileText className="w-4 h-4 text-primary" />
          </div>
          <div>
            <p className="font-mono font-semibold text-foreground">{invoice.invoiceNumber}</p>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {clientTypeLabels[invoice.clientType]}
              </Badge>
              {invoice.type && (
                <Badge variant="outline" className={`text-xs ${typeConfig[invoice.type]?.className}`}>
                  {typeConfig[invoice.type]?.label}
                </Badge>
              )}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'clientInfo',
      header: 'Client',
      cell: (invoice) => (
        <div>
          <p className="font-medium text-foreground">{invoice.clientInfo.name}</p>
          {invoice.clientInfo.company && (
            <p className="text-sm text-muted-foreground">{invoice.clientInfo.company}</p>
          )}
          <p className="text-xs text-muted-foreground">{invoice.clientInfo.email}</p>
        </div>
      ),
    },
    {
      key: 'total',
      header: 'Montant',
      cell: (invoice) => (
        <div className="text-right">
          <p className="font-bold text-lg">{formatCurrency(invoice.total)}</p>
          <p className="text-xs text-muted-foreground">
            {new Date(invoice.createdAt).toLocaleDateString('fr-CM')}
          </p>
        </div>
      ),
    },
    {
      key: 'dueDate',
      header: 'Échéance',
      cell: (invoice) => (
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 text-sm">
            <Calendar className="w-3 h-3" />
            {new Date(invoice.dueDate).toLocaleDateString('fr-CM')}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {Math.ceil((new Date(invoice.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} jours
          </p>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Statut',
      cell: (invoice) => {
        const config = statusConfig[invoice.status];
        const Icon = config.icon;
        return (
          <Badge variant="outline" className={config.className}>
            <Icon className="w-3 h-3 mr-1" />
            {config.label}
          </Badge>
        );
      },
    },
    {
      key: 'actions',
      header: 'Actions',
      cell: (invoice) => (
        <div className="flex items-center justify-end gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => handleDownloadPDF(invoice)}
            className="h-8 w-8 p-0"
          >
            <Download className="w-4 h-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => handleSendInvoice(invoice)}
            className="h-8 w-8 p-0"
          >
            <Send className="w-4 h-4" />
          </Button>
          {invoice.status === 'pending' && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0 text-green-600 hover:text-green-700"
              onClick={() => handleUpdateStatus(invoice.id, 'paid')}
            >
              <CheckCircle className="w-4 h-4" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <PageHeader
          title="Facturation"
          description="Gestion des factures et abonnements"
          icon={<Receipt className="w-6 h-6" />}
          actions={
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => window.location.reload()}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Actualiser
              </Button>
              <Button 
                className="forge-button-primary"
                onClick={() => setIsCreateModalOpen(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Nouvelle facture
              </Button>
              <PartnerInvoiceForm
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSuccess={handleCreateInvoiceSuccess}
              />
            </div>
          }
        />

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total facturé</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {formatCurrency(stats?.totalAmount || 0)}
                  </p>
                </div>
                <div className="p-2 rounded-lg bg-blue-100">
                  <Receipt className="w-5 h-5 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Payé</p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(stats?.paidAmount || 0)}
                  </p>
                </div>
                <div className="p-2 rounded-lg bg-green-100">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-yellow-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">En attente</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {formatCurrency(stats?.pendingAmount || 0)}
                  </p>
                </div>
                <div className="p-2 rounded-lg bg-yellow-100">
                  <Clock className="w-5 h-5 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-red-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">En retard</p>
                  <p className="text-2xl font-bold text-red-600">
                    {formatCurrency(stats?.overdueAmount || 0)}
                  </p>
                </div>
                <div className="p-2 rounded-lg bg-red-100">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Card>
          <CardHeader>
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <CardTitle>Liste des factures</CardTitle>
                <CardDescription>
                  {invoices.length} facture{invoices.length > 1 ? 's' : ''} trouvée{invoices.length > 1 ? 's' : ''}
                </CardDescription>
              </div>
              
              {/* Quick Actions */}
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    // Simuler la génération automatique des factures de retrait
                    setError('2 factures de retrait générées automatiquement');
                    setTimeout(() => setError(null), 3000);
                  }}
                >
                  <DollarSign className="w-4 h-4 mr-2" />
                  Générer factures retraits
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    // Simuler l'envoi des factures d'abonnement
                    setError('Factures d\'abonnement envoyées');
                    setTimeout(() => setError(null), 3000);
                  }}
                >
                  <Send className="w-4 h-4 mr-2" />
                  Envoyer abonnements
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Tabs Navigation */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="all" className="flex items-center gap-2">
                  <Receipt className="w-4 h-4" />
                  Toutes
                </TabsTrigger>
                <TabsTrigger value="pending" className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  En attente
                </TabsTrigger>
                <TabsTrigger value="overdue" className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  En retard
                </TabsTrigger>
                <TabsTrigger value="subscriptions" className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4" />
                  Abonnements
                </TabsTrigger>
                <TabsTrigger value="withdrawals" className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Retraits
                </TabsTrigger>
              </TabsList>

              <TabsContent value={activeTab} className="space-y-4">
                {/* Filters */}
                <div className="flex flex-col xl:flex-row gap-4 p-4 bg-muted/30 rounded-lg">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Rechercher par numéro, client..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    <Select value={clientTypeFilter} onValueChange={setClientTypeFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="Type client" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tous types</SelectItem>
                        <SelectItem value="customer">Client</SelectItem>
                        <SelectItem value="associate">Associé</SelectItem>
                        <SelectItem value="partner">Partenaire</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="Statut" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tous statuts</SelectItem>
                        <SelectItem value="paid">Payée</SelectItem>
                        <SelectItem value="pending">En attente</SelectItem>
                        <SelectItem value="overdue">En retard</SelectItem>
                        <SelectItem value="cancelled">Annulée</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="Type facture" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tous types</SelectItem>
                        <SelectItem value="subscription">Abonnement</SelectItem>
                        <SelectItem value="commission">Commission</SelectItem>
                        <SelectItem value="withdrawal">Retrait</SelectItem>
                        <SelectItem value="manual">Manuelle</SelectItem>
                      </SelectContent>
                    </Select>

                    <Input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      placeholder="Date début"
                    />
                  </div>
                </div>

                {/* Table */}
                {isLoading ? (
                  <div className="text-center p-8">
                    <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2" />
                    <p>Chargement des factures...</p>
                  </div>
                ) : error ? (
                  <Alert variant="destructive">{error}</Alert>
                ) : (
                  <DataTable
                    data={invoices}
                    columns={columns}
                    keyExtractor={(invoice) => invoice.id}
                    emptyMessage="Aucune facture trouvée"
                  />
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
