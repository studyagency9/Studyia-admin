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
  DollarSign,
  Building
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import jsPDF from 'jspdf';

// Interfaces
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
  cvStats?: {
    quota: number;
    used: number;
    remaining: number;
    percentageUsed: number;
    isLimitReached: boolean;
  };
  status: 'active' | 'suspended';
  planRenewalDate?: string;
}

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface PartnerInvoiceFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function PartnerInvoiceForm({ isOpen, onClose, onSuccess }: PartnerInvoiceFormProps) {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreatingInvoice, setIsCreatingInvoice] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);
  
  // Formulaire de facture
  const [invoiceForm, setInvoiceForm] = useState({
    invoiceNumber: '',
    date: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    items: [
      { id: '1', description: '', quantity: 1, unitPrice: 0, total: 0 }
    ],
    subtotal: 0,
    tax: 0,
    total: 0,
    notes: ''
  });

  // Charger les partenaires dynamiquement
  useEffect(() => {
    if (isOpen) {
      loadPartners();
    }
  }, [isOpen]);

  const loadPartners = async () => {
    try {
      setLoading(true);
      console.log('🔄 Chargement des partenaires depuis /admin/partners...');
      
      const response = await fetch('/api/admin/partners');
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('✅ Réponse API partenaires:', data);
      
      // Vérifier la structure des données
      if (data?.data?.partners && Array.isArray(data.data.partners)) {
        const partnersData = data.data.partners;
        console.log(`📊 ${partnersData.length} partenaires trouvés`);
        
        setPartners(partnersData);
        
        // Debug: afficher le premier partenaire
        if (partnersData.length > 0) {
          console.log('🔍 Premier partenaire:', partnersData[0]);
        }
      } else {
        console.warn('⚠️ Structure de données inattendue:', data);
        setPartners([]);
      }
      
    } catch (error) {
      console.error('❌ Erreur lors du chargement des partenaires:', error);
      setPartners([]);
    } finally {
      setLoading(false);
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
    if (!selectedPartner) return;
    
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    
    // En-tête
    pdf.setFillColor(25, 55, 109);
    pdf.rect(0, 0, pageWidth, 70, 'F');
    
    pdf.setFillColor(212, 175, 55);
    pdf.rect(0, 68, pageWidth, 2, 'F');
    
    // Logo et titre
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(28);
    pdf.setFont('helvetica', 'bold');
    pdf.text('STUDIA CAREER', pageWidth / 2, 25, { align: 'center' });
    
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'normal');
    pdf.text('FACTURE PARTENAIRE', pageWidth / 2, 40, { align: 'center' });
    
    pdf.setFontSize(12);
    pdf.text(`N°: ${invoiceForm.invoiceNumber}`, pageWidth / 2, 55, { align: 'center' });
    
    // Informations partenaire
    pdf.setTextColor(0, 0, 0);
    pdf.setFont('helvetica', 'normal');
    
    let yPosition = 90;
    
    // Partenaire
    pdf.setFont('helvetica', 'bold');
    pdf.text('PARTENAIRE:', 20, yPosition);
    yPosition += 10;
    pdf.setFont('helvetica', 'normal');
    pdf.text(`${selectedPartner.firstName} ${selectedPartner.lastName}`, 20, yPosition);
    yPosition += 7;
    pdf.text(selectedPartner.company, 20, yPosition);
    yPosition += 7;
    pdf.text(selectedPartner.email, 20, yPosition);
    yPosition += 7;
    if (selectedPartner.phone) {
      pdf.text(selectedPartner.phone, 20, yPosition);
      yPosition += 7;
    }
    if (selectedPartner.city && selectedPartner.country) {
      pdf.text(`${selectedPartner.city}, ${selectedPartner.country}`, 20, yPosition);
      yPosition += 7;
    }
    pdf.text(`Plan: ${selectedPartner.plan.toUpperCase()}`, 20, yPosition);
    yPosition += 7;
    pdf.text(`Quota CV: ${selectedPartner.cvQuota || selectedPartner.cvStats?.quota || 0}`, 20, yPosition);
    
    // Tableau des articles
    yPosition += 20;
    pdf.setFillColor(240, 248, 255);
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
        const lines = pdf.splitTextToSize(item.description, 60);
        lines.forEach((line: string) => {
          pdf.text(line, 25, yPosition);
          yPosition += 7;
        });
        
        pdf.text(item.quantity.toString(), 100, yPosition - 7);
        pdf.text(`${item.unitPrice.toFixed(2)} €`, 130, yPosition - 7);
        pdf.text(`${item.total.toFixed(2)} €`, 170, yPosition - 7);
        
        yPosition += 5;
      }
    });
    
    // Totaux
    yPosition += 20;
    pdf.setDrawColor(25, 55, 109);
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
    const footerY = pdf.internal.pageSize.getHeight() - 30;
    pdf.setFillColor(25, 55, 109);
    pdf.rect(0, footerY, pageWidth, 30, 'F');
    
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text('STUDIA CAREER - Plateforme Professionnelle de Création de CV', pageWidth / 2, footerY + 10, { align: 'center' });
    pdf.text('career.studyia.net | contact@studyia.net', pageWidth / 2, footerY + 20, { align: 'center' });
    
    // Télécharger le PDF
    const fileName = `Facture-Partenaire-${selectedPartner.company}-${new Date().toISOString().split('T')[0]}.pdf`;
    pdf.save(fileName);
  };

  const handleCreateInvoice = () => {
    if (!selectedPartner) {
      alert('Veuillez sélectionner un partenaire');
      return;
    }
    
    if (invoiceForm.items.length === 0 || !invoiceForm.items.some(item => item.description && item.quantity > 0)) {
      alert('Veuillez ajouter au moins un article à la facture');
      return;
    }
    
    setIsCreatingInvoice(true);
    try {
      generatePDFInvoice();
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Erreur lors de la création de la facture:', error);
      alert('Erreur lors de la création de la facture');
    } finally {
      setIsCreatingInvoice(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900">
            Facture pour Partenaire
          </DialogTitle>
          <DialogDescription>
            Créez une facture professionnelle pour un partenaire Studyia Career.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 mt-6">
          {/* Sélection du partenaire */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Building className="w-5 h-5 text-blue-600" />
              Sélectionner le partenaire
            </h3>
            
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-3"></div>
                <span className="text-gray-600">Chargement des partenaires...</span>
              </div>
            ) : partners.length === 0 ? (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Aucun partenaire trouvé dans la base de données. Veuillez contacter l'administrateur.
                </AlertDescription>
              </Alert>
            ) : (
              <Select onValueChange={(value) => {
                const partner = partners.find(p => p._id === value);
                if (partner) {
                  setSelectedPartner(partner);
                  console.log('✅ Partenaire sélectionné:', partner);
                }
              }}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Choisir un partenaire..." />
                </SelectTrigger>
                <SelectContent>
                  {partners.map(partner => (
                    <SelectItem key={partner._id} value={partner._id}>
                      <div className="flex items-center gap-3 py-2">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-semibold text-sm">
                            {partner.company.charAt(0)}
                          </span>
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">
                            {partner.company}
                          </div>
                          <div className="text-sm text-gray-500">
                            {partner.firstName} {partner.lastName}
                          </div>
                          <div className="text-xs text-gray-400">
                            {partner.email}
                          </div>
                        </div>
                        <div className="flex flex-col gap-1">
                          <Badge variant={partner.status === 'active' ? 'default' : 'destructive'} className="text-xs">
                            {partner.status === 'active' ? 'Actif' : 'Suspendu'}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {partner.plan}
                          </Badge>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            
            {selectedPartner && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-medium text-blue-900 mb-2">Partenaire sélectionné:</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Entreprise:</span> {selectedPartner.company}
                  </div>
                  <div>
                    <span className="font-medium">Contact:</span> {selectedPartner.firstName} {selectedPartner.lastName}
                  </div>
                  <div>
                    <span className="font-medium">Email:</span> {selectedPartner.email}
                  </div>
                  <div>
                    <span className="font-medium">Plan:</span> {selectedPartner.plan}
                  </div>
                  <div>
                    <span className="font-medium">Quota CV:</span> {selectedPartner.cvQuota || selectedPartner.cvStats?.quota || 0}
                  </div>
                  <div>
                    <span className="font-medium">Statut:</span> 
                    <Badge variant={selectedPartner.status === 'active' ? 'default' : 'destructive'} className="ml-1">
                      {selectedPartner.status === 'active' ? 'Actif' : 'Suspendu'}
                    </Badge>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Informations de la facture */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              Informations de la facture
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="invoiceNumber">Numéro de facture</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    id="invoiceNumber"
                    value={invoiceForm.invoiceNumber || generateInvoiceNumber()}
                    onChange={(e) => setInvoiceForm(prev => ({ ...prev, invoiceNumber: e.target.value }))}
                    placeholder="Généré automatiquement"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setInvoiceForm(prev => ({ ...prev, invoiceNumber: generateInvoiceNumber() }))}
                  >
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div>
                <Label htmlFor="date">Date de facturation</Label>
                <Input
                  id="date"
                  type="date"
                  value={invoiceForm.date}
                  onChange={(e) => setInvoiceForm(prev => ({ ...prev, date: e.target.value }))}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="dueDate">Date d'échéance</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={invoiceForm.dueDate}
                  onChange={(e) => setInvoiceForm(prev => ({ ...prev, dueDate: e.target.value }))}
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          {/* Articles de la facture */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                Articles de la facture
              </h3>
              <Button onClick={addItem} variant="outline" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Ajouter un article
              </Button>
            </div>
            
            <div className="space-y-3">
              {invoiceForm.items.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div className="md:col-span-2">
                      <Label htmlFor={`description-${item.id}`}>Description</Label>
                      <Input
                        id={`description-${item.id}`}
                        value={item.description}
                        onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                        placeholder="Description du service/produit"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`quantity-${item.id}`}>Quantité</Label>
                      <Input
                        id={`quantity-${item.id}`}
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateItem(item.id, 'quantity', parseInt(e.target.value) || 0)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`unitPrice-${item.id}`}>Prix unitaire (€)</Label>
                      <Input
                        id={`unitPrice-${item.id}`}
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.unitPrice}
                        onChange={(e) => updateItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                        className="mt-1"
                      />
                    </div>
                    <div className="flex items-end gap-2">
                      <div className="flex-1">
                        <Label>Total</Label>
                        <div className="font-semibold text-lg text-gray-900 mt-1">
                          {item.total.toFixed(2)} €
                        </div>
                      </div>
                      {invoiceForm.items.length > 1 && (
                        <Button
                          onClick={() => removeItem(item.id)}
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
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
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
            <div className="space-y-3">
              <div className="flex justify-between text-lg">
                <span>Sous-total:</span>
                <span className="font-semibold">{invoiceForm.subtotal.toFixed(2)} €</span>
              </div>
              <div className="flex justify-between text-lg">
                <span>TVA (19%):</span>
                <span className="font-semibold">{invoiceForm.tax.toFixed(2)} €</span>
              </div>
              <div className="border-t pt-3 flex justify-between text-xl font-bold text-blue-600">
                <span>TOTAL:</span>
                <span>{invoiceForm.total.toFixed(2)} €</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-4">
            <Button variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button 
              onClick={handleCreateInvoice}
              className="bg-blue-600 hover:bg-blue-700 text-white"
              disabled={!selectedPartner || isCreatingInvoice}
            >
              {isCreatingInvoice ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Génération...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Générer la facture PDF
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
