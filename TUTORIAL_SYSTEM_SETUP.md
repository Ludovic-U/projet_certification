# Système de Tutoriels - Résumé de l'implémentation

## 📋 Qu'est-ce qui a été créé ?

Vous avez maintenant un système complet de tutoriels qui :
- Affiche automatiquement un tutoriel **la première fois** qu'un utilisateur visite une page
- Permet à l'admin de créer/modifier/supprimer des tutoriels
- Persiste l'état "vu" de chaque tutoriel par utilisateur

## 📁 Fichiers créés

### Backend

1. **`backend/prisma/schema.prisma`** - Modèles Prisma mis à jour
   - `TutorialPage` : stocke les tutoriels
   - `UserTutorialView` : track qui a vu quel tutoriel

2. **`backend/services/tutorialService.js`** - Logique métier
   - `getTutorialForPage()` : récupère un tutoriel avec statut "vu"
   - `markTutorialAsViewed()` : enregistre que l'utilisateur a vu le tutoriel
   - Autres fonctions admin

3. **`backend/controllers/tutorialController.js`** - Endpoints API

4. **`backend/routes/tutorialRoutes.js`** - Routes tutoriels

5. **`backend/index.js`** - Modifié pour enregistrer les routes

### Frontend

1. **`frontend/src/components/Tutorial/TutorialOverlay.tsx`** - Composant overlay du tutoriel

2. **`frontend/src/hooks/useTutorial.ts`** - Hook pour gérer les tutoriels

3. **`frontend/src/app/admin/tutorials/page.tsx`** - Page admin pour gérer les tutoriels

### Documentation

1. **`TUTORIAL_SYSTEM_GUIDE.md`** - Guide complet d'utilisation
2. **`TUTORIAL_SYSTEM_SETUP.md`** - Ce fichier

## 🚀 Prochaines étapes

### 1. Appliquer la migration Prisma

Vous avez deux options :

**Option A : Via Prisma Migrate (recommandé)**
```bash
cd backend
npx prisma migrate deploy
```

**Option B : Exécuter le SQL directement**
```bash
# Connexion à votre DB PostgreSQL
psql -U your_user -d postgres -h localhost < backend/prisma/migrations/add_tutorial_system.sql
```

### 2. Tester le système

1. **Créer un tutorial dans l'admin**
   - Allez à `http://localhost:3000/admin/tutorials`
   - Cliquez "Nouveau tutoriel"
   - Exemple :
     - Page Name: `ideation`
     - Title: `Bienvenue sur la page d'idéation`
     - Content: `<h3>Étape 1</h3><p>Cliquez sur le bouton bleu</p>`

2. **Intégrer sur une page**
   - Ouvrez la page concernée (ex: `frontend/src/app/[clientId]/[projectId]/ideation/page.tsx`)
   - Ajoutez au composant :
   ```tsx
   import { TutorialOverlay } from '@/components/Tutorial/TutorialOverlay';
   import { useTutorial } from '@/hooks/useTutorial';
   
   export default function YourPage() {
     const { tutorial, markAsViewed } = useTutorial('ideation');
     
     return (
       <div>
         <TutorialOverlay tutorial={tutorial} onClose={markAsViewed} />
         {/* Rest of your page */}
       </div>
     );
   }
   ```

3. **Voir le résultat**
   - Accédez à la page en tant qu'utilisateur
   - Le tutoriel devrait s'afficher automatiquement la première fois
   - La deuxième fois, il ne s'affichera plus

## 🔗 Endpoints API

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/tutorial/page/:pageName` | Récupère un tutoriel (avec info si vu) |
| POST | `/api/tutorial/mark-viewed` | Marque comme vu |
| GET | `/api/tutorial/my-tutorials` | Liste tous les tutos avec statut per user |
| GET | `/api/tutorial/admin/all` | [Admin] Tous les tutoriels |
| POST | `/api/tutorial/admin/create` | [Admin] Créer |
| GET | `/api/tutorial/admin/:id` | [Admin] Détail |
| PUT | `/api/tutorial/admin/:id` | [Admin] Modifier |
| DELETE | `/api/tutorial/admin/:id` | [Admin] Supprimer |

## 📁 Structure des tutoriels

Chaque tutoriel contient :
- `pageName` (unique) : identifiant de la page (ex: "ideation", "gantt", "budget")
- `title` : titre du tutoriel
- `description` : description courte
- `content` : contenu HTML
- `order` : ordre d'affichage
- `isActive` : pour activer/désactiver sans supprimer

## 🎨 Personnalisation du contenu HTML

Vous pouvez utiliser n'importe quel HTML :

```html
<div style="padding: 16px;">
  <h3 style="color: #2563eb; margin-bottom: 12px;">Bienvenue !</h3>
  <p>Voici comment utiliser cette page :</p>
  
  <ol style="margin-left: 20px;">
    <li>Étape 1 : Cliquez sur le bouton</li>
    <li>Étape 2 : Remplissez le formulaire</li>
    <li>Étape 3 : Soumettre</li>
  </ol>
  
  <p style="margin-top: 16px; background-color: #ecfdf5; padding: 12px; border-radius: 4px;">
    ℹ️ Ce tutoriel ne s'affichera qu'une fois
  </p>
</div>
```

## ⚙️ Configuration avancée

### Modifier le style du tutoriel

Le composant `TutorialOverlay` se trouve dans `frontend/src/components/Tutorial/TutorialOverlay.tsx`

Vous pouvez modifier les classes Tailwind ou ajouter du CSS personnalisé.

### Ajouter plus de logique

Le hook `useTutorial` peut être étendu pour :
- Pré-charger les tutoriels
- Ajouter de la télémétrie
- Intégrer avec un système de onboarding

## 🐛 Troubleshooting

### Le tutoriel ne s'affiche pas
1. Vérifiez que le `pageName` correspond exactement
2. Vérifiez que le tutoriel est `isActive: true`
3. Vérifiez la console du navigateur pour les erreurs

### Erreur de migration
1. Vérifiez que PostgreSQL est démarré
2. Vérifiez la connexion DB dans `.env`
3. Essayez d'exécuter le SQL directement

### Le tutoriel réapparaît
- C'est normal après une réinitialisation de la DB
- L'état "vu" est stocké dans la table `UserTutorialView`

## 📚 Pour aller plus loin

Voir `TUTORIAL_SYSTEM_GUIDE.md` pour :
- Un guide d'intégration détaillé
- Des exemples de code complets
- La documentation API complète
