import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle, Copy, Eye, EyeOff, ArrowLeft, Download, Share2, FileText, Shield, User, Mail, Key, Calendar, Send, Globe, MapPin, Phone } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface UserCredentials {
  email: string;
  password: string;
  name: string;
  role: string;
  referralCode?: string;
  createdAt: string;
  plan?: string;
  planRenewalDate?: string;
  company?: string;
}

export default function UserCredentialsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(false);
  const [credentials, setCredentials] = useState<UserCredentials | null>(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const pdfRef = useRef<HTMLDivElement>(null);

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

  const handleDownloadPDF = async () => {
    if (!credentials || !pdfRef.current) return;
    
    setIsGeneratingPDF(true);
    try {
      // Créer un PDF avec jsPDF
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      // Couleurs du thème Studyia Career (bleu professionnel)
      const primaryBlue = [25, 55, 109] as [number, number, number]; // #19376D
      const lightBlue = [240, 248, 255] as [number, number, number]; // #F0F8FF
      const darkBlue = [15, 35, 75] as [number, number, number]; // #0F234B
      const gray = [71, 85, 105] as [number, number, number]; // #475569
      const accentGold = [212, 175, 55] as [number, number, number]; // #D4AF37
      
      // En-tête premium avec dégradé bleu
      pdf.setFillColor(...primaryBlue);
      pdf.rect(0, 0, pageWidth, 60, 'F');
      
      // Ligne décorative
      pdf.setFillColor(...accentGold);
      pdf.rect(0, 58, pageWidth, 2, 'F');
      
      // Titre premium
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(32);
      pdf.setFont('helvetica', 'bold');
      pdf.text('STUDYIA CAREER', pageWidth / 2, 25, { align: 'center' });
      
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'normal');
      pdf.text('Plateforme Professionnelle de Création de CV', pageWidth / 2, 35, { align: 'center' });
      
      pdf.setFontSize(12);
      pdf.text('Identifiants de Connexion Partenaire', pageWidth / 2, 45, { align: 'center' });
      
      // Ligne de séparation premium
      pdf.setDrawColor(255, 255, 255);
      pdf.setLineWidth(0.5);
      pdf.line(30, 52, pageWidth - 30, 52);
      
      // Réinitialiser les couleurs
      pdf.setTextColor(0, 0, 0);
      pdf.setFont('helvetica', 'normal');
      
      // Section Informations du Partenaire
      let yPosition = 80;
      
      // Titre de section avec fond premium
      pdf.setFillColor(...lightBlue);
      pdf.roundedRect(25, yPosition - 12, pageWidth - 50, 16, 3, 3, 'F');
      pdf.setTextColor(...darkBlue);
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('INFORMATIONS DU PARTENAIRE', pageWidth / 2, yPosition, { align: 'center' });
      
      yPosition += 25;
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      
      // Informations du partenaire avec mise en page premium
      const partnerInfo = [
        { label: 'Nom complet:', value: credentials.name || '', bold: true },
        { label: 'Entreprise:', value: credentials.company || '', bold: true },
        { label: 'Email professionnel:', value: credentials.email },
        { label: 'Rôle:', value: 'Partenaire Premium' },
        { label: 'Plan d\'abonnement:', value: credentials.plan ? credentials.plan.charAt(0).toUpperCase() + credentials.plan.slice(1) : 'Starter' },
        { label: 'Code de parrainage:', value: credentials.referralCode || 'N/A' },
        { label: 'Date de début:', value: new Date(credentials.createdAt).toLocaleDateString('fr-CM', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        }) },
        { label: 'Date de fin d\'abonnement:', value: credentials.planRenewalDate ? 
          new Date(credentials.planRenewalDate).toLocaleDateString('fr-CM', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          }) : 
          new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('fr-CM', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })
        },
        { label: 'Généré le:', value: new Date().toLocaleDateString('fr-CM', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }) }
      ];
      
      partnerInfo.forEach(info => {
        pdf.setFont('helvetica', info.bold ? 'bold' : 'normal');
        pdf.text(info.label, 30, yPosition);
        pdf.setFont('helvetica', 'normal');
        pdf.text(info.value, 90, yPosition);
        yPosition += 10;
      });
      
      // Ligne de séparation premium
      yPosition += 15;
      pdf.setDrawColor(...gray);
      pdf.setLineWidth(0.5);
      pdf.line(30, yPosition, pageWidth - 30, yPosition);
      
      // Section Instructions de Connexion
      yPosition += 20;
      
      // Titre de section
      pdf.setFillColor(...lightBlue);
      pdf.roundedRect(25, yPosition - 12, pageWidth - 50, 16, 3, 3, 'F');
      pdf.setTextColor(...darkBlue);
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('PROCÉDURE DE CONNEXION', pageWidth / 2, yPosition, { align: 'center' });
      
      yPosition += 25;
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      
      const instructions = [
        '1. Accédez au site web : career.studyia.net',
        '2. Faites défiler jusqu\'en bas de la page d\'accueil',
        '3. Cliquez sur "Connexion Partenaire" dans le pied de page',
        '4. Saisissez vos identifiants de connexion :',
        `   • Email professionnel : ${credentials.email}`,
        `   • Mot de passe : ${credentials.password}`,
        '5. Cliquez sur "Se connecter" pour accéder à votre espace',
        '6. Vous serez redirigé vers votre tableau de bord partenaire'
      ];
      
      instructions.forEach(instruction => {
        if (instruction.includes('Email') || instruction.includes('Mot de passe')) {
          pdf.setFont('helvetica', 'bold');
        } else {
          pdf.setFont('helvetica', 'normal');
        }
        pdf.text(instruction, 30, yPosition);
        yPosition += 8;
      });
      
      // Section Avantages Premium
      yPosition += 15;
      
      // Titre de section
      pdf.setFillColor(...accentGold);
      pdf.roundedRect(25, yPosition - 12, pageWidth - 50, 16, 3, 3, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('AVANTAGES DE VOTRE ABONNEMENT', pageWidth / 2, yPosition, { align: 'center' });
      
      yPosition += 25;
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      
      const benefits = [
        '• Accès illimité à la plateforme de création de CV',
        '• Templates de CV professionnels et modernes',
        '• Personnalisation avancée avec votre branding',
        '• Exportation en multiple formats (PDF, Word, etc.)',
        '• Suivi des statistiques de consultation',
        '• Support prioritaire 24/7',
        '• Mises à jour automatiques des templates'
      ];
      
      benefits.forEach(benefit => {
        pdf.text(benefit, 30, yPosition);
        yPosition += 7;
      });
      
      // Section Informations importantes
      yPosition += 15;
      
      // Titre de section
      pdf.setFillColor(220, 38, 38); // Rouge pour l'attention
      pdf.roundedRect(25, yPosition - 12, pageWidth - 50, 16, 3, 3, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('⚠ INFORMATIONS DE SÉCURITÉ', pageWidth / 2, yPosition, { align: 'center' });
      
      yPosition += 25;
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      
      const importantNotes = [
        '• Conservez ces informations dans un endroit sécurisé et confidentiel',
        '• Modifiez votre mot de passe lors de votre première connexion',
        '• Ne partagez jamais vos identifiants avec des tiers non autorisés',
        '• En cas de suspicion de compromission, contactez-nous immédiatement',
        '• Votre abonnement est renouvelable automatiquement chaque mois',
        '• Vous pouvez résilier votre abonnement à tout moment depuis votre espace'
      ];
      
      importantNotes.forEach(note => {
        pdf.text(note, 30, yPosition);
        yPosition += 7;
      });
      
      // Pied de page premium
      const footerY = pageHeight - 40;
      
      // Ligne décorative
      pdf.setFillColor(...accentGold);
      pdf.rect(0, footerY - 2, pageWidth, 2, 'F');
      
      // Fond pied de page
      pdf.setFillColor(...primaryBlue);
      pdf.rect(0, footerY, pageWidth, 40, 'F');
      
      // Informations de contact
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('STUDYIA CAREER', pageWidth / 2, footerY + 10, { align: 'center' });
      
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      pdf.text('Plateforme Professionnelle de Création de CV', pageWidth / 2, footerY + 18, { align: 'center' });
      pdf.text('career.studyia.net | Douala, Cameroun', pageWidth / 2, footerY + 25, { align: 'center' });
      pdf.text('contact@studyia.net | +237 671373978 / +237 686430454', pageWidth / 2, footerY + 32, { align: 'center' });
      
      // Télécharger le PDF avec nom de fichier professionnel
      const fileName = `Studyia-Credentials-${credentials.name?.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);
      
    } catch (error) {
      console.error('Erreur lors de la génération du PDF:', error);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleSendEmail = async () => {
    if (!credentials) return;
    
    setIsSendingEmail(true);
    try {
      // Générer le PDF en mémoire
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      // Couleurs du thème Studyia Career (bleu professionnel)
      const primaryBlue = [25, 55, 109] as [number, number, number];
      const lightBlue = [240, 248, 255] as [number, number, number];
      const darkBlue = [15, 35, 75] as [number, number, number];
      const gray = [71, 85, 105] as [number, number, number];
      const accentGold = [212, 175, 55] as [number, number, number];
      
      // En-tête premium
      pdf.setFillColor(...primaryBlue);
      pdf.rect(0, 0, pageWidth, 60, 'F');
      pdf.setFillColor(...accentGold);
      pdf.rect(0, 58, pageWidth, 2, 'F');
      
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(32);
      pdf.setFont('helvetica', 'bold');
      pdf.text('STUDYIA CAREER', pageWidth / 2, 25, { align: 'center' });
      
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'normal');
      pdf.text('Plateforme Professionnelle de Création de CV', pageWidth / 2, 35, { align: 'center' });
      pdf.setFontSize(12);
      pdf.text('Identifiants de Connexion Partenaire', pageWidth / 2, 45, { align: 'center' });
      
      pdf.setDrawColor(255, 255, 255);
      pdf.setLineWidth(0.5);
      pdf.line(30, 52, pageWidth - 30, 52);
      
      pdf.setTextColor(0, 0, 0);
      pdf.setFont('helvetica', 'normal');
      
      // Section Informations du Partenaire
      let yPosition = 80;
      pdf.setFillColor(...lightBlue);
      pdf.roundedRect(25, yPosition - 12, pageWidth - 50, 16, 3, 3, 'F');
      pdf.setTextColor(...darkBlue);
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('INFORMATIONS DU PARTENAIRE', pageWidth / 2, yPosition, { align: 'center' });
      
      yPosition += 25;
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      
      const partnerInfo = [
        { label: 'Nom complet:', value: credentials.name || '', bold: true },
        { label: 'Entreprise:', value: credentials.company || '', bold: true },
        { label: 'Email professionnel:', value: credentials.email },
        { label: 'Rôle:', value: 'Partenaire Premium' },
        { label: 'Plan d\'abonnement:', value: credentials.plan ? credentials.plan.charAt(0).toUpperCase() + credentials.plan.slice(1) : 'Starter' },
        { label: 'Code de parrainage:', value: credentials.referralCode || 'N/A' },
        { label: 'Date de début:', value: new Date(credentials.createdAt).toLocaleDateString('fr-CM', { 
          weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
        }) },
        { label: 'Date de fin d\'abonnement:', value: credentials.planRenewalDate ? 
          new Date(credentials.planRenewalDate).toLocaleDateString('fr-CM', { 
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
          }) : 
          new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('fr-CM', { 
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
          })
        }
      ];
      
      partnerInfo.forEach(info => {
        pdf.setFont('helvetica', info.bold ? 'bold' : 'normal');
        pdf.text(info.label, 30, yPosition);
        pdf.setFont('helvetica', 'normal');
        pdf.text(info.value, 90, yPosition);
        yPosition += 10;
      });
      
      // Pied de page
      const footerY = pageHeight - 40;
      pdf.setFillColor(...accentGold);
      pdf.rect(0, footerY - 2, pageWidth, 2, 'F');
      pdf.setFillColor(...primaryBlue);
      pdf.rect(0, footerY, pageWidth, 40, 'F');
      
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('STUDYIA CAREER', pageWidth / 2, footerY + 10, { align: 'center' });
      
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      pdf.text('Plateforme Professionnelle de Création de CV', pageWidth / 2, footerY + 18, { align: 'center' });
      pdf.text('career.studyia.net | Douala, Cameroun', pageWidth / 2, footerY + 25, { align: 'center' });
      pdf.text('contact@studyia.net | +237 671373978 / +237 686430454', pageWidth / 2, footerY + 32, { align: 'center' });
      
      // Convertir le PDF en Blob
      const pdfBlob = pdf.output('blob');
      
      // Créer le FormData pour l'envoi
      const formData = new FormData();
      formData.append('to', credentials.email);
      formData.append('subject', 'Vos Identifiants de Connexion Studyia Career');
      formData.append('html', `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #19376D, #0F234B); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0; font-size: 28px; font-weight: bold;">STUDYIA CAREER</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Plateforme Professionnelle de Création de CV</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef;">
            <h2 style="color: #19376D; margin-top: 0;">Bienvenue chez Studyia Career !</h2>
            <p style="color: #6c757d; line-height: 1.6;">Nous sommes ravis de vous accueillir en tant que partenaire premium. Vos identifiants de connexion sont ci-joints en format PDF pour une conservation sécurisée.</p>
            
            <div style="background: #e3f2fd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #19376D;">
              <h3 style="color: #19376D; margin-top: 0;">📋 Vos Informations</h3>
              <p style="margin: 5px 0;"><strong>Nom:</strong> ${credentials.name}</p>
              <p style="margin: 5px 0;"><strong>Email:</strong> ${credentials.email}</p>
              <p style="margin: 5px 0;"><strong>Plan:</strong> ${credentials.plan ? credentials.plan.charAt(0).toUpperCase() + credentials.plan.slice(1) : 'Starter'}</p>
              <p style="margin: 5px 0;"><strong>Date de fin d'abonnement:</strong> ${credentials.planRenewalDate ? 
                new Date(credentials.planRenewalDate).toLocaleDateString('fr-CM', { 
                  weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
                }) : 
                new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('fr-CM', { 
                  weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
                })
              }</p>
            </div>
            
            <div style="background: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #d4af37;">
              <h3 style="color: #856404; margin-top: 0;">🔐 Procédure de Connexion</h3>
              <ol style="color: #856404; line-height: 1.6; padding-left: 20px;">
                <li>Accédez au site: <a href="https://career.studyia.net" style="color: #19376D; text-decoration: none;">career.studyia.net</a></li>
                <li>Faites défiler jusqu'en bas de la page</li>
                <li>Cliquez sur "Connexion Partenaire"</li>
                <li>Entrez votre email: <strong>${credentials.email}</strong></li>
                <li>Entrez votre mot de passe: <strong>${credentials.password}</strong></li>
                <li>Cliquez sur "Se connecter"</li>
              </ol>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <p style="color: #6c757d; font-size: 14px;">Cet email contient vos identifiants confidentiels. Veuillez le conserver en sécurité.</p>
            </div>
          </div>
          
          <div style="background: #19376D; color: white; padding: 20px; text-align: center; border-radius: 10px; margin-top: 20px;">
            <p style="margin: 5px 0; font-weight: bold;">STUDYIA CAREER</p>
            <p style="margin: 5px 0; font-size: 12px;">Plateforme Professionnelle de Création de CV</p>
            <p style="margin: 5px 0; font-size: 11px;">career.studyia.net | Douala, Cameroun</p>
            <p style="margin: 5px 0; font-size: 11px;">contact@studyia.net | +237 671373978 / +237 686430454</p>
          </div>
        </div>
      `);
      formData.append('attachments', pdfBlob, `Studyia-Credentials-${credentials.name?.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`);
      
      // Envoyer l'email via l'API
      const response = await fetch('https://studyiacareer-backend-qpmpz.ondigitalocean.app/api/send-email', {
        method: 'POST',
        body: formData
      });
      
      if (response.ok) {
        alert('Email envoyé avec succès à ' + credentials.email);
      } else {
        throw new Error('Erreur lors de l\'envoi de l\'email');
      }
      
    } catch (error) {
      console.error('Erreur lors de l\'envoi de l\'email:', error);
      alert('Erreur lors de l\'envoi de l\'email. Veuillez réessayer.');
    } finally {
      setIsSendingEmail(false);
    }
  };

  const handleDownloadTXT = () => {
    if (!credentials) return;

    const content = `
IDENTIFIANTS DE CONNEXION - STUDYIA CAREER
==========================================

INFORMATIONS DU PARTENAIRE
------------------------
Nom complet: ${credentials.name}
Entreprise: ${credentials.company || 'N/A'}
Email professionnel: ${credentials.email}
Rôle: Partenaire Premium
Plan d'abonnement: ${credentials.plan ? credentials.plan.charAt(0).toUpperCase() + credentials.plan.slice(1) : 'Starter'}
Code de parrainage: ${credentials.referralCode || 'N/A'}
Date de début: ${new Date(credentials.createdAt).toLocaleDateString('fr-CM', { 
  weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
})}
Date de fin d'abonnement: ${credentials.planRenewalDate ? 
  new Date(credentials.planRenewalDate).toLocaleDateString('fr-CM', { 
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
  }) : 
  new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('fr-CM', { 
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
  })
}

PROCÉDURE DE CONNEXION
---------------------
1. Accédez au site web : career.studyia.net
2. Faites défiler jusqu'en bas de la page d'accueil
3. Cliquez sur "Connexion Partenaire" dans le pied de page
4. Saisissez vos identifiants de connexion :
   • Email professionnel : ${credentials.email}
   • Mot de passe : ${credentials.password}
5. Cliquez sur "Se connecter" pour accéder à votre espace
6. Vous serez redirigé vers votre tableau de bord partenaire

AVANTAGES DE VOTRE ABONNEMENT
------------------------------
• Accès illimité à la plateforme de création de CV
• Templates de CV professionnels et modernes
• Personnalisation avancée avec votre branding
• Exportation en multiple formats (PDF, Word, etc.)
• Suivi des statistiques de consultation
• Support prioritaire 24/7
• Mises à jour automatiques des templates

⚠ INFORMATIONS DE SÉCURITÉ
---------------------------
• Conservez ces informations dans un endroit sécurisé et confidentiel
• Modifiez votre mot de passe lors de votre première connexion
• Ne partagez jamais vos identifiants avec des tiers non autorisés
• En cas de suspicion de compromission, contactez-nous immédiatement
• Votre abonnement est renouvelable automatiquement chaque mois
• Vous pouvez résilier votre abonnement à tout moment depuis votre espace

POUR NOUS CONTACTER
------------------
Site web : career.studyia.net
Location : Douala, Cameroun
Email : contact@studyia.net
Téléphone : +237 671373978 / +237 686430454

Plateforme Professionnelle de Création de CV
    `.trim();

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Studyia-Credentials-${credentials.name?.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const handleShare = async () => {
    if (!credentials) return;

    const shareData = {
      title: 'Identifiants de connexion Studyia Career',
      text: `Email: ${credentials.email}\nMot de passe: ${credentials.password}\nSite: career.studyia.net`,
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

      <div className="max-w-5xl mx-auto space-y-8">
        {/* Alert de succès */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Alert className="border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 shadow-lg">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <AlertDescription className="text-green-800 font-medium">
              🎉 Le compte a été créé avec succès ! Voici les identifiants de connexion.
            </AlertDescription>
          </Alert>
        </motion.div>

        {/* Carte principale améliorée */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card className="border-2 border-green-200 shadow-xl overflow-hidden">
            {/* En-tête avec dégradé */}
            <div className="bg-gradient-to-r from-green-500 via-emerald-500 to-teal-600 p-8 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-3 text-2xl">
                    <div className="bg-white/20 p-3 rounded-full">
                      <CheckCircle className="w-6 h-6" />
                    </div>
                    Compte créé avec succès
                  </CardTitle>
                  <CardDescription className="text-green-50 mt-2 text-lg">
                    Veuillez conserver ces informations précieusement
                  </CardDescription>
                </div>
                <div className="bg-white/20 p-4 rounded-full">
                  <Shield className="w-8 h-8" />
                </div>
              </div>
            </div>
            
            <CardContent className="p-8" ref={pdfRef}>
              {/* Informations utilisateur avec design amélioré */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Colonne gauche */}
                <div className="space-y-6">
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="bg-blue-500 p-2 rounded-lg">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="font-semibold text-blue-900">Informations personnelles</h3>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-blue-700">Nom complet</label>
                        <p className="text-lg font-semibold text-gray-900">{credentials.name}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-blue-700">Rôle</label>
                        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">
                          {credentials.role}
                        </Badge>
                      </div>
                      {credentials.referralCode && (
                        <div>
                          <label className="text-sm font-medium text-blue-700">Code de parrainage</label>
                          <div className="flex items-center gap-2 mt-1">
                            <p className="font-mono bg-white px-4 py-2 rounded-lg border border-blue-200 text-sm">
                              {credentials.referralCode}
                            </p>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleCopy(credentials.referralCode!, 'referral')}
                              className="border-blue-200 hover:bg-blue-50"
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Colonne droite */}
                <div className="space-y-6">
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="bg-green-500 p-2 rounded-lg">
                        <Key className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="font-semibold text-green-900">Identifiants de connexion</h3>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-green-700">Email</label>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border border-green-200 flex-1">
                            <Mail className="w-4 h-4 text-green-600" />
                            <p className="font-mono text-sm">{credentials.email}</p>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCopy(credentials.email, 'email')}
                            className="border-green-200 hover:bg-green-50"
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-green-700">Mot de passe</label>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border border-green-200 flex-1">
                            <Key className="w-4 h-4 text-green-600" />
                            <p className="font-mono text-sm">
                              {showPassword ? credentials.password : '•••••••••'}
                            </p>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowPassword(!showPassword)}
                            className="border-green-200 hover:bg-green-50"
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCopy(credentials.password, 'password')}
                            className="border-green-200 hover:bg-green-50"
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions améliorées */}
              <div className="flex flex-col sm:flex-row gap-4 pt-8 border-t border-gray-200">
                <Button
                  variant="outline"
                  onClick={handleDownloadPDF}
                  disabled={isGeneratingPDF}
                  className="flex items-center gap-2 border-red-200 hover:bg-red-50 text-red-700"
                >
                  {isGeneratingPDF ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                      Génération PDF...
                    </>
                  ) : (
                    <>
                      <FileText className="w-4 h-4" />
                      Télécharger PDF
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleSendEmail}
                  disabled={isSendingEmail}
                  className="flex items-center gap-2 border-green-200 hover:bg-green-50 text-green-700"
                >
                  {isSendingEmail ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                      Envoi en cours...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Envoyer par Email
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleDownloadTXT}
                  className="flex items-center gap-2 border-blue-200 hover:bg-blue-50 text-blue-700"
                >
                  <Download className="w-4 h-4" />
                  Télécharger TXT
                </Button>
                <Button
                  variant="outline"
                  onClick={handleShare}
                  className="flex items-center gap-2 border-purple-200 hover:bg-purple-50 text-purple-700"
                >
                  <Share2 className="w-4 h-4" />
                  Partager
                </Button>
                <Button
                  onClick={() => navigate(-1)}
                  className="forge-button-primary flex-1"
                >
                  Terminer
                </Button>
              </div>

              {/* Message de copie animé */}
              {copied && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-sm text-green-600 font-medium text-center bg-green-50 p-3 rounded-lg border border-green-200"
                >
                  ✅ Copié dans le presse-papiers !
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Instructions améliorées */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card className="shadow-lg border-0 bg-gradient-to-br from-gray-50 to-blue-50">
            <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="bg-white/20 p-2 rounded-lg">
                  <Calendar className="w-5 h-5" />
                </div>
                Instructions de connexion
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                    <span className="bg-blue-100 text-blue-600 w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold">1</span>
                    Accès au site
                  </h4>
                  <p className="text-gray-600 ml-8">Allez sur <strong className="text-blue-600">career.studyia.net</strong></p>
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                    <span className="bg-blue-100 text-blue-600 w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold">2</span>
                    Pied de page
                  </h4>
                  <p className="text-gray-600 ml-8">Faites défiler jusqu'en bas de la page</p>
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                    <span className="bg-blue-100 text-blue-600 w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold">3</span>
                    Connexion partenaire
                  </h4>
                  <p className="text-gray-600 ml-8">Cliquez sur "Connexion Partenaire" dans le pied de page</p>
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                    <span className="bg-blue-100 text-blue-600 w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold">4</span>
                    Identifiants
                  </h4>
                  <p className="text-gray-600 ml-8">
                    Entrez : <strong className="text-blue-600">{credentials.email}</strong><br/>
                    Mot de passe : <strong className="text-blue-600">{showPassword ? credentials.password : '•••••••••'}</strong>
                  </p>
                </div>
                
                <div className="space-y-4 md:col-span-2">
                  <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                    <span className="bg-blue-100 text-blue-600 w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold">5</span>
                    Accès à l'espace
                  </h4>
                  <p className="text-gray-600 ml-8">Cliquez sur "Se connecter" pour accéder à votre espace partenaire</p>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-6">
                <h4 className="font-semibold text-amber-900 mb-4 flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  ⚠️ Informations importantes
                </h4>
                <ul className="text-sm text-amber-800 space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-amber-600 mt-1">•</span>
                    <span>Conservez ces informations en sécurité</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-600 mt-1">•</span>
                    <span>Changez votre mot de passe lors de la première connexion</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-600 mt-1">•</span>
                    <span>Ne partagez jamais votre mot de passe avec des tiers</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-600 mt-1">•</span>
                    <span>Contactez le support technique en cas de problème</span>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
