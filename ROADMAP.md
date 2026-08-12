# Roadmap StudyForge

Fonctionnalités planifiées, par ordre d'impact. Issues d'une analyse du code existant.

## Priorité haute

- [ ] **Spaced repetition (SRS)** : calculer `next_review` (algo SM-2 simplifié), trier les cartes dues, re-revoir les cartes « nouveau / difficile » avant les autres. C'est la valeur phare du produit (promis sur la Landing).
- [ ] **Réinitialisation de mot de passe** : lien « Forgot password? » sur le Login + `supabase.auth.resetPasswordForEmail` + écran de nouveau mot de passe.
- [ ] **Gestion des cours** : supprimer un cours (avec ses questions/cartes/progrès), régénérer quiz ou flashcards individuellement depuis le Dashboard.
- [ ] **Édition de profil** : modifier le nom, changer/retirer l'avatar (avec validation taille/type, purger les anciens fichiers du bucket de stockage).

## Priorité moyenne

- [ ] **Quiz** : mélanger l'ordre des options, navigation clavier (1-4, Entrée), revue des erreurs en fin de quiz.
- [ ] **Upload** : validation type/taille côté client (déjà une base avec le rename du titre), vraie progression serveur, message dedié par question de plusieurs fichiers.
- [ ] **Page Settings fonctionnelle** : les boutons « Settings » (Sidebar + AvatarMenu) sont inactifs.
- [ ] **Recherche / tri des cours** sur le Dashboard.

## UX

- [ ] **Raccourcis clavier** pour les flashcards (Espace pour retourner, A/H/G/E pour la notation).
- [ ] **Timer de quiz optionnel** avec vue de fin.
- [ ] **Thème clair** en option.

## Technique

- [ ] **Types Supabase générés** (supabase gen types) pour remplacer les interfaces manuelles dans `src/lib/types.ts`.
- [ ] **Typecheck dans le workflow** : lier les types `lucide-react` manquants et faire passer `tsc --noEmit` au CI.
- [ ] **Upload par lots** (max N MB par fichier, limite globale).