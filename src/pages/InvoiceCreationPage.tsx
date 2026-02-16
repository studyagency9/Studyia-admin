import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Send, 
  Eye, 
  Edit, 
  Trash2, 
  Calendar, 
  DollarSign, 
  User, 
  Building, 
  Mail, 
  Phone,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import jsPDF from 'jspdf';

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
  _id?: string;
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

export default function InvoiceCreationPage() {
  const navigate = useNavigate();
  const [commercials, setCommercials] = useState<Commercial[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedCommercial, setSelectedCommercial] = useState<Commercial | null>(null);
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);
  const [isCreatingInvoice, setIsCreatingInvoice] = useState(false);
  const [showInvoiceDialog, setShowInvoiceDialog] = useState(false);
  
  // Formulaire de facture
  const [invoiceForm, setInvoiceForm] = useState<Invoice>({
    invoiceNumber: '',
    date: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    commercial: {} as Commercial,
    partner: {} as Partner,
    items: [
      { id: '1', description: '', quantity: 1, unitPrice: 0, total: 0 }
    ],
    subtotal: 0,
    tax: 0,
    total: 0,
    status: 'draft'
  });

  // Charger les données dynamiquement
  useEffect(() => {
    loadCommercials();
    loadPartners();
  }, []);

  const loadCommercials = async () => {
    try {
      // Appel API réel pour récupérer les commerciaux depuis /admin/associates
      const response = await fetch('/api/admin/associates');
      
      if (!response.ok) {
        throw new Error('Erreur lors du chargement des commerciaux');
      }
      
      const data = await response.json();
      console.log('Commercials API response:', data);
      
      // Adapter les données d'associates au format Commercial
      const adaptedCommercials = data.data?.associates?.map((associate: any) => ({
        _id: associate._id,
        firstName: associate.firstName || associate.name?.split(' ')[0] || '',
        lastName: associate.lastName || associate.name?.split(' ').slice(1).join(' ') || '',
        email: associate.email,
        phone: associate.phone,
        status: associate.status || 'active',
        commission: associate.commission || 10
      })) || [];
      
      setCommercials(adaptedCommercials);
    } catch (error) {
      console.error('Erreur lors du chargement des commerciaux:', error);
      // En cas d'erreur, utiliser des données de démonstration
      const fallbackCommercials: Commercial[] = [
        {
          _id: '1',
          firstName: 'Jean',
          lastName: 'Dupont',
          email: 'jean.dupont@studyia.net',
          phone: '+237 671234567',
          status: 'active',
          commission: 10
        },
        {
          _id: '2',
          firstName: 'Marie',
          lastName: 'Martin',
          email: 'marie.martin@studyia.net',
          phone: '+237 698765432',
          status: 'active',
          commission: 12
        }
      ];
      setCommercials(fallbackCommercials);
    } finally {
      setLoading(false);
    }
  };

  const loadPartners = async () => {
    try {
      // Appel API réel pour récupérer les partenaires depuis /admin/partners
      const response = await fetch('/api/admin/partners');
      
      if (!response.ok) {
        throw new Error('Erreur lors du chargement des partenaires');
      }
      
      const data = await response.json();
      console.log('Partners API response:', data);
      
      // Adapter les données de partenaires au format Partner
      const adaptedPartners = data.data?.partners?.map((partner: any) => ({
        _id: partner._id,
        firstName: partner.firstName,
        lastName: partner.lastName,
        company: partner.company,
        email: partner.email,
        phone: partner.phone,
        country: partner.country,
        city: partner.city,
        plan: partner.plan,
        cvQuota: partner.cvStats?.quota || partner.cvQuota || 0,
        status: partner.status
      })) || [];
      
      setPartners(adaptedPartners);
    } catch (error) {
      console.error('Erreur lors du chargement des partenaires:', error);
      // En cas d'erreur, utiliser des données de démonstration
      const fallbackPartners: Partner[] = [
        {
          _id: '1',
          firstName: 'Ahmadou',
          lastName: 'Tch',
          company: 'Tech Solutions',
          email: 'ahmadou@techsolutions.com',
          phone: '+237 612345678',
          country: 'Cameroun',
          city: 'Douala',
          plan: 'pro',
          cvQuota: 100,
          status: 'active'
        },
        {
          _id: '2',
          firstName: 'Fatima',
          lastName: 'Bello',
          company: 'Digital Agency',
          email: 'fatima@digitalagency.com',
          phone: '+237 623456789',
          country: 'Cameroun',
          city: 'Yaoundé',
          plan: 'business',
          cvQuota: 300,
          status: 'active'
        }
      ];
      setPartners(fallbackPartners);
    }
  };

  const generateInvoiceNumber = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `INV-${year}${month}-${random}`;
  };

  const addItem = () => {
    const newItem: InvoiceItem = {
      id: Date.now().toString(),
      description: '',
      quantity: 1,
      unitPrice: 0,
      total: 0
    };
    setInvoiceForm(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }));
  };

  const updateItem = (id: string, field: keyof InvoiceItem, value: string | number) => {
    setInvoiceForm(prev => ({
      ...prev,
      items: prev.items.map(item => {
        if (item.id === id) {
          const updatedItem = { ...item, [field]: value };
          if (field === 'quantity' || field === 'unitPrice') {
            updatedItem.total = updatedItem.quantity * updatedItem.unitPrice;
          }
          return updatedItem;
        }
        return item;
      })
    }));
  };

  const removeItem = (id: string) => {
    setInvoiceForm(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== id)
    }));
  };

  // Calculer les totaux
  useEffect(() => {
    const subtotal = invoiceForm.items.reduce((sum, item) => sum + item.total, 0);
    const tax = subtotal * 0.19; // TVA 19%
    const total = subtotal + tax;
    
    setInvoiceForm(prev => ({
      ...prev,
      subtotal,
      tax,
      total
    }));
  }, [invoiceForm.items]);

  const generatePDFInvoice = () => {
    if (!invoiceForm.commercial || !invoiceForm.partner) return;
    
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    
    // Couleurs du thème
    const primaryBlue: [number, number, number] = [25, 55, 109];
    const lightBlue: [number, number, number] = [240, 248, 255];
    const accentGold: [number, number, number] = [212, 175, 55];
    
    // En-tête
    pdf.setFillColor(...primaryBlue);
    pdf.rect(0, 0, pageWidth, 80, 'F');
    
    pdf.setFillColor(...accentGold);
    pdf.rect(0, 78, pageWidth, 2, 'F');
    
    // Logo et titre
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(32);
    pdf.setFont('helvetica', 'bold');
    pdf.text('STUDIA CAREER', pageWidth / 2, 25, { align: 'center' });
    
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'normal');
    pdf.text('FACTURE', pageWidth / 2, 40, { align: 'center' });
    
    pdf.setFontSize(14);
    pdf.text(`N°: ${invoiceForm.invoiceNumber}`, pageWidth / 2, 55, { align: 'center' });
    
    pdf.setFontSize(12);
    pdf.text(`Date: ${new Date(invoiceForm.date).toLocaleDateString('fr-FR')}`, pageWidth / 2, 70, { align: 'center' });
    
    // Informations client et commercial
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    
    let yPosition = 100;
    
    // Client
    pdf.setFont('helvetica', 'bold');
    pdf.text('CLIENT:', 20, yPosition);
    yPosition += 10;
    pdf.setFont('helvetica', 'normal');
    pdf.text(`${invoiceForm.partner.firstName} ${invoiceForm.partner.lastName}`, 20, yPosition);
    yPosition += 7;
    pdf.text(invoiceForm.partner.company, 20, yPosition);
    yPosition += 7;
    pdf.text(invoiceForm.partner.email, 20, yPosition);
    yPosition += 7;
    if (invoiceForm.partner.phone) {
      pdf.text(invoiceForm.partner.phone, 20, yPosition);
      yPosition += 7;
    }
    if (invoiceForm.partner.city && invoiceForm.partner.country) {
      pdf.text(`${invoiceForm.partner.city}, ${invoiceForm.partner.country}`, 20, yPosition);
      yPosition += 7;
    }
    
    // Commercial
    yPosition = 100;
    pdf.setFont('helvetica', 'bold');
    pdf.text('COMMERCIAL:', 120, yPosition);
    yPosition += 10;
    pdf.setFont('helvetica', 'normal');
    pdf.text(`${invoiceForm.commercial.firstName} ${invoiceForm.commercial.lastName}`, 120, yPosition);
    yPosition += 7;
    pdf.text(invoiceForm.commercial.email, 120, yPosition);
    yPosition += 7;
    if (invoiceForm.commercial.phone) {
      pdf.text(invoiceForm.commercial.phone, 120, yPosition);
      yPosition += 7;
    }
    pdf.text(`Commission: ${invoiceForm.commercial.commission}%`, 120, yPosition);
    
    // Tableau des articles
    yPosition += 20;
    pdf.setFillColor(...lightBlue);
    pdf.rect(20, yPosition - 5, pageWidth - 40, 10, 'F');
    
    pdf.setFont('helvetica', 'bold');
    pdf.text('Description', 25, yPosition);
    pdf.text('Quantité', 100, yPosition);
    pdf.text('Prix Unitaire', 130, yPosition);
    pdf.text('Total', 170, yPosition);
    
    yPosition += 15;
    pdf.setFont('helvetica', 'normal');
    
    invoiceForm.items.forEach(item => {
      if (item.description && item.quantity > 0) {
        // Description (sur plusieurs lignes si nécessaire)
        const lines = pdf.splitTextToSize(item.description, 60);
        lines.forEach((line: string) => {
          pdf.text(line, 25, yPosition);
          yPosition += 7;
        });
        
        // Quantité
        pdf.text(item.quantity.toString(), 100, yPosition - 7);
        
        // Prix unitaire
        pdf.text(`${item.unitPrice.toFixed(2)} €`, 130, yPosition - 7);
        
        // Total
        pdf.text(`${item.total.toFixed(2)} €`, 170, yPosition - 7);
        
        yPosition += 5;
      }
    });
    
    // Totaux
    yPosition += 20;
    pdf.setDrawColor(...primaryBlue);
    pdf.setLineWidth(0.5);
    pdf.line(20, yPosition, pageWidth - 20, yPosition);
    
    yPosition += 15;
    pdf.setFont('helvetica', 'normal');
    pdf.text('Sous-total:', 130, yPosition);
    pdf.text(`${invoiceForm.subtotal.toFixed(2)} €`, 170, yPosition);
    
    yPosition += 10;
    pdf.text('TVA (19%):', 130, yPosition);
    pdf.text(`${invoiceForm.tax.toFixed(2)} €`, 170, yPosition);
    
    yPosition += 10;
    pdf.setFont('helvetica', 'bold');
    pdf.text('TOTAL:', 130, yPosition);
    pdf.text(`${invoiceForm.total.toFixed(2)} €`, 170, yPosition);
    
    // Pied de page
    const footerY = pdf.internal.pageSize.getHeight() - 40;
    pdf.setFillColor(...primaryBlue);
    pdf.rect(0, footerY, pageWidth, 40, 'F');
    
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text('STUDIA CAREER - Plateforme Professionnelle de Création de CV', pageWidth / 2, footerY + 15, { align: 'center' });
    pdf.text('career.studyia.net | contact@studyia.net | +237 671373978', pageWidth / 2, footerY + 25, { align: 'center' });
    
    // Télécharger le PDF
    const fileName = `Facture-${invoiceForm.invoiceNumber}-${new Date().toISOString().split('T')[0]}.pdf`;
    pdf.save(fileName);
  };

  const handleCreateInvoice = () => {
    if (!invoiceForm.commercial || !invoiceForm.partner) {
      alert('Veuillez sélectionner un commercial et un partenaire');
      return;
    }
    
    if (invoiceForm.items.length === 0 || !invoiceForm.items.some(item => item.description && item.quantity > 0)) {
      alert('Veuillez ajouter au moins un article à la facture');
      return;
    }
    
    setIsCreatingInvoice(true);
    try {
      generatePDFInvoice();
      setShowInvoiceDialog(false);
    } catch (error) {
      console.error('Erreur lors de la création de la facture:', error);
      alert('Erreur lors de la création de la facture');
    } finally {
      setIsCreatingInvoice(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-muted-foreground">Chargement des données...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* En-tête */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestion des Factures</h1>
          <p className="text-gray-600">Créez et gérez vos factures professionnelles</p>
          <nav className="flex text-sm text-gray-500 mt-4">
            <span className="hover:text-gray-700 cursor-pointer">Tableau de bord</span>
            <span className="mx-2">/</span>
            <span className="text-gray-700 font-medium">Factures</span>
          </nav>
        </div>

        {/* Actions principales */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Rechercher une facture..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="draft">Brouillon</SelectItem>
                <SelectItem value="sent">Envoyée</SelectItem>
                <SelectItem value="paid">Payée</SelectItem>
                <SelectItem value="overdue">En retard</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Dialog open={showInvoiceDialog} onOpenChange={setShowInvoiceDialog}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800">
                <Plus className="w-4 h-4 mr-2" />
                Nouvelle Facture
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
                  Créer une nouvelle facture
                </DialogTitle>
                <DialogDescription>
                  Remplissez les informations ci-dessous pour créer une facture professionnelle.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6 mt-6">
                {/* Informations générales */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
                  <h3 className="text-xl font-bold text-blue-900 mb-6 flex items-center gap-2">
                    <FileText className="w-6 h-6" />
                    Informations générales
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="invoiceNumber" className="text-sm font-medium text-blue-700">Numéro de facture</Label>
                      <div className="relative">
                        <Input
                          id="invoiceNumber"
                          value={invoiceForm.invoiceNumber || generateInvoiceNumber()}
                          onChange={(e) => setInvoiceForm(prev => ({ ...prev, invoiceNumber: e.target.value }))}
                          placeholder="Généré automatiquement"
                          className="border-blue-300 focus:border-blue-500 focus:ring-blue-500"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setInvoiceForm(prev => ({ ...prev, invoiceNumber: generateInvoiceNumber() }))}
                          className="absolute right-1 top-1 h-8 px-2 text-xs"
                        >
                          Générer
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="date" className="text-sm font-medium text-blue-700">Date de facturation</Label>
                      <Input
                        id="date"
                        type="date"
                        value={invoiceForm.date}
                        onChange={(e) => setInvoiceForm(prev => ({ ...prev, date: e.target.value }))}
                        className="border-blue-300 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dueDate" className="text-sm font-medium text-blue-700">Date d'échéance</Label>
                      <Input
                        id="dueDate"
                        type="date"
                        value={invoiceForm.dueDate}
                        onChange={(e) => setInvoiceForm(prev => ({ ...prev, dueDate: e.target.value }))}
                        className="border-blue-300 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Sélection du commercial */}
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-xl border border-purple-200">
                  <h3 className="text-xl font-bold text-purple-900 mb-6 flex items-center gap-2">
                    <User className="w-6 h-6" />
                    Commercial assigné
                  </h3>
                  {loading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mr-3"></div>
                      <span className="text-purple-600">Chargement des commerciaux...</span>
                    </div>
                  ) : commercials.length === 0 ? (
                    <div className="text-center py-8">
                      <User className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                      <p className="text-gray-500">Aucun commercial disponible</p>
                      <p className="text-sm text-gray-400 mt-1">Veuillez contacter l'administrateur</p>
                    </div>
                  ) : (
                    <Select onValueChange={(value) => {
                      const commercial = commercials.find(c => c._id === value);
                      if (commercial) {
                        setInvoiceForm(prev => ({ ...prev, commercial }));
                      }
                    }}>
                      <SelectTrigger className="border-purple-300 focus:border-purple-500 focus:ring-purple-500 h-12">
                        <SelectValue placeholder="Sélectionner un commercial" />
                      </SelectTrigger>
                      <SelectContent>
                        {commercials.map(commercial => (
                          <SelectItem key={commercial._id} value={commercial._id}>
                            <div className="flex items-center gap-3 p-2">
                              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                                {commercial.firstName.charAt(0)}{commercial.lastName.charAt(0)}
                              </div>
                              <div className="flex-1">
                                <div className="font-medium text-gray-900">
                                  {commercial.firstName} {commercial.lastName}
                                </div>
                                <div className="text-sm text-gray-500">{commercial.email}</div>
                                <div className="text-xs text-gray-400">Commission: {commercial.commission}%</div>
                              </div>
                              <Badge variant={commercial.status === 'active' ? 'default' : 'secondary'} className="ml-2">
                                {commercial.status === 'active' ? 'Actif' : 'Inactif'}
                              </Badge>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>

                {/* Sélection du partenaire */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200">
                  <h3 className="text-xl font-bold text-green-900 mb-6 flex items-center gap-2">
                    <Building className="w-6 h-6" />
                    Client (Partenaire)
                  </h3>
                  {loading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mr-3"></div>
                      <span className="text-green-600">Chargement des partenaires...</span>
                    </div>
                  ) : partners.length === 0 ? (
                    <div className="text-center py-8">
                      <Building className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                      <p className="text-gray-500">Aucun partenaire disponible</p>
                      <p className="text-sm text-gray-400 mt-1">Veuillez contacter l'administrateur</p>
                    </div>
                  ) : (
                    <Select onValueChange={(value) => {
                      const partner = partners.find(p => p._id === value);
                      if (partner) {
                        setInvoiceForm(prev => ({ ...prev, partner }));
                      }
                    }}>
                      <SelectTrigger className="border-green-300 focus:border-green-500 focus:ring-green-500 h-12">
                        <SelectValue placeholder="Sélectionner un partenaire" />
                      </SelectTrigger>
                      <SelectContent>
                        {partners.map(partner => (
                          <SelectItem key={partner._id} value={partner._id}>
                            <div className="flex items-center gap-3 p-2">
                              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center text-white font-bold">
                                {partner.company.charAt(0)}
                              </div>
                              <div className="flex-1">
                                <div className="font-medium text-gray-900">
                                  {partner.company}
                                </div>
                                <div className="text-sm text-gray-500">{partner.firstName} {partner.lastName}</div>
                                <div className="text-xs text-gray-400">{partner.email}</div>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge variant="outline" className="text-xs">
                                    Plan {partner.plan}
                                  </Badge>
                                  <Badge variant="outline" className="text-xs">
                                    {partner.cvQuota} CVs
                                  </Badge>
                                </div>
                              </div>
                              <Badge variant={partner.status === 'active' ? 'default' : 'destructive'} className="ml-2">
                                {partner.status === 'active' ? 'Actif' : 'Suspendu'}
                              </Badge>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>

                {/* Articles de la facture */}
                <div className="bg-gradient-to-r from-orange-50 to-amber-50 p-6 rounded-xl border border-orange-200">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-orange-900 flex items-center gap-2">
                      <FileText className="w-6 h-6" />
                      Articles de la facture
                    </h3>
                    <Button 
                      onClick={addItem} 
                      className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Ajouter un article
                    </Button>
                  </div>
                  
                  <div className="space-y-4">
                    {invoiceForm.items.map((item, index) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-white p-4 rounded-lg border border-orange-200 shadow-sm"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                          <div className="md:col-span-2">
                            <Label htmlFor={`description-${item.id}`} className="text-sm font-medium text-orange-700">Description</Label>
                            <Input
                              id={`description-${item.id}`}
                              value={item.description}
                              onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                              placeholder="Description du service/produit"
                              className="border-orange-300 focus:border-orange-500 focus:ring-orange-500 mt-1"
                            />
                          </div>
                          <div>
                            <Label htmlFor={`quantity-${item.id}`} className="text-sm font-medium text-orange-700">Quantité</Label>
                            <Input
                              id={`quantity-${item.id}`}
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => updateItem(item.id, 'quantity', parseInt(e.target.value) || 0)}
                              className="border-orange-300 focus:border-orange-500 focus:ring-orange-500 mt-1"
                            />
                          </div>
                          <div>
                            <Label htmlFor={`unitPrice-${item.id}`} className="text-sm font-medium text-orange-700">Prix unitaire (€)</Label>
                            <Input
                              id={`unitPrice-${item.id}`}
                              type="number"
                              min="0"
                              step="0.01"
                              value={item.unitPrice}
                              onChange={(e) => updateItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                              className="border-orange-300 focus:border-orange-500 focus:ring-orange-500 mt-1"
                            />
                          </div>
                          <div className="flex items-end gap-2">
                            <div className="flex-1">
                              <Label className="text-sm font-medium text-orange-700">Total</Label>
                              <div className="font-bold text-lg text-orange-600 mt-1">
                                {item.total.toFixed(2)} €
                              </div>
                            </div>
                            {invoiceForm.items.length > 1 && (
                              <Button
                                onClick={() => removeItem(item.id)}
                                variant="outline"
                                size="sm"
                                className="text-red-600 hover:text-red-700 hover:bg-red-50 mt-6"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Totaux */}
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 rounded-xl border border-indigo-200 shadow-lg">
                  <div className="space-y-4">
                    <div className="flex justify-between text-white text-lg">
                      <span>Sous-total:</span>
                      <span className="font-semibold">{invoiceForm.subtotal.toFixed(2)} €</span>
                    </div>
                    <div className="flex justify-between text-white text-lg">
                      <span>TVA (19%):</span>
                      <span className="font-semibold">{invoiceForm.tax.toFixed(2)} €</span>
                    </div>
                    <div className="border-t border-white/30 pt-4 flex justify-between text-2xl font-bold text-white">
                      <span>TOTAL:</span>
                      <span className="text-3xl">{invoiceForm.total.toFixed(2)} €</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-4">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowInvoiceDialog(false)}
                    className="border-gray-300 hover:bg-gray-50"
                  >
                    Annuler
                  </Button>
                  <Button 
                    onClick={handleCreateInvoice}
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-8 py-3 text-lg font-semibold shadow-lg"
                    disabled={!invoiceForm.commercial || !invoiceForm.partner || isCreatingInvoice}
                  >
                    {isCreatingInvoice ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Génération en cours...
                      </>
                    ) : (
                      <>
                        <FileText className="w-5 h-5 mr-2" />
                        Générer la facture PDF
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600 font-medium">Total des factures</p>
                  <p className="text-2xl font-bold text-blue-900">12</p>
                </div>
                <div className="p-3 bg-blue-200 rounded-full">
                  <FileText className="w-6 h-6 text-blue-700" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600 font-medium">Factures payées</p>
                  <p className="text-2xl font-bold text-green-900">8</p>
                </div>
                <div className="p-3 bg-green-200 rounded-full">
                  <CheckCircle className="w-6 h-6 text-green-700" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-yellow-600 font-medium">En attente</p>
                  <p className="text-2xl font-bold text-yellow-900">3</p>
                </div>
                <div className="p-3 bg-yellow-200 rounded-full">
                  <Clock className="w-6 h-6 text-yellow-700" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-red-600 font-medium">En retard</p>
                  <p className="text-2xl font-bold text-red-900">1</p>
                </div>
                <div className="p-3 bg-red-200 rounded-full">
                  <AlertCircle className="w-6 h-6 text-red-700" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Liste des factures (placeholder) */}
        <Card>
          <CardHeader>
            <CardTitle>Liste des factures</CardTitle>
            <CardDescription>
              Historique de toutes vos factures
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <FileText className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">Aucune facture créée pour le moment</p>
              <p className="text-sm text-gray-400 mt-2">
                Cliquez sur "Nouvelle Facture" pour commencer
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
