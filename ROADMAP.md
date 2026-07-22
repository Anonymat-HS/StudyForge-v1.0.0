# StudyForge — Roadmap

## Phase 1 : Setup Infrastructure ✅

- [x] Structurer l'architecture du projet (dossiers `src/lib/`, `supabase/functions/`, etc.)
- [x] Installer `@supabase/supabase-js`
- [x] Créer le client Supabase (`src/lib/supabase/client.ts`)
- [x] Créer les types partagés (`src/lib/types.ts`)
- [x] Créer le schéma SQL (`supabase/schema.sql`) + RLS + indexes
- [x] Configurer `.env` + `.env.example`

## Phase 2 : Auth Supabase

- [ ] Installer `@supabase/auth-helpers-react` (si nécessaire)
- [ ] Créer les écrans Login / Signup / ForgotPassword
- [ ] Créer le hook `useAuth()` (session, user, login, signup, logout)
- [ ] Protéger les routes (redirect si non connecté)
- [ ] Tester : inscription → confirmation email → login → accès dashboard

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
- [ ] Tester : générer des flashcards → les réviser → progression enregistrée

## Phase 7 : Page Progression

- [ ] Implémenter l'Edge Function `get-progress` (récupérer stats)
- [ ] Implémenter le frontend Progress (`src/screens/Progress.tsx`)
- [ ] Stats : score moyen quiz, nombre de cours révisés, streak, temps écoulé
- [ ] Tester : après avoir fait des quiz + flashcards → page progression affiche les bonnes stats

## Phase 8 : Polish UI

- [ ] Finaliser les composants UI réutilisables (`src/components/ui/`)
- [ ] Responsive mobile
- [ ] États de chargement + error handling
- [ ] Dark mode cohérent (accent violet #7C5CFF)

## Phase 9 : Déploiement

- [ ] Déployer le frontend sur Vercel (Hobby plan, gratuit)
- [ ] Déployer les Edge Functions Supabase
- [ ] Configurer les variables d'environnement en production
- [ ] Tester le flow complet en production
