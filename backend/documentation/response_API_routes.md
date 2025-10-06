# Response API Routes `/api/response`

- [POST `/create`](#post-create)
- [PATCH `/update/:responseId`](#patch-updateresponseid)
- [DELETE `/delete/:responseId`](#delete-deleteresponseid)
- [GET `/get/project/:projectId/question/:questionId`](#get-getprojectprojectidquestionquestionid)
- [GET `/get/project/:projectId`](#get-getprojectprojectid)
- [GET `/get/responseId/subresponse`](#get-getresponseidsubresponse)

## POST `/create`

### **Description**

Crée une nouvelle réponse dans la base de données.

### **Corps de la Requête (JSON)**

| Champ              | Type    | Obligatoire  | Défaut  | Description                                                    |
| -------------------| ------- | ------------ | ------- | -------------------------------------------------------------- |
| `label`            | string  | ✅           | -       | Texte de la réponse.                                           |
| `projectId`        | number  | ✅           | -       | ID du projet associée.                                         |
| `questionId`       | number  | ✅           | -       | ID de la question associée.                                    |
| `optionId`         | number  | ❌           | `null`  | ID de l'option associée (si la réponse provient d'une option). |
| `responseIdParent` | number  | ❌           | `null`  | ID d’une réponse parente (si c’est une sous-réponse).          |

### **Exemple de requête**

```json
{
 "label": "Ceci est une réponse",
 "projectId": 1,
 "questionId": 3,
}
```

### **Réponses**

### 201 Created

```json
{
 "responseId": 1,
 "label": "Ceci est une réponse",
 "projectId": 1,
 "questionId": 3,
 "option": null,
 "responseIdParent": null
}
```

### 400 Bad Request

```json
{
  "errors":[
    {
      "path": "label",
      "msg": "label is required"
    }
  ]
}
```

### 500 Internal Server Error

```json
{
  "error": "Internal server error"
}
```

## PATCH `/update/:responseId`

### **Description**

Met à jour une réponse existante en fonction de son `responseId`.

### **Corps de la Requête (JSON)**

Tous les champs sont optionnels.
Seuls les champs envoyés seront mis à jour.

| Champ              | Type    | Obligatoire  | Description                                                    |
| -------------------| ------- | ------------ | -------------------------------------------------------------- |
| `label`            | string  | ❌           | Texte de la réponse.                                           |
| `projectId`        | number  | ❌           | ID du projet associée.                                         |
| `questionId`       | number  | ❌           | ID de la question associée.                                    |
| `optionId`         | number  | ❌           | ID de l'option associée (si la réponse provient d'une option). |
| `responseIdParent` | number  | ❌           | ID d’une réponse parente (si c’est une sous-réponse).          |

### **Exemple de requête**

```json
{
 "label": "Ceci est une réponse mis à jour",
}
```

### **Réponses**

### 200 OK

```json
{
 "responseId": 1,
 "label": "Ceci est une réponse mis à jour",
 "projectId": 1,
 "questionId": 3,
 "option": null,
 "responseIdParent": null
}
```

### 400 Bad Request

```json
{
  "errors":[
    {
      "path": "label",
      "msg": "label is required"
    }
  ]
}
```

### 404 Not Found

```json
{
  "error": "Response not found"
}
```

### 500 Internal Server Error

```json
{
  "error": "Internal server error"
}
```

## DELETE `/delete/:responseId`

### **Description**

Supprime une réponse existante en fonction de son `responseId`.

### **Réponses**

### 204 OK No Content

### 404 Not Found

```json
{
  "error": "Response not found"
}
```

### 500 Internal Server Error

```json
{
  "error": "Internal server error"
}
```

## GET `/get/project/:projectId/question/:questionId`

### **Description**

Récupère la ou les réponse(s) d'une question d'un project en fonction de `projectId` et `questionId`.

### **Réponses**

### 200 OK

```json
[
 {
  "responseId": 1,
  "label": "Ceci est une réponse",
  "projectId": 1,
  "questionId": 3,
  "option": null,
  "responseIdParent": null
 },
 {
  "responseId": 2,
  "label": "Ceci est une autre réponse de la question",
  "projectId": 1,
  "questionId": 3,
  "option": null,
  "responseIdParent": null
 },
]
```

### 404 Not Found

```json
{
  "error": "Project not found"
}
```

**OU**

```json
{
  "error": "Questiion not found"
}
```

### 500 Internal Server Error

```json
{
  "error": "Internal server error"
}
```

## GET `/get/project/:projectId`

### **Description**

Retourne la liste des réponses associées a un projet en fonction de `projectId`.

### **Réponses**

### 200 OK

```json
[
 {
  "responseId": 1,
  "label": "Ceci est une réponse",
  "projectId": 1,
  "questionId": 3,
  "option": null,
  "responseIdParent": null
 },
 {
  "responseId": 2,
  "label": "Ceci est une autre réponse d'une autre question",
  "projectId": 1,
  "questionId": 6,
  "option": null,
  "responseIdParent": null
 },
]
```

### 404 Not Found

```json
{
  "error": "Project not found"
}
```

### 500 Internal Server Error

```json
{
  "error": "Internal server error"
}
```

## GET `/get/:responseId/subresponse`

### **Description**

Retourne la liste des subréponses assosciées a une réponse en fonction de `responseIdParent`

### **Réponses**

### 200 OK

```json
[
 {
  "responseId": 2,
  "label": "Ceci est une réponse liée a une réponse",
  "projectId": 1,
  "questionId": 3,
  "option": null,
  "responseIdParent": 1
 },
 {
  "responseId": 3,
  "label": "Ceci est une autre réponse liée a une réponse",
  "projectId": 1,
  "questionId": 4,
  "option": null,
  "responseIdParent": 1
 },
]
```

### 404 Not Found

```json
{
  "error": "Response not found"
}
```

### 500 Internal Server Error

```json
{
  "error": "Internal server error"
}
```