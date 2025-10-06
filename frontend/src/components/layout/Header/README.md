# Header
Les composants **'Header'** et **'HeaderMobile'** gèrent l'affichage du haut de page (*top navigation*).

> ⚠️ le composant [**ClientLayout**](../README.md) gère l'affichage de la bonne version en fonction de la taille de l'écran.

## Structure
- [**Header.tsx**](./Header.tsx) - Desktop
    - Simple barre fixe en haut avec logo/branding.
    - Réagit au scroll (**useScroll**) et au segment de route actif (**useSelectedLayoutSegment**).
- [**HeaderMobile**](./Header-mobile.tsx) - Mobile
    - Menu burger animé avec cercle qui s'élargit pour révéler les liens.
    - Génère dynamiquement les items à partir de [**SIDENAV_ITEMS**](../SideNav/constants.tsx)

- **Hooks utilisés**
    - [useScroll](../../../hooks/useScroll.tsx) → détection du scroll vertical pour changer le style du header.
    - [useDimensions](../../../hooks/useDimensions.ts) → récupération de la hauteur du conteneur pour l'animation du menu burger.

## Usage

```tsx
import { Header, HeaderMobile } from "@/components/layout"

export default function Page() {
    return (
        <div>
            <Header/>
            <HeaderMobile/>
            <main>
                Contenu
            </main>
        </div>
    )
}
```
Note : [**ClientLayout**](../ClientLayout.tsx) gère l'affichage automatique de la version desktop ou mobile.

<p align=center>
    <img src="../../../../public/docs/Header.gif" alt="Aperçu du header avec son responsive headerMobile">
</p>

## Bonne pratiques
1. Utiliser [**SIDENAV_ITEMS**](../SideNav/constants.tsx) comme source unique pour les liens afin de rester cohérent avec la navigation principale.
2. Ne pas dépasser 1 niveau de nous-menu pour garder la navigation simple et rapide.
4. Pour toute modification majeure du style ou de l'animation, privilégier les hooks et Framer Motion plutôt que des changements inline pour garder la maintenabilité.