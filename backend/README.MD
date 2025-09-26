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
- POST [`api/user/register`](./documentation/controllers_docs.md#post-apiuserclientnameregister) : créer un utilisateur et le lie au client
- POST [`api/user/forgot-password`](./documentation/controllers_docs.md#post-apiuserforgot-password) : envoie un lien de reset de mdp, contenant un token à usage unique, à un email.
- POST [`api/user/reset-password`](./documentation/controllers_docs.md#post-apiuserreset-password) : consomme le token à usage unique, change le mdp.
- GET [`api/client/get`](./documentation/controllers_docs.md#post-apiclientget) : retourne la liste de tout les clients
- GET [`api/client/getById/:clientId`](./documentation/controllers_docs.md#post-apiclientget) : retourne un seul client
- POST [`api/client/create`](./documentation/controllers_docs.md#post-apiclientcreate) : créer un nouveau client
- 






## Middleware
* `authenticateUser`
    * **Description** : Un middleware qui vérifie le jeton JWT dans le cookie pour authentifier l'utilisateur.

    * **Utilisation** : Ce middleware est utilisé dans les routes register, client et me pour s'assurer que l'utilisateur est authentifié.

## Détails du Serveur
Le serveur utilise ***Express*** pour le traitement des requêtes et est configuré avec plusieurs middlewares :

* **CORS** : Le serveur accepte les requêtes provenant de n'importe quelle origine, avec les méthodes et en-têtes définis dans les paramètres.

* **Cookies** : Le jeton JWT est envoyé dans un cookie sécurisé lors de la connexion.

Le serveur écoute sur le port spécifié dans ***process.env.PORT***.


# Pense bête :
    Liste des codes HTTP
    
    200 : succès de la requête ;
    301 et 302 : redirection, respectivement permanente et temporaire ;
    401 : utilisateur non authentifié ;
    403 : accès refusé ;
    404 : ressource non trouvée ;
    500, 502 et 503 : erreurs serveur ;
    504 : le serveur n'a pas répondu.



