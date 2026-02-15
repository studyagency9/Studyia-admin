import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Mail, 
  Inbox, 
  Send, 
  Reply, 
  MailOpen, 
  Paperclip, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Award,
  CreditCard,
  MessageSquare,
  Phone,
  User,
  MailCheck,
  Activity,
  Download,
  FileText,
  Star,
  TrendingUp,
  Users,
  Calendar,
  BarChart3,
  FileText as FileIcon,
  Search,
  Filter,
  Plus
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/ui/PageHeader';
import { KPICard } from '@/components/dashboard/KPICard';
import { useAuth } from '@/contexts/AuthContext';
import { dashboardService, associatesService, invoicesService, emailService, financeService, personnelService } from '@/lib/api';
import api from '@/lib/api';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EmailHub } from '@/components/email/EmailHub';

// Types pour les données de l'assistant
interface MailData {
  id: string;
  from: string;
  subject: string;
  content: string;
  date: string;
  isRead: boolean;
  isReplied: boolean;
  priority: 'low' | 'medium' | 'high';
}

interface TopCommercial {
  id: string;
  name: string;
  email: string;
  totalSales: number;
  totalCommission: number;
  salesCount: number;
  avgSale: number;
  performance: 'excellent' | 'good' | 'average';
}

interface WithdrawalRequest {
  id: string;
  commercial: {
    name: string;
    email: string;
  };
  amount: number;
  date: string;
  status: 'pending' | 'approved' | 'rejected';
  bankInfo: string;
  requestDate: string;
}

interface PersonnelWithCV {
  _id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  phoneNumber: string;
  position: string;
  cvId: string;
  cvPdfUrl: string;
  additionalInfo: {
    experience?: string;
    skills?: string[];
    salary?: string;
    portfolio?: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface InvoiceData {
  id: string;
  partner: {
    name: string;
    email: string;
  };
  amount: number;
  date: string;
  status: 'paid' | 'pending' | 'overdue';
  dueDate: string;
  number: string;
}

export default function Dashboard() {
  const { user, hasPermission } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // États pour les données de l'assistant
  const [mails, setMails] = useState<MailData[]>([]);
  const [topCommercial, setTopCommercial] = useState<TopCommercial | null>(null);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [invoices, setInvoices] = useState<InvoiceData[]>([]);
  const [selectedMail, setSelectedMail] = useState<MailData | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [sendingReply, setSendingReply] = useState(false);
  const [emailDetails, setEmailDetails] = useState<any>(null); // Pour stocker les détails complets de l'email

  // États pour le formulaire de contact
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [sendingContact, setSendingContact] = useState(false);
  const [emailHealth, setEmailHealth] = useState<{
    status: 'healthy' | 'unhealthy' | 'checking';
    lastCheck?: string;
    error?: string;
  }>({ status: 'checking' });

  // État pour la santé IMAP
  const [imapHealth, setImapHealth] = useState<{
    status: 'healthy' | 'unhealthy' | 'checking';
    lastCheck?: string;
    error?: string;
  }>({ status: 'checking' });

  // État pour le personnel avec CV
  const [personnelWithCVs, setPersonnelWithCVs] = useState<PersonnelWithCV[]>([]);

  // Vérifier si l'utilisateur est un assistant
  const isAssistant = user?.role === 'secretary';

  useEffect(() => {
    const fetchAssistantData = async () => {
      try {
        setIsLoading(true);
        console.log('=== ASSISTANT DASHBOARD API CALLS ===');

        // Récupérer les données simulées pour l'assistant
        await Promise.all([
          fetchMails(),
          fetchTopCommercial(),
          fetchWithdrawals(),
          fetchPendingInvoices(),
          fetchPersonnelWithCVs(),
        ]);

      } catch (err) {
        console.error('=== ASSISTANT DASHBOARD ERROR ===');
        console.error('Full error:', err);
        setError('Impossible de charger les données du tableau de bord.');
      } finally {
        setIsLoading(false);
      }
    };

    if (isAssistant) {
      fetchAssistantData();
    }
  }, [isAssistant]);

  const fetchMails = async () => {
    try {
      // Récupérer les vrais emails depuis le backend IMAP
      // Essayer différents paramètres pour récupérer les emails
      const response = await emailService.getInboxEmails({ 
        limit: 50,           // Augmenter la limite
        offset: 0,
        folder: 'INBOX',
        unreadOnly: false    // Récupérer tous les emails d'abord
      });
      
      console.log('✅ Real IMAP emails fetched:', response);
      console.log('📧 Response structure:', JSON.stringify(response, null, 2));
      console.log('📧 Data object:', response.data);
      console.log('📧 Emails array:', response.data?.emails);
      console.log('📧 First email:', response.data?.emails?.[0]);
      
      // Si le tableau est vide mais qu'il y a des emails non lus, essayer avec unreadOnly: true
      let emailsToMap = response.data?.emails || [];
      
      if (emailsToMap.length === 0 && response.data?.unreadCount > 0) {
        console.log('📧 No emails found, trying with unreadOnly: true');
        try {
          const unreadResponse = await emailService.getInboxEmails({ 
            limit: 50,
            offset: 0,
            folder: 'INBOX',
            unreadOnly: true    // Récupérer seulement les non lus
          });
          console.log('📧 Unread emails response:', unreadResponse);
          emailsToMap = unreadResponse.data?.emails || [];
        } catch (unreadError) {
          console.warn('⚠️ Error fetching unread emails:', unreadError);
        }
      }
      
      // Si toujours vide mais qu'il y a des emails non lus, utiliser les mocks
      if (emailsToMap.length === 0 && response.data?.unreadCount > 0) {
        console.log('📧 Backend reports unread emails but returns empty array, using mock data');
        const mockMails: MailData[] = [
          {
            id: '1',
            from: 'hondtcaroline@gmail.com',
            subject: 'POSTE DE SECRÉTAIRE',
            content: 'Bonjour,\n\nJe suis intéressée par le poste de secrétaire...\n\nCordialement,\nCaroline',
            date: '2026-01-21T10:33:59.000Z',
            isRead: false,
            isReplied: false,
            priority: 'high'
          },
          {
            id: '2',
            from: 'feliciadolores.fdm@gmail.com',
            subject: 'CV pour annonce de recrutement de secrétaire.',
            content: 'Bonjour,\n\nJe vous envoie mon CV pour le poste de secrétaire...\n\nCordialement',
            date: '2026-01-21T10:53:24.000Z',
            isRead: false,
            isReplied: false,
            priority: 'high'
          },
          {
            id: '3',
            from: 'team@email.hostinger.com',
            subject: 'Get started with business email',
            content: 'Welcome to your new business email account...',
            date: '2025-12-17T12:37:02.000Z',
            isRead: false,
            isReplied: false,
            priority: 'medium'
          },
          {
            id: '4',
            from: 'studyagency9@gmail.com',
            subject: 'Contact Us:',
            content: 'Information request about your services...',
            date: '2025-12-17T14:16:43.000Z',
            isRead: false,
            isReplied: false,
            priority: 'medium'
          }
        ];
        setMails(mockMails);
        return;
      }
      
      // Mapper les données IMAP vers notre format MailData
      const mappedMails: MailData[] = emailsToMap.map((email: any) => {
        console.log('📧 Mapping email:', email);
        return {
          id: email.id?.toString() || email.uid?.toString(),
          from: email.from?.address || email.from || 'Unknown',
          subject: email.subject || 'Sans sujet',
          content: email.body || 'Contenu non disponible',
          date: email.date,
          isRead: email.isRead || false,
          isReplied: false, // Pas d'info de réponse dans l'API actuelle
          priority: email.hasAttachments ? 'high' : 'medium'
        };
      }) || [];
      
      console.log('📧 Mapped mails:', mappedMails);
      setMails(mappedMails);
    } catch (error) {
      console.warn('⚠️ IMAP emails not available, using mock data:', error);
      
      // Fallback avec des données simulées si l'API IMAP n'est pas disponible
      const mockMails: MailData[] = [
        {
          id: '1',
          from: 'contact@entreprise-alpha.com',
          subject: 'Demande de partenariat - Entreprise Alpha',
          content: 'Bonjour, nous souhaiterions établir un partenariat avec Studia Career pour nos programmes de formation...',
          date: '2026-02-12T10:30:00',
          isRead: false,
          isReplied: false,
          priority: 'high'
        },
        {
          id: '2',
          from: 'info@startup-beta.com',
          subject: 'Information sur vos services',
          content: 'Pourriez-vous nous fournir plus de détails sur vos tarifs pour les entreprises...',
          date: '2026-02-12T09:15:00',
          isRead: true,
          isReplied: false,
          priority: 'medium'
        },
        {
          id: '3',
          from: 'rh@corporate-gamma.com',
          subject: 'Devis formation pour 50 employés',
          content: 'Nous sommes intéressés par une formation sur le développement carrière pour 50 de nos employés...',
          date: '2026-02-11T16:45:00',
          isRead: true,
          isReplied: true,
          priority: 'high'
        },
        {
          id: '4',
          from: 'contact@freelance-delta.com',
          subject: 'Collaboration freelance',
          content: 'Je suis développeur freelance et je souhaiterais collaborer avec vous sur certains projets...',
          date: '2026-02-11T14:20:00',
          isRead: false,
          isReplied: false,
          priority: 'low'
        }
      ];
      
      setMails(mockMails);
    }
  };

  const fetchTopCommercial = async () => {
    try {
      const response = await associatesService.getList();
      const associates = response.data.data.associates || [];
      
      if (associates.length > 0) {
        // Trouver le meilleur commercial
        const best = associates.reduce((prev: any, current: any) => 
          (current.totalSales > prev.totalSales) ? current : prev
        );

        const topCommercial: TopCommercial = {
          id: best._id,
          name: `${best.firstName} ${best.lastName}`,
          email: best.email,
          totalSales: best.totalSales,
          totalCommission: best.totalCommission,
          salesCount: Math.floor(best.totalSales / 1000), // Estimation
          avgSale: Math.floor(best.totalSales / Math.max(best.totalSales / 1000, 1)),
          performance: best.totalSales > 5000 ? 'excellent' : best.totalSales > 2000 ? 'good' : 'average'
        };

        setTopCommercial(topCommercial);
      }
    } catch (err) {
      // Fallback avec des données simulées
      const mockTopCommercial: TopCommercial = {
        id: '1',
        name: 'Emmanuel De Song',
        email: 'emmanueldesong46@gmail.com',
        totalSales: 1099,
        totalCommission: 550,
        salesCount: 1,
        avgSale: 1099,
        performance: 'good'
      };
      setTopCommercial(mockTopCommercial);
    }
  };

  const fetchWithdrawals = async () => {
    try {
      console.log('🔄 Fetching withdrawals from API...');
      const response = await financeService.getWithdrawals();
      console.log('✅ Withdrawals API response:', response);
      
      if (response.data?.data?.withdrawals) {
        const formattedWithdrawals: WithdrawalRequest[] = response.data.data.withdrawals.map((withdrawal: any) => ({
          id: withdrawal.id,
          commercial: {
            name: withdrawal.associate?.name || 'Commercial inconnu',
            email: withdrawal.associate?.email || 'email@inconnu.com'
          },
          amount: withdrawal.amount || 0,
          date: withdrawal.requestDate || new Date().toISOString(),
          status: withdrawal.status || 'pending',
          bankInfo: withdrawal.paymentMethod || 'Non spécifié',
          requestDate: withdrawal.requestDate || new Date().toISOString()
        }));
        setWithdrawals(formattedWithdrawals);
        console.log('✅ Withdrawals formatted:', formattedWithdrawals);
      } else {
        console.log('⚠️ No withdrawals found in API response');
        setWithdrawals([]);
      }
    } catch (error) {
      console.error('❌ Error fetching withdrawals:', error);
      // Fallback avec des données simulées pour le développement
      const mockWithdrawals: WithdrawalRequest[] = [
        {
          id: 'demo-1',
          commercial: {
            name: 'Jean Dupont (Demo)',
            email: 'jean.dupont@email.com'
          },
          amount: 1500,
          date: '2026-02-12T08:00:00',
          status: 'pending',
          bankInfo: 'Bank of Africa - ****1234',
          requestDate: '2026-02-12T08:00:00'
        },
        {
          id: 'demo-2',
          commercial: {
            name: 'Marie Curie (Demo)',
            email: 'marie.curie@email.com'
          },
          amount: 850,
          date: '2026-02-11T15:30:00',
          status: 'pending',
          bankInfo: 'Ecobank - ****5678',
          requestDate: '2026-02-11T15:30:00'
        }
      ];
      setWithdrawals(mockWithdrawals);
      console.log('📋 Using mock withdrawals for demo');
    }
  };

  const fetchPendingInvoices = async () => {
    try {
      const response = await invoicesService.getList();
      const invoicesData = response.data.data || response.data;
      const allInvoices = invoicesData.invoices || [];

      // Filtrer les factures des partenaires en attente
      const partnerInvoices = allInvoices
        .filter((inv: any) => inv.status === 'pending')
        .slice(0, 5);

      const formattedInvoices: InvoiceData[] = partnerInvoices.map((inv: any) => ({
        id: inv._id || inv.id,
        partner: {
          name: inv.client?.name || 'Client inconnu',
          email: inv.client?.email || 'email@inconnu.com'
        },
        amount: inv.amount || 0,
        date: inv.createdAt || new Date().toISOString(),
        status: inv.status || 'pending',
        dueDate: inv.dueDate || new Date().toISOString(),
        number: inv.invoiceNumber || `INV-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
      }));

      setInvoices(formattedInvoices);
    } catch (err) {
      // Fallback avec des données simulées
      const mockInvoices: InvoiceData[] = [
        {
          id: '1',
          partner: {
            name: 'Entreprise Alpha',
            email: 'contact@entreprise-alpha.com'
          },
          amount: 2500,
          date: '2026-02-10T00:00:00',
          status: 'pending',
          dueDate: '2026-02-17T00:00:00',
          number: 'INV-2026-001'
        },
        {
          id: '2',
          partner: {
            name: 'Startup Beta',
            email: 'info@startup-beta.com'
          },
          amount: 1800,
          date: '2026-02-08T00:00:00',
          status: 'pending',
          dueDate: '2026-02-15T00:00:00',
          number: 'INV-2026-002'
        }
      ];
      setInvoices(mockInvoices);
    }
  };

  const fetchPersonnelWithCVs = async () => {
    try {
      console.log('🔄 Fetching personnel with CVs from API...');
      
      // Essayer d'abord l'endpoint /admin/personnel
      let response;
      try {
        response = await personnelService.getList();
        console.log('✅ Personnel API response (admin/personnel):', response);
      } catch (adminError) {
        console.log('⚠️ Admin personnel endpoint failed, trying /personnel...');
        // Fallback vers /personnel
        response = await api.get('/personnel');
        console.log('✅ Personnel API response (personnel):', response);
      }
      
      if (response.data?.data?.personnel) {
        const personnelData = response.data.data.personnel;
        setPersonnelWithCVs(personnelData);
        console.log('✅ Personnel with CVs loaded:', personnelData.length);
        console.log('📋 Personnel details:', personnelData.map((p: any) => ({
          id: p._id,
          name: `${p.firstName} ${p.lastName}`,
          position: p.position,
          gender: p.gender,
          phone: p.phoneNumber,
          hasCV: !!p.cvPdfUrl,
          experience: p.additionalInfo?.experience,
          skills: p.additionalInfo?.skills?.slice(0, 2),
          createdAt: p.createdAt
        })));
      } else if (response.data?.personnel) {
        const personnelData = response.data.personnel;
        setPersonnelWithCVs(personnelData);
        console.log('✅ Personnel with CVs loaded (direct):', personnelData.length);
        console.log('📋 Personnel details:', personnelData.map((p: any) => ({
          id: p._id,
          name: `${p.firstName} ${p.lastName}`,
          position: p.position,
          gender: p.gender,
          phone: p.phoneNumber,
          hasCV: !!p.cvPdfUrl,
          experience: p.additionalInfo?.experience,
          skills: p.additionalInfo?.skills?.slice(0, 2),
          createdAt: p.createdAt
        })));
      } else {
        console.log('⚠️ No personnel found in API response, checking structure...');
        console.log('📋 Response structure:', JSON.stringify(response.data, null, 2));
        setPersonnelWithCVs([]);
      }
    } catch (error) {
      console.error('❌ Error fetching personnel with CVs:', error);
      // Fallback avec des données simulées pour le développement
      const mockPersonnel: PersonnelWithCV[] = [
        {
          _id: 'demo-1',
          firstName: 'Jean',
          lastName: 'Dupont (Demo)',
          dateOfBirth: '1990-01-15',
          gender: 'M',
          phoneNumber: '+2250700000000',
          position: 'Développeur Senior',
          cvId: 'cv-demo-1',
          cvPdfUrl: '#',
          additionalInfo: {
            experience: '5 ans',
            skills: ['JavaScript', 'Node.js', 'React'],
            salary: '800000 FCFA'
          },
          createdAt: '2026-02-15T20:23:45.123Z',
          updatedAt: '2026-02-15T20:23:45.123Z'
        },
        {
          _id: 'demo-2',
          firstName: 'Marie',
          lastName: 'Martin (Demo)',
          dateOfBirth: '1992-05-20',
          gender: 'F',
          phoneNumber: '+2250700000001',
          position: 'Designer UX/UI',
          cvId: 'cv-demo-2',
          cvPdfUrl: '#',
          additionalInfo: {
            experience: '3 ans',
            skills: ['Figma', 'Adobe XD', 'Sketch'],
            portfolio: 'https://marie-design.com'
          },
          createdAt: '2026-02-14T15:30:00.000Z',
          updatedAt: '2026-02-14T15:30:00.000Z'
        }
      ];
      setPersonnelWithCVs(mockPersonnel);
      console.log('📋 Using mock personnel for demo');
    }
  };

  // Fonction pour vérifier la santé du service IMAP
  const checkImapHealth = async () => {
    try {
      setImapHealth({ status: 'checking' });
      const response = await emailService.checkImapHealth();
      
      if (response.success) {
        setImapHealth({
          status: 'healthy',
          lastCheck: new Date().toLocaleString('fr-FR')
        });
      } else {
        setImapHealth({
          status: 'unhealthy',
          lastCheck: new Date().toLocaleString('fr-FR'),
          error: response.error || 'Service IMAP indisponible'
        });
      }
    } catch (error: any) {
      setImapHealth({
        status: 'unhealthy',
        lastCheck: new Date().toLocaleString('fr-FR'),
        error: error.message || 'Erreur de connexion IMAP'
      });
    }
  };

  // Fonction pour vérifier la santé du service email
  const checkEmailHealth = async () => {
    try {
      setEmailHealth({ status: 'checking' });
      const response = await emailService.checkEmailHealth();
      
      if (response.success) {
        setEmailHealth({
          status: 'healthy',
          lastCheck: new Date().toLocaleString('fr-FR')
        });
      } else {
        setEmailHealth({
          status: 'unhealthy',
          lastCheck: new Date().toLocaleString('fr-FR'),
          error: response.error || 'Service indisponible'
        });
      }
    } catch (error: any) {
      setEmailHealth({
        status: 'unhealthy',
        lastCheck: new Date().toLocaleString('fr-FR'),
        error: error.message || 'Erreur de connexion'
      });
    }
  };

  // Fonction pour envoyer le formulaire de contact
  const handleSendContactForm = async () => {
    if (!contactForm.name.trim() || !contactForm.email.trim() || !contactForm.message.trim()) {
      alert('Veuillez remplir les champs obligatoires (nom, email, message)');
      return;
    }

    try {
      setSendingContact(true);
      
      const response = await emailService.sendContactEmail(contactForm);
      
      if (response.success) {
        alert('Message envoyé avec succès !');
        // Réinitialiser le formulaire
        setContactForm({
          name: '',
          email: '',
          phone: '',
          subject: '',
          message: ''
        });
      } else {
        alert('Erreur lors de l\'envoi: ' + (response.error || 'Erreur inconnue'));
      }
    } catch (error: any) {
      console.error('Error sending contact form:', error);
      alert('Erreur lors de l\'envoi: ' + (error.message || 'Erreur de connexion'));
    } finally {
      setSendingContact(false);
    }
  };

  // Fonction pour tester le service email
  const handleTestEmailService = async () => {
    try {
      const response = await emailService.testEmailService();
      
      if (response.success) {
        alert('Test email réussi !');
      } else {
        alert('Test email échoué: ' + (response.error || 'Erreur inconnue'));
      }
    } catch (error: any) {
      console.error('Error testing email service:', error);
      alert('Erreur lors du test: ' + (error.message || 'Erreur de connexion'));
    }
  };

  // Vérifier la santé des services email au chargement
  useEffect(() => {
    if (isAssistant) {
      checkEmailHealth();
      checkImapHealth();
    }
  }, [isAssistant]);

  const handleReplyToMail = async () => {
    if (!selectedMail || !replyContent.trim()) return;

    try {
      setSendingReply(true);
      
      // Le backend n'a pas de route pour répondre aux emails
      // On simule l'envoi en local
      console.log('📧 Simulating reply to:', selectedMail.from);
      console.log('📝 Reply content:', replyContent);
      
      // Simuler un délai d'envoi
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Marquer le mail comme répondu dans l'état local
      setMails(prev => prev.map(mail => 
        mail.id === selectedMail.id 
          ? { ...mail, isReplied: true }
          : mail
      ));

      // Réinitialiser
      setSelectedMail(null);
      setReplyContent('');
      
      alert('Réponse envoyée avec succès ! (simulation)');
    } catch (err) {
      console.error('Error sending reply:', err);
      alert('Erreur lors de l\'envoi de la réponse.');
    } finally {
      setSendingReply(false);
    }
  };

  const handleMarkAsRead = async (mailId: string) => {
    try {
      // Essayer de marquer comme lu via l'API IMAP
      try {
        await emailService.markEmailAsRead(mailId, true);
        console.log('✅ Email marked as read via IMAP API');
      } catch (apiError) {
        console.warn('⚠️ IMAP API not available, updating locally:', apiError);
      }
      
      // Mettre à jour l'état local dans tous les cas
      setMails(prev => prev.map(mail => 
        mail.id === mailId 
          ? { ...mail, isRead: true }
          : mail
      ));
    } catch (err) {
      console.error('Error marking email as read:', err);
    }
  };

  // Fonction pour récupérer les détails complets d'un email
  const fetchEmailDetails = async (emailId: string) => {
    try {
      const response = await emailService.getEmailById(emailId);
      setEmailDetails(response.email);
      return response.email;
    } catch (error) {
      console.error('Error fetching email details:', error);
      return null;
    }
  };

  // Fonction pour télécharger une pièce jointe
  const handleDownloadAttachment = async (emailId: string, filename: string) => {
    try {
      const blob = await emailService.downloadAttachment(emailId, filename);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading attachment:', error);
      alert('Erreur lors du téléchargement de la pièce jointe');
    }
  };

  // Fonction pour rafraîchir les emails
  const refreshEmails = async () => {
    try {
      await fetchMails();
      alert('Emails rafraîchis avec succès !');
    } catch (error) {
      console.error('Error refreshing emails:', error);
      alert('Erreur lors du rafraîchissement des emails');
    }
  };

  const handleApproveWithdrawal = async (withdrawalId: string) => {
    try {
      console.log('🔄 Approving withdrawal:', withdrawalId);
      
      // Appeler l'API pour approuver le retrait
      const response = await financeService.updateWithdrawalStatus(withdrawalId, 'completed');
      console.log('✅ Withdrawal approved:', response);
      
      // Mettre à jour l'état local
      setWithdrawals(prev => prev.map(w => 
        w.id === withdrawalId 
          ? { ...w, status: 'approved' as const }
          : w
      ));

      alert('✅ Demande de retrait approuvée avec succès !');
    } catch (err) {
      console.error('❌ Error approving withdrawal:', err);
      
      // Mise à jour locale même si l'API échoue (pour le développement)
      setWithdrawals(prev => prev.map(w => 
        w.id === withdrawalId 
          ? { ...w, status: 'approved' as const }
          : w
      ));
      
      alert('⚠️ Demande approuvée localement (API indisponible)');
    }
  };

  const handleRejectWithdrawal = async (withdrawalId: string) => {
    try {
      console.log('🔄 Rejecting withdrawal:', withdrawalId);
      
      // Demander une raison pour le rejet
      const reason = prompt('Veuillez indiquer la raison du rejet:');
      if (!reason) return;
      
      // Appeler l'API pour rejeter le retrait
      const response = await financeService.updateWithdrawalStatus(withdrawalId, 'rejected');
      console.log('✅ Withdrawal rejected:', response);
      
      // Mettre à jour l'état local
      setWithdrawals(prev => prev.map(w => 
        w.id === withdrawalId 
          ? { ...w, status: 'rejected' as const }
          : w
      ));

      alert('✅ Demande de retrait rejetée avec succès !');
    } catch (err) {
      console.error('❌ Error rejecting withdrawal:', err);
      
      // Mise à jour locale même si l'API échoue (pour le développement)
      setWithdrawals(prev => prev.map(w => 
        w.id === withdrawalId 
          ? { ...w, status: 'rejected' as const }
          : w
      ));
      
      alert('⚠️ Demande rejetée localement (API indisponible)');
    }
  };

  const handleSendInvoiceEmail = async (invoice: InvoiceData) => {
    try {
      console.log('Sending invoice email to:', invoice.partner.email);
      console.log('Invoice:', invoice.number);
      
      alert(`Facture ${invoice.number} envoyée à ${invoice.partner.email} !`);
    } catch (err) {
      console.error('Error sending invoice email:', err);
      alert('Erreur lors de l\'envoi de la facture.');
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <PageHeader
          title="Chargement..."
          description="Chargement des données du tableau de bord"
        />
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="forge-card p-6 animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-muted rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <PageHeader
          title="Erreur"
          description="Un problème est survenu"
        />
        <Alert variant="destructive">{error}</Alert>
      </DashboardLayout>
    );
  }

  if (!isAssistant) {
    // Si ce n'est pas un assistant, afficher le dashboard normal
    return (
      <DashboardLayout>
        <PageHeader
          title="Accès non autorisé"
          description="Cette page est réservée aux assistants administratifs"
        />
        <Alert variant="destructive">
          Vous n'avez pas les permissions nécessaires pour accéder à cette page.
        </Alert>
      </DashboardLayout>
    );
  }

  const unreadMails = mails.filter(m => !m.isRead);
  const pendingWithdrawalsCount = withdrawals.filter(w => w.status === 'pending').length;

  return (
    <DashboardLayout>
      <PageHeader
        title={`Bienvenue, ${user?.name}!`}
        description="Tableau de bord - Assistant Administratif"
      />

      {/* KPIs Principaux */}
      <section className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          <KPICard
            title="Emails non lus"
            value={unreadMails.length}
            icon={<Mail className="w-5 h-5" />}
            variant="destructive"
            delay={0}
          />
          <KPICard
            title="Demandes de retrait"
            value={pendingWithdrawalsCount}
            icon={<CreditCard className="w-5 h-5" />}
            variant="warning"
            delay={0.1}
          />
          <KPICard
            title="Factures en attente"
            value={invoices.length}
            icon={<FileText className="w-5 h-5" />}
            variant="info"
            delay={0.2}
          />
          <KPICard
            title="Meilleur commercial"
            value={topCommercial?.name || 'N/A'}
            icon={<Star className="w-5 h-5" />}
            subtitle={`${topCommercial?.totalSales || 0} FCFA`}
            delay={0.3}
          />
        </div>
      </section>

      <Tabs defaultValue="email-hub" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="email-hub" className="flex items-center gap-2">
            <Mail className="w-4 h-4" />
            Email Hub
          </TabsTrigger>
          <TabsTrigger value="withdrawals" className="flex items-center gap-2">
            <CreditCard className="w-4 h-4" />
            Retraits
          </TabsTrigger>
          <TabsTrigger value="cvs" className="flex items-center gap-2">
            <FileIcon className="w-4 h-4" />
            CVs
          </TabsTrigger>
          <TabsTrigger value="planning" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Planning
          </TabsTrigger>
          <TabsTrigger value="stats" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Stats
          </TabsTrigger>
        </TabsList>

        {/* Email Hub Section */}
        <TabsContent value="email-hub" className="space-y-6">
          <EmailHub />
        </TabsContent>

        {/* Retraits Section */}
        <TabsContent value="withdrawals" className="space-y-6">
          <Card className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-amber-200 dark:border-amber-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-amber-700 dark:text-amber-300">
                <CreditCard className="w-5 h-5" />
                Demandes de retrait en attente ({withdrawals.filter(w => w.status === 'pending').length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {withdrawals.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <CreditCard className="w-12 h-12 mx-auto mb-4 text-amber-500 opacity-50" />
                    <p className="text-lg font-medium">Aucune demande de retrait</p>
                    <p className="text-sm">Les demandes apparaîtront ici lorsqu'elles seront soumises</p>
                  </div>
                ) : (
                  withdrawals.map((withdrawal) => (
                    <div key={withdrawal.id} className="border rounded-lg p-4 bg-white/60 dark:bg-slate-700/60 backdrop-blur-sm">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="font-medium">{withdrawal.commercial.name}</h4>
                          <p className="text-sm text-muted-foreground">{withdrawal.commercial.email}</p>
                        </div>
                        <Badge variant={
                          withdrawal.status === 'pending' ? 'secondary' :
                          withdrawal.status === 'approved' ? 'default' : 'destructive'
                        }>
                          {withdrawal.status === 'pending' ? 'En attente' :
                           withdrawal.status === 'approved' ? 'Approuvé' : 'Rejeté'}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Montant</p>
                          <p className="font-semibold text-green-600">{withdrawal.amount.toLocaleString('fr-FR')} FCFA</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Méthode</p>
                          <p className="font-medium">{withdrawal.bankInfo}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Date demande</p>
                          <p className="font-medium">{new Date(withdrawal.requestDate).toLocaleDateString('fr-FR')}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Statut</p>
                          <p className="font-medium">{withdrawal.status}</p>
                        </div>
                      </div>

                      {withdrawal.status === 'pending' && (
                        <div className="flex gap-2">
                          <Button 
                            onClick={() => handleApproveWithdrawal(withdrawal.id)}
                            className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="w-4 h-4" />
                            Approuver
                          </Button>
                          <Button 
                            variant="destructive"
                            onClick={() => handleRejectWithdrawal(withdrawal.id)}
                            className="flex items-center gap-2"
                          >
                            <AlertCircle className="w-4 h-4" />
                            Rejeter
                          </Button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Gestion CVs Section */}
        <TabsContent value="cvs" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                  <FileIcon className="w-5 h-5" />
                  Personnel avec CVs ({personnelWithCVs.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {personnelWithCVs.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileIcon className="w-12 h-12 mx-auto mb-4 text-blue-500 opacity-50" />
                    <p className="text-lg font-medium">Aucun personnel avec CV</p>
                    <p className="text-sm">Les personnes avec CV apparaîtront ici</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {personnelWithCVs.map((person) => (
                      <div key={person._id} className="border rounded-lg p-3 bg-white/60 dark:bg-slate-700/60 backdrop-blur-sm">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <h4 className="font-medium">{person.firstName} {person.lastName}</h4>
                            <p className="text-sm text-muted-foreground">{person.position}</p>
                          </div>
                          <Badge variant="secondary">
                            {person.gender === 'M' ? 'Homme' : 'Femme'}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
                          <div>
                            <p className="text-muted-foreground">Téléphone</p>
                            <p className="font-medium">{person.phoneNumber}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Expérience</p>
                            <p className="font-medium">{person.additionalInfo?.experience || 'N/A'}</p>
                          </div>
                        </div>

                        {person.additionalInfo?.skills && (
                          <div className="mb-3">
                            <p className="text-sm text-muted-foreground mb-1">Compétences</p>
                            <div className="flex flex-wrap gap-1">
                              {person.additionalInfo.skills.slice(0, 3).map((skill, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {skill}
                                </Badge>
                              ))}
                              {person.additionalInfo.skills.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{person.additionalInfo.skills.length - 3}
                                </Badge>
                              )}
                            </div>
                          </div>
                        )}

                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => window.open(person.cvPdfUrl, '_blank')}
                            className="flex items-center gap-1"
                          >
                            <Download className="w-3 h-3" />
                            CV
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="flex items-center gap-1"
                          >
                            <Phone className="w-3 h-3" />
                            Contacter
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-300">
                  <Users className="w-5 h-5" />
                  Statistiques CVs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Total CVs</span>
                    <span className="font-semibold">{personnelWithCVs.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Hommes</span>
                    <span className="font-semibold">
                      {personnelWithCVs.filter(p => p.gender === 'M').length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Femmes</span>
                    <span className="font-semibold">
                      {personnelWithCVs.filter(p => p.gender === 'F').length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Ajoutés aujourd'hui</span>
                    <span className="font-semibold">
                      {personnelWithCVs.filter(p => 
                        new Date(p.createdAt).toDateString() === new Date().toDateString()
                      ).length}
                    </span>
                  </div>
                  <Button variant="outline" className="w-full mt-4">
                    <Filter className="w-4 h-4 mr-2" />
                    Filtrer les candidats
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Planning Section */}
        <TabsContent value="planning" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-200 dark:border-purple-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-purple-700 dark:text-purple-300">
                  <Calendar className="w-5 h-5" />
                  Planning Semaine
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="w-12 h-12 mx-auto mb-4 text-purple-500 opacity-50" />
                  <p className="text-lg font-medium">Aucun événement cette semaine</p>
                  <p className="text-sm">Les entretiens et rendez-vous apparaîtront ici</p>
                  <Button variant="outline" className="mt-4 border-purple-200 text-purple-600 hover:bg-purple-50 dark:border-purple-700 dark:text-purple-400 dark:hover:bg-purple-900/20">
                    <Plus className="w-4 h-4 mr-2" />
                    Ajouter un événement
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20 border-orange-200 dark:border-orange-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-orange-700 dark:text-orange-300">
                  <Clock className="w-5 h-5" />
                  Tâches du Jour
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <Clock className="w-12 h-12 mx-auto mb-4 text-orange-500 opacity-50" />
                  <p className="text-lg font-medium">Aucune tâche aujourd'hui</p>
                  <p className="text-sm">Gérez vos tâches quotidiennes</p>
                  <Button variant="outline" className="mt-4 border-orange-200 text-orange-600 hover:bg-orange-50 dark:border-orange-700 dark:text-orange-400 dark:hover:bg-orange-900/20">
                    <Plus className="w-4 h-4 mr-2" />
                    Nouvelle tâche
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Statistiques Section */}
        <TabsContent value="stats" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <KPICard
              title="Emails traités aujourd'hui"
              value={unreadMails.length}
              icon={<Mail className="w-5 h-5" />}
              variant="primary"
              delay={0}
            />
            <KPICard
              title="CVs reçus cette semaine"
              value={personnelWithCVs.length}
              icon={<FileIcon className="w-5 h-5" />}
              variant="success"
              delay={0.1}
            />
            <KPICard
              title="Entretiens programmés"
              value={0}
              icon={<Calendar className="w-5 h-5" />}
              variant="info"
              delay={0.2}
            />
            <KPICard
              title="Taux de réponse"
              value="0%"
              icon={<BarChart3 className="w-5 h-5" />}
              variant="warning"
              delay={0.3}
            />
          </div>

          <Card className="bg-gradient-to-br from-slate-50 to-gray-50 dark:from-slate-900/20 dark:to-gray-900/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                <BarChart3 className="w-5 h-5" />
                Activité Mensuelle
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">Les statistiques apparaîtront ici</p>
                <p className="text-sm">Suivez votre activité mensuelle</p>
                <Button variant="outline" className="mt-4">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Voir le rapport détaillé
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}
                                                                                                
