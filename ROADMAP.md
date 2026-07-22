# StudyForge — Roadmap

## Phase 1 : Setup Infrastructure ✅

- [x] Structurer l'architecture du projet (dossiers `src/lib/`, `supabase/functions/`, etc.)
- [x] Installer `@supabase/supabase-js`
- [x] Créer le client Supabase (`src/lib/supabase/client.ts`)
- [x] Créer les types partagés (`src/lib/types.ts`)
- [x] Créer le schéma SQL (`supabase/schema.sql`) + RLS + indexes (complet : select/insert/update/delete sur toutes les tables)
- [x] Configurer `.env` + `.env.example`
- [x] Connecter le client Supabase au vrai projet (URL + publishable key)
- [x] Ajouter favicon + app icons (`.ico`, `.png`, `apple-touch-icon`, `site.webmanifest`)
- [x] Nettoyer `vite.config.ts` (supprimer plugins Figma Make)
- [x] Nettoyer `index.html` (commentaires Figma → balises standard)
- [x] Utiliser l'icon `android-chrome-192x192.png` comme logo sidebar

## Phase 2 : Auth Supabase ✅

- [x] Créer le hook `useAuth()` (session, user, login, signup, logout)
- [x] Créer l'écran Login (`src/screens/Login.tsx`)
- [x] Créer l'écran Signup (`src/screens/Signup.tsx`) avec flow confirmation email
- [x] Intégrer l'auth dans `App.tsx` (AuthProvider, routing conditionnel)
- [x] Ajouter la mention "H.S Company" dans le footer Landing
- [x] Ajouter le système de citations inspirantes (Dashboard, citation aléatoire au chargement)
- [x] Ajouter champ "Full name" au formulaire d'inscription (stocké dans `user_metadata`)
- [x] Augmenter la sécurité mot de passe à 8+ caractères avec indicateur de force
- [x] Créer l'écran `CompleteProfile` pour les comptes existants sans nom
- [x] Rediriger vers CompleteProfile si profil incomplet après connexion

## Phase 3 : Upload Cours + Extraction PDF ✅

- [x] Implémenter l'Edge Function `extract-course` (Deno/TS) — extraction PDF/TXT/MD
- [x] Connecter l'écran Upload à Supabase (upload réel + titre + error handling)
- [x] Afficher les cours récents depuis la DB
- [x] Corriger l'import `Buffer` pour Deno (`node:buffer`)
- [x] Remplacer `pdf-parse` par `unpdf@1.6.2` (compatible Edge Functions, pas de bug de fichier test)
- [x] Tester : uploader un PDF → texte extrait visible dans la DB

## Phase 4 : Intégration LLM (couche d'abstraction) ✅

- [x] Créer `supabase/functions/_shared/llm/types.ts` (interface `LLMProvider`)
- [x] Implémenter le provider Gemini (`providers/gemini.ts`)
- [x] Implémenter le provider Groq (`providers/groq.ts`)
- [x] Implémenter le provider Ollama (`providers/ollama.ts`)
- [x] Créer `supabase/functions/_shared/llm/index.ts` (sélection via env `LLM_PROVIDER`)
- [x] Configurer Groq comme provider actif (`.env` + secrets Supabase)
- [x] Tester : appeler le LLM depuis une Edge Function avec un texte exemple

## Phase 5 : Génération Quiz ✅

- [x] Implémenter l'Edge Function `generate-quiz` (appel Groq → parsing JSON → insert DB)
- [x] Corriger le schéma d'insert : une ligne par question (course_id, question, options, bonne_reponse, explication)
- [x] Ajouter le filtre `user_id` pour la sécurité (bypass RLS avec service_role)
- [x] Déployer via Dashboard Supabase

## Phase 6 : Génération Flashcards ✅

- [x] Implémenter l'Edge Function `generate-flashcards` (appel Groq → parsing JSON → insert DB)
- [x] Corriger le schéma d'insert : une ligne par flashcard (course_id, recto, verso)
- [x] Ajouter le filtre `user_id` pour la sécurité
- [x] Déployer via Dashboard Supabase

## Phase 7 : Dashboard connecté aux vraies données ✅

- [x] Récupérer les vrais cours depuis Supabase (triés par date décroissante)
- [x] Compter le nombre réel de quiz et flashcards par cours
- [x] Afficher le vrai nom de l'utilisateur (depuis `user_metadata.full_name`)
- [x] Salut adaptatif (Good morning/afternoon/evening)
- [x] État de chargement pendant la récupération
- [x] État vide avec bouton "Upload a course" si aucun cours

## Phase 8 : Frontend Quiz + Flashcards ✅

- [x] Implémenter le frontend Quiz (`src/screens/Quiz.tsx`) — récupérer les vraies questions depuis Supabase
- [x] Afficher les questions, gérer les réponses, calculer le score
- [x] Stocker la progression dans `user_progress`
- [x] Implémenter le frontend Flashcards (`src/screens/Flashcards.tsx`) — récupérer les vraies flashcards
- [x] Système de flip (recto/verso) + boutons niveau (nouveau, difficile, bien, facile)
- [x] Stocker la progression dans `flashcard_progress`
- [x] Tester : générer un quiz → jouer le quiz → score enregistré
- [x] Tester : générer des flashcards → les réviser → progression enregistrée

## Phase 9 : Page Progression ✅

- [x] Implémenter le frontend Progress (`src/screens/Progress.tsx`) avec vraies données Supabase
- [x] Stats : score moyen quiz, streak, mastered flashcards, nombre de quiz
- [x] Graphiques : score over time (area chart), score par cours (bar chart)
- [x] Course breakdown avec barres de progression
- [x] Weekly activity grid (basé sur les données réelles)

## Phase 10 : Polish UI

- [x] Responsive mobile (tous les écrans : Landing, Dashboard, Upload, Quiz, Flashcards, Progress)
- [x] États de chargement + error handling (Dashboard, Auth)
- [ ] Dark mode cohérent (accent violet #7C5CFF)

## Phase 11 : Déploiement

- [ ] Déployer le frontend sur Vercel (Hobby plan, gratuit)
- [ ] Déployer les Edge Functions Supabase
- [ ] Configurer les variables d'environnement en production
- [ ] Tester le flow complet en production
