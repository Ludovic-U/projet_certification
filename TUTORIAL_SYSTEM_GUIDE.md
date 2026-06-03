# Guide d'intégration du système de tutoriels

## Vue d'ensemble

Le système de tutoriels permet d'afficher automatiquement un tutoriel la première fois qu'un utilisateur accède à une page.

## Utilisation sur une page

### 1. Importer les composants et le hook

```tsx
import { TutorialOverlay } from '@/components/Tutorial/TutorialOverlay';
import { useTutorial } from '@/hooks/useTutorial';
```

### 2. Ajouter le hook dans votre composant

```tsx
export default function YourPage() {
  const { tutorial, loading, markAsViewed } = useTutorial('page-name');
  
  // ... rest of your component
}
```

Le `page-name` doit correspondre au `pageName` du tutoriel créé dans l'interface admin.

### 3. Ajouter l'overlay au JSX

```tsx
export default function YourPage() {
  const { tutorial, loading, markAsViewed } = useTutorial('ideation');
  
  return (
    <div>
      <TutorialOverlay 
        tutorial={tutorial} 
        onClose={markAsViewed}
      />
      
      {/* Rest of your page content */}
      <div>...your content here...</div>
    </div>
  );
}
```

## Exemple complet

```tsx
'use client';

import React from 'react';
import { PageHeader } from '@/components/ui';
import { TutorialOverlay } from '@/components/Tutorial/TutorialOverlay';
import { useTutorial } from '@/hooks/useTutorial';

export default function BudgetPage() {
  const { tutorial, markAsViewed } = useTutorial('budget');
  
  return (
    <div>
      <TutorialOverlay 
        tutorial={tutorial} 
        onClose={markAsViewed}
      />
      
      <PageHeader title="Budget" />
      
      {/* Your page content */}
      <div className="p-8">
        <h2>Budgets</h2>
        {/* ... */}
      </div>
    </div>
  );
}
```

## Créer un nouveau tutoriel

1. Allez à `/admin/tutorials`
2. Cliquez sur "Nouveau tutoriel"
3. Remplissez les champs:
   - **Page Name**: identifiant unique (ex: `ideation`, `gantt`, `budget`)
   - **Titre**: titre du tutoriel
   - **Description**: description courte
   - **Contenu HTML**: contenu du tutoriel en HTML
   - **Ordre**: ordre d'affichage

### Format du contenu HTML

Le contenu peut être n'importe quel HTML valide :

```html
<h3>Bienvenue sur la page d'idéation !</h3>
<p>Cette page vous permet de...</p>

<div style="margin-top: 16px;">
  <h4>Étapes :</h4>
  <ol>
    <li>Commencez par cliquer sur le bouton bleu</li>
    <li>Entrez votre idée</li>
    <li>Cliquez sur Soumettre</li>
  </ol>
</div>
```

## Backend API

### Get tutorial pour une page

```
GET /api/tutorial/page/:pageName
```

Response:
```json
{
  "tutorialId": 1,
  "pageName": "ideation",
  "title": "Introduction à l'idéation",
  "description": "...",
  "content": "<h3>...</h3>",
  "shouldShow": true,
  "isFirstTime": true
}
```

### Marquer un tutoriel comme vu

```
POST /api/tutorial/mark-viewed
```

Body:
```json
{
  "tutorialId": 1
}
```

### Admin - Get all tutorials

```
GET /api/tutorial/admin/all
```

### Admin - Create tutorial

```
POST /api/tutorial/admin/create
```

Body:
```json
{
  "pageName": "ideation",
  "title": "Introduction",
  "description": "...",
  "content": "<h3>...</h3>",
  "order": 0
}
```

### Admin - Update tutorial

```
PUT /api/tutorial/admin/:tutorialId
```

### Admin - Delete tutorial

```
DELETE /api/tutorial/admin/:tutorialId
```

## Points importants

- Le tutoriel s'affiche **automatiquement** si c'est la première fois que l'utilisateur visite la page
- Une fois fermé, il n'apparaît plus pour cet utilisateur
- L'admin peut gérer tous les tutoriels depuis `/admin/tutorials`
- Les tutoriels désactivés ne s'affichent pas
