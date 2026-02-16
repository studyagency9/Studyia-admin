// Types pour le système de facturation

export interface Commercial {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  status: 'active' | 'inactive';
  commission: number;
}

export interface Partner {
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

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Invoice {
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
