# meController


### GET `/api/me`
GET `/` :

* **Description** : Récupère les informations de l'utilisateur actuellement authentifié.

* **Réponses** :
    * **exemple** :
        ```json
        {
        "user": {
            "userId": 3,
            "roles": [
             "admin_client"
            ],
            "permissions": [],
            "clientId": 2,
            "position": null,
            "iat": 1744114310,
            "exp": 1744200710
            }
         }
        ```

`200` OK → : Retourne les données de l'utilisateur.

`401` Unauthorized → : Si l'utilisateur n'est pas authentifié.

# userController

### GET `/api/user/by-client/:clientId`

**Description**  


**Paramêtre de la requête**  
 `clientId` : L'ID du client 

**Réponses possibles**


### POST `/api/user/login`

**Description**  
Authentifie un utilisateur avec son email + mot de passe, crée une session et renvoie un cookie `token`.  

**Body attendu (JSON)**  
```json
{
  "email": "user@example.com",
  "password": "mypassword"
}
```
**Réponses possibles**

`200` OK → { "message": "Login successful" } + cookie `token` (httpOnly)

`400` Bad Request → { "error": "Password is required" }

`500` Internal Server Error → { "error": "Login failed" }

#
### POST `/api/user/logout`

**Description**  
Déconnecte l’utilisateur en supprimant toutes ses sessions et en effaçant le cookie `token`.  

**Body attendu (JSON)**  
Aucun.

**Réponses**  
`200` OK → cookie `token` supprimé 

`500` Internal Server Error → { "error": "Error logging out" }

#

### POST `api/user/register`

 **Description** : Permet d'enregistrer un nouvel utilisateur et de l'associer à un client spécifique. Cette route est protégée et nécessite des permissions d'administrateur ou de responsable pour le client spécifié.

 **Paramètres de la Requête** :

  `clientName` : Le nom du client auquel associer le nouvel utilisateur.

 **Corps de la Requête** :

```json
{
    "clientName": "exempleClient",
    "username": "nouvelutilisateur",
    "firstname": "Prénom",
    "lastname": "Nom",
    "email": "nouvelutilisateur@example.com",
    "position": "Poste",
}
```

 **Réponses** :

`201 Created` : Utilisateur créé avec succès.

`401 Unauthorized` : Aucun jeton fourni ou utilisateur non autorisé.

`403 Forbidden` : Permissions insuffisantes (l'utilisateur n'est pas un administrateur ou un responsable pour ce client).

#
### POST `/api/user/forgot-password`

**Description**  
Envoie un email avec un lien de réinitialisation si l’email est enregistré.  

**Body attendu (JSON)**  
```json
{
  "email": "user@example.com"
}
```
**Réponses** 

`200` OK → { "message": "email sent if the email is registered" }

`400` Bad Request → { "error": "Email is required" }

`500` Internal Server Error → { "error": "Error processing request" }


#
### POST `/api/user/reset-password`

**Description**  
Réinitialise le mot de passe d’un utilisateur à partir d’un token de réinitialisation valide.  

**Body attendu (JSON)**  
```json
{
  "token": "reset_token_from_email",
  "newPassword": "MyNewStrongPassword123!"
}
```

**Réponses**

`200` OK → { "message": "Password reset successful" }

`400` Bad Request → { "error": "Token and new password are required" }

`400` Bad Request → { "error": "Invalid or expired token" }

`400` Bad Request → { "error": "Password does not meet security requirements" }

`500` Internal Server Error → { "error": "Internal server error" }


# clientController
### POST `api/client/create` :

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

   `200` Created → {message: "client created"}

   `400` Forbidden → { error: "Missing required fields: name and type" }

   `500` Internal Server Error → { error: 'Internal server error' }

### GET `api/client/get` :

* **Description** : Récupère la liste de tous les clients. Accessible uniquement par les administrateurs.

* **Réponses** :

    `200` OK → Retourne la liste des clients.

    `403` Forbidden → Si l'utilisateur n'est pas un administrateur.

    `500` Internal Server Error → Erreur lors de la récupération des clients.

### GET `api/client/getById/:clientId` :

* **Description** : Récupère un client avec son id.

* **Réponses** :

    `200` OK → Retourne le client. exemple:

    ```json
    {
    "clientId": 1,
    "clientName": "LambdaSARL",
    "clientType": "Example",
    "description": "Un exemple de client",
    "createdAt": "2025-08-14T12:31:16.970Z"
    }

    ```

    `400` Forbidden → { error: "Client not found" }

    `404` Not Found → { error: "Client not found" }

    `500` Internal Server Error → { error: 'Internal server error' }


# projectController
### POST ### POST `api/projet/create` :

* **Description** : Crée un nouveau projet. Accessible uniquement par les administrateurs et admin client.

* **Corps de la Requête**:
    ```json
    {
    
    }
    ```
* **Réponses** :

   * **201 Created** : Projet créé avec succès.

   * **403 Forbidden** : Si l'utilisateur n'est pas un administrateur.

   * **500 Internal Server Error** : Erreur lors de la création du client.