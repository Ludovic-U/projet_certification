# Feuille de route des améliorations futures du diagramme de Gantt

Ce document décrit les améliorations planifiées et proposées pour le module du diagramme de Gantt.

---

## 🚀 Fonctionnalités planifiées (Prochaine version v2.1)

### 1. Visualisation avancée des dépendances

**Description:** Améliorer les lignes de dépendances avec une meilleure visualisation et validation.

**Fonctionnalités:**
- Distinction visuelle entre les types de dépendances (fin-à-début, début-à-début, etc.)
- Mise en évidence du chemin critique
- Avertissements de validation des dépendances (détection des dépendances circulaires)
- Créer des dépendances par glisser-déposer directement sur la timeline

**Fichiers à modifier:**
- `components/GanttTimeline.tsx` - Ajouter le rendu des dépendances
- `hooks/useGanttHandlers.ts` - Gérer la création des dépendances

### 2. Gestion des ressources

**Description:** Ajouter la visualisation de l'allocation et de la charge des ressources.

**Fonctionnalités:**
- Vue de la charge des ressources (utilisateurs)
- Avertissements de surcharge
- Timeline des ressources montrant la disponibilité des utilisateurs
- Glisser les tâches entre les assignés

**Fichiers à créer:**
- `components/GanttResourceView.tsx` - Vue d'allocation des ressources
- `components/GanttResourcePanel.tsx` - Panneau latéral des ressources
- `utils/resourceUtils.ts` - Calculs des ressources

### 3. Comparaison avec la baseline

**Description:** Comparer le calendrier actuel avec les dates de référence/Objectif.

**Fonctionnalités:**
- Définir les dates de référence pour les tâches
- Comparaison visuelle (mise en évidence des écarts)
- Vue timeline référence vs réel
- Rapports d'écarts

**Fichiers à modifier:**
- `types.ts` - Ajouter les champs de référence à Task
- `components/GanttTimeline.tsx` - Rendre l'overlay de référence
- `api/ganttApi.ts` - Ajouter les endpoints de référence

---

## 🔮 Fonctionnalités proposées (v2.2+)

### 4. Modèles de diagramme de Gantt

**Description:** Sauvegarder et charger des modèles de Gantt pour les types de projets courants.

**Fonctionnalités:**
- Modèles préconstruits (Construction, Événement, Développement logiciel, etc.)
- Sauvegarder des modèles personnalisés
- Place de marché de modèles (futur)

**Fichiers à créer:**
- `data/templates/` - Fichiers JSON des modèles
- `components/TemplateSelector.tsx` - Modale de sélection de modèle

### 5. Suivi budgétaire avancé

**Description:** Gestion budgétaire améliorée avec prévision et alertes.

**Fonctionnalités:**
- Suivi budget vs réel
- Gestion des taux de coût
- Prévision budgétaire basée sur la progression
- Seuils d'alerte

**Fichiers à modifier:**
- `utils/budgetUtils.ts` - Ajouter des fonctions de prévision
- `components/GanttBudgetPanel.tsx` - Vue budgétaire améliorée

### 6. Fonctionnalités de collaboration d'équipe

**Description:** Collaboration en temps réel et commentaires.

**Fonctionnalités:**
- Commentaires/sujets sur les tâches
- @mentions pour les membres de l'équipe
- Journal d'activité
- Synchronisation en temps réel (WebSocket)
- Notifications

**Fichiers à créer:**
- `components/TaskComments.tsx` - Système de commentaires
- `services/collaboration.ts` - Synchronisation en temps réel

### 7. Intégration calendrier

**Description:** Synchronisation avec les calendriers externes.

**Fonctionnalités:**
- Export/import iCal
- Synchronisation Google Calendar
- Intégration Outlook
- Synchroniser les échéances vers le calendrier

**Fichiers à créer:**
- `utils/calendarUtils.ts` - Conversions de format calendrier

### 8. Rapports et analytique

**Description:** Générer des rapports et analytique de projet.

**Fonctionnalités:**
- Rapports de progression de projet (export PDF)
- Graphiques burndown/burnup
- Rapports de jalons atteints
- Métriques de productivité de l'équipe

**Fichiers à créer:**
- `components/GanttReports.tsx` - Générateur de rapports
- `utils/reportUtils.ts` - Génération de rapports

---

## 💰 Budget Prévisionnel - Améliorations futures détaillées

Cette section détail les améliorations potentielles pour la fonctionnalité Budget Prévisionnel (déjà partiellement implémentée en v2.0).

### Implémentation actuelle (v2.0)

L'implémentation actuelle inclut:
- Interface basée sur modal avec trois onglets (Aperçu, Prévision, Comparaison)
- Support de plusieurs scénarios de prévision
- Trois vues de granularité: Annuel, Trimestriel, Mensuel
- Création manuelle d'éléments de prévision avec catégorie, montant, année, trimestre, mois
- Génération automatique depuis les données historiques avec taux de croissance
- Autocomplétion de catégorie avec entrée en texte libre pour les catégories personnalisées

### Améliorations futures

#### 1. Stockage persistant (Priorité: HAUTE)

**Problème:** Les prévisions sont actuellement stockées dans l'état du composant et perdues au rafraîchissement.

**Solution:** Sauvegarder les prévisions dans la base de données.

**Implémentation:**
- Ajouter un nouveau modèle de base de données pour ForecastScenario et ForecastItem dans `schema.prisma`
- Créer des endpoints API: `GET/POST/PUT/DELETE /api/gantt/:projectId/forecasts`
- Mettre à jour `BudgetPrevisionnel.tsx` pour récupérer/sauvegarder depuis l'API
- Ajouter des états de chargement et gestion d'erreurs

**Fichiers à créer/modifier:**
- `backend/prisma/schema.prisma` - Ajouter les modèles ForecastScenario, ForecastItem
- `backend/controllers/forecastController.js` - Nouveau contrôleur
- `backend/routes/forecastRoutes.js` - Nouvelles routes
- `backend/services/forecastService.js` - Nouveau service
- `frontend/src/api/forecastApi.ts` - Nouveau client API

**Proposition de schéma de base de données:**
```prisma
model ForecastScenario {
  id        String   @id @default(cuid())
  projectId Int
  name      String
  growthRate Float   @default(3.0)
  items     ForecastItem[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model ForecastItem {
  id          String           @id @default(cuid())
  scenarioId  String
  scenario    ForecastScenario @relation(fields: [scenarioId], references: [id])
  category    String
  description String
  amount      Float
  year        Int
  quarter     String?
  month       Int?
  isManual    Boolean          @default(true)
}
```

---

#### 2. Fonctionnalité d'export (Priorité: HAUTE)

**Problème:** Les utilisateurs ne peuvent pas exporter les prévisions pour usage externe.

**Solution:** Ajouter l'export vers PDF, Excel et CSV.

**Implémentation:**
- Ajouter des boutons d'export dans l'onglet Prévision
- Créer des utilitaires d'export utilisant la bibliothèque xlsx existante

**Fonctionnalités:**
- Exporter les prévisions par scénario
- Exporter avec la granularité sélectionnée
- Inclure les statistiques récapitulatives
- Export PDF avec graphiques

---

#### 3. Algorithmes de prévision avancés (Priorité: MOYENNE)

**Problème:** La génération automatique actuelle est une projection linéaire simple.

**Solution:** Implémenter des prévisions plus sophistiquées.

**Fonctionnalités:**
- Moyenne mobile pondérée
- Lissage exponentiel
- Ajustement saisonnier
- Plusieurs scénarios de projection (optimiste/pessimiste)
- Intervalles de confiance

**Fichiers à créer:**
- `utils/forecastUtils.ts` - Algorithmes de prévision

---

#### 4. Alertes et seuils budgétaires (Priorité: MOYENNE)

**Problème:** Pas d'avertissement quand les prévisions dépassent les limites.

**Solution:** Ajouter la surveillance des seuils budgétaires.

**Fonctionnalités:**
- Définir des limites budgétaires par catégorie
- Avertissements visuels quand on approche de la limite
- Notifications d'alerte
- Plafonds budgétaires mensuels/trimestriels

**Implémentation:**
- Paramètres de seuil dans l'onglet Aperçu
- Indicateurs codés par couleur dans l'onglet Prévention
- Modale d'avertissement lors de l'ajout d'éléments dépassant le seuil

---

#### 5. Intégration tâche-budget (Priorité: MOYENNE)

**Problème:** Les prévisions sont séparées des budgets réels des tâches.

**Solution:** Lier les prévisions aux tâches ou phases spécifiques.

**Fonctionnalités:**
- Associer des éléments de prévision aux tâches
- Afficher la progression des tâches liées dans la vue de prévision
- Calculer automatiquement les prévisions basées sur les budgets des tâches
- Suivi des écarts entre planifié et réel

**Implémentation:**
- Ajouter le champ optionnel `taskId` à ForecastItem
- Mettre à jour l'UI pour afficher les associations de tâches
- Ajouter un bouton de synchronisation pour mettre à jour les prévisions depuis les tâches

---

#### 6. Support multi-devises (Priorité: BASSE)

**Problème:** Seul l'EUR est supporté.

**Solution:** Ajouter la sélection et la conversion de devises.

**Fonctionnalités:**
- Sélecteur de devise (EUR, USD, GBP, etc.)
- Saisie/manual sync des taux de change
- Affichage dans la devise sélectionnée
- Suivi des taux historiques

---

#### 7. Améliorations des graphiques (Priorité: MOYENNE)

**Problème:** Les graphiques sont basiques et manquent d'interactivité.

**Solution:** Améliorer les visualisations de graphiques.

**Fonctionnalités:**
- Graphiques drill-down (cliquer année → voir trimestres → cliquer trimestre → voir mois)
- Graphiques camembert/anneau par catégorie
- Graphique de consommation cumulative
- Graphique de consommation budgétaire
- Info-bulles interactives avec plus de détails
- Changement de type de graphique (barre/ligne/aire)

---

#### 8. Comparaison de scénarios (Priorité: HAUTE)

**Problème:** Impossible de comparer facilement différents scénarios côte à côte.

**Solution:** Ajouter une vue de comparaison de scénarios.

**Fonctionnalités:**
- Comparaison de scénarios côte à côte
- Mise en évidence des différences
- Fusionner des scénarios
- Analyse meilleur/pire cas

---

#### 9. Prévisions récurrentes (Priorité: BASSE)

**Problème:** Saisie manuelle pour les dépenses récurrentes.

**Solution:** Support des éléments de prévision récurrents.

**Fonctionnalités:**
- Définir le pattern de récurrence (mensuel, trimestriel, annuel)
- Générer automatiquement les entrées futures
- Modifier une fois, mettre à jour tout

---

#### 10. Widget tableau de bord (Priorité: MOYENNE)

**Problème:** Doit ouvrir la modal pour voir le résumé des prévisions.

**Solution:** Ajouter un résumé compact dans la barre d'outils.

**Fonctionnalités:**
- Affichage du total des prévisions dans la barre d'outils
- Stats rapides (total, par catégorie)
- Cliquer pour ouvrir la modal complète

---

## 🛠️ Améliorations techniques

### Optimisations de performance

- [ ] Implémenter le défilement virtuel pour les grands ensembles de données (1000+ tâches)
- [ ] Ajouter le batchage requestAnimationFrame pour les mises à jour en masse
- [ ] Implémenter le chargement paresseux des détails de tâche
- [ ] Ajouter le cache IndexedDB pour le support hors ligne

### Améliorations de performance et UX du GanttTutorial

Le composant de tutoriel interactif peut être amélioré dans les domaines suivants:

#### Améliorations de performance

1. **Réduire les re-rendus**
   - Déplacer le tableau `tutorialSteps` hors du composant (actuellement recréé à chaque rendu)
   - Utiliser `useMemo` pour les calculs d'étapes

2. **Optimiser les keyframes d'animation**
   - Déplacer la chaîne de style `pulseAnimation` inline vers un fichier CSS
   - Crée actuellement une nouvelle balise `<style>` à chaque rendu

3. **Utiliser `useCallback` pour les gestionnaires d'événements**
   - Envelopper `goToNext`, `goToPrevious`, `goToStep` avec `useCallback`

4. **Debouncer les écouteurs de redimensionnement/défilement**
   - Ajouter du debouncing aux appels de `updateHighlightPosition`

#### Améliorations UX

5. **Persistance de la progression** - Sauvegarder/restaurer la progression du tutoriel depuis localStorage
6. **Option "Ne plus montrer"** - Ajouter une case à cocher pour sauter le tutoriel
7. **Meilleur indicateur de progression** - Barres de progression horizontales segmentées
8. **Positionnement dynamique de la modal** - Mesurer les dimensions réelles de la modal

#### Améliorations d'accessibilité

9. **Ajouter des attributs ARIA** - role="dialog", aria-modal, aria-labelledby
10. **Gestion du focus** - Piéger le focus dans la modal

#### Organisation du code

11. **Extraire les étapes du tutoriel** - Déplacer vers un fichier séparé
12. **Créer des composants d'animation réutilisables**

### Qualité du code

- [ ] Ajouter des tests unitaires (Jest/React Testing Library)
- [ ] Ajouter des tests d'intégration (Playwright)
- [ ] Implémenter des limites d'erreurs
- [ ] Ajouter des types TypeScript complets
- [ ] Ajouter une documentation JSDoc

### Accessibilité (a11y)

- [ ] Étiquettes ARIA pour tous les éléments interactifs
- [ ] Navigation clavier pour tout le Gantt
- [ ] Support lecteur d'écran
- [ ] Mode contraste élevé
- [ ] Indicateurs de focus

### Support mobile

- [ ] Design adaptatif pour tablettes
- [ ] Gestes tactiles pour glisser/redimensionner
- [ ] Barre d'outils adaptée aux mobiles
- [ ] Navigation par swipe

---

## 🎯 File de priorité des fonctionnalités

| Priorité | Fonctionnalité | Version cible |
|----------|----------------|---------------|
| P0 | Dépendances avancées | v2.1 |
| P0 | Gestion des ressources | v2.1 |
| P0 | Stockage persistant des prévisions | v2.1 |
| P0 | Export des prévisions | v2.1 |
| P1 | Comparaison avec baseline | v2.1 |
| P1 | Comparaison de scénarios de prévision | v2.1 |
| P1 | Modèles | v2.2 |
| P2 | Algorithmes de prévision avancés | v2.2 |
| P2 | Alertes budgétaires | v2.2 |
| P2 | Intégration tâche-budget | v2.2 |
| P2 | Collaboration d'équipe | v2.3 |
| P3 | Intégration calendrier | v2.3 |
| P3 | Rapports | v2.4 |

---

## 🔧 Directives de contribution

Lors de l'implémentation de nouvelles fonctionnalités:

1. **Suivre la structure de code existante**
   - Utiliser les mêmes patterns de composants
   - Suivre l'architecture des hooks
   - Maintenir les types TypeScript

2. **Exigences de test**
   - Tests unitaires pour les utilitaires
   - Tests de composants pour l'UI
   - Tests d'intégration pour l'API

3. **Documentation**
   - Mettre à jour README.md avec les nouvelles fonctionnalités
   - Ajouter des commentaires JSDoc
   - Mettre à jour les définitions de types

4. **Considérations de performance**
   - Utiliser memo/useCallback de manière appropriée
   - Éviter les re-rendus inutiles
   - Considérer la gestion des grands ensembles de données

---

## 📋 Liste de contrôle pour le développement de nouvelles fonctionnalités

- [ ] Créer une branche de fonctionnalité
- [ ] Ajouter des interfaces TypeScript
- [ ] Implémenter le composant/hook
- [ ] Ajouter à la barre d'outils/menu si nécessaire
- [ ] Mettre à jour l'API si nécessaire
- [ ] Ajouter des tests unitaires
- [ ] Mettre à jour la documentation
- [ ] Tester les cas limites
- [ ] Vérifier l'accessibilité
- [ ] Réviser l'impact sur la performance

---

## 💡 Demander de nouvelles fonctionnalités

Pour proposer de nouvelles fonctionnalités:

1. Consulter les issues/discussions existantes
2. Créer une issue avec:
   - Description de la fonctionnalité
   - Cas d'utilisation / motivation
   - Approche d'implémentation proposée
   - Priorité (P0-P3)
3. Discuter avec les mainteneurs

---

*Dernière mise à jour: Mars 2026*
*Version: 2.0*
