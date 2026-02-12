# Guide de Dépannage - Render Connection Issues

## 🔍 Problème Actuel

Le backend sur `https://studyia-career-backend.onrender.com/api` présente des problèmes de connexion :
- **Erreur** : `ERR_CONNECTION_RESET`
- **Cause** : Cold start de Render ou serveur indisponible

## 🚀 Solutions Implémentées

### 1. Retry Intelligent (3 tentatives)
```typescript
// Délais progressifs : 2s, 4s, 6s
// Codes gérés : ECONNABORTED, ECONNRESET, ERR_NETWORK, ERR_CONNECTION_RESET
```

### 2. Messages Utilisateur Améliorés
- **ERR_CONNECTION_RESET** : "Serveur en cours de démarrage... Réessayer dans quelques instants."
- **Timeout** : "Le serveur met du temps à répondre (Cold start Render)..."
- **ERR_NETWORK** : "Serveur indisponible. Veuillez réessayer plus tard."

### 3. Indicateur Visuel
- Bouton : "Tentative de reconnexion..." pendant les retries
- Logs console : "Retry attempt X for POST /admin/login (ERR_CONNECTION_RESET)"

## 🔧 Diagnostic

### Vérifier l'état du serveur
```bash
# Test de connexion
curl -I https://studyia-career-backend.onrender.com/

# Test endpoint login
curl -X POST https://studyia-career-backend.onrender.com/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@studyia.com", "password": "STUDYIADMIN01"}'
```

### Causes Possibles
1. **Cold Start Render** : Premier démarrage après inactivité
2. **Serveur en maintenance** : Redéploiement en cours
3. **Limitations gratuites** : Timeout/ressources insuffisantes
4. **CORS** : Configuration incorrecte

## 🛠️ Solutions Alternatives

### Option 1 : Attendre le Cold Start
- Patientez 2-3 minutes après le premier échec
- Les retries automatiques gèrent cette situation

### Option 2 : Vérifier le Dashboard Render
- Visitez le dashboard Render de votre application
- Vérifiez les logs et l'état du déploiement

### Option 3 : Redémarrer le Serveur
- Sur le dashboard Render : "Manual Deploy"
- Ou via les commandes de votre repo

### Option 4 : Mode Dégradé
Si le problème persiste, envisagez :
- Backend local en développement
- Service d'API alternatif
- Mode démo avec données mock

## 📊 Monitoring

### Logs à Surveiller
```
Retry attempt 1 for POST /admin/login (ERR_CONNECTION_RESET)
Retry attempt 2 for POST /admin/login (ERR_CONNECTION_RESET)
Retry attempt 3 for POST /admin/login (ERR_CONNECTION_RESET)
```

### Indicateurs de Succès
```
API Response: POST /admin/login - 15420ms
```

## 🎯 Prochaines Étapes

1. **Tester avec patience** : Laisser les retries s'effectuer
2. **Vérifier Render** : Consulter le dashboard backend
3. **Alternative locale** : Utiliser localhost:3000 si disponible
4. **Contact support** : Si le problème persiste > 30min

Le système est maintenant robuste pour gérer les instabilités de Render !
