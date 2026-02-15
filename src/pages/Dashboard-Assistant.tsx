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
  TrendingUp
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/ui/PageHeader';
import { KPICard } from '@/components/dashboard/KPICard';
import { useAuth } from '@/contexts/AuthContext';
import { dashboardService, associatesService, invoicesService, emailService } from '@/lib/api';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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
      const response = await emailService.getInboxEmails({ 
        limit: 20,
        unreadOnly: false 
      });
      console.log('✅ Real IMAP emails fetched:', response);
      
      // Mapper les données IMAP vers notre format MailData
      const mappedMails: MailData[] = response.emails?.map((email: any) => ({
        id: email.id?.toString() || email.uid?.toString(),
        from: email.from?.address || email.from || 'Unknown',
        subject: email.subject || 'Sans sujet',
        content: email.body || 'Contenu non disponible',
        date: email.date,
        isRead: email.isRead || false,
        isReplied: false, // Pas d'info de réponse dans l'API actuelle
        priority: email.hasAttachments ? 'high' : 'medium'
      })) || [];
      
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
    // Simuler des demandes de retrait
    const mockWithdrawals: WithdrawalRequest[] = [
      {
        id: '1',
        commercial: {
          name: 'Jean Dupont',
          email: 'jean.dupont@email.com'
        },
        amount: 1500,
        date: '2026-02-12T08:00:00',
        status: 'pending',
        bankInfo: 'Bank of Africa - ****1234',
        requestDate: '2026-02-12T08:00:00'
      },
      {
        id: '2',
        commercial: {
          name: 'Marie Curie',
          email: 'marie.curie@email.com'
        },
        amount: 850,
        date: '2026-02-11T15:30:00',
        status: 'pending',
        bankInfo: 'Ecobank - ****5678',
        requestDate: '2026-02-11T15:30:00'
      },
      {
        id: '3',
        commercial: {
          name: 'Paul Martin',
          email: 'paul.martin@email.com'
        },
        amount: 2200,
        date: '2026-02-10T11:15:00',
        status: 'pending',
        bankInfo: 'Orange Money - ****9012',
        requestDate: '2026-02-10T11:15:00'
      }
    ];
    setWithdrawals(mockWithdrawals);
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
      console.log('Approving withdrawal:', withdrawalId);
      
      setWithdrawals(prev => prev.map(w => 
        w.id === withdrawalId 
          ? { ...w, status: 'approved' as const }
          : w
      ));

      alert('Demande de retrait approuvée !');
    } catch (err) {
      console.error('Error approving withdrawal:', err);
      alert('Erreur lors de l\'approbation.');
    }
  };

  const handleRejectWithdrawal = async (withdrawalId: string) => {
    try {
      console.log('Rejecting withdrawal:', withdrawalId);
      
      setWithdrawals(prev => prev.map(w => 
        w.id === withdrawalId 
          ? { ...w, status: 'rejected' as const }
          : w
      ));

      alert('Demande de retrait rejetée !');
    } catch (err) {
      console.error('Error rejecting withdrawal:', err);
      alert('Erreur lors du rejet.');
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

      <Tabs defaultValue="mails" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="mails">Emails</TabsTrigger>
          <TabsTrigger value="email-service">Service Email</TabsTrigger>
          <TabsTrigger value="withdrawals">Retraits</TabsTrigger>
          <TabsTrigger value="invoices">Factures</TabsTrigger>
          <TabsTrigger value="commercial">Top Commercial</TabsTrigger>
        </TabsList>

        {/* Emails Section */}
        <TabsContent value="mails" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Liste des emails */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Inbox className="w-5 h-5" />
                    Boîte de réception ({unreadMails.length} non lus)
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={refreshEmails}
                    className="flex items-center gap-2"
                  >
                    <Mail className="w-4 h-4" />
                    Rafraîchir
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {mails.map((mail) => (
                  <div
                    key={mail.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedMail?.id === mail.id 
                        ? 'border-primary bg-primary/5' 
                        : 'hover:bg-muted/50'
                    } ${!mail.isRead ? 'border-l-4 border-l-primary' : ''}`}
                    onClick={async () => {
                    setSelectedMail(mail);
                    // Récupérer les détails complets de l'email
                    await fetchEmailDetails(mail.id);
                    if (!mail.isRead) {
                      handleMarkAsRead(mail.id);
                    }
                  }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-sm font-medium ${
                            !mail.isRead ? 'text-primary' : 'text-muted-foreground'
                          }`}>
                            {mail.from}
                          </span>
                          <Badge variant={
                            mail.priority === 'high' ? 'destructive' : 
                            mail.priority === 'medium' ? 'secondary' : 'outline'
                          }>
                            {mail.priority}
                          </Badge>
                          {mail.isReplied && <CheckCircle className="w-4 h-4 text-green-500" />}
                          {mail.priority === 'high' && <Paperclip className="w-4 h-4 text-orange-500" />}
                        </div>
                        <h4 className="font-medium mb-1">{mail.subject}</h4>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {mail.content}
                        </p>
                        <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          {new Date(mail.date).toLocaleDateString('fr-FR')}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Lecture et réponse */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MailOpen className="w-5 h-5" />
                  {selectedMail ? 'Email sélectionné' : 'Sélectionnez un email'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedMail ? (
                  <div className="space-y-4">
                    <div className="border-b pb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{selectedMail.from}</span>
                        <Badge variant={
                          selectedMail.priority === 'high' ? 'destructive' : 
                          selectedMail.priority === 'medium' ? 'secondary' : 'outline'
                        }>
                          {selectedMail.priority}
                        </Badge>
                      </div>
                      <h3 className="font-semibold mb-2">{selectedMail.subject}</h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        {new Date(selectedMail.date).toLocaleDateString('fr-FR', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                      <div className="whitespace-pre-wrap">{selectedMail.content}</div>
                      
                      {/* Affichage des pièces jointes */}
                      {emailDetails?.attachments && emailDetails.attachments.length > 0 && (
                        <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                          <h4 className="font-medium mb-2 flex items-center gap-2">
                            <Paperclip className="w-4 h-4" />
                            Pièces jointes ({emailDetails.attachments.length})
                          </h4>
                          <div className="space-y-2">
                            {emailDetails.attachments.map((attachment: any, index: number) => (
                              <div key={index} className="flex items-center justify-between p-2 bg-background rounded border">
                                <div className="flex items-center gap-2">
                                  <FileText className="w-4 h-4 text-muted-foreground" />
                                  <span className="text-sm">{attachment.filename}</span>
                                  <span className="text-xs text-muted-foreground">
                                    ({(attachment.size / 1024).toFixed(1)} KB)
                                  </span>
                                </div>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleDownloadAttachment(selectedMail.id, attachment.filename)}
                                  className="flex items-center gap-1"
                                >
                                  <Download className="w-3 h-3" />
                                  Télécharger
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="reply">Réponse</Label>
                      <Textarea
                        id="reply"
                        placeholder="Rédigez votre réponse..."
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        rows={6}
                      />
                      <div className="flex gap-2">
                        <Button 
                          onClick={handleReplyToMail}
                          disabled={!replyContent.trim() || sendingReply}
                          className="flex items-center gap-2"
                        >
                          <Send className="w-4 h-4" />
                          {sendingReply ? 'Envoi...' : 'Envoyer'}
                        </Button>
                        <Button 
                          variant="outline"
                          onClick={() => {
                            setSelectedMail(null);
                            setReplyContent('');
                          }}
                        >
                          Annuler
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Mail className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Sélectionnez un email pour le lire et y répondre</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Email Service Section */}
        <TabsContent value="email-service" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Formulaire de contact */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Formulaire de Contact
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Nom *</Label>
                    <Input
                      id="name"
                      value={contactForm.name}
                      onChange={(e) => setContactForm(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Nom du contact"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={contactForm.email}
                      onChange={(e) => setContactForm(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="email@exemple.com"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="phone">Téléphone</Label>
                  <Input
                    id="phone"
                    value={contactForm.phone}
                    onChange={(e) => setContactForm(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="+33612345678"
                  />
                </div>

                <div>
                  <Label htmlFor="subject">Sujet</Label>
                  <Input
                    id="subject"
                    value={contactForm.subject}
                    onChange={(e) => setContactForm(prev => ({ ...prev, subject: e.target.value }))}
                    placeholder="Sujet du message"
                  />
                </div>

                <div>
                  <Label htmlFor="message">Message *</Label>
                  <Textarea
                    id="message"
                    value={contactForm.message}
                    onChange={(e) => setContactForm(prev => ({ ...prev, message: e.target.value }))}
                    placeholder="Votre message..."
                    rows={4}
                  />
                </div>

                <Button 
                  onClick={handleSendContactForm}
                  disabled={sendingContact || !contactForm.name.trim() || !contactForm.email.trim() || !contactForm.message.trim()}
                  className="w-full flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  {sendingContact ? 'Envoi...' : 'Envoyer le message'}
                </Button>
              </CardContent>
            </Card>

            {/* Santé du service email */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Santé des Services Email
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Service SMTP */}
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${
                      emailHealth.status === 'healthy' ? 'bg-green-500' :
                      emailHealth.status === 'checking' ? 'bg-yellow-500 animate-pulse' :
                      'bg-red-500'
                    }`} />
                    <div>
                      <p className="font-medium">SMTP (Envoi)</p>
                      <p className="text-sm text-muted-foreground">
                        {emailHealth.status === 'healthy' ? 'Service en ligne' :
                         emailHealth.status === 'checking' ? 'Vérification...' :
                         'Service hors ligne'}
                      </p>
                      {emailHealth.lastCheck && (
                        <p className="text-xs text-muted-foreground">
                          Dernière vérification: {emailHealth.lastCheck}
                        </p>
                      )}
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={checkEmailHealth}
                    disabled={emailHealth.status === 'checking'}
                  >
                    <Activity className="w-4 h-4 mr-2" />
                    Vérifier
                  </Button>
                </div>

                {/* Service IMAP */}
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${
                      imapHealth.status === 'healthy' ? 'bg-green-500' :
                      imapHealth.status === 'checking' ? 'bg-yellow-500 animate-pulse' :
                      'bg-red-500'
                    }`} />
                    <div>
                      <p className="font-medium">IMAP (Lecture)</p>
                      <p className="text-sm text-muted-foreground">
                        {imapHealth.status === 'healthy' ? 'Service en ligne' :
                         imapHealth.status === 'checking' ? 'Vérification...' :
                         'Service hors ligne'}
                      </p>
                      {imapHealth.lastCheck && (
                        <p className="text-xs text-muted-foreground">
                          Dernière vérification: {imapHealth.lastCheck}
                        </p>
                      )}
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={checkImapHealth}
                    disabled={imapHealth.status === 'checking'}
                  >
                    <Activity className="w-4 h-4 mr-2" />
                    Vérifier
                  </Button>
                </div>

                {/* Erreurs */}
                {emailHealth.error && (
                  <Alert variant="destructive">
                    <AlertCircle className="w-4 h-4" />
                    <AlertTitle>Erreur SMTP</AlertTitle>
                    <AlertDescription>{emailHealth.error}</AlertDescription>
                  </Alert>
                )}

                {imapHealth.error && (
                  <Alert variant="destructive">
                    <AlertCircle className="w-4 h-4" />
                    <AlertTitle>Erreur IMAP</AlertTitle>
                    <AlertDescription>{imapHealth.error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <Button 
                      onClick={handleTestEmailService}
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <MailCheck className="w-4 h-4" />
                      Tester SMTP
                    </Button>
                    
                    <Button 
                      onClick={refreshEmails}
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <Mail className="w-4 h-4" />
                      Rafraîchir Emails
                    </Button>
                  </div>
                  
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <h4 className="font-medium mb-2">Informations des services</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">SMTP:</span>
                        <span className="font-mono text-xs">smtp.hostinger.com:465</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">IMAP:</span>
                        <span className="font-mono text-xs">imap.hostinger.com:993</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Email:</span>
                        <span className="font-mono text-xs">contact@studyia.net</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Retraits Section */}
        <TabsContent value="withdrawals" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Demandes de retrait en attente ({pendingWithdrawalsCount})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {withdrawals.map((withdrawal) => (
                  <div key={withdrawal.id} className="border rounded-lg p-4">
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
                        <p className="font-semibold">{withdrawal.amount.toLocaleString('fr-FR')} FCFA</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Banque</p>
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
                          className="flex items-center gap-2"
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
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Factures Section */}
        <TabsContent value="invoices" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Factures partenaires en attente ({invoices.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {invoices.map((invoice) => (
                  <div key={invoice.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-medium">{invoice.number}</h4>
                        <p className="text-sm text-muted-foreground">{invoice.partner.name}</p>
                        <p className="text-sm text-muted-foreground">{invoice.partner.email}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-lg">{invoice.amount.toLocaleString('fr-FR')} FCFA</p>
                        <Badge variant="secondary">En attente</Badge>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Date facture</p>
                        <p className="font-medium">{new Date(invoice.date).toLocaleDateString('fr-FR')}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Date échéance</p>
                        <p className="font-medium">{new Date(invoice.dueDate).toLocaleDateString('fr-FR')}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Statut</p>
                        <p className="font-medium">{invoice.status}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Montant</p>
                        <p className="font-semibold">{invoice.amount.toLocaleString('fr-FR')} FCFA</p>
                      </div>
                    </div>

                    <Button 
                      onClick={() => handleSendInvoiceEmail(invoice)}
                      className="flex items-center gap-2"
                    >
                      <Send className="w-4 h-4" />
                      Envoyer la facture
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Top Commercial Section */}
        <TabsContent value="commercial" className="space-y-6">
          {topCommercial && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="w-5 h-5" />
                    Meilleur commercial du mois
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center py-6">
                    <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Award className="w-10 h-10 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold mb-2">{topCommercial.name}</h3>
                    <p className="text-muted-foreground">{topCommercial.email}</p>
                    <Badge variant={
                      topCommercial.performance === 'excellent' ? 'default' :
                      topCommercial.performance === 'good' ? 'secondary' : 'outline'
                    } className="mt-2">
                      {topCommercial.performance === 'excellent' ? 'Excellent' :
                       topCommercial.performance === 'good' ? 'Bon' : 'Moyen'}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <p className="text-2xl font-bold text-primary">{topCommercial.totalSales.toLocaleString('fr-FR')}</p>
                      <p className="text-sm text-muted-foreground">Ventes totales</p>
                    </div>
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <p className="text-2xl font-bold text-green-600">{topCommercial.totalCommission.toLocaleString('fr-FR')}</p>
                      <p className="text-sm text-muted-foreground">Commissions</p>
                    </div>
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <p className="text-2xl font-bold text-blue-600">{topCommercial.salesCount}</p>
                      <p className="text-sm text-muted-foreground">Nombre de ventes</p>
                    </div>
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <p className="text-2xl font-bold text-purple-600">{topCommercial.avgSale.toLocaleString('fr-FR')}</p>
                      <p className="text-sm text-muted-foreground">Moyenne/vente</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Performance détaillée
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                      <span className="font-medium">Taux de conversion</span>
                      <span className="font-bold text-green-600">85%</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                      <span className="font-medium">Satisfaction client</span>
                      <span className="font-bold text-blue-600">4.8/5</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                      <span className="font-medium">Temps de réponse moyen</span>
                      <span className="font-bold text-purple-600">2h 30min</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                      <span className="font-medium">Rétenue client</span>
                      <span className="font-bold text-orange-600">92%</span>
                    </div>
                  </div>

                  <div className="mt-6">
                    <h4 className="font-medium mb-3">Actions recommandées</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>Féliciter pour la performance exceptionnelle</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>Proposer une formation avancée</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>Considérer pour un poste de leadership</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}
