# Documentation des Routes API
---
## Configuration du Serveur
### 1. Middleware utilisé :

   * `express.json()` : Permet d'analyser le corps des requêtes au format JSON.

   * `cookie-parser()` : Permet de gérer les cookies (en particulier pour le jeton JWT).

   * **CORS (Cross-Origin Resource Sharing)** : Permet d'autoriser toutes les origines et méthodes pour les requêtes entrantes, en définissant les en-têtes appropriés.

### 2. Routes :
- GET [`api/me`](./documentation/controllers_docs.md#get-apime) : prend le cookie de session renvoie un objet utilisateur 

- POST [`api/user/login`](./documentation/controllers_docs.md#post-apiuserlogin) : vérifie mdp et email, créé une session de connection, puis renvoie un cookie
- POST [`api/user/logout`](./documentation/controllers_docs.md#post-apiuserlogout) : prend le cookie de session et supprime les sessions de l'utilisateur
- POST [`api/user/:clientName/register`](./documentation/controllers_docs.md#post-apiuser:clientNamelogout) : créer un utilisateur et le lie au client
- POST [`api/user/forgot-password`](./documentation/controllers_docs.md#post-apiuserforgot-password) : envoie un lien de reset de mdp, contenant un token à usage unique, à un email.
- POST [`api/user/reset-password`](./documentation/controllers_docs.md#post-apiuserreset-password) : consomme le token à usage unique, change le mdp, 



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

