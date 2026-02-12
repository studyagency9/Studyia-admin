import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion } from 'framer-motion';
import { User as UserIcon, Mail, Phone, Shield, Lock, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { User } from '@/pages/UsersPage';

const userSchema = z.object({
  firstName: z.string().min(2, 'Le prénom doit contenir au moins 2 caractères'),
  lastName: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  email: z.string().email('Adresse e-mail invalide'),
  role: z.string().min(1, 'Le rôle est requis'),
  password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères').optional(),
});

type UserFormValues = z.infer<typeof userSchema>;

interface UserFormProps {
  user?: User | null;
  onSubmit: (data: UserFormValues) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

export function UserForm({ user, onSubmit, onCancel, isSubmitting }: UserFormProps) {
  const { control, handleSubmit, formState: { errors, isValid } } = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      role: user?.role || '',
    },
    mode: 'onChange',
  });

  const roleOptions = [
    { value: 'superadmin', label: 'Super Admin' },
    { value: 'secretaire', label: 'Secrétaire' },
    { value: 'comptable', label: 'Comptable' },
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Header simple */}
      <div className="text-center space-y-3 pb-4 border-b">
        <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center mx-auto">
          <UserPlus className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">
            {user ? 'Modifier l\'utilisateur' : 'Nouvel utilisateur'}
          </h3>
          <p className="text-sm text-muted-foreground">
            {user ? 'Mettre à jour les informations' : 'Créer un nouveau compte'}
          </p>
        </div>
      </div>

      {/* Formulaire compact */}
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
        <Label className="text-sm font-medium">Rôle</Label>
        <Controller
          name="role"
          control={control}
          render={({ field }) => (
            <Select onValueChange={field.onChange} value={field.value}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un rôle" />
              </SelectTrigger>
              <SelectContent>
                {roleOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.role && (
          <p className="text-xs text-destructive">{errors.role.message}</p>
        )}
      </div>

      {!user && (
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
            user ? 'Mettre à jour' : 'Créer'
          )}
        </Button>
      </div>
    </form>
  );
}
