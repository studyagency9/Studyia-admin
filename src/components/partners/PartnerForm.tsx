import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion } from 'framer-motion';
import { Building, Mail, Phone, Lock, Handshake, MapPin, Crown, Star, Briefcase, User, Globe, Shield, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Partner } from '@/pages/PartnersPage';

const partnerSchema = z.object({
  firstName: z.string().min(2, 'Le prénom doit contenir au moins 2 caractères'),
  lastName: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  company: z.string().min(2, 'L\'entreprise doit contenir au moins 2 caractères'),
  email: z.string().email('Adresse e-mail invalide'),
  phone: z.string().min(8, 'Le téléphone doit contenir au moins 8 caractères'),
  country: z.string().min(2, 'Le pays est requis'),
  city: z.string().min(2, 'La ville est requise'),
  password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
  plan: z.enum(['starter', 'pro', 'business'], {
    required_error: 'Le plan est requis'
  }),
});

type PartnerFormValues = z.infer<typeof partnerSchema>;

interface PartnerFormProps {
  partner?: Partner | null;
  onSubmit: (data: {
    firstName: string;
    lastName: string;
    company: string;
    email: string;
    phone: string;
    country: string;
    city: string;
    password: string;
    plan: 'starter' | 'pro' | 'business';
  }) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

export function PartnerForm({ partner, onSubmit, onCancel, isSubmitting }: PartnerFormProps) {
  const { control, handleSubmit, formState: { errors, isValid } } = useForm<PartnerFormValues>({
    resolver: zodResolver(partnerSchema),
    defaultValues: {
      firstName: partner?.name?.split(' ')[0] || '',
      lastName: partner?.name?.split(' ')[1] || '',
      company: partner?.company || '',
      email: partner?.email || '',
      phone: partner?.phone || '',
      country: partner?.country || 'CM',
      city: partner?.city || '',
      password: '',
      plan: (partner?.plan as 'starter' | 'pro' | 'business') || 'starter',
    },
    mode: 'onChange',
  });

  const onFormSubmit = (data: PartnerFormValues) => {
    console.log('📝 PartnerForm - Submitting data:', data);
    console.log('📋 PartnerForm - Data structure:', JSON.stringify(data, null, 2));
    // Ensure all required fields are present
    const submitData = {
      firstName: data.firstName || '',
      lastName: data.lastName || '',
      company: data.company || '',
      email: data.email || '',
      phone: data.phone || '',
      country: data.country || '',
      city: data.city || '',
      password: data.password || '',
      plan: data.plan || 'starter'
    };
    console.log('🚀 PartnerForm - Final submit data:', submitData);
    onSubmit(submitData);
  };

  const countries = [
    { value: 'CM', label: 'Cameroun' },
    { value: 'FR', label: 'France' },
    { value: 'CI', label: 'Côte d\'Ivoire' },
    { value: 'SN', label: 'Sénégal' },
    { value: 'GA', label: 'Gabon' },
  ];

  const plans = [
    {
      value: 'starter',
      label: 'Starter',
      description: '30 CV/mois - 15 000 FCFA',
      icon: <Briefcase className="w-4 h-4" />,
      badge: null,
      recommended: false
    },
    {
      value: 'pro',
      label: 'Pro',
      description: '100 CV/mois - 30 000 FCFA',
      icon: <Star className="w-4 h-4" />,
      badge: 'Populaire',
      recommended: true
    },
    {
      value: 'business',
      label: 'Business',
      description: '300 CV/mois - 60 000 FCFA',
      icon: <Crown className="w-4 h-4" />,
      badge: null,
      recommended: false
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header amélioré */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4 pb-6 border-b border-gray-200"
      >
        <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-lg">
          <Handshake className="w-8 h-8 text-white" />
        </div>
        <div>
          <h3 className="text-2xl font-bold text-gray-900">
            {partner ? 'Modifier le partenaire' : 'Nouveau partenaire'}
          </h3>
          <p className="text-gray-600 mt-1">
            {partner ? 'Mettre à jour les informations du partenaire' : 'Créer un nouveau compte partenaire avec accès à la plateforme'}
          </p>
        </div>
      </motion.div>

      {/* Formulaire avec design amélioré */}
      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-8">
        {/* Section Informations personnelles */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-indigo-50">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-lg">
                <div className="bg-blue-500 p-2 rounded-lg">
                  <User className="w-5 h-5 text-white" />
                </div>
                Informations personnelles
              </CardTitle>
              <CardDescription className="text-blue-700">
                Informations sur le représentant du partenaire
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label htmlFor="firstName" className="text-sm font-medium text-blue-700 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Prénom
                  </Label>
                  <Input 
                    id="firstName" 
                    {...control.register('firstName')} 
                    placeholder="Jean"
                    className="h-12 border-blue-200 focus:border-blue-400 focus:ring-blue-100"
                  />
                  {errors.firstName && (
                    <p className="text-xs text-red-600 flex items-center gap-1">
                      <span className="text-red-500">•</span>
                      {errors.firstName.message}
                    </p>
                  )}
                </div>
                <div className="space-y-3">
                  <Label htmlFor="lastName" className="text-sm font-medium text-blue-700 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Nom
                  </Label>
                  <Input 
                    id="lastName" 
                    {...control.register('lastName')} 
                    placeholder="Dupont"
                    className="h-12 border-blue-200 focus:border-blue-400 focus:ring-blue-100"
                  />
                  {errors.lastName && (
                    <p className="text-xs text-red-600 flex items-center gap-1">
                      <span className="text-red-500">•</span>
                      {errors.lastName.message}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Section Professionnelle */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-0 shadow-sm bg-gradient-to-br from-green-50 to-emerald-50">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-lg">
                <div className="bg-green-500 p-2 rounded-lg">
                  <Building className="w-5 h-5 text-white" />
                </div>
                Informations professionnelles
              </CardTitle>
              <CardDescription className="text-green-700">
                Détails sur l'entreprise et les coordonnées
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label htmlFor="company" className="text-sm font-medium text-green-700 flex items-center gap-2">
                    <Building className="w-4 h-4" />
                    Entreprise
                  </Label>
                  <Input 
                    id="company" 
                    {...control.register('company')} 
                    placeholder="Nom de l'entreprise"
                    className="h-12 border-green-200 focus:border-green-400 focus:ring-green-100"
                  />
                  {errors.company && (
                    <p className="text-xs text-red-600 flex items-center gap-1">
                      <span className="text-red-500">•</span>
                      {errors.company.message}
                    </p>
                  )}
                </div>
                <div className="space-y-3">
                  <Label htmlFor="email" className="text-sm font-medium text-green-700 flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email
                  </Label>
                  <Input 
                    id="email" 
                    type="email" 
                    {...control.register('email')} 
                    placeholder="contact@entreprise.com"
                    className="h-12 border-green-200 focus:border-green-400 focus:ring-green-100"
                  />
                  {errors.email && (
                    <p className="text-xs text-red-600 flex items-center gap-1">
                      <span className="text-red-500">•</span>
                      {errors.email.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label htmlFor="phone" className="text-sm font-medium text-green-700 flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    Téléphone
                  </Label>
                  <Input 
                    id="phone" 
                    {...control.register('phone')} 
                    placeholder="+237 123456789"
                    className="h-12 border-green-200 focus:border-green-400 focus:ring-green-100"
                  />
                  {errors.phone && (
                    <p className="text-xs text-red-600 flex items-center gap-1">
                      <span className="text-red-500">•</span>
                      {errors.phone.message}
                    </p>
                  )}
                </div>
                
                {/* Mot de passe (uniquement pour création) */}
                {!partner && (
                  <div className="space-y-3">
                    <Label htmlFor="password" className="text-sm font-medium text-green-700 flex items-center gap-2">
                      <Lock className="w-4 h-4" />
                      Mot de passe
                    </Label>
                    <Input 
                      id="password" 
                      type="password" 
                      {...control.register('password')} 
                      placeholder="••••••••"
                      className="h-12 border-green-200 focus:border-green-400 focus:ring-green-100"
                    />
                    {errors.password && (
                      <p className="text-xs text-red-600 flex items-center gap-1">
                        <span className="text-red-500">•</span>
                        {errors.password.message}
                      </p>
                    )}
                    <p className="text-xs text-green-600">
                      Le partenaire utilisera ce mot de passe pour se connecter
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Section Localisation */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-0 shadow-sm bg-gradient-to-br from-purple-50 to-indigo-50">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-lg">
                <div className="bg-purple-500 p-2 rounded-lg">
                  <Globe className="w-5 h-5 text-white" />
                </div>
                Localisation
              </CardTitle>
              <CardDescription className="text-purple-700">
                Informations géographiques du partenaire
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-purple-700 flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    Pays
                  </Label>
                  <Controller
                    name="country"
                    control={control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger className="h-12 border-purple-200 focus:border-purple-400 focus:ring-purple-100">
                          <SelectValue placeholder="Sélectionner un pays" />
                        </SelectTrigger>
                        <SelectContent>
                          {countries.map((country) => (
                            <SelectItem key={country.value} value={country.value}>
                              {country.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.country && (
                    <p className="text-xs text-red-600 flex items-center gap-1">
                      <span className="text-red-500">•</span>
                      {errors.country.message}
                    </p>
                  )}
                </div>
                <div className="space-y-3">
                  <Label htmlFor="city" className="text-sm font-medium text-purple-700 flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Ville
                  </Label>
                  <Input 
                    id="city" 
                    {...control.register('city')} 
                    placeholder="Douala, Yaoundé, etc."
                    className="h-12 border-purple-200 focus:border-purple-400 focus:ring-purple-100"
                  />
                  {errors.city && (
                    <p className="text-xs text-red-600 flex items-center gap-1">
                      <span className="text-red-500">•</span>
                      {errors.city.message}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Section Plan d'abonnement (uniquement pour création) */}
        {!partner && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="border-0 shadow-sm bg-gradient-to-br from-amber-50 to-orange-50">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-lg">
                  <div className="bg-amber-500 p-2 rounded-lg">
                    <CreditCard className="w-5 h-5 text-white" />
                  </div>
                  Plan d'abonnement
                </CardTitle>
                <CardDescription className="text-amber-700">
                  Choisissez le plan adapté aux besoins du partenaire
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Controller
                  name="plan"
                  control={control}
                  render={({ field }) => (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {plans.map((plan) => (
                        <motion.div
                          key={plan.value}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Card
                            className={`cursor-pointer transition-all duration-200 ${
                              field.value === plan.value
                                ? 'border-amber-400 bg-amber-50 shadow-lg'
                                : 'border-amber-200 hover:border-amber-300 hover:shadow-md'
                            } ${plan.recommended ? 'ring-2 ring-amber-400 ring-offset-2' : ''}`}
                            onClick={() => field.onChange(plan.value)}
                          >
                            <CardContent className="p-4 text-center">
                              <div className="flex justify-center mb-3">
                                <div className={`p-3 rounded-full ${
                                  field.value === plan.value ? 'bg-amber-500 text-white' : 'bg-amber-100 text-amber-600'
                                }`}>
                                  {plan.icon}
                                </div>
                              </div>
                              <h3 className="font-semibold text-lg mb-1">{plan.label}</h3>
                              <p className="text-sm text-gray-600 mb-3">{plan.description}</p>
                              {plan.badge && (
                                <Badge className="bg-amber-500 text-white mb-2">
                                  {plan.badge}
                                </Badge>
                              )}
                              {field.value === plan.value && (
                                <div className="text-amber-600 text-sm font-medium">
                                  ✓ Sélectionné
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  )}
                />
                {errors.plan && (
                  <p className="text-xs text-red-600 flex items-center gap-1 mt-3">
                    <span className="text-red-500">•</span>
                    {errors.plan.message}
                  </p>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex justify-end gap-4 pt-8 border-t border-gray-200"
        >
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
            className="h-12 px-6 border-gray-300 hover:bg-gray-50"
          >
            Annuler
          </Button>
          <Button 
            type="submit" 
            disabled={!isValid || isSubmitting}
            className="forge-button-primary h-12 px-8"
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                {partner ? 'Mise à jour...' : 'Création...'}
              </div>
            ) : (
              partner ? 'Mettre à jour' : 'Créer le partenaire'
            )}
          </Button>
        </motion.div>
      </form>
    </div>
  );
}
