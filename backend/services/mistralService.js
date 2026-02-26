const { Mistral } = require('@mistralai/mistralai');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

dotenv.config();

const apiKey = process.env.MISTRAL_API_KEY;
const client = new Mistral({ apiKey: apiKey });

// Load app config for prompts
const CONFIG_PATH = path.join(__dirname, '../config/app-config.json');

function loadConfig() {
    try {
        const configData = fs.readFileSync(CONFIG_PATH, 'utf8');
        return JSON.parse(configData);
    } catch (error) {
        console.error('Error loading config:', error);
        return {};
    }
}

// Get prompts from config, with fallbacks to hardcoded values
function getPromptConfig(promptType) {
    const config = loadConfig();
    return config.prompts?.[promptType] || null;
}

exports.CallMistralAPI = async (prompt) => {
    const chatResponse = await client.chat.complete({
        model: "mistral-small-latest",
        messages: [{ role: 'user', content: prompt }],
        responseFormat: { type: 'json_object' },
    });

    // prix des tokens 0.5$ par million de tokens pour mistral-large-3
    const prix = (chatResponse.usage.promptTokens * 0.5 / 1000000) + (chatResponse.usage.completionTokens * 2 / 1000000);

    console.log("cette opération a couté : " + prix + " $");
    return chatResponse.choices[0].message.content;
};

// Format attendu pour le Gantt
const ganttExpectedForma = `{
    "Gantt": [
        {
            "id": 0,
            "title": "<Nom de la tâche>",
            "start_date": "<YYYY-MM-DD>",
            "end_date": "<YYYY-MM-DD>",
            "progress_percent": 0,
            "parent_id": null,
            "type": "action|sous-action|milestone", // Enum : 3 valeurs possibles
            "description": "<Description de la tâche>",
            "note": "<Note supplémentaire>",
            "assignees": [
                {
                    "name": "<Nom personne>",
                    "hours_assigned": 0,
                    "daily_cost": 0
                }
            ],
            "expenses": [
                {
                    "type": "amenagement-mobilier|equipement|prestations|communication-evenementiel", // Enum : 4 valeurs possibles
                    "name": "<Nom dépense>",
                    "unit": "<Unité>",
                    "unit_price": 0
                }
            ],
            "deliverables": [
                {
                    "name": "<Nom livrable>",
                    "delivered": false,
                    "uploaded": false,
                    "file_path": "<Chemin fichier>"
                }
            ]
        }
    ]
}
`;

// Appel de l'API Mistral pour générer le Gantt
exports.GenerateGanttMistralAPI = async (textContent, projectId = 1) => {
    try {

        const prompt = textContent.trim()
            ? `Analyse ce contenu et à partir des information pertinentes que tu y trouveras, retourne un objet JSON qui servira à créer un Gantt:
            \n\n${textContent}
            \n\nLe format attendu pour le Gantt est le suivant:\n${ganttExpectedForma}
            \n\nAssure toi que le JSON retourné est valide et respecte bien le format demandé.    `
            : 'How far is the moon from earth?';

            // appel call mistral api 
        // for loop sur chaque task du json
    
        // appel du controlelr gantt pour créer chaque task 

        // appel du controller dépense si la task a une depense 

        // ensuite return le json pour debug.
        return exports.CallMistralAPI(prompt); // json

    } catch (err) {
        console.error('Mistral API Error:', err);
        return { error: 'Mistral API Error', details: err.message };
    }
}

// Lire un document et en extraire le texte via OCR
exports.MistralOCR = async (filePath) => {
    if (!apiKey) throw new Error('Missing MISTRAL_API_KEY');
    if (!filePath) throw new Error('filePath is required');


    const fileContent = fs.readFileSync(filePath, 'utf-8');

    // Upload et récupère l'URL signée
    const documentUrl = await exports.uploadFile(filePath);

    // Lance l'OCR avec l'URL
    const response = await client.ocr.process({
        model: 'mistral-ocr-latest',
        document: {
            type: 'document_url',
            documentUrl: documentUrl,
        },
        includeImageBase64: true,
    });

    // Supprimer le fichier temporaire
    fs.unlinkSync(filePath);

    return response;
}

// Upload un fichier et retourne son URL signée
exports.uploadFile = async (filePath) => {
    const fileName = path.basename(filePath);
    const fileBuffer = fs.readFileSync(filePath);

    // Upload le fichier
    const uploadedFile = await client.files.upload({
        file: {
            fileName: fileName,
            content: fileBuffer,
        },
        purpose: 'ocr'
    });

    // Récupère l'URL signée
    const signedUrl = await client.files.getSignedUrl({
        fileId: uploadedFile.id
    });

    return signedUrl.url;
}

// Genere un arbre de question/réponse à partir d'un texte
exports.GenerateIdeationMistralAPI = async (textContent) => {

}

// Format attendu pour le Mindmap
const mindmapExpectedFormat = `{
    "nodes": [
        {
            "id": "root",
            "label": "Nom du projet",
            "nodeType": "action",
            "color": "#3b82f6"
        },
        {
            "id": "node-1",
            "parentId": "root",
            "label": "Titre de la catégorie ou question",
            "nodeType": "action",
            "color": "#96776e"
        },
        {
            "id": "node-1-1",
            "parentId": "node-1",
            "label": "Réponse ou sous-catégorie",
            "nodeType": "sous_action",
            "color": "#698063"
        }
    ]
}`;

// Default system prompt for mindmap (fallback if not in config)
const defaultMindmapSystemPrompt = `À partir de ces réponses aux questions, génère une structure de carte mentale (mindmap) organisée de manière hiérarchique.

Règles:
- Le premier nœud (root) doit être le nom du projet ou thème principal
- Organise les réponses en catégories logiques
- Utilise les types de nœuds: "action" pour les catégories principales, "sous_action" pour les sous-catégories, "livrable" pour les livrables, "objectif" pour les objectifs
- Les couleurs recommandées: #3b82f6 (bleu) pour root, #96776e (marron) pour action, #698063 (vert) pour sous_action, #22c55e (vert clair) pour livrable, #ffffff (blanc) pour objectif
- Génère un JSON valide sans texte supplémentaire`;

// Génère un mindmap à partir des réponses du projet
exports.GenerateMindmapFromResponses = async (projectId) => {
    try {
        // Fetch project to get project name for root node
        const { prisma } = require('../prisma/prismaClient');
        
        console.log('Fetching project and responses for projectId:', projectId);
        
        const project = await prisma.project.findUnique({
            where: { projectId: projectId },
            select: { projectName: true },
        });
        
        // Use projectName, fallback to 'Projet'
        const projectName = project?.projectName || 'Projet';
        
        console.log('Project name:', projectName);
        
        const responses = await prisma.response.findMany({
            where: { projectId: projectId },
            include: {
                question: true,
                option: true,
            },
        });
        
        console.log('Found responses:', responses.length);

        if (!responses || responses.length === 0) {
            return { error: 'Aucune réponse trouvée pour ce projet. Veuillez d\'abord répondre à des questions dans l\'onglet Questions/Réponses.' };
        }

        // Build context from responses
        let contextText = 'Voici les réponses aux questions du projet:\n\n';
        
        // Group by question
        const responsesByQuestion = {};
        for (const response of responses) {
            const questionLabel = response.question?.label || 'Question sans titre';
            if (!responsesByQuestion[questionLabel]) {
                responsesByQuestion[questionLabel] = [];
            }
            const responseText = response.label || (response.option?.label || 'Sans réponse');
            responsesByQuestion[questionLabel].push(responseText);
        }

        // Format context
        for (const [question, answers] of Object.entries(responsesByQuestion)) {
            contextText += `Question: ${question}\n`;
            contextText += `Réponses: ${answers.join(', ')}\n\n`;
        }

        // Get prompt from config or use default
        const promptConfig = getPromptConfig('mindmap');
        const systemPromptTemplate = promptConfig?.systemPrompt || defaultMindmapSystemPrompt;
        // const finalPrompt = systemPromptTemplate.replace('{fmt}', mindmapExpectedFormat).replace('{text}', contextText);
        const finalPrompt = systemPromptTemplate + 'Le forma attendu en réponse est le suivant:\n' + mindmapExpectedFormat;
        const prompt = `${contextText}

${finalPrompt}`;

        return exports.CallMistralAPI(prompt);
    } catch (err) {
        console.error('Error generating mindmap from responses:', err);
        return { error: 'Error generating mindmap', details: err.message };
    }
}

// Simple wrapper used by controller tests
exports.testMistralAPI = async (testContent) => {
    return exports.GenerateGanttMistralAPI(testContent);
};