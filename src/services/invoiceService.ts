import { Invoice, Commercial, Partner, InvoiceItem } from '../types/invoice';

// Types pour le service de facturation
export interface CreateInvoiceData {
  invoiceNumber: string;
  date: string;
  dueDate: string;
  commercialId: string;
  partnerId: string;
  items: Omit<InvoiceItem, 'id' | 'total'>[];
  notes?: string;
}

export interface UpdateInvoiceData extends Partial<CreateInvoiceData> {
  status?: 'draft' | 'sent' | 'paid' | 'overdue';
}

export interface InvoiceFilters {
  status?: string;
  commercialId?: string;
  partnerId?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

export interface InvoiceStats {
  totalInvoices: number;
  paidInvoices: number;
  pendingInvoices: number;
  overdueInvoices: number;
  totalRevenue: number;
  pendingRevenue: number;
  overdueRevenue: number;
}

class InvoiceService {
  private baseUrl = '/api/invoices';

  /**
   * Récupérer la liste des factures avec filtres
   */
  async getInvoices(filters?: InvoiceFilters): Promise<Invoice[]> {
    try {
      const params = new URLSearchParams();
      
      if (filters?.status) params.append('status', filters.status);
      if (filters?.commercialId) params.append('commercialId', filters.commercialId);
      if (filters?.partnerId) params.append('partnerId', filters.partnerId);
      if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom);
      if (filters?.dateTo) params.append('dateTo', filters.dateTo);
      if (filters?.search) params.append('search', filters.search);

      const response = await fetch(`${this.baseUrl}?${params}`);
      
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des factures');
      }

      return await response.json();
    } catch (error) {
      console.error('InvoiceService - getInvoices:', error);
      throw error;
    }
  }

  /**
   * Récupérer une facture par son ID
   */
  async getInvoiceById(id: string): Promise<Invoice> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`);
      
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération de la facture');
      }

      return await response.json();
    } catch (error) {
      console.error('InvoiceService - getInvoiceById:', error);
      throw error;
    }
  }

  /**
   * Créer une nouvelle facture
   */
  async createInvoice(data: CreateInvoiceData): Promise<Invoice> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la création de la facture');
      }

      return await response.json();
    } catch (error) {
      console.error('InvoiceService - createInvoice:', error);
      throw error;
    }
  }

  /**
   * Mettre à jour une facture
   */
  async updateInvoice(id: string, data: UpdateInvoiceData): Promise<Invoice> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la mise à jour de la facture');
      }

      return await response.json();
    } catch (error) {
      console.error('InvoiceService - updateInvoice:', error);
      throw error;
    }
  }

  /**
   * Supprimer une facture
   */
  async deleteInvoice(id: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la suppression de la facture');
      }
    } catch (error) {
      console.error('InvoiceService - deleteInvoice:', error);
      throw error;
    }
  }

  /**
   * Envoyer une facture par email
   */
  async sendInvoice(id: string, email?: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email || '' }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de l\'envoi de la facture');
      }
    } catch (error) {
      console.error('InvoiceService - sendInvoice:', error);
      throw error;
    }
  }

  /**
   * Marquer une facture comme payée
   */
  async markAsPaid(id: string, paymentDate?: string): Promise<Invoice> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}/pay`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ paymentDate }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors du marquage comme payée');
      }

      return await response.json();
    } catch (error) {
      console.error('InvoiceService - markAsPaid:', error);
      throw error;
    }
  }

  /**
   * Générer un numéro de facture unique
   */
  async generateInvoiceNumber(): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/generate-number`);
      
      if (!response.ok) {
        throw new Error('Erreur lors de la génération du numéro de facture');
      }

      const data = await response.json();
      return data.invoiceNumber;
    } catch (error) {
      console.error('InvoiceService - generateInvoiceNumber:', error);
      throw error;
    }
  }

  /**
   * Récupérer les statistiques des factures
   */
  async getInvoiceStats(filters?: InvoiceFilters): Promise<InvoiceStats> {
    try {
      const params = new URLSearchParams();
      
      if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom);
      if (filters?.dateTo) params.append('dateTo', filters.dateTo);

      const response = await fetch(`${this.baseUrl}/stats?${params}`);
      
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des statistiques');
      }

      return await response.json();
    } catch (error) {
      console.error('InvoiceService - getInvoiceStats:', error);
      throw error;
    }
  }

  /**
   * Récupérer la liste des commerciaux
   */
  async getCommercials(): Promise<Commercial[]> {
    try {
      const response = await fetch('/api/commercials');
      
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des commerciaux');
      }

      return await response.json();
    } catch (error) {
      console.error('InvoiceService - getCommercials:', error);
      throw error;
    }
  }

  /**
   * Récupérer la liste des partenaires
   */
  async getPartners(): Promise<Partner[]> {
    try {
      const response = await fetch('/api/partners');
      
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des partenaires');
      }

      return await response.json();
    } catch (error) {
      console.error('InvoiceService - getPartners:', error);
      throw error;
    }
  }

  /**
   * Exporter les factures en CSV
   */
  async exportInvoicesCSV(filters?: InvoiceFilters): Promise<Blob> {
    try {
      const params = new URLSearchParams();
      
      if (filters?.status) params.append('status', filters.status);
      if (filters?.commercialId) params.append('commercialId', filters.commercialId);
      if (filters?.partnerId) params.append('partnerId', filters.partnerId);
      if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom);
      if (filters?.dateTo) params.append('dateTo', filters.dateTo);

      const response = await fetch(`${this.baseUrl}/export/csv?${params}`);
      
      if (!response.ok) {
        throw new Error('Erreur lors de l\'export CSV');
      }

      return await response.blob();
    } catch (error) {
      console.error('InvoiceService - exportInvoicesCSV:', error);
      throw error;
    }
  }

  /**
   * Calculer les totaux d'une facture
   */
  calculateTotals(items: Omit<InvoiceItem, 'id' | 'total'>[]): {
    subtotal: number;
    tax: number;
    total: number;
  } {
    const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const tax = subtotal * 0.19; // TVA 19%
    const total = subtotal + tax;

    return { subtotal, tax, total };
  }

  /**
   * Valider les données d'une facture
   */
  validateInvoiceData(data: CreateInvoiceData): string[] {
    const errors: string[] = [];

    if (!data.invoiceNumber.trim()) {
      errors.push('Le numéro de facture est requis');
    }

    if (!data.date) {
      errors.push('La date de facturation est requise');
    }

    if (!data.dueDate) {
      errors.push('La date d\'échéance est requise');
    }

    if (!data.commercialId) {
      errors.push('Le commercial est requis');
    }

    if (!data.partnerId) {
      errors.push('Le client est requis');
    }

    if (!data.items || data.items.length === 0) {
      errors.push('Au moins un article est requis');
    } else {
      data.items.forEach((item, index) => {
        if (!item.description.trim()) {
          errors.push(`La description de l'article ${index + 1} est requise`);
        }
        if (item.quantity <= 0) {
          errors.push(`La quantité de l'article ${index + 1} doit être supérieure à 0`);
        }
        if (item.unitPrice < 0) {
          errors.push(`Le prix unitaire de l'article ${index + 1} ne peut pas être négatif`);
        }
      });
    }

    return errors;
  }
}

// Exporter une instance singleton du service
export const invoiceService = new InvoiceService();

// Exporter les types pour utilisation dans d'autres composants
export default invoiceService;
