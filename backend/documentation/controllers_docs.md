# meController


### GET `/api/me`
arguments : requête, response

reponse : `{}`

# userController

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

### POST `/:clientName/register`

 **Description** : Permet d'enregistrer un nouvel utilisateur et de l'associer à un client spécifique. Cette route est protégée et nécessite des permissions d'administrateur ou de responsable pour le client spécifié.

 **Paramètres de la Requête** :

  `clientName` : Le nom du client auquel associer le nouvel utilisateur.

 **Corps de la Requête** :

```json
{
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
