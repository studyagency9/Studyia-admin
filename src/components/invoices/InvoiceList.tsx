import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, 
  Download, 
  Send, 
  Eye, 
  Edit, 
  Trash2, 
  Calendar, 
  DollarSign, 
  User, 
  Building,
  CheckCircle,
  Clock,
  AlertCircle,
  MoreHorizontal,
  Search,
  Filter
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';

// Interfaces
interface Commercial {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  status: 'active' | 'inactive';
  commission: number;
}

interface Partner {
  _id: string;
  firstName: string;
  lastName: string;
  company: string;
  email: string;
  phone?: string;
  country?: string;
  city?: string;
  plan: 'starter' | 'pro' | 'business';
  cvQuota: number;
  status: 'active' | 'suspended';
}

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface Invoice {
  _id: string;
  invoiceNumber: string;
  date: string;
  dueDate: string;
  commercial: Commercial;
  partner: Partner;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  notes?: string;
}

interface InvoiceListProps {
  invoices: Invoice[];
  onView?: (invoice: Invoice) => void;
  onEdit?: (invoice: Invoice) => void;
  onDelete?: (invoice: Invoice) => void;
  onSend?: (invoice: Invoice) => void;
  onDownload?: (invoice: Invoice) => void;
}

const statusConfig = {
  draft: {
    label: 'Brouillon',
    color: 'bg-gray-100 text-gray-800',
    icon: FileText
  },
  sent: {
    label: 'Envoyée',
    color: 'bg-blue-100 text-blue-800',
    icon: Send
  },
  paid: {
    label: 'Payée',
    color: 'bg-green-100 text-green-800',
    icon: CheckCircle
  },
  overdue: {
    label: 'En retard',
    color: 'bg-red-100 text-red-800',
    icon: AlertCircle
  }
};

export function InvoiceList({ 
  invoices, 
  onView, 
  onEdit, 
  onDelete, 
  onSend, 
  onDownload 
}: InvoiceListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCommercial, setFilterCommercial] = useState('all');
  const [filterPartner, setFilterPartner] = useState('all');

  // Filtrer les factures
  const filteredInvoices = useMemo(() => {
    return invoices.filter(invoice => {
      // Recherche par numéro ou client
      const matchesSearch = searchTerm === '' || 
        invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.partner.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        `${invoice.partner.firstName} ${invoice.partner.lastName}`.toLowerCase().includes(searchTerm.toLowerCase());

      // Filtre par statut
      const matchesStatus = filterStatus === 'all' || invoice.status === filterStatus;

      // Filtre par commercial
      const matchesCommercial = filterCommercial === 'all' || 
        invoice.commercial._id === filterCommercial;

      // Filtre par partenaire
      const matchesPartner = filterPartner === 'all' || 
        invoice.partner._id === filterPartner;

      return matchesSearch && matchesStatus && matchesCommercial && matchesPartner;
    });
  }, [invoices, searchTerm, filterStatus, filterCommercial, filterPartner]);

  // Extraire les commerciaux et partenaires uniques pour les filtres
  const uniqueCommercials = useMemo(() => {
    const commercialMap = new Map();
    invoices.forEach(invoice => {
      commercialMap.set(invoice.commercial._id, invoice.commercial);
    });
    return Array.from(commercialMap.values());
  }, [invoices]);

  const uniquePartners = useMemo(() => {
    const partnerMap = new Map();
    invoices.forEach(invoice => {
      partnerMap.set(invoice.partner._id, invoice.partner);
    });
    return Array.from(partnerMap.values());
  }, [invoices]);

  const getStatusIcon = (status: string) => {
    const config = statusConfig[status as keyof typeof statusConfig];
    const Icon = config.icon;
    return <Icon className="w-4 h-4" />;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date();
  };

  if (filteredInvoices.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="w-16 h-16 mx-auto text-gray-300 mb-4" />
        <p className="text-gray-500 text-lg font-medium">Aucune facture trouvée</p>
        <p className="text-sm text-gray-400 mt-2">
          {searchTerm || filterStatus !== 'all' || filterCommercial !== 'all' || filterPartner !== 'all'
            ? 'Essayez de modifier vos filtres de recherche'
            : 'Créez votre première facture pour commencer'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filtres */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Rechercher par numéro, client..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-2">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              {Object.entries(statusConfig).map(([key, config]) => (
                <SelectItem key={key} value={key}>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(key)}
                    <span>{config.label}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filterCommercial} onValueChange={setFilterCommercial}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Commercial" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les commerciaux</SelectItem>
              {uniqueCommercials.map(commercial => (
                <SelectItem key={commercial._id} value={commercial._id}>
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span>{commercial.firstName} {commercial.lastName}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filterPartner} onValueChange={setFilterPartner}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Client" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les clients</SelectItem>
              {uniquePartners.map(partner => (
                <SelectItem key={partner._id} value={partner._id}>
                  <div className="flex items-center gap-2">
                    <Building className="w-4 h-4" />
                    <span>{partner.company}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Liste des factures */}
      <div className="space-y-4">
        {filteredInvoices.map((invoice, index) => (
          <motion.div
            key={invoice._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="hover:shadow-lg transition-shadow duration-200">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  {/* Informations principales */}
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {invoice.invoiceNumber}
                      </h3>
                      <Badge className={statusConfig[invoice.status].color}>
                        <div className="flex items-center gap-1">
                          {getStatusIcon(invoice.status)}
                          <span>{statusConfig[invoice.status].label}</span>
                        </div>
                      </Badge>
                      {invoice.status === 'sent' && isOverdue(invoice.dueDate) && (
                        <Badge variant="destructive">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          En retard
                        </Badge>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Building className="w-4 h-4" />
                        <span>{invoice.partner.company}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <User className="w-4 h-4" />
                        <span>{invoice.commercial.firstName} {invoice.commercial.lastName}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(invoice.date)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <DollarSign className="w-4 h-4" />
                        <span className="font-semibold text-gray-900">
                          {invoice.total.toFixed(2)} €
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onView?.(invoice)}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Voir
                    </Button>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onDownload?.(invoice)}>
                          <Download className="w-4 h-4 mr-2" />
                          Télécharger PDF
                        </DropdownMenuItem>
                        
                        {invoice.status === 'draft' && (
                          <DropdownMenuItem onClick={() => onSend?.(invoice)}>
                            <Send className="w-4 h-4 mr-2" />
                            Envoyer
                          </DropdownMenuItem>
                        )}
                        
                        {(invoice.status === 'draft' || invoice.status === 'sent') && (
                          <DropdownMenuItem onClick={() => onEdit?.(invoice)}>
                            <Edit className="w-4 h-4 mr-2" />
                            Modifier
                          </DropdownMenuItem>
                        )}
                        
                        <DropdownMenuItem 
                          onClick={() => onDelete?.(invoice)}
                          className="text-red-600"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Supprimer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Pagination (si nécessaire) */}
      {filteredInvoices.length > 10 && (
        <div className="flex justify-center">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled>
              Précédent
            </Button>
            <span className="text-sm text-gray-600">
              Page 1 sur {Math.ceil(filteredInvoices.length / 10)}
            </span>
            <Button variant="outline" size="sm">
              Suivant
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
