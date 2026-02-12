import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle, Copy, Eye, EyeOff, ArrowLeft, Download, Share2 } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

interface UserCredentials {
  email: string;
  password: string;
  name: string;
  role: string;
  referralCode?: string;
  createdAt: string;
}

export default function UserCredentialsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(false);
  const [credentials, setCredentials] = useState<UserCredentials | null>(null);

  useEffect(() => {
    // Récupérer les données depuis le state de navigation
    const state = location.state as { credentials: UserCredentials };
    if (state?.credentials) {
      setCredentials(state.credentials);
    } else {
      // Rediriger si pas de données
      navigate('/dashboard');
    }
  }, [location.state, navigate]);

  const handleCopy = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleDownload = () => {
    if (!credentials) return;

    const content = `
IDENTIFIANTS DE CONNEXION
=====================

UTILISATEUR
---------
Nom: ${credentials.name}
Email: ${credentials.email}
Mot de passe: ${credentials.password}
Rôle: ${credentials.role}
Code de parrainage: ${credentials.referralCode || 'N/A'}
Date de création: ${new Date(credentials.createdAt).toLocaleDateString('fr-CM')}

INSTRUCTIONS DE CONNEXION
-------------------------
1. Allez sur la page de connexion
2. Entrez votre email: ${credentials.email}
3. Entrez votre mot de passe: ${credentials.password}
4. Cliquez sur "Se connecter"

IMPORTANT
---------
- Gardez ces informations en sécurité
- Changez votre mot de passe lors de la première connexion
- Ne partagez jamais votre mot de passe avec des tiers

Pour toute assistance, contactez le support technique.
    `.trim();

    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `identifiants-${credentials.email.replace(/[^a-zA-Z0-9]/g, '_')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const handleShare = async () => {
    if (!credentials) return;

    const shareData = {
      title: 'Identifiants de connexion',
      text: `Email: ${credentials.email}\nMot de passe: ${credentials.password}`,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.error('Failed to share:', err);
      }
    } else {
      await handleCopy(`${shareData.text}`, 'credentials');
    }
  };

  if (!credentials) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <p className="text-muted-foreground">Chargement...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <PageHeader
        title="Identifiants de connexion"
        description="Informations de connexion du nouvel utilisateur"
        icon={<CheckCircle className="w-6 h-6" />}
        actions={
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour
          </Button>
        }
      />

      <div className="max-w-4xl mx-auto space-y-6">
        {/* Alert de succès */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Le compte a été créé avec succès ! Voici les identifiants de connexion.
            </AlertDescription>
          </Alert>
        </motion.div>

        {/* Carte principale */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card className="border-2 border-green-200 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-600 text-white">
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Compte créé avec succès
              </CardTitle>
              <CardDescription>
                Veuillez conserver ces informations précieusement
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {/* Informations utilisateur */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Nom complet</label>
                    <p className="text-lg font-semibold">{credentials.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Rôle</label>
                    <Badge variant="outline" className="text-sm">
                      {credentials.role}
                    </Badge>
                  </div>
                  {credentials.referralCode && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Code de parrainage</label>
                      <div className="flex items-center gap-2">
                        <p className="font-mono bg-gray-100 px-3 py-1 rounded text-sm">
                          {credentials.referralCode}
                        </p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopy(credentials.referralCode!, 'referral')}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Email</label>
                    <div className="flex items-center gap-2">
                      <p className="text-lg font-mono">{credentials.email}</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopy(credentials.email, 'email')}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Mot de passe</label>
                    <div className="flex items-center gap-2">
                      <p className="text-lg font-mono">
                        {showPassword ? credentials.password : '•••••••••'}
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopy(credentials.password, 'password')}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t">
                <Button
                  variant="outline"
                  onClick={handleDownload}
                  className="flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Télécharger
                </Button>
                <Button
                  variant="outline"
                  onClick={handleShare}
                  className="flex items-center gap-2"
                >
                  <Share2 className="w-4 h-4" />
                  Partager
                </Button>
                <Button
                  onClick={() => navigate(-1)}
                  className="forge-button-primary"
                >
                  Terminer
                </Button>
              </div>

              {/* Message de copie */}
              {copied && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-sm text-green-600 font-medium text-center"
                >
                  Copié dans le presse-papiers !
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Instructions */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Instructions de connexion</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ol className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="font-semibold text-green-600">1.</span>
                  <span>Allez sur la page de connexion de la plateforme</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-semibold text-green-600">2.</span>
                  <span>Entrez votre email : <strong>{credentials.email}</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-semibold text-green-600">3.</span>
                  <span>Entrez votre mot de passe : <strong>{showPassword ? credentials.password : '•••••••••'}</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-semibold text-green-600">4.</span>
                  <span>Cliquez sur "Se connecter"</span>
                </li>
              </ol>
              
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <h4 className="font-semibold text-amber-800 mb-2">⚠️ Important</h4>
                <ul className="text-sm text-amber-700 space-y-1">
                  <li>• Conservez ces informations en sécurité</li>
                  <li>• Changez votre mot de passe lors de la première connexion</li>
                  <li>• Ne partagez jamais votre mot de passe avec des tiers</li>
                  <li>• Contactez le support technique en cas de problème</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
