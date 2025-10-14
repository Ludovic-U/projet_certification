# Type API Routes `/api/type`

- [POST `/create`](#post-create)
- [GET `/get`](#get-get)
- [PATCH `/update/:typeId`](#patch-updatetypeid)
- [DELETE `/delete/:typeId`](#delete-deletetypeid)
- [GET `/get/:TypeId`](#get-gettypeid)

## POST `/create`

### **Description**

Crée un nouveau type dans la base de données.
Accessible uniquement par les administrateurs.

### **Corps de la Requête (JSON)**

| Champ       | Type    | Obligatoire  | Défaut  | Description                                    |
| ------------| ------- | ------------ | ------- | -----------------------------------------------|
| `label`     | string  | ✅           | -       | Nom du type.                                   |
| `projects`  | array   | ❌           | `[]`    | Liste des identifiants de projets associés.    |
| `questions` | array   | ❌           | `[]`    | Liste des identifiants de questions associées. |

### **Exemple de requête**

```json
{
 "label": "General"
}
```

### **Réponses**

### 201 Created

```json
{
 "typeId": 1,
 "label": "General",
 "projects": [],
 "questions": []
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

## GET `/get`

### **Description**

Récupère la liste de tous les types.
Accessible uniquement par les administrateurs.

### **Réponses**

### 200 OK

```json
[
 {
  "typeId": 1,
  "label": "General",
 },
 {
  "typeId": 2,
  "label": "Sports",
 }, 
]
```

### 500 Internal Server Error

```json
{
  "error": "Internal server error"
}
```

## PATCH `/update/:typeId`

### **Description**

Met à jour un type existant en fonction de son `typeId`.
Accessible uniquement par les administrateurs.

### **Corps de la Requête (JSON)**

Tous les champs sont optionnels.
Seuls les champs envoyés seront mis à jour.

| Champ            | Type    | Obligatoire  | Description                           |
| -----------------| ------- | ------------ | ------------------------------------- |
| `label`          | string  | ❌           | Nom du type.                          |
| `addProject`     | array   | ❌           | Liste des IDs projets a ajoutés.      |
| `removeProject`  | array   | ❌           | Liste des IDs projets a supprimées.   |
| `addQuestion`    | array   | ❌           | Liste des IDs questions a ajoutés.    |
| `removeQuestion` | array   | ❌           | Liste des IDs questions a supprimées. |

### **Exemple de requête**

```json
{
 "label": "Cuisine",
 "addProject": [2],
 "addQuestion": [6],
}
```

### **Réponses**

### 200 OK

```json
 {
  "typeId": 1,
  "label": "Cuisine",
  "projects": [2],
  "questions": [6]
 },
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
  "error": "Type not found"
}
```

### 500 Internal Server Error

```json
{
  "error": "Internal server error"
}
```

## DELETE `/delete/:typeId`

### ** Description**

Supprime un type existant en fonction de son `typeId`.
Accessible uniquement par les administrateurs.

### **Réponses**

### 204 OK No Content

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

## GET `/get/:TypeId`

### **Description**

Récupère le type existant en fonction de son `typeId`.
Accessible uniquement par les administrateurs.

### **Réponses**

### 200 OK

```json
{
 "typeId": 1,
 "label": "General",
 "projects": [],
 "questions": []
}
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