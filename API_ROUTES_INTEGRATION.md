# API Studyia - Routes et Services

## 🎯 Routes API Intégrées

### 🔐 Authentification
```typescript
// Login
authService.login({ email, password })
// POST /admin/login
// Réponse: { success: true, data: { admin: {...}, accessToken: "..." } }

// Profil (si disponible)
authService.getProfile(userId)
// GET /admin/users/{userId}
```

### 📊 Dashboard
```typescript
// Statistiques
dashboardService.getStats()
// GET /admin/stats/dashboard
// Réponse: { success: true, data: { totalCVs: 1250, totalPartners: 45, ... } }

// KPIs (même endpoint)
dashboardService.getKpi()
// GET /admin/stats/dashboard
```

### 📄 CVs
```typescript
// Liste des CVs
cvsService.getList()
// GET /admin/cvs
// Réponse: { success: true, data: { cvs: [...], total: 1250, page: 1, limit: 20 } }

// Créer un CV
cvsService.create(data)
// POST /admin/cvs

// Mettre à jour un CV
cvsService.update(id, data)
// PUT /admin/cvs/{id}
```

### 🤝 Partenaires
```typescript
// Liste des partenaires
partnersService.getList()
// GET /admin/partners
// Réponse: { success: true, data: { partners: [...], total: 45 } }

// Mettre à jour le statut
partnersService.updateStatus(id, "active")
// PUT /admin/partners/{id}/status
```

### 👥 Associés
```typescript
// Liste des associés
associatesService.getList()
// GET /admin/associates
// Réponse: { success: true, data: { associates: [...], total: 120 } }

// Mettre à jour le statut
associatesService.updateStatus(id, "suspended")
// PUT /admin/associates/{id}/status
```

### 💰 Finance
```typescript
// Statistiques financières
financeService.getStats()
// GET /admin/finance/stats
// Réponse: { success: true, data: { totalRevenue: 15000, revenueToday: 500, ... } }

// Liste des paiements
financeService.getPayments()
// GET /admin/payments
// Réponse: { success: true, data: { payments: [...], total: 450 } }

// Liste des retraits
financeService.getWithdrawals()
// GET /admin/withdrawals
// Réponse: { success: true, data: { withdrawals: [...], total: 25 } }

// Approuver un retrait
financeService.updateWithdrawalStatus(id, "approved")
// PUT /admin/withdrawals/{id}/status
```

### 👤 Utilisateurs Admin
```typescript
// Liste des admins
api.get('/admin/users/')
// GET /admin/users/
// Réponse: { success: true, data: { admins: [...], total: 3 } }

// Détails admin
api.get(`/admin/users/${id}`)
// GET /admin/users/{id}
// Réponse: { success: true, data: { admin: {...} } }
```

## 🔧 Optimisations

### 1. Login Optimisé
- Utilise les données de l'admin directement depuis la réponse login
- Plus d'appel supplémentaire pour récupérer le profil
- Réduction du temps de connexion

### 2. Services Spécialisés
- `authService` : Authentification
- `dashboardService` : Statistiques et KPIs
- `cvsService` : Gestion des CVs
- `partnersService` : Gestion des partenaires
- `associatesService` : Gestion des associés
- `financeService` : Finance et paiements

### 3. Types TypeScript
```typescript
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  admin?: T; // Compatibilité format admin
  error?: string;
}

interface PaginatedResponse<T = any> extends ApiResponse<T> {
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
```

## 🚀 Utilisation

### Import des services
```typescript
import { 
  authService, 
  dashboardService, 
  cvsService, 
  partnersService,
  associatesService,
  financeService 
} from '@/lib/api';
```

### Exemple d'utilisation
```typescript
// Login
const { data } = await authService.login({ 
  email: 'admin@studyia.com', 
  password: 'STUDYIADMIN01' 
});

// Stats dashboard
const stats = await dashboardService.getStats();

// Liste des partenaires
const partners = await partnersService.getList();

// Mise à jour statut partenaire
await partnersService.updateStatus(partnerId, 'active');
```

## ✅ Avantages

1. **Performance** : Login optimisé sans appel supplémentaire
2. **Maintenabilité** : Services spécialisés et typés
3. **Consistance** : Format de réponse uniforme
4. **Sécurité** : Token JWT géré automatiquement
5. **Retry** : Gestion des erreurs réseau automatique

L'API est maintenant entièrement intégrée avec les routes de votre backend Studyia !
