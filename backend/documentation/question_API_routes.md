# Question API Routes `/api/question`

- [POST `/create`](#post-create)
- [GET `/get`](#get-get)
- [PATCH `/update/:questionId`](#patch-updatequestionid)
- [DELETE `/delete/:questionId`](#delete-deletequestionid)
- [GET `/get/:questionId`](#get-getquestionid)
- [GET `/get/project/:projectId`](#get-getprojectprojectid)
- [GET `/get/category/:category`](#get-getcategorycategory)
- [GET `/get/type/:typeId`](#get-gettypetypeid)
- [GET `/get/:questionId/subquestion`](#get-getquestionidsubquestion)

## POST `/create`

### **Description**

Crée une nouvelle question dans la base de données.
Accessible uniquement par les administrateurs.

### **Corps de la Requête (JSON)**

| Champ                      | Type    | Obligatoire  | Défaut  | Description                                             |
| -------------------------- | ------- | ------------ | ------- | ------------------------------------------------------- |
| `label`                    | string  | ✅           | -       | Texte de la question.                                   |
| `category`                 | string  | ✅           | -       | Catégorie associée à la question.                       |
| `numberOfSelectionableOpt` | number  | ❌           | `null`  | Nombre maximum d’options sélectionnables.               |
| `isRelevant`               | boolean | ❌           | `false` | Indique si la question est pertinente.                  |
| `hasMultipleOpenResponse`  | boolean | ❌           | `false` | Autorise plusieurs réponses libres.                     |
| `shouldMultiply`           | boolean | ❌           | `false` | La question doit-elle être multipliée.                  |
| `questionIdParent`         | number  | ❌           | `null`  | ID d’une question parente (si c’est une sous-question). |
| `types`                    | array   | ❌           | `[]`    | Liste des identifiants de types associés.               |
| `projects`                 | array   | ❌           | `[]`    | Liste des identifiants de projets associés.             |
| `options`                  | array   | ❌           | `[]`    | Liste des identifiants d’options associées.             |

### **Exemple de requête**

```json
{
 "label": "Quel(s) sont vos objectif(s)?",
 "category": "Ideation",
 "isRelevant": true,
 "hasMultipleOpenResponse": true,
 "types": [1,2],
}
```

### **Réponses**

### 201 Created

```json
{
 "questionId": 1,
 "label": "Quel(s) sont vos objectif(s)?",
 "category": "Ideation",
 "numberOfselectionableOpt": null,
 "isRelevant": true,
 "hasMultipleOpenResponse": true,
 "shouldMultiply": false,
 "questionIdParent": null,
 "types": [1,2],
 "projects": [],
 "options": []
}
```

### 400 Bad Request

```json
{
  "error": "label and category are required"
}
```

### 500 Internal Server Error

```json
{
  "error": "Internal server error"
}
```

## GET `/get`

### **Description**

Récupère la liste de toutes les questions.
Accessible uniquement par les administrateurs.

### **Réponses**

### 200 OK

```json
[
 {
  "questionId": 1,
  "label": "Quel(s) sont vos objectif(s)?",
  "category": "Ideation",
  "numberOfselectionableOpt": null,
  "isRelevant": true,
  "hasMultipleOpenResponse": true,
  "shouldMultiply": false,
  "questionIdParent": null,
  "types": [1,2],
  "projects": [],
  "options": []
 },
 {
  "questionId": 2,
  "label": "Quelle(s) sont les contrainte(s)?",
  "category": "Conception",
  "numberOfselectionableOpt": null,
  "isRelevant": true,
  "hasMultipleOpenResponse": true,
  "shouldMultiply": false,
  "questionIdParent": 1,
  "types": [1,2],
  "projects": [],
  "options": []
 }
]
```

### 500 Internal Server Error

```json
{
  "error": "Internal server error"
}
```

## PATCH `/update/:questionId`

### **Description**

Met à jour une question existante en fonction de son `questionId`.
Accessible uniquement par les administrateurs.

### **Corps de la Requête (JSON)**

Tous les champs sont optionnels.
Seuls les champs envoyés seront mis à jour.

| Champ                      | Type        | Obligatoire  | Description                            |
| -------------------------- | ----------- | ------------ | -------------------------------------- |
| `label`                    | string      | ❌           | Texte de la question.                  |
| `category`                 | string      | ❌           | Catégorie de la question.              |
| `numberOfSelectionableOpt` | number      | ❌           | Nombre max d’options sélectionnables.  |
| `isRelevant`               | boolean     | ❌           | Indique si la question est pertinente. |
| `hasMultipleOpenResponse`  | boolean     | ❌           | Autorise plusieurs réponses libres.    |
| `shouldMultiply`           | boolean     | ❌           | La question doit être multipliée.      |
| `questionIdParent`         | number      | ❌           | ID de la question parente.             |
| `addType`                  | array       | ❌           | Liste des IDs types a ajoutés.         |
| `removeType`               | array       | ❌           | Liste des IDs types a supprimées.      |
| `addProject`               | array       | ❌           | Liste des IDs projets a ajoutés.       |
| `removeProject`            | array       | ❌           | Liste des IDs projets a supprimées.    |

### **Exemple de requête**

```json
{
  "label": "Quel(s) sont les concurrent(s)?",
  "addType": [5],
  "removeType": [2],
  "addProject": [10]
}
```

### **Réponses**

### 200 OK

```json
{
 "questionId": 1,
 "label": "Quel(s) sont vos objectif(s)?",
 "category": "Ideation",
 "numberOfselectionableOpt": null,
 "isRelevant": true,
 "hasMultipleOpenResponse": true,
 "shouldMultiply": false,
 "questionIdParent": null,
 "types": [1,5],
 "projects": [10],
 "options": []
}
```

### 400 Bad Request

```json
{
  "error": "label and category are required"
}
```

### 404 Not Found

```json
{
  "error": "Question not found"
}
```

### 500 Internal Server Error

```json
{
  "error": "Internal server error"
}
```

## DELETE `/delete/:questionId`

### **Description**

Supprime une question existante en fonction de son `questionId`.
Accessible uniquement par les administrateurs.

### **Réponses**

### 204 OK

Retourne la question supprimer.

```json
{
 "questionId": 1,
 "label": "Quel(s) sont vos objectif(s)?",
 "category": "Ideation",
 "numberOfselectionableOpt": null,
 "isRelevant": true,
 "hasMultipleOpenResponse": true,
 "shouldMultiply": false,
 "questionIdParent": null,
 "types": [1,2],
 "projects": [],
 "options": []
}
```

### 404 Not Found

```json
{
  "error": "Question not found"
}
```

### 500 Internal Server Error

```json
{
  "error": "Internal server error"
}
```

## GET `/get/:questionId`

### **Description**

Récupère la question existante en fonction de son `questionId`.
Accessible uniquement par les administrateurs.

### **Réponses**

### 200 OK

```json
{
 "questionId": 1,
 "label": "Quel(s) sont vos objectif(s)?",
 "category": "Ideation",
 "numberOfselectionableOpt": null,
 "isRelevant": true,
 "hasMultipleOpenResponse": true,
 "shouldMultiply": false,
 "questionIdParent": null,
 "types": [1,2],
 "projects": [],
 "options": []
}
```

### 404 Not Found

```json
{
  "error": "Question not found"
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

Retourne la liste des questions liées par le type ou directement assosciées au projet en fonction de `projectId`.

### **Réponses**

### 200 OK

```json
[
  {
  "questionId": 1,
  "label": "Quel(s) sont vos objectif(s)?",
  "category": "Ideation",
  "numberOfselectionableOpt": null,
  "isRelevant": true,
  "hasMultipleOpenResponse": true,
  "shouldMultiply": false,
  "questionIdParent": null,
  "types": [1,2],
  "projects": [],
  "options": []
 },
 {
  "questionId": 2,
  "label": "Quelle(s) sont les contrainte(s)?",
  "category": "Ideation",
  "numberOfselectionableOpt": null,
  "isRelevant": true,
  "hasMultipleOpenResponse": true,
  "shouldMultiply": false,
  "questionIdParent": 1,
  "types": [5],
  "projects": [1],
  "options": []
 }
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

## GET `/get/category/:category`

### **Description**

Retourne la liste des questions assosciées à la category en fonction de `category`

### **Réponses**

### 200 OK

```json
[
  {
  "questionId": 1,
  "label": "Quel(s) sont vos objectif(s)?",
  "category": "Ideation",
  "numberOfselectionableOpt": null,
  "isRelevant": true,
  "hasMultipleOpenResponse": true,
  "shouldMultiply": false,
  "questionIdParent": null,
  "types": [1,4],
  "projects": [],
  "options": []
 },
 {
  "questionId": 7,
  "label": "Avez vous des contributeurs?",
  "category": "Ideation",
  "numberOfselectionableOpt": 1,
  "isRelevant": true,
  "hasMultipleOpenResponse": false,
  "shouldMultiply": false,
  "questionIdParent": null,
  "types": [2],
  "projects": [6],
  "options": [1,2]
 }
]
```

### 500 Internal Server Error

```json
{
  "error": "Internal server error"
}
```

## GET `/get/type/:typeId`

### **description**

Retourn la liste des questions assosciées au type en fonction de `typeId`

### **Réponses**

### 200 OK

```json
[
  {
  "questionId": 1,
  "label": "Quel(s) sont vos objectif(s)?",
  "category": "Ideation",
  "numberOfselectionableOpt": null,
  "isRelevant": true,
  "hasMultipleOpenResponse": true,
  "shouldMultiply": false,
  "questionIdParent": null,
  "types": [1,4],
  "projects": [],
  "options": []
 },
 {
  "questionId": 7,
  "label": "Avez vous des contributeurs?",
  "category": "Ideation",
  "numberOfselectionableOpt": 1,
  "isRelevant": true,
  "hasMultipleOpenResponse": false,
  "shouldMultiply": false,
  "questionIdParent": null,
  "types": [1],
  "projects": [6],
  "options": [1,2]
 }
]
```

### 404 Not Found

```json
{
  "error": "Type not found"
}
```

### 500 Internal Server Error

```json
{
  "error": "Internal server error"
}
```

## GET `/get/:questionId/subquestion`

### **Description**

Retourne la liste des subquestions assosciées a une question en fonction de `questionIdParent`

### **Réponses**

### 200 OK

```json
[
  {
  "questionId": 2,
  "label": "Quel(s) sont vos objectif(s)?",
  "category": "Ideation",
  "numberOfselectionableOpt": null,
  "isRelevant": true,
  "hasMultipleOpenResponse": true,
  "shouldMultiply": false,
  "questionIdParent": 1,
  "types": [4],
  "projects": [],
  "options": []
 },
 {
  "questionId": 7,
  "label": "Avez vous des contributeurs?",
  "category": "Ideation",
  "numberOfselectionableOpt": 1,
  "isRelevant": true,
  "hasMultipleOpenResponse": false,
  "shouldMultiply": false,
  "questionIdParent": 1,
  "types": [1],
  "projects": [6],
  "options": [1,2]
 }
]
```

### 404 Not Found

```json
{
  "error": "Question not found"
}
```

### 500 Internal Server Error

```json
{
  "error": "Internal server error"
}
```