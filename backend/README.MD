# Documentation des Routes API
---
## Configuration du Serveur
### 1. Middleware utilisé :

   * `express.json()` : Permet d'analyser le corps des requêtes au format JSON.

   * `cookie-parser()` : Permet de gérer les cookies (en particulier pour le jeton JWT).

   * **CORS (Cross-Origin Resource Sharing)** : Permet d'autoriser toutes les origines et méthodes pour les requêtes entrantes, en définissant les en-têtes appropriés.

### 2. Routes :

* `/api/user` : Routes relatives à l'authentification et à l'enregistrement des utilisateurs.

* `/api/client` : Routes relatives à la gestion des clients. L'accès est protégé par l'authentification JWT.

* `/api/me` : Routes pour récupérer les informations de l'utilisateur authentifié. Accessible uniquement aux utilisateurs authentifiés.

## Routes d'Authentification
### 1. POST  `/login` :

* **Description** : Permet de se connecter à l'application avec l'email/nom d'utilisateur et le mot de passe. Un jeton JWT est renvoyé dans le cookie si la connexion est réussie.

* **Corps de la Requête** :
    ```json
    {
      "email": "utilisateur@example.com",
      "password": "motdepasse"
    }
    ```
* **Réponses** :

  * `200 OK` : Connexion réussie.

  * `401 Unauthorized` : Identifiants incorrects.

### 2. POST `/:clientId/register`

* **Description** : Permet d'enregistrer un nouvel utilisateur et de l'associer à un client spécifique. Cette route est protégée et nécessite des permissions d'administrateur ou de responsable pour le client spécifié.

* **Paramètres de la Requête** :

  * `clientId` : L'ID du client auquel associer le nouvel utilisateur.

* **Corps de la Requête** :
    ```json
    {
      "username": "nouvelutilisateur",
      "firstname": "Prénom",
      "lastname": "Nom",
      "email": "nouvelutilisateur@example.com",
      "password": "motdepasse",
      "manager": true,
      "position": "Poste",
      "role": "nomDuRôle"
    }
     ```
* **Réponses** :

  * `201 Created` : Utilisateur créé avec succès.

  * `401 Unauthorized` : Aucun jeton fourni ou utilisateur non autorisé.

  * `403 Forbidden` : Permissions insuffisantes (l'utilisateur n'est pas un administrateur ou un responsable pour ce client).

### 3. POST `/logout` :

* **Description** : Permet de déconnecter l'utilisateur en supprimant le jeton JWT du cookie.

* **Réponses** :

  * `200 OK` : Déconnexion réussie.

  * `401 Unauthorized` : Aucun jeton fourni.

## Routes Client
### 1. POST `/create` :

* **Description** : Crée un nouveau client. Accessible uniquement par les administrateurs.

* **Corps de la Requête**:
    ```json
    {
    "name": "Nom du Client",
    "type": "Type du Client",
    "desc": "Description du client"
    }
    ```
* **Réponses** :

   * **201 Created** : Client créé avec succès.

   * **403 Forbidden** : Si l'utilisateur n'est pas un administrateur.

   * **500 Internal Server Error** : Erreur lors de la création du client.

### 2. GET `/get` :

* **Description** : Récupère la liste de tous les clients. Accessible uniquement par les administrateurs.

* **Réponses** :

    * **200 OK** : Retourne la liste des clients.

    * **403 Forbidden** : Si l'utilisateur n'est pas un administrateur.

    * **500 Internal Server Error** : Erreur lors de la récupération des clients.

## Routes Me
### 1. GET `/` :

* **Description** : Récupère les informations de l'utilisateur actuellement authentifié.

* **Réponses** :
    * **exemple** :
        ```json
        {
        "user": {
            "userId": 3,
            "roles": [
             "manager"
            ],
            "permissions": [],
            "clientId": 2,
            "isManager": false,
            "position": null,
            "iat": 1744114310,
            "exp": 1744200710
            }
         }
        ```

    * **200 OK** : Retourne les données de l'utilisateur.

    * **401 Unauthorized** : Si l'utilisateur n'est pas authentifié.

## Middleware
* `authenticateUser`
    * **Description** : Un middleware qui vérifie le jeton JWT dans le cookie pour authentifier l'utilisateur.

    * **Utilisation** : Ce middleware est utilisé dans les routes register, client et me pour s'assurer que l'utilisateur est authentifié.

## Détails du Serveur
Le serveur utilise ***Express*** pour le traitement des requêtes et est configuré avec plusieurs middlewares :

* **CORS** : Le serveur accepte les requêtes provenant de n'importe quelle origine, avec les méthodes et en-têtes définis dans les paramètres.

* **Cookies** : Le jeton JWT est envoyé dans un cookie sécurisé lors de la connexion.

Le serveur écoute sur le port spécifié dans ***process.env.PORT***.

## Liste des routes
* `api/me` : renvoie un objet utilisateur
* `api/me` : renvoie un objet utilisateur
* `api/me` : renvoie un objet utilisateur
* `api/me` : renvoie un objet utilisateur
* `api/me` : renvoie un objet utilisateur
* `api/me` : renvoie un objet utilisateur
* `api/me` : renvoie un objet utilisateur
* `api/me` : renvoie un objet utilisateur
* `api/me` : renvoie un objet utilisateur