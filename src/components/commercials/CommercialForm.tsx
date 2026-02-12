import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion } from 'framer-motion';
import { User, Mail, Phone, Lock, UserPlus, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Commercial } from '@/pages/CommercialsPage';

const commercialSchema = z.object({
  firstName: z.string().min(2, 'Le prénom doit contenir au moins 2 caractères'),
  lastName: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  email: z.string().email('Adresse e-mail invalide'),
  phone: z.string().min(8, 'Le téléphone doit contenir au moins 8 caractères'),
  country: z.string().min(2, 'Le pays est requis'),
  city: z.string().min(2, 'La ville est requise'),
  password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères').optional(),
});

type CommercialFormValues = z.infer<typeof commercialSchema>;

interface CommercialFormProps {
  commercial?: Commercial | null;
  onSubmit: (data: CommercialFormValues) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

export function CommercialForm({ commercial, onSubmit, onCancel, isSubmitting }: CommercialFormProps) {
  const { control, handleSubmit, formState: { errors, isValid } } = useForm<CommercialFormValues>({
    resolver: zodResolver(commercialSchema),
    defaultValues: {
      firstName: commercial?.firstName || '',
      lastName: commercial?.lastName || '',
      email: commercial?.email || '',
      phone: commercial?.phone || '',
      country: commercial?.country || 'CM',
      city: commercial?.city || '',
    },
    mode: 'onChange',
  });

  const countries = [
    { value: 'CM', label: 'Cameroun' },
    { value: 'FR', label: 'France' },
    { value: 'CI', label: 'Côte d\'Ivoire' },
    { value: 'SN', label: 'Sénégal' },
    { value: 'GA', label: 'Gabon' },
    { value: 'CG', label: 'Congo' },
    { value: 'BF', label: 'Burkina Faso' },
    { value: 'ML', label: 'Mali' },
    { value: 'NE', label: 'Niger' },
    { value: 'TD', label: 'Tchad' },
    { value: 'BJ', label: 'Bénin' },
    { value: 'TG', label: 'Togo' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-3 pb-4 border-b">
        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto">
          <UserPlus className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">
            {commercial ? 'Modifier l\'associé' : 'Nouvel associé'}
          </h3>
          <p className="text-sm text-muted-foreground">
            {commercial ? 'Mettre à jour les informations' : 'Créer un nouveau compte associé'}
          </p>
        </div>
      </div>

      {/* Formulaire compact */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Informations principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName" className="text-sm font-medium">Prénom</Label>
            <Input 
              id="firstName" 
              {...control.register('firstName')} 
              placeholder="Prénom"
            />
            {errors.firstName && (
              <p className="text-xs text-destructive">{errors.firstName.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName" className="text-sm font-medium">Nom</Label>
            <Input 
              id="lastName" 
              {...control.register('lastName')} 
              placeholder="Nom"
            />
            {errors.lastName && (
              <p className="text-xs text-destructive">{errors.lastName.message}</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium">Email</Label>
          <Input 
            id="email" 
            type="email" 
            {...control.register('email')} 
            placeholder="email@exemple.com"
          />
          {errors.email && (
            <p className="text-xs text-destructive">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone" className="text-sm font-medium">Téléphone</Label>
          <Input 
            id="phone" 
            {...control.register('phone')} 
            placeholder="+237 123456789"
          />
          {errors.phone && (
            <p className="text-xs text-destructive">{errors.phone.message}</p>
          )}
        </div>

        {/* Localisation */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Pays</Label>
            <Controller
              name="country"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger>
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
              <p className="text-xs text-destructive">{errors.country.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="city" className="text-sm font-medium">Ville</Label>
            <Input 
              id="city" 
              {...control.register('city')} 
              placeholder="Douala, Yaoundé, etc."
            />
            {errors.city && (
              <p className="text-xs text-destructive">{errors.city.message}</p>
            )}
          </div>
        </div>

        {/* Mot de passe (uniquement pour création) */}
        {!commercial && (
          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium">Mot de passe</Label>
            <Input 
              id="password" 
              type="password" 
              {...control.register('password')} 
              placeholder="••••••••"
            />
            {errors.password && (
              <p className="text-xs text-destructive">{errors.password.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              L'associé utilisera ce mot de passe pour se connecter
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4">
          <Button 
            type="button" 
            variant="ghost" 
            onClick={onCancel}
          >
            Annuler
          </Button>
          <Button 
            type="submit" 
            disabled={!isValid || isSubmitting}
            className="forge-button-primary"
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Enregistrement...
              </div>
            ) : (
              commercial ? 'Mettre à jour' : 'Créer'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
