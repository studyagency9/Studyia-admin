import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Alert, AlertDescription } from '@/components/ui/alert';
import axios from 'axios';
import { AlertTriangle, Briefcase, Shield, BookUser } from 'lucide-react';
import { motion } from 'framer-motion';

const loginSchema = z.object({
  email: z.string().email({ message: 'Adresse e-mail invalide' }),
  password: z.string().min(1, { message: 'Le mot de passe est requis' }),
});

type LoginFormValues = z.infer<typeof loginSchema>;


export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors, isSubmitting }, setValue } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  
  const onSubmit = async (data: LoginFormValues) => {
    setError(null);
    setIsRetrying(true);
    try {
      await login(data.email, data.password);
      navigate('/');
    } catch (err) {
      console.error('Login failed:', err);
      setIsRetrying(false);
      
      if (axios.isAxiosError(err)) {
        if (err.response) {
          if (err.response.status === 401) {
            const errorMessage = err.response.data?.error || 'Email ou mot de passe incorrect.';
            setError(errorMessage);
          } else {
            const serverError = err.response.data?.error || err.response.statusText;
            setError(`Erreur serveur: ${serverError}`);
          }
        } else if (err.request) {
          // Erreurs réseau et connexion
          let errorMessage = 'Erreur réseau. Impossible de contacter le serveur.';
          
          if (err.code === 'ERR_CONNECTION_RESET' || err.code === 'ECONNRESET') {
            errorMessage = 'Serveur en cours de démarrage... Réessayer dans quelques instants.';
          } else if (err.message.includes('timeout')) {
            errorMessage = 'Le serveur met du temps à répondre (Cold start Render)...';
          } else if (err.code === 'ERR_NETWORK') {
            errorMessage = 'Serveur indisponible. Veuillez réessayer plus tard.';
          }
          
          setError(errorMessage);
        } else {
          setError('Une erreur inattendue est survenue.');
        }
      } else {
        // Handle non-axios errors (including our custom thrown errors)
        let errorMessage = 'Une erreur inattendue est survenue.';
        
        if (err instanceof Error) {
          if (err.message.includes('timeout')) {
            errorMessage = 'Le serveur met du temps à répondre... (Cold start Render)';
          } else if (err.message.includes('Network Error')) {
            errorMessage = 'Erreur réseau. Vérifiez votre connexion.';
          } else {
            errorMessage = err.message;
          }
        }
        
        setError(errorMessage);
      }
    }
  };

  return (
    <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2">
      <div className="hidden bg-muted lg:block">
        <div className="flex flex-col justify-between h-full p-8 text-white bg-gradient-to-br from-primary to-primary/80">
          <div className="flex items-center gap-2 text-2xl font-bold">
            <Briefcase className="w-8 h-8" />
            <span>Studyia</span>
          </div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <h1 className="text-4xl font-bold">Bienvenue sur votre tableau de bord</h1>
            <p className="mt-4 text-lg text-primary-foreground/80">Gérez vos opérations, suivez vos finances et collaborez efficacement.</p>
          </motion.div>
          <div />
        </div>
      </div>
      <div className="flex items-center justify-center py-12">
        <div className="mx-auto grid w-[350px] gap-6">
          <div className="grid gap-2 text-center">
            <h1 className="text-3xl font-bold">Connexion</h1>
            <p className="text-balance text-muted-foreground">
              Entrez vos identifiants pour accéder à votre espace
            </p>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
            {error && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="admin@studyia.com" {...register('email')} autoComplete="email" />
              {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Mot de passe</Label>
              <Input id="password" type="password" {...register('password')} autoComplete="current-password" />
              {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Connexion...' : isRetrying ? 'Tentative de reconnexion...' : 'Se connecter'}
            </Button>
          </form>
                  </div>
      </div>
    </div>
  );
}
