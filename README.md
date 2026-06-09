# DossierPro - Frontend (Angular)

Interface utilisateur de la plateforme DossierPro.

## Stack
- Angular 17
- TypeScript
- CSS custom (variables, responsive)
- HttpClient + HTTP Basic Auth interceptor
- Lazy-loaded modules par rôle

## Prérequis
- Node.js 18+ (`node -v`)
- npm 9+ (`npm -v`)
- Angular CLI : `npm install -g @angular/cli`

## Installation et démarrage

```bash
cd dossierpro-frontend

# Installer les dépendances
npm install

# Lancer le serveur de développement
ng serve
```

L'application est accessible sur **http://localhost:4200**

> ⚠️ Le backend doit être lancé sur http://localhost:8080 avant d'utiliser l'application.

## Build production

```bash
ng build --configuration production
# Les fichiers compilés sont dans dist/dossierpro-frontend/
```

## Comptes de test

| Login | Mot de passe | Rôle | Accès |
|-------|-------------|------|-------|
| `A00001` | `00000` | Admin | Dashboard, Entités, Entity Managers |
| `M26060600001` | `00000` | Entity Manager | Dashboard, Utilisateurs, Dossiers + Validation |
| `U26060600001` | `00000` | Utilisateur | Dossiers, Profil, Préférences |

## Architecture

```
src/app/
├── core/
│   ├── models/         # Interfaces TypeScript (models.ts)
│   ├── services/       # AuthService, ApiService
│   ├── guards/         # AuthGuard, RoleGuard
│   └── interceptors/   # AuthInterceptor (Basic Auth header)
├── layout/
│   ├── sidebar/        # Navigation latérale (rôle-aware)
│   └── navbar/         # Barre de titre
├── features/
│   ├── auth/           # Login, Change Password
│   ├── admin/          # Dashboard, Entités, Entity Managers
│   ├── entity-manager/ # Dashboard, Info, Utilisateurs, Dossiers
│   └── user/           # Dossiers, Profil, Préférences
└── app.module.ts       # Module racine + HTTP_INTERCEPTORS
```

## Routing par rôle

```
/login                        → LoginComponent
/change-password              → ChangePasswordComponent
/admin/dashboard              → AdminDashboardComponent      (ADMIN)
/admin/entities               → EntitiesComponent            (ADMIN)
/admin/entity-managers        → EntityManagersComponent      (ADMIN)
/em/dashboard                 → EmDashboardComponent         (ENTITY_MANAGER)
/em/info                      → EmInfoComponent              (ENTITY_MANAGER)
/em/users                     → EmUsersComponent             (ENTITY_MANAGER)
/em/dossiers                  → EmDossiersComponent          (ENTITY_MANAGER)
/user/dossiers                → UserDossiersComponent        (USER)
/user/profile                 → UserProfileComponent         (USER)
/user/preferences             → UserPreferencesComponent     (USER)
```

## Fonctionnalités

### Admin
- Dashboard avec statistiques globales
- CRUD Entités (paginé 8/page, modale création/édition)
- CRUD Entity Managers (avec assignation automatique d'un compte)

### Entity Manager
- Dashboard avec stats de l'entité
- CRUD Utilisateurs (activation/désactivation toggle)
- Dossiers : onglets Pending / Validés
- **Workflow de validation 3 étapes** :
  1. Révision du dossier (ou rejet avec motif obligatoire)
  2. Génération PDF (via PDFBox backend)
  3. Signature QR Code → statut VALIDATED

### Utilisateur
- Création de dossiers (DRAFT ou soumission directe)
- Modification (DRAFT uniquement), suppression, soumission
- Profil modifiable
- Préférences : thème, langue, format date/montant

## Authentification

L'intercepteur `AuthInterceptor` ajoute automatiquement le header `Authorization: Basic <credentials>` à chaque requête HTTP. Les credentials sont stockés en `sessionStorage` (effacés à la fermeture du navigateur).
