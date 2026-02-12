import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Plus, Trash2, Calculator, FileText, Handshake, UserCheck, RefreshCw, DollarSign } from 'lucide-react';

// Define types for entities based on API response
interface Partner {
  id: string;
  name: string;
  debt: number;
  email: string;
  phone: string;
  company?: string;
}

interface Commercial {
  id: string;
  firstName: string;
  lastName: string;
  commissionDue: number;
  email: string;
  phone: string;
  totalSales: number;
  totalCommission: number;
  availableBalance: number;
}

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
  notes?: string;
  createdAt: string;
  updatedAt: string;
  type?: 'subscription' | 'commission' | 'withdrawal' | 'manual';
}

const invoiceSchema = z.object({
  template: z.enum(['partner_debt', 'commercial_commission', 'partner_subscription', 'manual']),
  entityId: z.string().min(1, 'Veuillez sélectionner une entité'),
  description: z.string().optional(),
  amount: z.number().min(0, 'Le montant doit être positif'),
  dueDate: z.string().min(1, 'La date d\'échéance est requise'),
  notes: z.string().optional(),
  items: z.array(z.object({
    description: z.string().min(1, 'La description est requise'),
    quantity: z.number().min(1, 'La quantité doit être supérieure à 0'),
    unitPrice: z.number().min(0, 'Le prix unitaire est requis'),
    total: z.number().min(0, 'Le total est requis'),
  })).optional(),
});

type InvoiceFormValues = z.infer<typeof invoiceSchema>;

interface CreateInvoiceFormProps {
  onSuccess: (newInvoice: Invoice) => void;
  onCancel: () => void;
}

const templates = {
  partner_debt: {
    label: 'Règlement de dette partenaire',
    icon: Handshake,
    entityType: 'partner',
    description: 'Règlement des dettes accumulées',
    type: 'manual' as const,
  },
  commercial_commission: {
    label: 'Commission commercial',
    icon: UserCheck,
    entityType: 'associate',
    description: 'Paiement des commissions dues',
    type: 'commission' as const,
  },
  partner_subscription: {
    label: 'Abonnement partenaire',
    icon: RefreshCw,
    entityType: 'partner',
    description: 'Facturation mensuelle d\'abonnement',
    type: 'subscription' as const,
  },
  manual: {
    label: 'Facture manuelle',
    icon: FileText,
    entityType: 'customer',
    description: 'Facture personnalisée',
    type: 'manual' as const,
  },
};

export function CreateInvoiceForm({ onSuccess, onCancel }: CreateInvoiceFormProps) {
  const [entities, setEntities] = useState<(Partner | Commercial)[]>([]);
  const [isLoadingEntities, setIsLoadingEntities] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');

  const { control, handleSubmit, watch, setValue, formState: { errors, isValid } } = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceSchema),
    mode: 'onChange',
    defaultValues: {
      template: 'manual',
      entityId: '',
      description: '',
      amount: 0,
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      notes: '',
      items: [{ description: '', quantity: 1, unitPrice: 0, total: 0 }],
    },
  });

  const template = watch('template');
  const entityId = watch('entityId');

  useEffect(() => {
    setSelectedTemplate(template);
    if (!template) return;

    const fetchEntities = async () => {
      setIsLoadingEntities(true);
      setError(null);
      try {
        let availableEntities: (Partner[] | Commercial[]) = [];
        
        // Mock data pour la démo
        if (template === 'partner_debt') {
          availableEntities = [
            { id: '1', name: 'KmerTech Recruit', debt: 150000, email: 'contact@kmertech.cm', phone: '+237691234567', company: 'KmerTech SAS' },
            { id: '2', name: 'TechRecruit Solutions', debt: 75000, email: 'info@techrecruit.cm', phone: '+237698765432', company: 'TechRecruit Ltd' },
          ];
        } else if (template === 'commercial_commission') {
          availableEntities = [
            { id: '3', firstName: 'Emmanuel', lastName: 'De Song', commissionDue: 55000, email: 'emmanuel@email.com', phone: '+237691234567', totalSales: 1200000, totalCommission: 120000, availableBalance: 55000 },
            { id: '4', firstName: 'Sophie', lastName: 'Martin', commissionDue: 35000, email: 'sophie@email.com', phone: '+237698765432', totalSales: 800000, totalCommission: 80000, availableBalance: 35000 },
          ];
        } else if (template === 'partner_subscription') {
          availableEntities = [
            { id: '5', name: 'KmerTech Recruit', debt: 0, email: 'contact@kmertech.cm', phone: '+237691234567', company: 'KmerTech SAS' },
            { id: '6', name: 'TechRecruit Solutions', debt: 0, email: 'info@techrecruit.cm', phone: '+237698765432', company: 'TechRecruit Ltd' },
          ];
        } else {
          availableEntities = [];
        }
        
        setEntities(availableEntities as (Partner | Commercial)[]);
        setValue('entityId', '');
        setValue('amount', 0);
        setValue('description', templates[template]?.description || '');
      } catch (err) {
        console.error(err);
        setError('Erreur lors du chargement des entités.');
        setEntities([]);
      } finally {
        setIsLoadingEntities(false);
      }
    };

    fetchEntities();
  }, [template, setValue]);

  useEffect(() => {
    if (!entityId || !template) return;

    const entity = entities.find(e => e.id === entityId);
    if (!entity) return;

    let amount = 0;
    if (template === 'partner_debt' && 'debt' in entity) {
      amount = entity.debt;
    } else if (template === 'commercial_commission' && 'commissionDue' in entity) {
      amount = entity.commissionDue;
    } else if (template === 'partner_subscription') {
      amount = 15000; // Fixe pour l'abonnement
    }
    setValue('amount', amount);
  }, [entityId, entities, template, setValue]);

  const onSubmit = async (data: InvoiceFormValues) => {
    const entity = entities.find(e => e.id === data.entityId);
    if (!entity) return;

    try {
      const templateConfig = templates[data.template];
      
      // Créer les infos client selon le type
      let clientInfo;
      if ('name' in entity) {
        // Partner
        clientInfo = {
          name: entity.name,
          email: entity.email,
          phone: entity.phone,
          company: entity.company || '',
          address: '',
          city: '',
          country: 'Cameroun',
        };
      } else {
        // Commercial
        clientInfo = {
          name: `${entity.firstName} ${entity.lastName}`,
          email: entity.email,
          phone: entity.phone,
          company: '',
          address: '',
          city: '',
          country: 'Cameroun',
        };
      }

      const newInvoice: Invoice = {
        id: `inv-${Date.now()}`,
        invoiceNumber: `INV-${new Date().getFullYear()}-${Math.floor(Math.random() * 9000) + 1000}`,
        clientId: data.entityId,
        clientType: templateConfig.entityType as 'customer' | 'associate' | 'partner',
        clientInfo,
        items: (data.items && data.items.length > 0) 
          ? data.items.map(item => ({
              description: item.description || 'Description par défaut',
              quantity: item.quantity || 1,
              unitPrice: item.unitPrice || 0,
              total: item.total || (item.quantity || 1) * (item.unitPrice || 0),
            }))
          : [{
              description: data.description || templateConfig.description,
              quantity: 1,
              unitPrice: data.amount,
              total: data.amount,
            }],
        subtotal: data.amount,
        tax: 0,
        total: data.amount,
        dueDate: data.dueDate,
        status: 'pending',
        notes: data.notes,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        type: templateConfig.type,
      };

      console.log('Creating invoice:', newInvoice);
      
      // Simuler la création
      setTimeout(() => {
        onSuccess(newInvoice);
      }, 500);
      
    } catch (err) {
      console.error(err);
      setError('Erreur lors de la création de la facture.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Template Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Type de facture
          </CardTitle>
          <CardDescription>
            Choisissez le modèle de facture à créer
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Controller
            name="template"
            control={control}
            render={({ field }) => (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(templates).map(([key, { label, icon: Icon, description }]) => (
                  <div
                    key={key}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      field.value === key 
                        ? 'border-primary bg-primary/5' 
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => field.onChange(key)}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${
                        field.value === key ? 'bg-primary text-primary-foreground' : 'bg-muted'
                      }`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium">{label}</h3>
                        <p className="text-sm text-muted-foreground">{description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          />
        </CardContent>
      </Card>

      {selectedTemplate && (
        <>
          {/* Entity Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Destinataire</CardTitle>
            </CardHeader>
            <CardContent>
              <Controller
                name="entityId"
                control={control}
                render={({ field }) => (
                  <div className="space-y-2">
                    <Select onValueChange={field.onChange} value={field.value} disabled={isLoadingEntities}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choisir un destinataire..." />
                      </SelectTrigger>
                      <SelectContent>
                        {entities.length > 0 ? entities.map(e => (
                          <SelectItem key={e.id} value={e.id}>
                            <div className="flex flex-col">
                              <span>{'name' in e ? e.name : `${e.firstName} ${e.lastName}`}</span>
                              <span className="text-sm text-muted-foreground">
                                {'email' in e ? e.email : ''}
                              </span>
                            </div>
                          </SelectItem>
                        )) : (
                          <div className="p-4 text-sm text-muted-foreground">
                            {isLoadingEntities ? 'Chargement...' : 'Aucune entité éligible.'}
                          </div>
                        )}
                      </SelectContent>
                    </Select>
                    {errors.entityId && (
                      <p className="text-sm text-destructive">{errors.entityId.message}</p>
                    )}
                  </div>
                )}
              />

              {/* Entity Details */}
              {entityId && (() => {
                const entity = entities.find(e => e.id === entityId);
                if (!entity) return null;

                return (
                  <div className="mt-4 p-4 bg-muted/30 rounded-lg">
                    <h4 className="font-medium mb-2">Détails du destinataire</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Nom:</span>
                        <p className="font-medium">
                          {'name' in entity ? entity.name : `${entity.firstName} ${entity.lastName}`}
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Email:</span>
                        <p className="font-medium">{'email' in entity ? entity.email : ''}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Téléphone:</span>
                        <p className="font-medium">{'phone' in entity ? entity.phone : ''}</p>
                      </div>
                      {'company' in entity && entity.company && (
                        <div>
                          <span className="text-muted-foreground">Entreprise:</span>
                          <p className="font-medium">{entity.company}</p>
                        </div>
                      )}
                      {'debt' in entity && entity.debt > 0 && (
                        <div>
                          <span className="text-muted-foreground">Dette:</span>
                          <p className="font-medium text-red-600">
                            {new Intl.NumberFormat('fr-CM', {
                              style: 'currency',
                              currency: 'XAF',
                            }).format(entity.debt)}
                          </p>
                        </div>
                      )}
                      {'commissionDue' in entity && entity.commissionDue > 0 && (
                        <div>
                          <span className="text-muted-foreground">Commission due:</span>
                          <p className="font-medium text-green-600">
                            {new Intl.NumberFormat('fr-CM', {
                              style: 'currency',
                              currency: 'XAF',
                            }).format(entity.commissionDue)}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}
            </CardContent>
          </Card>

          {/* Invoice Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="w-5 h-5" />
                Détails de la facture
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Montant</Label>
                  <Controller
                    name="amount"
                    control={control}
                    render={({ field }) => (
                      <div className="relative">
                        <Input
                          id="amount"
                          type="number"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          className="font-bold text-lg"
                          readOnly={selectedTemplate !== 'manual'}
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                          XAF
                        </span>
                      </div>
                    )}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dueDate">Date d'échéance</Label>
                  <Controller
                    name="dueDate"
                    control={control}
                    render={({ field }) => (
                      <Input
                        id="dueDate"
                        type="date"
                        {...field}
                      />
                    )}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Controller
                  name="description"
                  control={control}
                  render={({ field }) => (
                    <Textarea
                      id="description"
                      {...field}
                      placeholder="Description de la facture..."
                      rows={3}
                      readOnly={selectedTemplate !== 'manual'}
                    />
                  )}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes (optionnel)</Label>
                <Controller
                  name="notes"
                  control={control}
                  render={({ field }) => (
                    <Textarea
                      id="notes"
                      {...field}
                      placeholder="Notes additionnelles..."
                      rows={2}
                    />
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Récapitulatif</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Sous-total:</span>
                  <span>
                    {new Intl.NumberFormat('fr-CM', {
                      style: 'currency',
                      currency: 'XAF',
                    }).format(watch('amount') || 0)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Taxe:</span>
                  <span>0 XAF</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span>
                    {new Intl.NumberFormat('fr-CM', {
                      style: 'currency',
                      currency: 'XAF',
                    }).format(watch('amount') || 0)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {error && (
        <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Annuler
        </Button>
        <Button 
          type="button" 
          onClick={handleSubmit(onSubmit)} 
          disabled={!isValid || !selectedTemplate || !entityId}
        >
          Créer la facture
        </Button>
      </div>
    </div>
  );
}
