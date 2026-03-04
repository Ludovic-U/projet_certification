# Page de Conception du Diagramme de Gantt

## Vue d'ensemble

Ce module fournit un diagramme de Gantt complet pour la planification de projet et la gestion des tâches. Il inclut des fonctionnalités interactives comme le glisser-déposer, la hiérarchie des tâches, les dépendances, et les capacités d'import/export.

## Structure des fichiers

```
frontend/src/app/[clientId]/[projectId]/conception/
├── page.tsx              # Composant principal du Gantt
├── README.md             # Ce fichier
├── constants.ts          # Constantes de configuration
├── types.ts             # Définitions de types TypeScript
├── data.ts              # Définitions de types et données d'exemple
├── hooks/
│   ├── useGanttState.ts       # Gestion d'état principal
│   ├── useGanttHandlers.ts    # Gestionnaires d'événements (glisser, redimensionner, etc.)
│   └── useGanttExportImport.ts # Fonctionnalité d'import/export
├── components/
│   ├── GanttTimeline.tsx       # Visualisation de la timeline
│   ├── GanttTaskList.tsx       # Barre latérale des tâches
│   ├── GanttToolbar.tsx         # Barre d'outils avec contrôles
│   ├── GanttTaskEditor.tsx      # Modale d'édition de tâche
│   ├── GanttTaskSummary.tsx     # Barre latérale des détails (améliorée)
│   ├── GanttTooltip.tsx         # Info-bulles au survol
│   ├── GanttContextMenu.tsx     # Menu contextuel clic droit
│   ├── PortalMenu.tsx          # Menu basé sur Portal
│   ├── MistralModal.tsx        # Génération de Gantt par IA
│   ├── VersionSelector.tsx     # Sélecteur de version
│   ├── GanttTutorial.tsx       # Tutoriel interactif
│   └── BudgetPrevisionnel.tsx  # Gestion des prévisions budgétaires
└── utils/
    ├── dateUtils.ts       # Utilitaires de manipulation de dates
    ├── timelineUtils.ts   # Génération de timeline
    ├── taskUtils.ts       # Assistants de tâches
    ├── budgetUtils.ts     # Calculs budgétaires
    └── mistralUtils.ts   # Parsing JSON Mistral IA
```

## Types de données

### Interface Task

```typescript
interface Task {
  id: number;              // Identifiant unique
  text: string;           // Nom de la tâche
  start: Date;            // Date de début
  end: Date;              // Date de fin
  progress: number;        // Pourcentage d'avancement 0-100
  parent: number;         // ID de la tâche parente (0 pour les racines)
  type: 'task' | 'milestone' | 'project';
  details: string;        // Description
  notes: string;          // Notes supplémentaires
  files: string[];        // URLs des fichiers joints
  assigneeIds: number[];  // IDs des utilisateurs assignés
  livrableIds: number[]; // IDs des livrables associés
  goal?: string;          // Objectif de la tâche
  color?: string;         // Couleur personnalisée (hex)
  budget?: Budget;        // Données budgétaires
}
```

### Types de tâches

| Type | Description | Visuel |
|------|-------------|--------|
| `task` | Tâche régulière | Barre rectangulaire arrondie |
| `milestone` | Jalon unique | Forme losange |
| `project` | Conteneur parent | Indicateur carré |

### Interface Link

```typescript
interface Link {
  id: number;
  source: number;  // ID de la tâche source
  target: number;  // ID de la tâche cible
  type: number;    // 0: finish-to-start, 1: start-to-start, etc.
}
```

### Interface GanttData

```typescript
interface GanttData {
  tasks: Task[];
  links: Link[];
  users: { id: number; label: string }[];
  livrables: { id: number; label: string; description: string }[];
}
```

## Hooks

### useGanttState

Gère tout l'état React du diagramme de Gantt.

**État géré:**
- `tasks` - Tableau de tâches
- `links` - Tableau de dépendances
- `data` - Données Gantt complètes de l'API
- `viewMode` - 'day' | 'week' | 'month'
- `pxPerDay` - Niveau de zoom
- `expandedTasks` - Ensemble des IDs de tâches parentes développées
- `history` - Pile d'historique undo/redo
- `selectedTask` - Tâche actuellement sélectionnée
- `editingTask` - Tâche en cours d'édition

**Actions:**
- `addTask()` - Créer une nouvelle tâche
- `addChildTask(parentId)` - Créer une sous-tâche
- `deleteTask(id)` - Supprimer une tâche (en cascade)
- `updateTask()` - Sauvegarder les modifications
- `undo()` / `redo()` - Navigation dans l'historique

### useGanttHandlers

Gère toutes les interactions souris/tactile:

| Gestionnaire | Fonction |
|--------------|----------|
| `handleMouseDown` | Initier glisser/redimensionner/changer progression |
| `handleMouseMove` | Mettre à jour la position pendant le glisser |
| `handleMouseUp` | Finaliser le glisser et sauvegarder |
| `handleTaskContextMenu` | Afficher le menu contextuel |
| `handleTimelineMouseMove` | Mettre à jour la position du curseur |

### useGanttExportImport

Gère l'import/export des données:

| Fonction | Format | Description |
|----------|--------|-------------|
| `exportData()` | JSON | Export complet avec tâches et liens |
| `importData()` | JSON | Import depuis fichier JSON |
| `exportToCSV()` | CSV | Export tabulaire |
| `importFromCSV()` | CSV | Import depuis CSV |
| `exportToExcel()` | XLSX | Excel avec feuilles Tâches/Liens |
| `importFromExcel()` | XLSX | Import depuis Excel |
| `exportToMSProject()` | XML | Format Microsoft Project |
| `importMistralGantt()` | JSON | Import Gantt généré par IA depuis Mistral |

**Processus d'import:**
1. Parser le fichier
2. Créer les tâches avec des IDs temporaires
3. Trier les parents avant les enfants
4. Sauvegarder via l'API avec mapping des IDs
5. Mettre à jour les références parents avec les nouveaux IDs

## Nouvelles fonctionnalités (v2.0)

### Gestion des versions

Le diagramme de Gantt supporte désormais la **gestion des versions**, permettant de créer et gérer plusieurs versions de votre plan de projet.

| Fonctionnalité | Description |
|----------------|-------------|
| Créer une version | Créer des versions nommées du Gantt |
| Changer de version | Basculer entre les différentes versions |
| Dupliquer une version | Créer une nouvelle version en copiant une existante |
| Supprimer une version | Retirer les versions indésirables |
| Activer une version | Marquer une version comme active/par défaut |
| Persistance | La sélection de version est sauvegardée dans localStorage |

**Utilisation:**
- Cliquez sur le menu déroulant des versions dans la barre d'outils
- Sélectionnez "Nouvelle version" pour en créer une nouvelle
- Cochez "Dupliquer les actions de..." pour copier les tâches de la version actuelle
- La version principale (sans version sélectionnée) contient toutes les tâches sans filtrage

### Intégration Mistral IA

Générez des diagrammes de Gantt automatiquement avec **Mistral IA** - décrivez votre projet en langage naturel et laissez l'IA créer la structure des tâches.

**Fonctionnalités:**
- Saisie textuelle: Décrivez votre projet et vos tâches en français
- Upload de fichiers: Téléchargez des fichiers PDF, DOC ou texte avec les détails du projet
- Traitement IA: Mistral IA parse votre saisie et génère la structure des tâches
- Import vers Gantt: Import en un clic des tâches générées

**Utilisation:**
1. Cliquez sur le bouton menu (⋯) dans la barre d'outils
2. Sélectionnez "Mistral" pour ouvrir la modal IA
3. Entrez une description comme: "Créer un projet de construction d'école avec 3 phases: préparation (2 semaines), construction (3 mois), inauguration (1 mois)"
4. Cliquez sur "Générer avec Mistral AI"
5. Examinez les tâches générées et cliquez sur "Importer dans le Gantt"

### Tutoriel interactif

Un **tutoriel pas à pas** complet aide les nouveaux utilisateurs à découvrir toutes les fonctionnalités du Gantt.

**Sujets du tutoriel:**
- Bienvenue et introduction
- Ajouter des tâches
- Éditer des tâches
- Déplacer des tâches (glisser-déposer)
- Redimensionner des tâches
- Modes de vue (jour/semaine/mois)
- Contrôles de zoom
- Navigation vers aujourd'hui
- Fonctionnalité Annuler/Rétablir
- Suivi de la progression
- Sous-tâches et hiérarchie
- Assignés
- Dépendances
- Jalons
- Raccourcis clavier

**Utilisation:**
- Cliquez sur le bouton "Tutoriel" dans la barre d'outils
- Naviguez avec les flèches ou cliquez "Suivant/Précédent"
- Appuyez sur ESC pour fermer à tout moment

### Affichage/Masquage de la liste des tâches

La barre latérale gauche (liste des tâches) peut maintenant être **affichée/masquée** pour une meilleure visibilité de la timeline.

**Fonctionnalités:**
- Bouton de bascule sur le bord entre les panneaux
- Animation fluide lors du basculement
- Indicateur visuel de l'état actuel
- Support des raccourcis clavier

### Panneau de résumé des tâches amélioré

La barre latérale des détails inclut désormais des **sections dépliables** et des fonctionnalités améliorées:

| Section | Fonctionnalités |
|---------|-----------------|
| Nom de la tâche | Affichage proéminent avec indicateur de couleur |
| Budget total | Affichage du calcul en temps réel |
| Livrables | Liste des livrables associés avec statut |
| Notes | Ajouter/supprimer des notes horodatées |
| Fichiers | Upload, visualisation et suppression de pièces jointes |
| Progression | Barre de progression visuelle |
| Info rapide | Date de début, fin, assignés, statut |
| Description | Description complète de la tâche |

### Import/Export amélioré

Nouvelles options d'import ajoutées:

| Format | Description |
|--------|-------------|
| Mistral JSON | Import de structure Gantt générée par IA |
| CSV | Import depuis tableur |
| Excel | Import depuis classeur Excel |
| JSON | Import complet des données |

### Budget Prévisionnel

La fonctionnalité Budget Prévisionnel permet de créer et gérer des prévisions budgétaires avec plusieurs scénarios et options de granularité.

#### Accès
- Cliquez sur le bouton "Prévisionnel" (icône calculatrice) dans la barre d'outils du Gantt
- S'ouvre comme une modal avec trois onglets: Aperçu, Prévision, et Comparaison

#### Fonctionnalités

**Onglet Aperçu**
- Comparaison Réel vs Prévision (graphiques en barres et aire)
- Tableau détaillé par année avec analyse des écarts
- Indicateurs de statut budgétaire (Excellent/Correct/Écart)

**Onglet Prévision**
- **Scénarios**: Créer plusieurs scénarios de prévision (Optimiste, Pessimiste, Base)
- **Options de granularité**:
  - Annuel - Grouper par année
  - Trimestriel - Grouper par trimestre (T1-T4)
  - Mensuel - Grouper par mois (Janvier-Décembre)
- **Prévisions manuelles**: Ajouter des éléments avec:
  - Description
  - Catégorie (avec autocomplétion pour les catégories existantes, ou texte libre pour personnalisées)
  - Montant
  - Année
  - Trimestre (optionnel)
  - Mois (optionnel)
- **Génération automatique**: Générer des prévisions depuis les données historiques avec taux de croissance

**Onglet Comparaison**
- Comparaison visuelle budget réel vs prévisionnel
- Analyse des écarts avec indicateurs de pourcentage

#### Types de données

```typescript
interface ForecastItem {
  id: string;
  category: string;        // Catégorie personnalisée ou prédéfinie
  description: string;
  amount: number;
  year: number;
  quarter?: string;        // T1, T2, T3, T4 (optionnel)
  month?: number;          // 1-12 (optionnel)
  isManual: boolean;       // true si ajouté manuellement
}

interface ForecastScenario {
  id: string;
  name: string;            // ex: "Scénario de base"
  items: ForecastItem[];
  growthRate: number;      // Pourcentage pour la génération automatique
}

type Granularity = 'yearly' | 'quarterly' | 'monthly';
```

#### Catégories
Catégories budgétaires par défaut:
- Moyen humain
- Stagiaires
- Aménagements
- Équipements pédagogiques
- Prestations
- Frais de déplacement
- Autres prestations
- Communications

Les catégories personnalisées peuvent être ajoutées en saisissant dans le champ catégorie (l'autocomplétion affiche les catégories existantes).

## Composants

### GanttTimeline

Le composant principal de visualisation de la timeline.

**Fonctionnalités:**
- En-têtes persistants (groupes + unités)
- Marqueur du jour (ligne verticale rouge)
- Indicateur de date au curseur
- Grille pour les unités de temps
- Barres de tâches avec poignées de redimensionnement
- Formes losange pour les jalons

### GanttTaskList

Barre latérale affichant la hiérarchie des tâches:
- Nom de la tâche avec indentation hiérarchique
- Dates de début/fin
- Assignés
- Pourcentage de progression + barre visuelle
- Développer/réduire les tâches parentes

### GanttTaskEditor

Modale d'édition avec onglets:
1. **Général** - Info de base
2. **Moyen humain** - Coûts de personnel
3. **Stagiaires** - Budget stages
4. **Aménagements** - Coûts d'aménagement
5. **Équipements pédagogiques** - Coûts d'équipement
6. **Prestations** - Sous-traitance/déplacements
7. **Communications** - Coûts de communication

### GanttContextMenu

Options du menu contextuel clic droit:
- Ajouter une sous-tâche
- Éditer la tâche
- Supprimer la tâche

### MistralModal

Modale de génération de Gantt par IA:
- Saisie textuelle de la description du projet
- Upload de documents
- Aperçu des tâches générées
- Fonctionnalité d'import vers Gantt

### VersionSelector

Menu déroulant de gestion des versions:
- Créer de nouvelles versions
- Basculer entre les versions
- Supprimer des versions
- Activer/désactiver des versions
- Dupliquer depuis la version actuelle

### GanttTutorial

Modale de tutoriel interactif:
- Guide pas à pas
- Navigation clavier
- Surbrillances visuelles
- Suivi de la progression
- 15+ sujets de tutoriel

## Intégration API

### Points de terminaison backend

Tous les points de terminaison nécessitent l'authentification via cookie JWT.

| Méthode | Point de terminaison | Description |
|---------|---------------------|-------------|
| GET | `/api/gantt/:projectId` | Récupérer toutes les données Gantt |
| POST | `/api/gantt/:projectId/tasks` | Créer une tâche |
| PUT | `/api/gantt/:projectId/tasks/:taskId` | Mettre à jour une tâche |
| DELETE | `/api/gantt/:projectId/tasks/:taskId` | Supprimer une tâche (en cascade) |
| PUT | `/api/gantt/:projectId/tasks/bulk` | Mise à jour en masse |
| POST | `/api/gantt/:projectId/links` | Créer une dépendance |
| DELETE | `/api/gantt/:projectId/links/:linkId` | Supprimer une dépendance |
| POST | `/api/gantt/:projectId/deliverables` | Créer un livrable |
| GET | `/api/gantt/:projectId/subactions` | Récupérer les sous-actions |

### Points de terminaison API de version

| Méthode | Point de terminaison | Description |
|---------|---------------------|-------------|
| GET | `/api/gantt/:projectId/versions` | Récupérer toutes les versions |
| POST | `/api/gantt/:projectId/versions` | Créer une nouvelle version |
| PUT | `/api/gantt/:projectId/versions/:versionId` | Mettre à jour une version |
| DELETE | `/api/gantt/:projectId/versions/:versionId` | Supprimer une version |
| PUT | `/api/gantt/:projectId/versions/:versionId/activate` | Activer une version |

### Fonctions API (ganttApi.ts)

```typescript
fetchGanttData(projectId, versionId?): Promise<GanttData>
createTask(projectId, taskData): Promise<Task>
updateTask(projectId, taskId, taskData): Promise<Task>
deleteTask(projectId, taskId): Promise<void>
bulkUpdateTasks(projectId, tasks): Promise<void>
createTaskLink(projectId, linkData): Promise<Link>
deleteTaskLink(projectId, linkId): Promise<void>
createDeliverable(projectId, data): Promise<Livrable>
fetchSubActions(projectId): Promise<SubAction[]>

// Fonctions de version
fetchVersions(projectId): Promise<Version[]>
createVersion(projectId, versionData): Promise<Version>
updateVersion(projectId, versionId, versionData): Promise<Version>
deleteVersion(projectId, versionId): Promise<void>
activateVersion(projectId, versionId): Promise<Version>
```

### Interface de version

```typescript
interface Version {
  versionId: number;
  projectId: number;
  name: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  taskCount?: number;
  linkCount?: number;
}
```

## Configuration

### Constantes (constants.ts)

```typescript
const ROW_HEIGHT = 60;           // Hauteur de ligne en px
const MIN_START_DATE = new Date(2020, 0, 1);
const MAX_HISTORY_STATES = 20;
const DEFAULT_DAY_WIDTH = {
  day: 24,    // 24px par jour
  week: 18,   // 18px par jour
  month: 6,   // 6px par jour
};
```

### Modes de vue

| Mode | Description | Largeur par défaut |
|------|-------------|-------------------|
| `day` | Vue journalière | 24px/jour |
| `week` | Vue hebdomadaire | 18px/jour |
| `month` | Vue mensuelle | 6px/jour |

## Codage couleur

Les couleurs des barres de tâches indiquent la progression:

| Progression | Couleur | Hex |
|-------------|---------|-----|
| 100% | Vert | `#00C000` |
| 75-99% | Émeraude | `#10b981` |
| 50-74% | Ambre | `#f59e0b` |
| 1-49% | Orange | `#f97316` |
| 0% | Gris | `#6b7280` |

## Utilitaires

### dateUtils

Toutes les opérations de date utilisent **UTC** pour éviter les problèmes de fuseau horaire:

| Fonction | Utilité |
|----------|---------|
| `toUTC(d)` | Convertir en timestamp UTC |
| `startOfDay(d)` | Obtenir le début du jour en UTC |
| `addDays/Weeks/Months` | Ajouter des périodes |
| `daysInMonth(d)` | Obtenir les jours dans le mois |
| `getISOWeek(d)` | Obtenir le numéro de semaine ISO |

### timelineUtils

| Fonction | Utilité |
|----------|---------|
| `generateColumns()` | Créer les colonnes de timeline |
| `getBaseStart()` | Obtenir la date de début de timeline |
| `getDateRange()` | Calculer la plage de dates depuis les tâches |

### budgetUtils

| Fonction | Utilité |
|----------|---------|
| `createEmptyBudget()` | Créer un objet budget par défaut |
| `calculateTotal()` | Calculer le total du budget |
| `calculateBudgetTotals()` | Calculer les totaux détaillés du budget |

### mistralUtils

| Fonction | Utilité |
|----------|---------|
| `parseMistralJSON()` | Parser la réponse JSON de l'IA |
| `transformMistralJSONToGanttTasks()` | Convertir les tâches IA en tâches Gantt |

## Problèmes courants

### Les tâches n'apparaissent pas après rechargement
- Vérifier la connexion API
- Vérifier le projectId dans l'URL
- Vérifier la console du navigateur pour les erreurs

### Le glisser-déposer ne fonctionne pas
- S'assurer qu'aucun autre bouton de souris n'est pressé
- Vérifier les écouteurs d'événements conflictuels

### L'import échoue
- Vérifier que le format JSON/CSV correspond à la structure attendue
- Vérifier les IDs en double
- S'assurer que les tâches parentes existent avant les enfants

### Les sous-tâches ne sont pas supprimées avec le parent
- Le backend devrait supprimer en cascade (voir ganttService.js)
- S'assurer que le serveur a été redémarré après les mises à jour

## Performance

- `useMemo` pour les calculs coûteux
- `requestAnimationFrame` pour un glisser fluide
- Historique limité à 20 états
- Défilement virtuel via gestion du overflow

## Dépendances

- **React** - Bibliothèque UI
- **lucide-react** - Icônes
- **xlsx** - Import/export Excel
- **@/api/ganttApi** - Client API

## Raccourcis clavier

| Touche | Action |
|--------|--------|
| `N` | Ajouter une nouvelle tâche |
| `E` | Éditer la tâche sélectionnée |
| `Delete` | Supprimer la tâche sélectionnée |
| `Ctrl+Z` | Annuler |
| `Ctrl+Y` | Rétablir |
| `←/→` | Naviguer dans les étapes du tutoriel |
| `ESC` | Fermer la modal / Quitter le tutoriel |
