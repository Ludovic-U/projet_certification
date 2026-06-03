# DOSSIER DE PRÉSENTATION DE PROJET
## Certification RNCP 37873 - Concepteur Développeur d'Applications

---

## 1. RÉSUMÉ EXÉCUTIF

### 1.1 Présentation du Projet
**Projet F2S (Figure de Skills)** est une application web full-stack de gestion de projets de formation, conçue pour accompagner les acteurs du secteur de la formation dans la conduite de leurs projets de bout en bout. Elle intègre notamment un module d'ideation assisté par IA (Mistral AI) pour la collecte structurée d'informations.

### 1.2 Objectifs du Projet
- Conception et développement d'une application web sécurisée en architecture multicouche
- Mise en place d'un système de gestion de projets avec diagrammes de Gantt
- Intégration d'un chatbot IA pour l'assistance à la création de projets
- Implémentation d'un système de mindmapping et de suivi de tâches
- Gestion des rôles et permissions utilisateurs

---

## 2. CONFORMITÉ AU RÉFÉRENTIEL RNCP 37873

### 2.1 Bloc de Compétences 1 : Développer une Application Sécurisée (RNCP37873BC01)

#### CC1 : Installer et configurer son environnement de travail en fonction du projet

**Preuves d'acquisition :**
- Configuration du projet Node.js avec Express (backend/index.js)
- Orchestration avec Prisma ORM et base de données PostgreSQL
- Configuration CORS pour le frontend Next.js
- Variables d'environnement sécurisées (.env)

**Code référence :**
```javascript
// backend/index.js: Configuration du serveur Express
const app = express();
app.set('trust proxy', function(ip) { ... });
app.use(express.json());
```

#### CC2 : Développer des interfaces utilisateur

**Preuves d'acquisition :**
- Développement d'interfaces React/TypeScript avec Next.js
- Composants UI réutilisables (ChatInput, PageHeader)
- Gestion d'état avec hooks React (useState, useEffect)
- Interface de chat avec reconnaissance vocale (useWhisperRecognition)

**Code référence :**
```tsx
// frontend/src/app/[clientId]/[projectId]/ideation/page.tsx
// Interface de chat avec onglets dynamiques
const [activeTab, setActiveTab] = useState<TabKey>('analyse');
```

#### CC3 : Développer des composants métier

**Preuves d'acquisition :**
- Modèles Prisma pour l'ensemble des entités métier (Project, Task, User, Client, etc.)
- Services métier (projectService, taskService, mistralService)
- Logique de gestion de chat avec IA pour l'ideation
- Gestion du cycle de vie des projets (étapes, statuts, décisions)

**Code référence :**
```javascript
// backend/services/IdeationMistralService.js
module.exports.applyIdeationActions = async (actions, projectId, availableQuestions) => {
  // Application des actions d'assistance IA
};
```

#### CC4 : Contribuer à la gestion d'un projet informatique

**Preuves d'acquisition :**
- Architecture technique documentée dans le schema Prisma
- Documentation des API REST
- Gestion des versions et migrations de base de données
- Système de feedback et journalisation des erreurs

---

### 2.2 Bloc de Compétences 2 : Concevoir et développer une application sécurisée organisée en couches (RNCP37873BC02)

#### CC5 : Analyser les besoins et maquetter une application

**Preuves d'acquisition :**
- Tables de questions dynamiques liées aux types de projets
- Système de questionnaires pour l'ideation projet
- Architecture "Question -> Option -> Response"
- Modélisation des relations many-to-many

**Code référence :**
```prisma
// backend/prisma/schema.prisma
model Question {
  questionId Int @id @default(autoincrement())
  label String
  keyword String
  types Type[] @relation("TypeQuestion")
  responses Response[]
}
```

#### CC6 : Définir l'architecture logicielle d'une application

**Preuves d'acquisition :**
- Architecture N-tier : Présentation (React) / API (Express) / Données (PostgreSQL/Prisma)
- Séparation des préoccupations (routes, controllers, services, modèles)
- Pattern Repository avec Prisma Client
- Middlewares de sécurité (auth, validation, rate limiting)

**Code référence :**
```
/frontend (Next.js + React)
  /components - UI réutilisable
  /pages - Routes applicatives
  /services - API client
/backend
  /routes - Points d'entrée API
  /controllers - Logique de traitement
  /services - Logique métier
  /middlewares - Sécurité et validation
```

#### CC7 : Concevoir et mettre en place une base de données relationnelle

**Preuves d'acquisition :**
- Schéma de base de données relationnel avec 20+ modèles Prisma
- Relations many-to-many avec tables d'association (UserRole, ClientUserRole)
- Contraintes d'intégrité (clés primaires/étrangères, uniques)
- Indexes pour optimiser les requêtes

**Code référence :**
```prisma
// backend/prisma/schema.prisma
model UserRole {
  userId Int
  roleId Int
  @@id([userId, roleId])
}
```

#### CC8 : Développer des composants d'accès aux données SQL et NoSQL

**Preuves d'acquisition :**
- Requêtes Prisma avec filtres, includes, relations
- Agrégations (findMany, count, groupBy)
- Transactions pour les opérations atomiques
- Gestion des erreurs base de données (P2002, P2025)

**Code référence :**
```javascript
// backend/services/projectService.js
const project = await prisma.project.findUnique({
  where: { projectId },
  include: { tasks: true, responses: true }
});
```

---

### 2.3 Bloc de Compétences 3 : Préparer le déploiement d'une application sécurisée (RNCP37873BC03)

#### CC9 : Préparer et exécuter les plans de tests d'une application

**Preuves d'acquisition :**
- Tests unitaires avec Jest (backend/tests)
- Tests d'intégration et tests de flux utilisateurs
- Configuration de tests (jest.setup.js)
- Couverture des services (projectService, responseService, questionService, etc.)

**Code référence :**
```javascript
// backend/tests/services/projectService.test.js
describe('ProjectService', () => {
  test('should create a project', async () => { ... });
});
```

#### CC10 : Préparer et documenter le déploiement d'une application

**Preuves d'acquisition :**
- Configuration de seed pour les données initiales
- Migrations Prisma versionnées
- Scripts de build (package.json)
- Configuration Docker-ready (multer pour uploads)

#### CC11 : Contribuer à la mise en production dans une démarche DevOps

**Preuves d'acquisition :**
- Rate limiting pour la protection DDoS
- Headers de sécurité HTTP (CSP, X-Frame-Options, XSS-Protection)
- CORS configuré pour les origines autorisées
- Gestion des sessions avec tokens (auth middleware)

**Code référence :**
```javascript
// backend/index.js: Headers de sécurité OWASP
res.setHeader('X-Frame-Options', 'DENY');
res.setHeader('X-Content-Type-Options', 'nosniff');
res.setHeader('Content-Security-Policy', "default-src 'self'");
```

---

## 3. ARCHITECTURE TECHNIQUE

### 3.1 Stack Technologique
| Couche | Technologie | Version |
|--------|-------------|---------|
| Frontend | Next.js / React | 18.x |
| UI Library | Tailwind CSS / Radix UI | latest |
| Backend | Node.js / Express | latest |
| Base de données | PostgreSQL | latest |
| ORM | Prisma | 6.x |
| IA | Mistral AI API | latest |
| Auth | JWT / Cookies | custom |

### 3.2 Schéma de l'Architecture
```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (Next.js)                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │ ChatInput    │  │ Gantt View   │  │ Mindmap View │   │
│  └──────────────┘  └──────────────┘  └──────────────┘   │
└──────────────────────────┬──────────────────────────────┘
                           │ HTTP/JSON
┌──────────────────────────▼──────────────────────────────┐
│                   Backend (Express)                     │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────────┐  │
│  │ Routes   │ │Services  │ │Middleware│ │Mistral API │  │
│  └──────────┘ └──────────┘ └──────────┘ └────────────┘  │
└──────────────────────────┬──────────────────────────────┘
                           │ SQL
┌──────────────────────────▼──────────────────────────────┐
│              Base de données (PostgreSQL)                │
│  Users | Clients | Projects | Tasks | Responses | ...   │
└─────────────────────────────────────────────────────────┘
```

---

## 4. SÉCURITÉ ET CONFORMITÉ

### 4.1 Mesures de Sécurité Implémentées
- **Rate Limiting** : Protection contre les abus (300 req/15min/IP)
- **Headers de Sécurité** : CSP, X-Frame-Options, XSS-Protection
- **Validation des Entrées** : Middleware inputValidation
- **Authentification** : JWT avec expiration et rafraîchissement
- **Authorization** : Contrôle d'accès par rôles (RBAC)
- **Upload Sécurisé** : Multer avec types mime limités

### 4.2 Conformité RGPD et Accessibilité
- Données personnelles chiffrées (bcrypt pour mots de passe)
- Gestion des consentements via mentions légales
- Interfaces respectant les contrastes WCAG (classes Tailwind)

---

## 5. SAUVEGARDE ET DÉPLOIEMENT

### 5.1 Stratégie de Backup
- Données de seed pour reprise (backend/prisma/seed.js)
- Migrations Prisma versionnées
- Sauvegarde des uploads dans répertoire dédié

### 5.2 Variables de Déploiement
```env
DATABASE_URL="postgresql://..."
PORT=4000
JWT_SECRET="..."
MISTRAL_API_KEY="..."
```

---

## 6. CONCLUSION

Ce projet démontre la maîtrise complète des compétences du titre professionnel **Concepteur Développeur d'Applications (RNCP 37873)** :

- ✅ Architecture logicielle multicouche respectée
- ✅ Développement d'interfaces utilisateurs modernes
- ✅ Base de données relationnelle complexe et normalisée
- ✅ Sécurité applicative selon les recommandations ANSSI
- ✅ Tests automatisés et documentation technique

---

*Fait à [Ville], le [Date]*

*Signature :* _________________