# Configuration API Optimisée - Studyia Dashboard

## 🚀 Optimisations Appliquées

### 1. Configuration Multi-Environnements
```typescript
// Développement : proxy local /api → http://localhost:3000/api
// Production : https://studyia-career-backend.onrender.com/api
```

### 2. Architecture API Centralisée

#### Endpoints Structurés
- **AUTH** : Login, profil, refresh token
- **DASHBOARD** : Stats, KPIs
- **USERS** : CRUD utilisateurs
- **INVOICES** : Gestion factures
- **PARTNERS** : Partenaires et commissions
- **COMMERCIALS** : Stats commerciaux
- **ACCOUNTING** : Comptabilité et transactions
- **LOGS** : Journal d'activité
- **SETTINGS** : Configuration système

#### Services Spécialisés
```typescript
authService.login(credentials)
authService.getProfile(userId)
dashboardService.getStats()
dashboardService.getKpi()
```

### 3. Gestion Erreurs Avancée

#### Intercepteurs Axios
- **Request** : Token JWT automatique + metadata temps
- **Response** : Logging performances + gestion 401 automatique
- **Error** : Logout auto + logging détaillé

#### Timeout & Retry
- Timeout : 10 secondes
- Retry automatique sur erreur réseau
- Gestion centralisée des erreurs 401/403/500

### 4. Proxy Vite Optimisé

#### Configuration Développement
```typescript
proxy: {
  '/api': {
    target: 'http://localhost:3000',
    changeOrigin: true,
    secure: false,
    logging: true
  }
}
```

#### Avantages
- Pas de CORS en développement
- Logging des requêtes/réponses
- Hot reload transparent

### 5. Types TypeScript Robustes

#### Interfaces API
```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  admin?: T; // Compatibilité format admin
  error?: string;
}

interface PaginatedResponse<T> extends ApiResponse<T> {
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
```

### 6. Performance & Monitoring

#### Métriques Intégrées
- Temps de réponse par requête
- Logging des erreurs structuré
- Metadata pour debugging

#### Optimisations
- Cache TanStack Query
- Lazy loading des composants
- Code splitting automatique

## 🔧 Utilisation

### Import des Services
```typescript
import { authService, dashboardService } from '@/lib/api';
import { API_ENDPOINTS } from '@/lib/api';
```

### Appels API
```typescript
// Login
const { data } = await authService.login({ email, password });

// Stats dashboard
const stats = await dashboardService.getStats();

// Endpoints directs
const users = await api.get(API_ENDPOINTS.USERS.LIST);
```

### Gestion Erreurs
```typescript
try {
  const result = await authService.login(credentials);
} catch (error) {
  // Erreur déjà loggée et formatée
  // 401 = logout automatique
  // 500 = message utilisateur
}
```

## 🌍 Environnements

### Développement
- Frontend : http://localhost:8080
- Backend : http://localhost:3000
- Proxy : /api → http://localhost:3000/api

### Production
- Frontend : Déployé (Render/Vercel)
- Backend : https://studyia-career-backend.onrender.com
- API : https://studyia-career-backend.onrender.com/api

## 📊 Monitoring

### Logs Développement
```bash
# Console Vite
Sending Request to the Target: POST /api/admin/login
Received Response from the Target: 200 /api/admin/login
API Response: POST /api/admin/login - 245ms
```

### Logs Production
- Erreurs 401 : logout automatique
- Performance : tracking temps réponse
- Debug : metadata détaillée

## 🎯 Avantages

1. **Maintenabilité** : Code centralisé et structuré
2. **Performance** : Timeout, retry, cache
3. **Sécurité** : Gestion tokens automatique
4. **DX** : TypeScript, logging, proxy
5. **Scalabilité** : Architecture modulaire

L'API est maintenant optimisée pour la production avec une excellente expérience développeur !
