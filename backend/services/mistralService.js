const { Mistral } = require('@mistralai/mistralai');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

dotenv.config();

const apiKey = process.env.MISTRAL_API_KEY;
const client = new Mistral({ apiKey: apiKey });

exports.CallMistralAPI = async (prompt) => {
    const chatResponse = await client.chat.complete({
        model: "mistral-large-latest",
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

// Simple wrapper used by controller tests
export async function testMistralAPI(testContent) {
    return GenerateGanttMistralAPI(testContent)
}