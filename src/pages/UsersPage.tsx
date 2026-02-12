import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Search, Plus, Phone, MapPin, Calendar, Edit, Trash2 } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/ui/PageHeader';
import { DataTable, Column, StatusBadge } from '@/components/ui/DataTable';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { usersService } from '@/lib/api';
import { Alert } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { UserForm } from '@/components/users/UserForm';

// Define the User type based on your API response
export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string; // Changé de roles[] à role (string simple)
  createdAt: string;
  lastLogin?: string;
}

const sourceLabels: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' }> = {
  direct: { label: 'Direct', variant: 'default' },
  partner: { label: 'Partenaire', variant: 'secondary' },
  commercial: { label: 'Commercial', variant: 'outline' },
};

const statusLabels: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  active: { label: 'Actif', variant: 'default' },
  inactive: { label: 'Inactif', variant: 'secondary' },
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      console.log('=== USERS API CALL ===');
      console.log('Calling usersService.getList()...');
      
      const response = await usersService.getList();
      
      console.log('Raw API Response:', response);
      console.log('Response data:', response.data);
      console.log('Response data.data:', response.data?.data);
      console.log('Full response structure:', JSON.stringify(response, null, 2));
      
      // Gérer la structure de réponse de l'API
      const responseData = response.data;
      
      if (responseData?.data?.users) {
        console.log('Setting users from response.data.data.users:', responseData.data.users);
        setUsers(responseData.data.users);
      } else if (responseData?.data) {
        console.log('Setting users from response.data.data:', responseData.data);
        setUsers(Array.isArray(responseData.data) ? responseData.data : []);
      } else if ((responseData as any)?.users) {
        console.log('Setting users from response.data.users:', (responseData as any).users);
        setUsers((responseData as any).users);
      } else {
        console.log('No users found in response, using empty array');
        setUsers([]);
      }
    } catch (err) {
      console.error('=== USERS API ERROR ===');
      console.error('Full error:', err);
      console.error('Error response:', (err as any).response);
      console.error('Error data:', (err as any).response?.data);
      console.error('Error status:', (err as any).response?.status);
      
      setError('Impossible de charger les utilisateurs.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleFormSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      if (selectedUser) {
        await usersService.update(selectedUser._id, data);
      } else {
        await usersService.create(data);
      }
      await fetchUsers();
      setIsModalOpen(false);
      setSelectedUser(null);
    } catch (err) {
      console.error('Failed to save user', err);
      // You might want to show an error message to the user here
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      try {
        await usersService.delete(userId);
        await fetchUsers();
      } catch (err) {
        console.error('Failed to delete user', err);
      }
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.firstName.toLowerCase().includes(search.toLowerCase()) ||
      user.lastName.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'all' || user.role === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const columns: Column<User>[] = [
    {
      key: 'name',
      header: 'Utilisateur',
      cell: (user) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
            {user.firstName.charAt(0)}{user.lastName.charAt(0)}
          </div>
          <div>
            <p className="font-medium text-foreground">{user.firstName} {user.lastName}</p>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      header: 'Rôle',
      cell: (user) => (
        <Badge variant="outline">{user.role}</Badge>
      ),
    },
    {
      key: 'createdAt',
      header: 'Inscription',
      cell: (user) => (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="w-3 h-3" />
          {new Date(user.createdAt).toLocaleDateString('fr-CM')}
        </div>
      ),
    },
    {
      key: 'lastLogin',
      header: 'Dernière connexion',
      cell: (user) => (
        user.lastLogin ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="w-3 h-3" />
            {new Date(user.lastLogin).toLocaleDateString('fr-CM')}
          </div>
        ) : (
          <span className="text-sm text-muted-foreground">Jamais</span>
        )
      ),
    },
    {
      key: 'actions',
      header: '',
      cell: (user) => (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setSelectedUser(user); setIsModalOpen(true); }}>
            <Edit className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDeleteUser(user._id)}>
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <DashboardLayout>
      <PageHeader
        title="Utilisateurs"
        description={`${users.length} utilisateurs inscrits`}
        icon={<Users className="w-6 h-6" />}
        actions={
          <Button className="forge-button-primary" onClick={() => { setSelectedUser(null); setIsModalOpen(true); }}>
            <Plus className="w-4 h-4 mr-2" />
            Nouvel utilisateur
          </Button>
        }
      />

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col sm:flex-row gap-4 mb-6"
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher par nom, email, ville..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous statuts</SelectItem>
            <SelectItem value="active">Actif</SelectItem>
            <SelectItem value="inactive">Inactif</SelectItem>
          </SelectContent>
        </Select>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
      >
        <div className="forge-card p-4">
          <p className="text-sm text-muted-foreground">Total</p>
          <p className="text-2xl font-bold text-foreground">{users.length}</p>
        </div>
        <div className="forge-card p-4">
          <p className="text-sm text-muted-foreground">Super Admins</p>
          <p className="text-2xl font-bold text-primary">{users.filter(u => u.role === 'superadmin').length}</p>
        </div>
        <div className="forge-card p-4">
          <p className="text-sm text-muted-foreground">Secrétaires</p>
          <p className="text-2xl font-bold text-foreground">{users.filter(u => u.role === 'secretaire').length}</p>
        </div>
        <div className="forge-card p-4">
          <p className="text-sm text-muted-foreground">Comptables</p>
          <p className="text-2xl font-bold text-foreground">{users.filter(u => u.role === 'comptable').length}</p>
        </div>
      </motion.div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {isLoading ? (
          <div className="text-center p-8">Chargement des utilisateurs...</div>
        ) : error ? (
          <Alert variant="destructive">{error}</Alert>
        ) : (
          <DataTable
            data={filteredUsers}
            columns={columns}
            keyExtractor={(user) => user._id}
            emptyMessage="Aucun utilisateur trouvé"
          />
        )}
      </motion.div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedUser ? 'Modifier l\'utilisateur' : 'Créer un nouvel utilisateur'}</DialogTitle>
            <DialogDescription>
              Remplissez les informations ci-dessous.
            </DialogDescription>
          </DialogHeader>
          <UserForm
            user={selectedUser}
            onSubmit={handleFormSubmit}
            onCancel={() => setIsModalOpen(false)}
            isSubmitting={isSubmitting}
          />
        </DialogContent>
      </Dialog>

    </DashboardLayout>
  );
}
