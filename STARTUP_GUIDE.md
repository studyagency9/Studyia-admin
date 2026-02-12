# Instructions de Démarrage - Studyia Dashboard

## 🚀 Démarrage Propre

### Étape 1: Arrêter tous les processus Node
```bash
# Arrêter tous les processus Node
taskkill /F /IM node.exe
```

### Étape 2: Démarrer le Dashboard
```bash
# Option 1: Démarrage normal (port 3001)
npm run dev

# Option 2: Démarrage propre (arrête les processus + démarre)
npm run dev:clean
```

### Étape 3: Accéder à l'application
- **URL**: http://localhost:3001
- **Auto-ouverture**: Le navigateur s'ouvrira automatiquement

## 🔧 Configuration Effectuée

### Port Modifié
- **Ancien**: 8080 (conflit possible)
- **Nouveau**: 3001 (disponible)

### Host Spécifique
- **Host**: localhost (plus précis que ::)
- **Auto-open**: true (ouvre le navigateur)

### Scripts Ajoutés
```json
{
  "dev": "vite --port 3001 --host localhost",
  "dev:clean": "taskkill /F /IM node.exe 2>nul || true && npm run dev"
}
```

## 🛠️ Dépannage

### Si un autre projet s'ouvre
1. **Vérifier le port**: Assurez-vous d'utiliser `localhost:3001`
2. **Vider le cache**: 
   ```bash
   npm run dev:clean
   ```
3. **Réinitialiser le navigateur**: 
   - Ctrl+Shift+R (hard refresh)
   - Ou incognito mode

### Si le port est occupé
```bash
# Vérifier les ports utilisés
netstat -ano | findstr :3001

# Forcer l'arrêt
taskkill /F /IM node.exe
```

## 📋 Vérification

### Confirmer que vous êtes sur le bon projet
1. **URL**: http://localhost:3001
2. **Titre**: "Studyia" dans la page de login
3. **Console**: Logs Vite avec "Studyia Dashboard"

### Identifiants de test
- **Email**: admin@studyia.com
- **Password**: STUDYIADMIN01

Le dashboard devrait maintenant démarrer correctement sur le port 3001 !
