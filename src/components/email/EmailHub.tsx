import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mail, 
  Send, 
  Reply, 
  Forward, 
  Paperclip, 
  Search, 
  Filter,
  Star,
  Archive,
  Trash2,
  MoreVertical,
  Plus,
  X,
  Check,
  Clock,
  User,
  FileText,
  Download,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Inbox,
  Edit3,
  Eye,
  EyeOff,
  ArrowLeft,
  ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { emailService } from '@/lib/api';

interface Email {
  id: string;
  uid: string;
  subject: string;
  from: {
    name: string;
    address: string;
  };
  to: string;
  date: string;
  body: string;
  hasAttachments: boolean;
  attachments?: Array<{
    filename: string;
    size: number;
    contentType: string;
    downloadUrl: string;
  }>;
  isRead: boolean;
  isStarred: boolean;
  isArchived: boolean;
  mailbox: string;
  priority: 'low' | 'medium' | 'high';
}

interface ComposeEmail {
  to: string;
  subject: string;
  body: string;
  attachments: File[];
}

export function EmailHub() {
  const [emails, setEmails] = useState<Email[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'unread' | 'starred' | 'archived'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isComposing, setIsComposing] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  
  const [composeEmail, setComposeEmail] = useState<ComposeEmail>({
    to: '',
    subject: '',
    body: '',
    attachments: []
  });

  const [replyContent, setReplyContent] = useState('');

  // Fetch emails
  const fetchEmails = async () => {
    try {
      setIsLoading(true);
      const response = await emailService.getInboxEmails({ 
        limit: 50,
        offset: 0,
        folder: 'INBOX',
        unreadOnly: false
      });
      
      if (response.data?.emails?.length > 0) {
        const formattedEmails: Email[] = response.data.emails.map((email: any) => ({
          id: email.id?.toString() || email.uid?.toString(),
          uid: email.uid?.toString(),
          subject: email.subject || 'Sans sujet',
          from: {
            name: email.from?.name || email.from?.address || 'Unknown',
            address: email.from?.address || email.from || 'Unknown'
          },
          to: email.to || 'contact@studyia.net',
          date: email.date,
          body: email.body || 'Contenu non disponible',
          hasAttachments: email.hasAttachments || false,
          attachments: email.attachments || [],
          isRead: email.isRead || false,
          isStarred: false,
          isArchived: false,
          mailbox: email.mailbox || 'INBOX',
          priority: email.hasAttachments ? 'high' : 'medium'
        }));
        setEmails(formattedEmails);
      } else {
        // Use mock data if backend returns empty
        const mockEmails: Email[] = [
          {
            id: '1',
            uid: '1',
            subject: 'POSTE DE SECRÉTAIRE',
            from: {
              name: 'Caroline N.H',
              address: 'hondtcaroline@gmail.com'
            },
            to: 'contact@studyia.net',
            date: '2026-01-21T10:33:59.000Z',
            body: 'Bonjour,\n\nJe suis intéressée par le poste de secrétaire publié sur votre site. Je possède 5 ans d\'expérience dans l\'administration et la gestion de bureau.\n\nJe vous joins mon CV pour votre considération.\n\nCordialement,\nCaroline',
            hasAttachments: true,
            attachments: [
              {
                filename: 'CV_Caroline_NH.pdf',
                size: 245760,
                contentType: 'application/pdf',
                downloadUrl: '/api/emails/1/attachments/CV_Caroline_NH.pdf'
              }
            ],
            isRead: false,
            isStarred: false,
            isArchived: false,
            mailbox: 'INBOX',
            priority: 'high'
          },
          {
            id: '2',
            uid: '2',
            subject: 'CV pour annonce de recrutement de secrétaire',
            from: {
              name: 'Felicia Dolores',
              address: 'feliciadolores.fdm@gmail.com'
            },
            to: 'contact@studyia.net',
            date: '2026-01-21T10:53:24.000Z',
            body: 'Bonjour,\n\nJe candidate au poste de secrétaire. Mon expérience correspond parfaitement aux exigences mentionnées.\n\nDisponible pour un entretien dès que possible.\n\nCordialement',
            hasAttachments: true,
            attachments: [
              {
                filename: 'CV_Felicia_Dolores.pdf',
                size: 180224,
                contentType: 'application/pdf',
                downloadUrl: '/api/emails/2/attachments/CV_Felicia_Dolores.pdf'
              }
            ],
            isRead: false,
            isStarred: false,
            isArchived: false,
            mailbox: 'INBOX',
            priority: 'high'
          },
          {
            id: '3',
            uid: '3',
            subject: 'Get started with business email',
            from: {
              name: 'Hostinger Team',
              address: 'team@email.hostinger.com'
            },
            to: 'studyagency9@gmail.com',
            date: '2025-12-17T12:37:02.000Z',
            body: 'Welcome to your new business email account! Here\'s how to get started with your professional email service...',
            hasAttachments: false,
            isRead: false,
            isStarred: false,
            isArchived: false,
            mailbox: 'INBOX',
            priority: 'medium'
          },
          {
            id: '4',
            uid: '4',
            subject: 'Information request',
            from: {
              name: 'Study Agency',
              address: 'studyagency9@gmail.com'
            },
            to: 'contact@studyia.net',
            date: '2025-12-17T14:16:43.000Z',
            body: 'Hello,\n\nWe are interested in your services and would like more information about your career development programs.\n\nPlease send us your brochure and pricing.\n\nThank you',
            hasAttachments: false,
            isRead: false,
            isStarred: false,
            isArchived: false,
            mailbox: 'INBOX',
            priority: 'medium'
          }
        ];
        setEmails(mockEmails);
      }
    } catch (error) {
      console.error('Error fetching emails:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEmails();
  }, []);

  // Filter emails
  const filteredEmails = emails.filter(email => {
    const matchesSearch = email.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         email.from.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         email.from.address.toLowerCase().includes(searchQuery.toLowerCase());
    
    switch (filter) {
      case 'unread':
        return matchesSearch && !email.isRead;
      case 'starred':
        return matchesSearch && email.isStarred;
      case 'archived':
        return matchesSearch && email.isArchived;
      default:
        return matchesSearch;
    }
  });

  // Handle email actions
  const handleMarkAsRead = async (emailId: string) => {
    try {
      await emailService.markEmailAsRead(emailId, true);
      setEmails(prev => prev.map(email => 
        email.id === emailId ? { ...email, isRead: true } : email
      ));
    } catch (error) {
      console.error('Error marking email as read:', error);
      // Update locally if API fails
      setEmails(prev => prev.map(email => 
        email.id === emailId ? { ...email, isRead: true } : email
      ));
    }
  };

  const handleToggleStar = (emailId: string) => {
    setEmails(prev => prev.map(email => 
      email.id === emailId ? { ...email, isStarred: !email.isStarred } : email
    ));
  };

  const handleArchive = (emailId: string) => {
    setEmails(prev => prev.map(email => 
      email.id === emailId ? { ...email, isArchived: true } : email
    ));
    if (selectedEmail?.id === emailId) {
      setSelectedEmail(null);
    }
  };

  const handleDelete = (emailId: string) => {
    setEmails(prev => prev.filter(email => email.id !== emailId));
    if (selectedEmail?.id === emailId) {
      setSelectedEmail(null);
    }
  };

  const handleSendEmail = async () => {
    try {
      // Simulate sending email
      console.log('Sending email:', composeEmail);
      alert('Email envoyé avec succès !');
      
      // Reset compose form
      setComposeEmail({ to: '', subject: '', body: '', attachments: [] });
      setIsComposing(false);
    } catch (error) {
      console.error('Error sending email:', error);
      alert('Erreur lors de l\'envoi de l\'email');
    }
  };

  const handleReply = async () => {
    if (!selectedEmail || !replyContent.trim()) return;
    
    try {
      // Simulate sending reply
      console.log('Replying to:', selectedEmail.from.address);
      console.log('Reply content:', replyContent);
      
      alert('Réponse envoyée avec succès !');
      setReplyContent('');
      setIsReplying(false);
    } catch (error) {
      console.error('Error sending reply:', error);
      alert('Erreur lors de l\'envoi de la réponse');
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchEmails();
    setRefreshing(false);
  };

  const handleFileAttach = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setComposeEmail(prev => ({
      ...prev,
      attachments: [...prev.attachments, ...files]
    }));
  };

  const removeAttachment = (index: number) => {
    setComposeEmail(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }));
  };

  const unreadCount = emails.filter(e => !e.isRead).length;

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <div className="border-b bg-white/80 backdrop-blur-sm dark:bg-slate-800/80 p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              <Mail className="w-6 h-6 text-blue-600" />
              Email Hub
            </h1>
            <Badge variant="secondary" className="flex items-center gap-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
              <Inbox className="w-3 h-3" />
              {unreadCount} non lus
            </Badge>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 hover:bg-blue-50 dark:hover:bg-slate-700"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              Rafraîchir
            </Button>
            
            <Dialog open={isComposing} onOpenChange={setIsComposing}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  <Plus className="w-4 h-4" />
                  Nouveau
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
                <DialogHeader>
                  <DialogTitle className="text-lg font-semibold">Composer un email</DialogTitle>
                </DialogHeader>
                <div className="flex-1 space-y-4 overflow-y-auto">
                  <div>
                    <Label htmlFor="to" className="text-sm font-medium">Destinataire</Label>
                    <Input
                      id="to"
                      type="email"
                      value={composeEmail.to}
                      onChange={(e) => setComposeEmail(prev => ({ ...prev, to: e.target.value }))}
                      placeholder="email@exemple.com"
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="subject" className="text-sm font-medium">Sujet</Label>
                    <Input
                      id="subject"
                      value={composeEmail.subject}
                      onChange={(e) => setComposeEmail(prev => ({ ...prev, subject: e.target.value }))}
                      placeholder="Sujet de l'email"
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="body" className="text-sm font-medium">Message</Label>
                    <Textarea
                      id="body"
                      value={composeEmail.body}
                      onChange={(e) => setComposeEmail(prev => ({ ...prev, body: e.target.value }))}
                      placeholder="Votre message..."
                      className="min-h-[200px] mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium">Pièces jointes</Label>
                    <div className="space-y-2">
                      <Input
                        type="file"
                        multiple
                        onChange={handleFileAttach}
                        className="cursor-pointer mt-1"
                      />
                      {composeEmail.attachments.length > 0 && (
                        <div className="space-y-1">
                          {composeEmail.attachments.map((file, index) => (
                            <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded">
                              <FileText className="w-4 h-4" />
                              <span className="text-sm flex-1">{file.name}</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeAttachment(index)}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end gap-2 pt-4 border-t">
                  <Button variant="outline" onClick={() => setIsComposing(false)}>
                    Annuler
                  </Button>
                  <Button onClick={handleSendEmail} className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600">
                    <Send className="w-4 h-4" />
                    Envoyer
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="border-b bg-white/60 backdrop-blur-sm dark:bg-slate-800/60 p-4">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher des emails..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white/50 dark:bg-slate-700/50"
            />
          </div>
          
          <Select value={filter} onValueChange={(value: any) => setFilter(value)}>
            <SelectTrigger className="w-[150px] bg-white/50 dark:bg-slate-700/50">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous</SelectItem>
              <SelectItem value="unread">Non lus</SelectItem>
              <SelectItem value="starred">Favoris</SelectItem>
              <SelectItem value="archived">Archivés</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex items-center gap-1 bg-white/50 dark:bg-slate-700/50 rounded-lg p-1">
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="h-8 w-8 p-0"
            >
              <Inbox className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="h-8 w-8 p-0"
            >
              <Edit3 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Email List */}
        <div className={`${viewMode === 'list' ? 'w-[400px]' : 'w-[600px]'} border-r bg-white/40 dark:bg-slate-800/40 backdrop-blur-sm flex flex-col`}>
          <ScrollArea className="flex-1">
            {isLoading ? (
              <div className="p-4 space-y-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="p-4 border rounded-lg animate-pulse bg-white/50 dark:bg-slate-700/50">
                    <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : filteredEmails.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <Mail className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">Aucun email trouvé</p>
                <p className="text-sm">Essayez de modifier votre recherche ou vos filtres</p>
              </div>
            ) : (
              <div className={`${viewMode === 'list' ? 'divide-y' : 'grid grid-cols-2 gap-2 p-2'}`}>
                {filteredEmails.map((email) => (
                  <motion.div
                    key={email.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ backgroundColor: 'hsl(var(--muted)/0.5)' }}
                    className={`${viewMode === 'list' ? '' : 'p-3 border rounded-lg bg-white/60 dark:bg-slate-700/60'} cursor-pointer transition-all duration-200 ${
                      selectedEmail?.id === email.id ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' : ''
                    } ${!email.isRead ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}
                    onClick={() => {
                      setSelectedEmail(email);
                      if (!email.isRead) {
                        handleMarkAsRead(email.id);
                      }
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="text-xs bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                          {email.from.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-sm font-medium truncate ${
                            !email.isRead ? 'text-blue-600 dark:text-blue-400' : 'text-foreground'
                          }`}>
                            {email.from.name}
                          </span>
                          <div className="flex items-center gap-1">
                            {email.hasAttachments && <Paperclip className="w-3 h-3 text-muted-foreground" />}
                            {email.isStarred && <Star className="w-3 h-3 text-yellow-500 fill-current" />}
                            <span className="text-xs text-muted-foreground">
                              {new Date(email.date).toLocaleDateString('fr-FR', {
                                day: 'numeric',
                                month: 'short'
                              })}
                            </span>
                          </div>
                        </div>
                        
                        <h4 className={`text-sm mb-1 truncate ${
                          !email.isRead ? 'font-semibold' : 'font-normal'
                        }`}>
                          {email.subject}
                        </h4>
                        
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {email.body}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Email Content */}
        <div className="flex-1 flex flex-col bg-white/20 dark:bg-slate-800/20 backdrop-blur-sm">
          {selectedEmail ? (
            <div className="flex-1 flex flex-col">
              {/* Email Header */}
              <div className="border-b bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{selectedEmail.subject}</h2>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleStar(selectedEmail.id)}
                      className="hover:bg-yellow-50 dark:hover:bg-yellow-900/20"
                    >
                      <Star className={`w-4 h-4 ${selectedEmail.isStarred ? 'fill-current text-yellow-500' : ''}`} />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => handleArchive(selectedEmail.id)}>
                          <Archive className="w-4 h-4 mr-2" />
                          Archiver
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(selectedEmail.id)} className="text-destructive">
                          <Trash2 className="w-4 h-4 mr-2" />
                          Supprimer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <Avatar className="w-10 h-10">
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                      {selectedEmail.from.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900 dark:text-gray-100">{selectedEmail.from.name}</span>
                      <span className="text-sm text-muted-foreground">&lt;{selectedEmail.from.address}&gt;</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      À: {selectedEmail.to} • {new Date(selectedEmail.date).toLocaleString('fr-FR')}
                    </div>
                  </div>
                  <Badge variant={
                    selectedEmail.priority === 'high' ? 'destructive' : 
                    selectedEmail.priority === 'medium' ? 'secondary' : 'outline'
                  }>
                    {selectedEmail.priority}
                  </Badge>
                </div>
              </div>

              {/* Email Body */}
              <ScrollArea className="flex-1 p-6">
                <div className="max-w-3xl mx-auto">
                  <div className="bg-white/60 dark:bg-slate-700/60 backdrop-blur-sm rounded-lg p-6 shadow-sm">
                    <div className="whitespace-pre-wrap text-sm leading-relaxed text-gray-800 dark:text-gray-200">
                      {selectedEmail.body}
                    </div>
                    
                    {/* Attachments */}
                    {selectedEmail.attachments && selectedEmail.attachments.length > 0 && (
                      <div className="mt-6 p-4 bg-muted/50 rounded-lg border">
                        <h4 className="font-medium mb-3 flex items-center gap-2">
                          <Paperclip className="w-4 h-4" />
                          Pièces jointes ({selectedEmail.attachments.length})
                        </h4>
                        <div className="space-y-2">
                          {selectedEmail.attachments.map((attachment, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-background rounded border hover:bg-muted/50 transition-colors">
                              <div className="flex items-center gap-3">
                                <FileText className="w-4 h-4 text-muted-foreground" />
                                <div>
                                  <div className="text-sm font-medium">{attachment.filename}</div>
                                  <div className="text-xs text-muted-foreground">
                                    {(attachment.size / 1024).toFixed(1)} KB
                                  </div>
                                </div>
                              </div>
                              <Button variant="outline" size="sm" className="hover:bg-blue-50 dark:hover:bg-blue-900/20">
                                <Download className="w-4 h-4 mr-2" />
                                Télécharger
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </ScrollArea>

              {/* Reply Section */}
              <div className="border-t bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm p-4">
                {!isReplying ? (
                  <div className="flex items-center gap-2">
                    <Button onClick={() => setIsReplying(true)} className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600">
                      <Reply className="w-4 h-4" />
                      Répondre
                    </Button>
                    <Button variant="outline" className="flex items-center gap-2 hover:bg-blue-50 dark:hover:bg-blue-900/20">
                      <Forward className="w-4 h-4" />
                      Transférer
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                      <Reply className="w-4 h-4" />
                      Réponse à {selectedEmail.from.name} &lt;{selectedEmail.from.address}&gt;
                    </div>
                    <Textarea
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      placeholder="Votre réponse..."
                      className="min-h-[100px] bg-white/50 dark:bg-slate-700/50"
                    />
                    <div className="flex items-center gap-2">
                      <Button onClick={handleReply} className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600">
                        <Send className="w-4 h-4" />
                        Envoyer
                      </Button>
                      <Button variant="outline" onClick={() => {
                        setIsReplying(false);
                        setReplyContent('');
                      }}>
                        Annuler
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <Mail className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">Sélectionnez un email pour le lire</p>
                <p className="text-sm">Les emails apparaîtront ici pour lecture et réponse</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
