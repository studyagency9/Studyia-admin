// Mock Data for Studya Forge Dashboard

export type UserRole = 'admin' | 'secretary' | 'accountant';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  city: string;
  age: number;
  registrationDate: string;
  source: 'direct' | 'partner' | 'commercial';
  sourceId?: string;
  status: 'active' | 'inactive';
  cvsCreated: number;
}

export interface CV {
  id: string;
  userId: string;
  userName: string;
  targetPosition: string;
  sector: string;
  experienceLevel: 'junior' | 'intermediate' | 'senior' | 'expert';
  city: string;
  creationDate: string;
  channel: 'direct' | 'partner' | 'commercial';
  status: 'draft' | 'ready' | 'exploited';
}

export interface Partner {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  cvsGenerated: number;
  totalRevenue: number;
  commissionRate: number;
  debt: number;
  status: 'active' | 'inactive';
  joinDate: string;
}

export interface Commercial {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  cvsGenerated: number;
  totalRevenue: number;
  commissionRate: number;
  commissionDue: number;
  lastPaymentDate: string;
  status: 'active' | 'inactive';
}

export interface Invoice {
  id: string;
  number: string;
  entityType: 'partner' | 'commercial' | 'direct';
  entityId: string;
  entityName: string;
  amount: number;
  periodStart: string;
  periodEnd: string;
  issueDate: string;
  dueDate: string;
  status: 'paid' | 'pending' | 'overdue';
}

export interface Payment {
  id: string;
  invoiceId: string;
  amount: number;
  date: string;
  method: 'bank_transfer' | 'card' | 'cash';
  status: 'completed' | 'pending' | 'failed';
}

export interface LogEntry {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  target: string;
  targetId: string;
  timestamp: string;
  details?: string;
}

// KPI Data
export const kpiData = {
  todayRevenue: 4850,
  weekRevenue: 28450,
  monthRevenue: 124680,
  totalRevenue: 1847250,
  todayChange: 12.5,
  weekChange: 8.3,
  monthChange: 15.2,
  channelPerformance: {
    direct: { revenue: 45230, percentage: 36.3, cvsCount: 342 },
    partners: { revenue: 52180, percentage: 41.8, cvsCount: 428 },
    commercials: { revenue: 27270, percentage: 21.9, cvsCount: 198 },
  },
};

// Mock Users
export const users: User[] = [
  { id: 'u1', firstName: 'Amina', lastName: 'Ngono', email: 'amina.ngono@email.com', phone: '+237 699 12 34 56', city: 'Yaoundé', age: 28, registrationDate: '2024-01-15', source: 'direct', status: 'active', cvsCreated: 3 },
  { id: 'u2', firstName: 'Samuel', lastName: 'Biyong', email: 'samuel.biyong@email.com', phone: '+237 677 98 76 54', city: 'Douala', age: 35, registrationDate: '2024-02-20', source: 'partner', sourceId: 'p1', status: 'active', cvsCreated: 2 },
  { id: 'u3', firstName: 'Fatima', lastName: 'Bello', email: 'fatima.bello@email.com', phone: '+237 655 11 22 33', city: 'Bafoussam', age: 24, registrationDate: '2024-03-10', source: 'commercial', sourceId: 'c1', status: 'active', cvsCreated: 1 },
  { id: 'u4', firstName: 'Jean-Pierre', lastName: 'Manga', email: 'jp.manga@email.com', phone: '+237 691 55 66 77', city: 'Garoua', age: 31, registrationDate: '2024-03-25', source: 'direct', status: 'active', cvsCreated: 4 },
  { id: 'u5', firstName: 'Chantal', lastName: 'Mvogo', email: 'chantal.mvogo@email.com', phone: '+237 678 99 88 77', city: 'Bamenda', age: 27, registrationDate: '2024-04-05', source: 'partner', sourceId: 'p2', status: 'inactive', cvsCreated: 1 },
  { id: 'u6', firstName: 'Paul', lastName: 'Atangana', email: 'paul.atangana@email.com', phone: '+237 698 44 33 22', city: 'Kribi', age: 29, registrationDate: '2024-04-12', source: 'commercial', sourceId: 'c2', status: 'active', cvsCreated: 2 },
  { id: 'u7', firstName: 'Adèle', lastName: 'Mballa', email: 'adele.mballa@email.com', phone: '+237 677 77 88 99', city: 'Limbé', age: 26, registrationDate: '2024-04-18', source: 'direct', status: 'active', cvsCreated: 3 },
  { id: 'u8', firstName: 'Christian', lastName: 'Tamo', email: 'christian.tamo@email.com', phone: '+237 656 22 33 44', city: 'Maroua', age: 33, registrationDate: '2024-05-02', source: 'partner', sourceId: 'p1', status: 'active', cvsCreated: 2 },
];

// Mock CVs
export const cvs: CV[] = [
  { id: 'cv1', userId: 'u1', userName: 'Amina Ngono', targetPosition: 'Développeur Full Stack', sector: 'Tech', experienceLevel: 'intermediate', city: 'Yaoundé', creationDate: '2024-01-20', channel: 'direct', status: 'ready' },
  { id: 'cv2', userId: 'u1', userName: 'Amina Ngono', targetPosition: 'Chef de Projet Digital', sector: 'Tech', experienceLevel: 'intermediate', city: 'Yaoundé', creationDate: '2024-02-15', channel: 'direct', status: 'exploited' },
  { id: 'cv3', userId: 'u2', userName: 'Samuel Biyong', targetPosition: 'Commercial B2B', sector: 'Vente', experienceLevel: 'senior', city: 'Douala', creationDate: '2024-02-25', channel: 'partner', status: 'ready' },
  { id: 'cv4', userId: 'u3', userName: 'Fatima Bello', targetPosition: 'Assistant RH', sector: 'RH', experienceLevel: 'junior', city: 'Bafoussam', creationDate: '2024-03-15', channel: 'commercial', status: 'draft' },
  { id: 'cv5', userId: 'u4', userName: 'Jean-Pierre Manga', targetPosition: 'Data Analyst', sector: 'Data', experienceLevel: 'intermediate', city: 'Garoua', creationDate: '2024-03-28', channel: 'direct', status: 'ready' },
  { id: 'cv6', userId: 'u6', userName: 'Paul Atangana', targetPosition: 'Designer UX/UI', sector: 'Design', experienceLevel: 'intermediate', city: 'Kribi', creationDate: '2024-04-15', channel: 'commercial', status: 'exploited' },
  { id: 'cv7', userId: 'u7', userName: 'Adèle Mballa', targetPosition: 'Marketing Manager', sector: 'Marketing', experienceLevel: 'senior', city: 'Limbé', creationDate: '2024-04-20', channel: 'direct', status: 'ready' },
  { id: 'cv8', userId: 'u8', userName: 'Christian Tamo', targetPosition: 'Ingénieur DevOps', sector: 'Tech', experienceLevel: 'expert', city: 'Maroua', creationDate: '2024-05-05', channel: 'partner', status: 'ready' },
];

// Mock Partners
export const partners: Partner[] = [
  { id: 'p1', name: 'KmerTech Recruit', company: 'KmerTech SAS', email: 'contact@kmertech.cm', phone: '+237 691 23 45 67', cvsGenerated: 156, totalRevenue: 23400, commissionRate: 15, debt: 3200, status: 'active', joinDate: '2023-06-15' },
  { id: 'p2', name: 'Douala Career Services', company: 'DCS SARL', email: 'hello@dcs.cm', phone: '+237 672 98 76 54', cvsGenerated: 98, totalRevenue: 14700, commissionRate: 12, debt: 0, status: 'active', joinDate: '2023-09-20' },
  { id: 'p3', name: 'Yaounde Job Connect', company: 'YJC', email: 'pro@yjc.cm', phone: '+237 655 55 44 33', cvsGenerated: 234, totalRevenue: 35100, commissionRate: 18, debt: 5600, status: 'active', joinDate: '2023-04-10' },
  { id: 'p4', name: 'Bafoussam Recruiters', company: 'Bafoussam Recruiters Inc', email: 'team@bafrecruit.cm', phone: '+237 699 11 22 33', cvsGenerated: 67, totalRevenue: 10050, commissionRate: 10, debt: 1200, status: 'inactive', joinDate: '2023-11-05' },
];

// Mock Commercials
export const commercials: Commercial[] = [
  { id: 'c1', firstName: 'Armand', lastName: 'Onana', email: 'a.onana@studya.cm', phone: '+237 677 12 34 56', cvsGenerated: 89, totalRevenue: 13350, commissionRate: 20, commissionDue: 2670, lastPaymentDate: '2024-03-31', status: 'active' },
  { id: 'c2', firstName: 'Brenda', lastName: 'Ngassa', email: 'b.ngassa@studya.cm', phone: '+237 698 98 76 54', cvsGenerated: 124, totalRevenue: 18600, commissionRate: 22, commissionDue: 4092, lastPaymentDate: '2024-04-15', status: 'active' },
  { id: 'c3', firstName: 'Cédric', lastName: 'Talla', email: 'c.talla@studya.cm', phone: '+237 655 55 66 77', cvsGenerated: 56, totalRevenue: 8400, commissionRate: 18, commissionDue: 1512, lastPaymentDate: '2024-04-01', status: 'active' },
  { id: 'c4', firstName: 'Sandrine', lastName: 'Fotso', email: 's.fotso@studya.cm', phone: '+237 691 11 22 33', cvsGenerated: 45, totalRevenue: 6750, commissionRate: 15, commissionDue: 0, lastPaymentDate: '2024-04-30', status: 'inactive' },
];

// Mock Invoices
export const invoices: Invoice[] = [
  { id: 'inv1', number: 'INV-2024-001', entityType: 'partner', entityId: 'p1', entityName: 'KmerTech Recruit', amount: 3200, periodStart: '2024-03-01', periodEnd: '2024-03-31', issueDate: '2024-04-01', dueDate: '2024-04-15', status: 'overdue' },
  { id: 'inv2', number: 'INV-2024-002', entityType: 'partner', entityId: 'p3', entityName: 'Yaounde Job Connect', amount: 5600, periodStart: '2024-03-01', periodEnd: '2024-03-31', issueDate: '2024-04-01', dueDate: '2024-04-15', status: 'overdue' },
  { id: 'inv3', number: 'INV-2024-003', entityType: 'commercial', entityId: 'c1', entityName: 'Armand Onana', amount: 2670, periodStart: '2024-04-01', periodEnd: '2024-04-30', issueDate: '2024-05-01', dueDate: '2024-05-10', status: 'pending' },
  { id: 'inv4', number: 'INV-2024-004', entityType: 'commercial', entityId: 'c2', entityName: 'Brenda Ngassa', amount: 4092, periodStart: '2024-04-01', periodEnd: '2024-04-30', issueDate: '2024-05-01', dueDate: '2024-05-10', status: 'pending' },
  { id: 'inv5', number: 'INV-2024-005', entityType: 'partner', entityId: 'p2', entityName: 'Douala Career Services', amount: 2450, periodStart: '2024-04-01', periodEnd: '2024-04-30', issueDate: '2024-05-01', dueDate: '2024-05-15', status: 'paid' },
  { id: 'inv6', number: 'INV-2024-006', entityType: 'direct', entityId: 'u1', entityName: 'Amina Ngono', amount: 150, periodStart: '2024-04-01', periodEnd: '2024-04-30', issueDate: '2024-05-01', dueDate: '2024-05-15', status: 'paid' },
];

// Mock Logs
export const logs: LogEntry[] = [
  { id: 'log1', userId: 'admin1', userName: 'Admin Ngono', userRole: 'admin', action: 'CREATE', target: 'invoice', targetId: 'inv5', timestamp: '2024-05-01T09:15:00', details: 'Création facture INV-2024-005' },
  { id: 'log2', userId: 'sec1', userName: 'Fatima Bello', userRole: 'secretary', action: 'UPDATE', target: 'user', targetId: 'u3', timestamp: '2024-05-01T10:30:00', details: 'Mise à jour informations utilisateur' },
  { id: 'log3', userId: 'acc1', userName: 'Samuel Biyong', userRole: 'accountant', action: 'EXPORT', target: 'report', targetId: 'rpt_april', timestamp: '2024-05-01T11:00:00', details: 'Export rapport comptable Avril 2024' },
  { id: 'log4', userId: 'admin1', userName: 'Admin Ngono', userRole: 'admin', action: 'PAYMENT', target: 'invoice', targetId: 'inv5', timestamp: '2024-05-02T14:20:00', details: 'Paiement reçu - 2450 XAF' },
  { id: 'log5', userId: 'sec1', userName: 'Fatima Bello', userRole: 'secretary', action: 'CREATE', target: 'partner', targetId: 'p4', timestamp: '2024-05-02T15:45:00', details: 'Nouveau partenaire ajouté' },
  { id: 'log6', userId: 'acc1', userName: 'Samuel Biyong', userRole: 'accountant', action: 'VIEW', target: 'debt', targetId: 'p1', timestamp: '2024-05-03T09:00:00', details: 'Consultation dette KmerTech' },
];

// Alerts for dashboard
export const alerts = {
  partnersWithDebt: partners.filter(p => p.debt > 0),
  commercialsToPay: commercials.filter(c => c.commissionDue > 0),
  overdueInvoices: invoices.filter(i => i.status === 'overdue'),
  pendingPayments: invoices.filter(i => i.status === 'pending'),
};

// Top performers
export const topPerformers = {
  topPartner: partners.reduce((max, p) => p.totalRevenue > max.totalRevenue ? p : max, partners[0]),
  topCommercial: commercials.reduce((max, c) => c.totalRevenue > max.totalRevenue ? c : max, commercials[0]),
  mostProfitableChannel: 'partners' as const,
};

// Financial summary
export const financialSummary = {
  totalIncome: 1847250,
  totalExpenses: 312450,
  totalDebt: 0, // Plus de dette dans la nouvelle structure
  totalCommissionsDue: 0, // Plus de commissionDue dans la nouvelle structure
  netProfit: 1534800,
};
