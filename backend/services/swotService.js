const { prisma } = require('../prisma/prismaClient');
const mistralService = require('./mistralService');

module.exports.generateSwotAnalysis = async (projectId) => {
  console.log('Generating SWOT for projectId:', projectId);

  // Fetch responses for the project
  const responses = await prisma.response.findMany({
    where: {
      projectId: Number(projectId),
    },
    select: {
      questionId: true,
      label: true,
      optionId: true,
    },
  });

  console.log('Responses found:', responses.length);

  // Get unique questionIds from responses
  const questionIds = [...new Set(responses.map(r => r.questionId))];
  console.log('Unique questionIds from responses:', questionIds);

  // Fetch questions that have responses in this project
  const questions = await prisma.question.findMany({
    where: {
      questionId: { in: questionIds },
    },
    select: {
      questionId: true,
      label: true,
      category: true,
      options: {
        select: {
          optionId: true,
          label: true,
        },
      },
    },
  });

  console.log('Questions found:', questions.length);

  // Build option map
  const optionMap = new Map();
  questions.forEach(q => {
    q.options.forEach(opt => {
      optionMap.set(opt.optionId, opt.label);
    });
  });

  // Format data for Mistral
  const formattedData = questions.map(q => {
    const qResponses = responses.filter(r => r.questionId === q.questionId);
    const responseTexts = qResponses.map(r => {
      if (r.label) return r.label;
      if (r.optionId && optionMap.has(r.optionId)) return optionMap.get(r.optionId);
      return '';
    }).filter(Boolean);

    return {
      questionId: q.questionId,
      label: q.label,
      category: q.category,
      responses: responseTexts,
    };
  });

  console.log(`Formatted data for Mistral:\n${JSON.stringify(formattedData, null, 2)}`);

  // Build prompt for Mistral
  const prompt = `
Tu es un assistant expert en analyse SWOT. Analyse les questions et réponses suivantes d'un projet et génère une analyse SWOT complète.

Données du projet (questions et réponses):
${JSON.stringify(formattedData, null, 2)}

Instructions:
- Analyse toutes les réponses pour identifier les forces, faiblesses, opportunités et menaces.
- Pour chaque catégorie SWOT, liste les points clés dérivés des réponses.
- Sois précis et basé uniquement sur les informations fournies.
- Retourne STRICTEMENT un objet JSON valide sans texte autour.
- Format JSON attendu:
{
  "strengths": "Texte des forces...",
  "weaknesses": "Texte des faiblesses...",
  "opportunities": "Texte des opportunités...",
  "threats": "Texte des menaces..."
}

Chaque champ doit contenir un paragraphe ou une liste descriptive basée sur les données.
  `.trim();

  // Call Mistral
  const rawResponse = await mistralService.CallMistralAPI(prompt);
  console.log('Raw Mistral response:', rawResponse);

  // Clean response if it has markdown
  let cleanedResponse = rawResponse.trim();
  if (cleanedResponse.startsWith('```json')) {
    cleanedResponse = cleanedResponse.replace(/^```json\s*/, '').replace(/\s*```$/, '');
  } else if (cleanedResponse.startsWith('```')) {
    cleanedResponse = cleanedResponse.replace(/^```\s*/, '').replace(/\s*```$/, '');
  }

  // Parse response
  try {
    const parsed = JSON.parse(cleanedResponse);
    
    // Map possible key variations
    const mapKeys = (obj) => {
      const mapped = {};
      for (const [key, value] of Object.entries(obj)) {
        const lowerKey = key.toLowerCase();
        if (lowerKey.includes('strength') || lowerKey.includes('force')) {
          mapped.strengths = value;
        } else if (lowerKey.includes('weakness') || lowerKey.includes('faiblesse')) {
          mapped.weaknesses = value;
        } else if (lowerKey.includes('opportunity') || lowerKey.includes('opportunite')) {
          mapped.opportunities = value;
        } else if (lowerKey.includes('threat') || lowerKey.includes('menace')) {
          mapped.threats = value;
        }
      }
      return mapped;
    };
    
    const mapped = mapKeys(parsed);

    // Helper to handle arrays or strings
    const getValue = (val) => Array.isArray(val) ? val.join('\n') : (val || "");

    // Always return the fields (allow empty strings), but log if any are missing.
    const result = {
      SWOT_strength: getValue(mapped.strengths ?? parsed.strengths),
      SWOT_weakness: getValue(mapped.weaknesses ?? parsed.weaknesses),
      SWOT_opportunity: getValue(mapped.opportunities ?? parsed.opportunities),
      SWOT_threat: getValue(mapped.threats ?? parsed.threats),
    };

    const missingKeys = Object.entries(result)
      .filter(([_, value]) => value === undefined)
      .map(([key]) => key);

    if (missingKeys.length > 0) {
      console.warn('Mistral response missing expected SWOT fields:', missingKeys, 'parsed:', parsed);
    }

    return result;
  } catch (error) {
    console.error('Error parsing Mistral response:', error);
    throw new Error('Failed to generate SWOT analysis');
  }
};