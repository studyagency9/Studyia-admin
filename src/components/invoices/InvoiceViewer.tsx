import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, 
  Download, 
  Send, 
  Edit, 
  Calendar, 
  DollarSign, 
  User, 
  Building,
  Mail,
  Phone,
  MapPin,
  CheckCircle,
  Clock,
  AlertCircle,
  ArrowLeft,
  Printer
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

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

interface InvoiceViewerProps {
  invoice: Invoice | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (invoice: Invoice) => void;
  onSend?: (invoice: Invoice) => void;
  onDownload?: (invoice: Invoice) => void;
}

const statusConfig = {
  draft: {
    label: 'Brouillon',
    color: 'bg-gray-100 text-gray-800 border-gray-200',
    icon: FileText,
    description: 'Cette facture est en cours de préparation'
  },
  sent: {
    label: 'Envoyée',
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    icon: Send,
    description: 'Cette facture a été envoyée au client'
  },
  paid: {
    label: 'Payée',
    color: 'bg-green-100 text-green-800 border-green-200',
    icon: CheckCircle,
    description: 'Cette facture a été payée'
  },
  overdue: {
    label: 'En retard',
    color: 'bg-red-100 text-red-800 border-red-200',
    icon: AlertCircle,
    description: 'Cette facture est en retard de paiement'
  }
};

export function InvoiceViewer({ 
  invoice, 
  isOpen, 
  onClose, 
  onEdit, 
  onSend, 
  onDownload 
}: InvoiceViewerProps) {
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  if (!invoice) return null;

  const statusInfo = statusConfig[invoice.status];
  const StatusIcon = statusInfo.icon;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const isOverdue = () => {
    return invoice.status === 'sent' && new Date(invoice.dueDate) < new Date();
  };

  const handleDownload = async () => {
    setIsGeneratingPDF(true);
    try {
      await onDownload?.(invoice);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold">
              Facture {invoice.invoiceNumber}
            </DialogTitle>
            <div className="flex items-center gap-2">
              <Badge className={statusInfo.color}>
                <div className="flex items-center gap-1">
                  <StatusIcon className="w-4 h-4" />
                  <span>{statusInfo.label}</span>
                </div>
              </Badge>
              {isOverdue() && (
                <Badge variant="destructive">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  En retard
                </Badge>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-6">
          {/* Actions */}
          <div className="flex flex-wrap gap-2 justify-end">
            {invoice.status === 'draft' && (
              <Button variant="outline" onClick={() => onEdit?.(invoice)}>
                <Edit className="w-4 h-4 mr-2" />
                Modifier
              </Button>
            )}
            
            {invoice.status === 'draft' && (
              <Button onClick={() => onSend?.(invoice)}>
                <Send className="w-4 h-4 mr-2" />
                Envoyer
              </Button>
            )}
            
            <Button 
              variant="outline" 
              onClick={handleDownload}
              disabled={isGeneratingPDF}
            >
              <Download className="w-4 h-4 mr-2" />
              {isGeneratingPDF ? 'Génération...' : 'Télécharger PDF'}
            </Button>
            
            <Button variant="outline">
              <Printer className="w-4 h-4 mr-2" />
              Imprimer
            </Button>
          </div>

          {/* En-tête de la facture */}
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
            <CardContent className="p-8">
              <div className="flex flex-col lg:flex-row justify-between items-start gap-8">
                {/* Informations de l'entreprise */}
                <div className="space-y-4">
                  <div>
                    <h2 className="text-2xl font-bold text-blue-900 mb-2">STUDIA CAREER</h2>
                    <p className="text-gray-600">Plateforme Professionnelle de Création de CV</p>
                  </div>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <span>Douala, Cameroun</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      <span>contact@studyia.net</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      <span>+237 671373978 / +237 686430454</span>
                    </div>
                  </div>
                </div>

                {/* Informations de la facture */}
                <div className="text-right space-y-4">
                  <div>
                    <h3 className="text-sm text-gray-500 mb-1">Numéro de facture</h3>
                    <p className="text-2xl font-bold text-gray-900">{invoice.invoiceNumber}</p>
                  </div>
                  <div>
                    <h3 className="text-sm text-gray-500 mb-1">Date de facturation</h3>
                    <p className="font-medium">{formatDate(invoice.date)}</p>
                  </div>
                  <div>
                    <h3 className="text-sm text-gray-500 mb-1">Date d'échéance</h3>
                    <p className={`font-medium ${isOverdue() ? 'text-red-600' : ''}`}>
                      {formatDate(invoice.dueDate)}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm text-gray-500 mb-1">Statut</h3>
                    <Badge className={statusInfo.color}>
                      <div className="flex items-center gap-1">
                        <StatusIcon className="w-3 h-3" />
                        <span>{statusInfo.label}</span>
                      </div>
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Informations client et commercial */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Client */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="w-5 h-5" />
                  Informations du client
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-lg">
                    {invoice.partner.company}
                  </h4>
                  <p className="text-gray-600">
                    {invoice.partner.firstName} {invoice.partner.lastName}
                  </p>
                </div>
                <div className="space-y-2 text-sm">
                  {invoice.partner.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span>{invoice.partner.email}</span>
                    </div>
                  )}
                  {invoice.partner.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span>{invoice.partner.phone}</span>
                    </div>
                  )}
                  {invoice.partner.city && invoice.partner.country && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span>{invoice.partner.city}, {invoice.partner.country}</span>
                    </div>
                  )}
                </div>
                <div className="pt-2">
                  <Badge variant={invoice.partner.status === 'active' ? 'default' : 'destructive'}>
                    {invoice.partner.status === 'active' ? 'Actif' : 'Suspendu'}
                  </Badge>
                  <Badge variant="outline" className="ml-2">
                    Plan {invoice.partner.plan}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Commercial */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Commercial assigné
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-lg">
                    {invoice.commercial.firstName} {invoice.commercial.lastName}
                  </h4>
                </div>
                <div className="space-y-2 text-sm">
                  {invoice.commercial.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span>{invoice.commercial.email}</span>
                    </div>
                  )}
                  {invoice.commercial.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span>{invoice.commercial.phone}</span>
                    </div>
                  )}
                </div>
                <div className="pt-2">
                  <Badge variant={invoice.commercial.status === 'active' ? 'default' : 'secondary'}>
                    {invoice.commercial.status === 'active' ? 'Actif' : 'Inactif'}
                  </Badge>
                  <Badge variant="outline" className="ml-2">
                    Commission: {invoice.commercial.commission}%
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Articles de la facture */}
          <Card>
            <CardHeader>
              <CardTitle>Détails de la facture</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Description</th>
                      <th className="text-center py-3 px-4">Quantité</th>
                      <th className="text-right py-3 px-4">Prix unitaire</th>
                      <th className="text-right py-3 px-4">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoice.items.map((item, index) => (
                      <tr key={item.id} className="border-b">
                        <td className="py-4 px-4">
                          <div className="max-w-xs">
                            {item.description}
                          </div>
                        </td>
                        <td className="text-center py-4 px-4">
                          {item.quantity}
                        </td>
                        <td className="text-right py-4 px-4">
                          {item.unitPrice.toFixed(2)} €
                        </td>
                        <td className="text-right py-4 px-4 font-medium">
                          {item.total.toFixed(2)} €
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2">
                      <td colSpan={3} className="py-4 px-4 text-right font-semibold">
                        Sous-total:
                      </td>
                      <td className="text-right py-4 px-4 font-semibold">
                        {invoice.subtotal.toFixed(2)} €
                      </td>
                    </tr>
                    <tr>
                      <td colSpan={3} className="py-4 px-4 text-right">
                        TVA (19%):
                      </td>
                      <td className="text-right py-4 px-4">
                        {invoice.tax.toFixed(2)} €
                      </td>
                    </tr>
                    <tr className="border-t-2">
                      <td colSpan={3} className="py-4 px-4 text-right font-bold text-lg">
                        Total:
                      </td>
                      <td className="text-right py-4 px-4 font-bold text-lg text-blue-600">
                        {invoice.total.toFixed(2)} €
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          {invoice.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 whitespace-pre-wrap">
                  {invoice.notes}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Informations de statut */}
          <Card className="bg-gray-50">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <StatusIcon className="w-6 h-6 text-gray-600" />
                <div>
                  <h4 className="font-semibold">{statusInfo.label}</h4>
                  <p className="text-sm text-gray-600">{statusInfo.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
