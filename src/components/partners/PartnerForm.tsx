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
    cvQuota: number;
    cvUsedThisMonth: number;
    cvStats: {
      quota: number;
      used: number;
      remaining: number;
      percentageUsed: number;
      isLimitReached: boolean;
      plan: string;
    };
    planRenewalDate: string;
    status: 'active' | 'suspended';
  }) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

export function PartnerForm({ partner, onSubmit, onCancel, isSubmitting }: PartnerFormProps) {
  const citiesByCountry = {
    CM: [
      'Douala', 'Yaoundé', 'Bafoussam', 'Garoua', 'Kousséri', 'Bamenda', 
      'Maroua', 'Ngaoundéré', 'Bertoua', 'Limbe', 'Edea', 'Kribi'
    ],
    GA: [
      'Libreville', 'Port-Gentil', 'Franceville', 'Oyem', 'Moanda', 'Mouanda',
      'Lambaréné', 'Tchibanga', 'Koulamoutou', 'Makokou'
    ],
    TG: [
      'Lomé', 'Sokodé', 'Kara', 'Kpalimé', 'Atakpamé', 'Bassar', 'Tsévié',
      'Aného', 'Mango', 'Dapaong', 'Notsé', 'Vogan', 'Bafilo', 'Badou'
    ],
    GQ: [
      'Malabo', 'Bata', 'Ebebiyín', 'Añisoc', 'Evinayong', 'Mongomo',
      'Mbini', 'Acurenam', 'Micheñiguen', 'Luba', 'Riaba'
    ],
    CI: [
      'Abidjan', 'Bouaké', 'Daloa', 'Yamoussoukro', 'Korhogo', 'San-Pédro',
      'Divo', 'Gagnoa', 'Man', 'Séguéla', 'Odienné', 'Bondoukou', 'Abengourou'
    ],
    SN: [
      'Dakar', 'Pikine', 'Thiès', 'Kaolack', 'Mbour', 'Saint-Louis', 'Ziguinchor',
      'Touba', 'Diourbel', 'Louga', 'Fatick', 'Kédougou', 'Matam', 'Kolda'
    ],
    ML: [
      'Bamako', 'Sikasso', 'Ségou', 'Mopti', 'Koutiala', 'Kayes', 'Kolokani',
      'Sadiola', 'Kita', 'Niono', 'Djenné', 'Sokolo', 'Yélimané', 'San'
    ],
    CF: [
      'Bangui', 'Bimbo', 'Mbaïki', 'Berbérati', 'Kaga-Bandoro', 'Bouar',
      'Bossangoa', 'Bambari', 'Carnot', 'Sibut', 'Mobaye', 'Boda', 'Alindao'
    ]
  };

  const { control, handleSubmit, formState: { errors, isValid }, watch, setValue } = useForm<PartnerFormValues>({
    resolver: zodResolver(partnerSchema),
    defaultValues: {
      firstName: partner?.firstName || '',
      lastName: partner?.lastName || '',
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

  // Surveiller les changements de pays pour mettre à jour les villes
  const selectedCountry = watch('country');
  const availableCities = citiesByCountry[selectedCountry as keyof typeof citiesByCountry] || [];

  // Réinitialiser la ville quand le pays change
  const handleCountryChange = (newCountry: string) => {
    if (newCountry && !partner) { // Seulement pour la création, pas la modification
      setValue('city', ''); // Réinitialiser la ville
    }
  };

  const onFormSubmit = (data: PartnerFormValues) => {
    console.log('📝 PartnerForm - Submitting data:', data);
    console.log('📋 PartnerForm - Data structure:', JSON.stringify(data, null, 2));
    
    // Récupérer les informations du plan
    const planInfo = plans.find(p => p.value === data.plan);
    const cvQuota = data.plan === 'starter' ? 30 : data.plan === 'pro' ? 100 : 300;
    
    // Calculer la date de renouvellement (1 mois à partir d'aujourd'hui)
    const renewalDate = new Date();
    renewalDate.setMonth(renewalDate.getMonth() + 1);
    
    // Préparer les données selon l'interface du backend
    const submitData = {
      firstName: data.firstName || '',
      lastName: data.lastName || '',
      company: data.company || '',
      email: data.email || '',
      phone: data.phone || '',
      country: data.country || '',
      city: data.city || '',
      password: data.password || '',
      plan: data.plan || 'starter',
      
      // Champs supplémentaires pour le backend
      cvQuota: cvQuota,
      cvUsedThisMonth: 0,
      cvStats: {
        quota: cvQuota,
        used: 0,
        remaining: cvQuota,
        percentageUsed: 0,
        isLimitReached: false,
        plan: data.plan || 'starter'
      },
      planRenewalDate: renewalDate.toISOString(),
      status: 'active' as const
    };
    
    console.log('🚀 PartnerForm - Final submit data:', submitData);
    onSubmit(submitData);
  };

  const countries = [
    { value: 'CM', label: 'Cameroun' },
    { value: 'GA', label: 'Gabon' },
    { value: 'TG', label: 'Togo' },
    { value: 'GQ', label: 'Guinée Équatoriale' },
    { value: 'CI', label: 'Côte d\'Ivoire' },
    { value: 'SN', label: 'Sénégal' },
    { value: 'ML', label: 'Mali' },
    { value: 'CF', label: 'Centrafrique' },
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
                      <Select onValueChange={(value) => {
                        field.onChange(value);
                        handleCountryChange(value);
                      }} value={field.value}>
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
                  <Controller
                    name="city"
                    control={control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger className="h-12 border-purple-200 focus:border-purple-400 focus:ring-purple-100">
                          <SelectValue placeholder={availableCities.length > 0 ? "Sélectionner une ville" : "Sélectionnez d'abord un pays"} />
                        </SelectTrigger>
                        <SelectContent>
                          {availableCities.map((city) => (
                            <SelectItem key={city} value={city}>
                              {city}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.city && (
                    <p className="text-xs text-red-600 flex items-center gap-1">
                      <span className="text-red-500">•</span>
                      {errors.city.message}
                    </p>
                  )}
                  {availableCities.length > 0 && (
                    <p className="text-xs text-purple-600">
                      {availableCities.length} villes disponibles pour {countries.find(c => c.value === selectedCountry)?.label}
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
            <div className="relative">
              {/* Background décoratif */}
              <div className="absolute inset-0 bg-gradient-to-r from-amber-100 via-orange-100 to-amber-100 rounded-2xl opacity-50" />
              
              <Card className="relative border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                <CardHeader className="text-center pb-8">
                  <div className="flex justify-center mb-4">
                    <div className="bg-gradient-to-br from-amber-400 to-orange-500 p-4 rounded-2xl shadow-lg">
                      <CreditCard className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  <CardTitle className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent mb-2">
                    Choisissez votre plan
                  </CardTitle>
                  <CardDescription className="text-amber-700 text-base font-medium">
                    Démarrez gratuitement et évoluez selon vos besoins
                  </CardDescription>
                </CardHeader>
                <CardContent className="px-8 pb-8">
                  <Controller
                    name="plan"
                    control={control}
                    render={({ field }) => (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {plans.map((plan, index) => (
                          <motion.div
                            key={plan.value}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 + (index * 0.1) }}
                            whileHover={{ scale: 1.03, y: -5 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <div
                              className={`relative cursor-pointer transition-all duration-300 ${
                                field.value === plan.value
                                  ? 'transform scale-105'
                                  : 'hover:transform hover:scale-102'
                              }`}
                              onClick={() => field.onChange(plan.value)}
                            >
                              {/* Badge "Populaire" */}
                              {plan.recommended && (
                                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                                  <div className="bg-gradient-to-r from-amber-400 to-orange-500 text-white px-4 py-1 rounded-full text-sm font-bold shadow-lg">
                                    ⭐ Populaire
                                  </div>
                                </div>
                              )}
                              
                              <Card
                                className={`h-full transition-all duration-300 ${
                                  field.value === plan.value
                                    ? 'border-2 border-amber-400 bg-gradient-to-br from-amber-50 to-orange-50 shadow-2xl'
                                    : 'border border-gray-200 bg-white hover:border-amber-300 hover:shadow-lg'
                                } ${plan.recommended && field.value !== plan.value ? 'ring-2 ring-amber-200 ring-offset-2' : ''}`}
                              >
                                <CardContent className="p-6 text-center">
                                  {/* Icône du plan */}
                                  <div className="flex justify-center mb-4">
                                    <div className={`p-4 rounded-2xl transition-all duration-300 ${
                                      field.value === plan.value 
                                        ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-lg' 
                                        : 'bg-amber-100 text-amber-600'
                                    }`}>
                                      {plan.icon}
                                    </div>
                                  </div>
                                  
                                  {/* Nom du plan */}
                                  <h3 className={`font-bold text-xl mb-2 transition-colors duration-300 ${
                                    field.value === plan.value ? 'text-amber-700' : 'text-gray-900'
                                  }`}>
                                    {plan.label}
                                  </h3>
                                  
                                  {/* Description */}
                                  <p className={`text-sm mb-4 transition-colors duration-300 ${
                                    field.value === plan.value ? 'text-amber-600 font-medium' : 'text-gray-600'
                                  }`}>
                                    {plan.description}
                                  </p>
                                  
                                  {/* Indicateur de sélection */}
                                  <div className={`mt-4 transition-all duration-300 ${
                                    field.value === plan.value ? 'opacity-100' : 'opacity-0'
                                  }`}>
                                    <div className="inline-flex items-center gap-2 bg-amber-500 text-white px-4 py-2 rounded-full text-sm font-bold">
                                      <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                                      Sélectionné
                                    </div>
                                  </div>
                                  
                                  {/* Prix mensuel visuel */}
                                  <div className="mt-4 pt-4 border-t border-gray-100">
                                    <div className="text-2xl font-bold text-gray-900">
                                      {plan.value === 'starter' ? '15K' : plan.value === 'pro' ? '30K' : '60K'}
                                      <span className="text-sm text-gray-500 font-normal">/mois</span>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  />
                  {errors.plan && (
                    <div className="mt-6 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-600 flex items-center gap-2">
                        <span className="text-red-500">⚠️</span>
                        {errors.plan.message}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
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
