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

## Phase 3 : Upload Cours + Extraction PDF

- [ ] Implémenter l'Edge Function `extract-course` (Deno/TS)
- [ ] Installer `pdf-parse` côté Edge Function
- [ ] Créer la page Upload côté frontend (drag & drop + input titre)
- [ ] Stocker le cours dans la table `courses`
- [ ] Tester : uploader un PDF → texte extrait visible dans la DB

## Phase 4 : Intégration LLM (couche d'abstraction)

- [ ] Créer `supabase/functions/_shared/llm/types.ts` (interface `LLMProvider`)
- [ ] Implémenter le provider Gemini (`providers/gemini.ts`)
- [ ] Implémenter le provider Groq (`providers/groq.ts`)
- [ ] Implémenter le provider Ollama (`providers/ollama.ts`)
- [ ] Créer `supabase/functions/_shared/llm/index.ts` (sélection via env `LLM_PROVIDER`)
- [ ] Tester : appeler le LLM depuis une Edge Function avec un texte exemple

## Phase 5 : Génération Quiz

- [ ] Implémenter l'Edge Function `generate-quiz` (appel LLM → parsing JSON → insert DB)
- [ ] Implémenter le frontend Quiz (`src/screens/Quiz.tsx`)
- [ ] Afficher les questions, gérer les réponses, calculer le score
- [ ] Stocker la progression dans `user_progress`
- [ ] Tester : générer un quiz à partir d'un cours → jouer le quiz → score enregistré

## Phase 6 : Génération Flashcards

- [ ] Implémenter l'Edge Function `generate-flashcards` (appel LLM → parsing JSON → insert DB)
- [ ] Implémenter le frontend Flashcards (`src/screens/Flashcards.tsx`)
- [ ] Système de flip (recto/verso) + boutons niveau (nouveau, difficile, bien, facile)
- [ ] Stocker la progression dans `flashcard_progress`
- [ ] Tester : générer des flashcards → les réviser → progression enregistré

## Phase 7 : Page Progression

- [ ] Implémenter l'Edge Function `get-progress` (récupérer stats)
- [ ] Implémenter le frontend Progress (`src/screens/Progress.tsx`)
- [ ] Stats : score moyen quiz, nombre de cours révisés, streak, temps écoulé
- [ ] Tester : après avoir fait des quiz + flashcards → page progression affiche les bonnes stats

## Phase 8 : Polish UI

- [x] Responsive mobile (tous les écrans : Landing, Dashboard, Upload, Quiz, Flashcards, Progress)
- [ ] États de chargement + error handling
- [ ] Dark mode cohérent (accent violet #7C5CFF)

## Phase 9 : Déploiement

- [ ] Déployer le frontend sur Vercel (Hobby plan, gratuit)
- [ ] Déployer les Edge Functions Supabase
- [ ] Configurer les variables d'environnement en production
- [ ] Tester le flow complet en production
