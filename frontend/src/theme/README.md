# Mediscan theme

Le systeme de couleur a ete simplifie.

La feuille de theme globale a ete fusionnee dans [app.css](/Users/taskin/Desktop/mediscan-main-test/frontend/src/styles/app.css).
Il ne reste plus qu'un seul point d'entree CSS global.

Les regles a suivre :

1. Modifier les couleurs seulement dans [palettes.js](/Users/taskin/Desktop/Projet%20Semestre%206/test-mediscan/frontend/src/theme/palettes.js).
2. Utiliser les classes `ui-*` pour les surfaces, boutons, chips et textes.
3. Ajouter les classes `fx-*` seulement si un effet visuel est vraiment voulu.
4. Eviter les `linear-gradient`, `radial-gradient` et `color-mix` dans les composants React.

Classes principales :

- `ui-surface`
- `ui-surface-soft`
- `ui-surface-primary`
- `ui-surface-accent`
- `ui-button`
- `ui-button-outline-primary`
- `ui-button-outline-accent`
- `ui-button-solid-primary`
- `ui-button-solid-accent`
- `ui-chip`
- `ui-chip-primary`
- `ui-chip-accent`
- `ui-text-primary`
- `ui-text-accent`

Effets optionnels :

- `fx-shadow-sm`
- `fx-shadow-md`
- `fx-glow-primary`
- `fx-glow-accent`
