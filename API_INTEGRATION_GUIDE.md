# Guide d'Intégration - API Admin Studyia

## Modifications Appliquées

### 1. AuthContext.tsx
- **Endpoint changé** : `/api/auth/login` → `/api/admin/login`
- **Mapping des rôles** : Ajout de `superadmin` → `admin`
- **Format de réponse** : Adaptation à `success/data/accessToken`
- **Route profil** : `/api/admin/profile/{userId}`

### 2. LoginPage.tsx
- **Email par défaut** : `admin@studyia.com`
- **Branding** : `Studya` → `Studyia`
- **Gestion d'erreur** : Support du format `{success: false, error: "..."}`
- **Messages d'erreur** : Affichage des erreurs spécifiques du backend

## Identifiants de Test

### Superadmin
```json
{
  "email": "admin@studyia.com",
  "password": "STUDYIADMIN01"
}
```

### Comptable
```json
{
  "email": "comptable@studyia.com", 
  "password": "STUDYIACMPT01"
}
```

### Secrétaire
```json
{
  "email": "secretaire1@studyia.com",
  "password": "STUDYIASCRT01"
}
```

## Flow d'Authentification

1. **Request** : `POST /api/admin/login`
2. **Response** : `{success: true, data: {admin: {...}, accessToken: "..."}}`
3. **Storage** : Token dans `localStorage`
4. **Usage** : `Authorization: Bearer {token}` pour les routes protégées

## Routes API Attendues

### Authentification
- `POST /api/admin/login` - Login admin

### Profil Utilisateur
- `GET /api/admin/profile/{userId}` - Infos utilisateur connecté

### Routes Protégées (exemples)
- `GET /api/admin/stats/dashboard` - Statistiques dashboard
- `GET /api/admin/users` - Liste des utilisateurs
- `GET /api/admin/invoices` - Factures
- etc.

## Sécurité

- **Rate limiting** : 200 requêtes/15min sur `/api/admin/*`
- **JWT Token** : Expérience 1 heure
- **Rôle dans token** : Pour permissions granulaires
- **Tracking** : `lastLogin` auto-update

## Tests

```bash
# Test login superadmin
curl -X POST "http://localhost:3000/api/admin/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@studyia.com", "password": "STUDYIADMIN01"}'

# Test route protégée
curl -X GET "http://localhost:3000/api/admin/stats/dashboard" \
  -H "Authorization: Bearer VOTRE_TOKEN_JWT" \
  -H "Content-Type: application/json"
```

## Points d'Attention

1. **Backend doit être démarré** sur `http://localhost:3000`
2. **CORS** : Autoriser `http://localhost:8080` (frontend)
3. **Format réponse** : Respecter le format `{success, data/error}`
4. **JWT Secret** : Doit être partagé entre services si nécessaire
