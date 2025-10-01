# Option API Routes `/api/option`

- [POST `/create`](#post-create)
- [PATCH `/update/:optionId`](#patch-updateoptionid)
- [DELETE `/delete/:optionId`](#delete-deleteoptionid)
- [GET `/get/:optionId`](#get-getoptionid)
- [GET `/get/question/:questionId`](#get-getquestionquestionid)

## POST `/create`

### **Description**

Crée une nouvelle option dans la base de données.

### **Corps de la Requête (JSON)**

| Champ        | Type    | Obligatoire  | Défaut  | Description                 |
| -------------| ------- | ------------ | ------- | ----------------------------|
| `label`      | string  | ✅           | -       | Nom de l'option.            |
| `questionId` | number  | ✅           | -       | ID de la question associée. |

### **Exemple de requête**

```json
{
 "label": "Option 1",
 "questionId": 1
}
```

### **Réponses**

### 201 Created

```json
{
 "optionId": 1,
 "label": "Option 1",
 "questionId": 1
}
```

### 400 Bad Request

```json
{
  "error": "label is required"
}
```

### 500 Internal Server Error

```json
{
  "error": "Internal server error"
}
```

## PATCH `/update/:optionId`

### **Description**

Met à jour une option existante en fonction de son `optionId`.

### **Corps de la Requête (JSON)**

Tous les champs sont optionnels.
Seuls les champs envoyés seront mis à jour.

| Champ        | Type    | Obligatoire  | Description                 |
| -------------| ------- | ------------ | ----------------------------|
| `label`      | string  | ❌           | Nom de l'option.            |
| `questionId` | number  | ❌           | ID de la question associée. |

### **Exemple de requête**

```json
{
 "label": "Option 1 modifier",
}
```

### **Réponses**

### 200 OK

```json
{
 "optionId": 1,
 "label": "Option 1 modifier",
 "questionId": 1
}
```

### 400 Bad Request

```json
{
  "error": "label is required"
}
```

### 404 Not Found

```json
{
  "error": "Option not found"
}
```

### 500 Internal Server Error

```json
{
  "error": "Internal server error"
}
```

## DELETE `/delete/:optionId`

### **Description**

Supprime une option existante en fonction de son `optionId`.

### **Réponses**

### 204 OK No Content

### 404 Not Found

```json
{
  "error": "Option not found"
}
```

### 500 Internal Server Error

```json
{
  "error": "Internal server error"
}
```

## GET `/get/:optionId`

### **Description**

Récupère l'option existante en fonction de son `optionId`.

### **Réponses**

### 200 OK

```json
{
 "optionId": 1,
 "label": "Option 1",
 "questionId": 1
}
```

### 404 Not Found

```json
{
  "error": "Option not found"
}
```

### 500 Internal Server Error

```json
{
  "error": "Internal server error"
}
```

## GET `/get/question/:questionId`

### **Description**

Retourne la liste des options associées a une question en fonction de son `questionId`.

### **Réponses**

### 200 OK

```json
[
 {
  "label": "Option 1",
  "questionId": 1,
 },
 {
  "label": "Option 2",
  "questionId": 1,
 },
 {
  "label": "Option 3",
  "questionId": 1,
 },
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
