# Tests instructions

### **Description**

Les tests sont realiser avec `Jest` (Mock), `supertest` et un docker contenant une base de donnees de test.

Dossier tests contenant les tests unitaires des controllers et services, ainsi que les tests d'integrations et de userflows.


### **Structure du dossier**

* `controllers` : tests unitaires pour les controllers.
* `services` : tests unitaires pour les services.
* `middlewares` : tests pour les middlewares.
* `integration` : tests d'integrations.
* `userflows` : tests des userflows.
* `helper` : dossier contenant des helpers functions.

## Commandes

Pour lancer un test, il faut etre dans le dossier backend avant de lancer une commande.

```bash
cd backend
```

Pour les tests d'integrations et de userflows, il faut demarrer la DB de test.

```bash
docker compose -f docker-compose.test.yml up -d
```

Pour arreter le docker de la DB de test :

```bash
docker compose -f docker-compose.test.yml down
```

### **Tous les tests**

```bash
npm run test:all
```

### **Controllers**

* Lancer tous les tests controllers.

```bash
npm run test:controllers
```

* Lancer les tests pour 1 seul controller.

```bash
npx jest tests/controllers/[nomDuFichierTest].test.js
```
example :

```bash
npx jest tests/controllers/questionController.test.js
```

### **Services**

* Lancer tous les tests services.

```bash
npm run test:services
```

* Lancer les tests pour 1 seul service.

```bash
npx jest tests/services/[nomDuFichierTest].test.js
```
example :

```bash
npx jest tests/services/questionService.test.js
```

### **Middlewares**

* Lancer les tests pour 1 seul middleware

```bash
npx jest tests/middlewares/[NomDuFichierTest].test.js
```

example :

```bash
npx jest tests/middlewares/validateId.test.js
```

### **Integrations**

* Lancer tous les tests d'integrations

```bash
npm run test:integration
```

* Lancer les tests pour 1 seul model

```bash
NODE_ENV=test npx jest --config jest.config.integration.js tests/integration/[NomDuFichierTest].test.js
```

example :

```bash
NODE_ENV=test npx jest --config jest.config.integration.js tests/integration/question.test.js
```

### **Userflows**

* Lancer tous les tests userflows

```bash
npm run test:userflow
```

* Lancer les tests pour 1 seul userflow

```bash
NODE_ENV=test npx jest --config jest.config.userflow.js tests/userflows/[NomDuFichierTest].test.js
```

example :

```bash
NODE_ENV=test npx jest --config jest.config.userflow.js tests/userflows/adminFlow.test.js
```