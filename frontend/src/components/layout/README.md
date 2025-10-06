# Layout
Le dossier **/layout** regroupe les composants qui définissent la **structure globale de l'application**.
Ils permettent de séparer clairement :
- l'affichage des **pages publiques** (sans navigation),
- l'affichage des **pages authentifiées** (avec navigation),
- la **gestion de l'espace et des marges** pour assurer une mise en page cohérente et réactive.

## Pourquoi des ***wrappers*** ?
Les wrappers servent à **encapsuler la logique de mise en forme** dans des composants réutilisables.
Ainsi, les pages de l'application restent concentrées sur leur contenu métier, sans avoir à gérer la stucture ni les marges.

Avantages :
- Cohérence visuelle sur toutes les pages
- Centralisation de la logique d'affichage (sidebar, header, responsive, etc.)
- Code des pages plus simple et lisible

## Composants
### PageWrapper
**But** : appliquer un style cohérent au contenu principal d'une page (padding, fond, espacement).
Chaque page passe par ce container pour garder une mise en forme uniforme.

```tsx
<PageWrapper>
    <h1>Titre de la page</h1>
    <p>Contenu métier...</p>
</PageWrapper>
```

### MarginWidthWrapper
**But** : ajuster automatiquement la largeur et la marge gauche du contenu selon l'état de la sidebar (**isCollapsed**).
Il gère la transition fluide quand la sidebar est ouverte/fermée.

```tsx
<MarginWidthWrapper isCollapsed={false}>
    <PageWrapper>Contenu</PageWrapper>
</MarginWidthWrapper>
```

### ClientLayout
**But** : décider quel layout utiliser en fonction de la page courante (**usePathname**). Il différencie les **pages publiques** (page de connexion) des **pages privées** (avec navigation et wrappers).

```tsx
<ClientLayout>
    <h1>Tableau de bord</h1>
</ClientLayout>
```