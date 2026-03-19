const { prisma } = require('../prisma/prismaClient');
const mistralService = require('./mistralService');
const { createResponse } = require('./responseService');
const fs = require('fs').promises;
const path = require('path');

const CONFIG_PATH = path.join(__dirname, '../config/app-config.json');

const ALLOWED_ACTIONS = {
	GENERATE_NEW_IDEATION_RESPONSE: 'GENERATE_NEW_IDEATION_RESPONSE',
	GENERATE_NEW_CONTRIBUTOR: 'GENERATE_NEW_CONTRIBUTOR',
};

const chatbotInclude = {
	remainingQuestionsToAsk: {
		select: {
			questionId: true,
			label: true,
			keyword: true,
			category: true,
			onglet: true,
		},
	},
};

const questionSelect = {
	questionId: true,
	label: true,
	keyword: true,
	category: true,
	onglet: true,
};

function parseQuestionIds(questionIds) {
	if (!Array.isArray(questionIds)) return [];

	return questionIds
		.map((id) => Number(id))
		.filter((id) => Number.isInteger(id) && id > 0);
}

async function loadAppConfig() {
	try {
		const raw = await fs.readFile(CONFIG_PATH, 'utf8');
		return JSON.parse(raw);
	} catch (error) {
		console.warn(`Unable to load app config (${CONFIG_PATH}):`, error.message);
		return null;
	}
}

async function getIdeationPromptTemplate() {
	const config = await loadAppConfig();
	return config?.prompts?.ideation?.systemPrompt || null;
}

const DEFAULT_IDEATION_PROMPT = `
Tu es un assistant de projet proactif et engageant.

Reponds en francais, de manière claire, concise et naturelle.
Retourne STRICTEMENT un objet JSON valide (sans markdown, sans texte autour).
Format JSON attendu:
{"response":"string","actions":[{"type":"GENERATE_NEW_IDEATION_RESPONSE","questionId":123,"answer":"string"},{"type":"GENERATE_NEW_CONTRIBUTOR","contributor":{"firstname":"string","lastname":"string","email":"string","position":"string"}}]}
Actions autorisees: ${ALLOWED_ACTIONS.GENERATE_NEW_IDEATION_RESPONSE}, ${ALLOWED_ACTIONS.GENERATE_NEW_CONTRIBUTOR}.
Regle generale: sois proactif pour recueillir des informations. Pose des questions pertinentes de la liste disponible de manière naturelle, en reagissant au dernier message utilisateur. TOUTES les questions de la liste de questions disponibles doivent être abordées.
Regle historique: utilise l'historique de conversation pour eviter de reposer les memes questions ou de repeter des informations deja connues.
Regle action: si le message utilisateur contient une information metier qui peut etre obtenue ou mise a jour via une question du projet, tu DOIS remplir actions avec au moins une action GENERATE_NEW_IDEATION_RESPONSE.
Regle action contributeur: si l'utilisateur evoque une personne qui travaille au sein de la structure, ajoute une action GENERATE_NEW_CONTRIBUTOR.
Regle action contributeur: pour GENERATE_NEW_CONTRIBUTOR, renseigne contributor.firstname, contributor.lastname, contributor.position et contributor.email (email est optionnel et peut etre une chaine vide si inconnu).
Regle action: la questionId choisie doit provenir de la liste de questions disponible ci-dessous et etre semantiquement liee a la demande utilisateur. Le champs "answer" doit resumer l'information pertinente fournie par l'utilisateur.
Regle proactivite: dans ta reponse, pose naturellement une question suivante pertinente si possible, pour approfondir la discussion sans etre repetitif.
Exemple: si l'utilisateur mentionne un projet termine, ajoute une action liee a la question qui demande s'il a deja termine un projet, et dans la reponse, demande des details sur ce projet.
Exemple contributeur: si l'utilisateur dit "Marie Dupont (marie.dupont@acme.fr) travaille sur la comptabilite", ajoute une action GENERATE_NEW_CONTRIBUTOR avec ces donnees.
Si aucune action n'est necessaire, retourne "actions": [], mais reste engageant dans la reponse.
Pour les actions de type GENERATE_NEW_IDEATION_RESPONSE uniquement, chaque action doit referencer une questionId existante dans la liste des questions ci-dessous.
`.trim();

module.exports.parseStoredMessages = (lastMessages) => {
	if (!lastMessages) return [];

	try {
		const parsed = JSON.parse(lastMessages);
		if (!Array.isArray(parsed)) return [];

		return parsed
			.filter((message) => message && typeof message === 'object')
			.map((message) => ({
				role: message.role === 'assistant' ? 'assistant' : 'user',
				content: typeof message.content === 'string' ? message.content : '',
				timestamp: message.timestamp || new Date().toISOString(),
			}))
			.filter((message) => message.content.trim().length > 0);
	} catch (_error) {
		console.warn('Invalid lastMessages JSON, resetting history.');
		return [];
	}
};

module.exports.normalizeIdeationActions = (rawActions) => {
	if (!Array.isArray(rawActions)) return [];

	return rawActions
		.filter((action) => action && typeof action === 'object')
		.map((action) => ({
			type:
				action.type === ALLOWED_ACTIONS.GENERATE_NEW_IDEATION_RESPONSE ||
				action.type === ALLOWED_ACTIONS.GENERATE_NEW_CONTRIBUTOR
					? action.type
					: null,
			questionId: Number(action.questionId),
			answer:
				typeof action.answer === 'string'
					? action.answer.trim()
					: typeof action.reason === 'string'
						? action.reason.trim()
						: '',
			contributor:
				action.contributor && typeof action.contributor === 'object'
					? {
						firstname:
							typeof action.contributor.firstname === 'string'
								? action.contributor.firstname.trim()
								: '',
						lastname:
							typeof action.contributor.lastname === 'string'
								? action.contributor.lastname.trim()
								: '',
						email:
							typeof action.contributor.email === 'string'
								? action.contributor.email.trim().toLowerCase()
								: '',
						position:
							typeof action.contributor.position === 'string'
								? action.contributor.position.trim()
								: '',
					}
					: null,
		}))
		.filter(
			(action) =>
				action.type === ALLOWED_ACTIONS.GENERATE_NEW_IDEATION_RESPONSE
					? Number.isInteger(action.questionId) && action.questionId > 0
					: action.type === ALLOWED_ACTIONS.GENERATE_NEW_CONTRIBUTOR,
		)
		.map((action) => ({
			type: action.type,
			questionId: Number.isInteger(action.questionId) ? action.questionId : null,
			answer: action.answer,
			contributor: action.contributor,
		}));
};

module.exports.extractIdeationAssistantPayload = (rawResponse) => {
	const fallback = {
		response: 'Je n\'ai pas de reponse pour le moment.',
		actions: [],
	};

	if (!rawResponse) return fallback;

	if (typeof rawResponse === 'object') {
		return {
			response:
				typeof rawResponse.response === 'string' && rawResponse.response.trim()
					? rawResponse.response.trim()
					: fallback.response,
			actions: module.exports.normalizeIdeationActions(rawResponse.actions),
		};
	}

	if (typeof rawResponse === 'string') {
		try {
			const parsed = JSON.parse(rawResponse);
			return {
				response:
					typeof parsed?.response === 'string' && parsed.response.trim()
						? parsed.response.trim()
						: rawResponse.trim() || fallback.response,
				actions: module.exports.normalizeIdeationActions(parsed?.actions),
			};
		} catch (_error) {
			return {
				response: rawResponse.trim() || fallback.response,
				actions: [],
			};
		}
	}

	return fallback;
};

module.exports.getAvailableQuestionsForProject = async (projectId) => {
	const projectLinkedQuestions = await prisma.question.findMany({
		where: {
			projects: {
				some: {
					projectId,
				},
			},
			category: {
				not: 'Theme',
			},
		},
		select: questionSelect,
		orderBy: {
			questionId: 'asc',
		},
	});

	const fallbackQuestions =
		projectLinkedQuestions.length > 0
			? []
			: await prisma.question.findMany({
					where: {
						category: {
							not: 'Theme',
						},
					},
					select: questionSelect,
					orderBy: {
						questionId: 'asc',
					},
				});

	return {
		projectLinkedQuestions,
		fallbackQuestions,
		availableQuestions:
			projectLinkedQuestions.length > 0
				? projectLinkedQuestions
				: fallbackQuestions,
	};
};

async function isQuestionLinkedToProject(projectId, questionId) {
	const project = await prisma.project.findFirst({
		where: {
			projectId,
			OR: [
				{
					questions: {
						some: { questionId },
					},
				},
				{
					types: {
						some: {
							questions: {
								some: { questionId },
							},
						},
					},
				},
			],
		},
		select: {
			projectId: true,
		},
	});

	return Boolean(project);
}

function isValidEmail(email) {
	return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function sanitizeNamePart(value) {
	if (typeof value !== 'string') return '';
	return value
		.trim()
		.replace(/\s+/g, ' ')
		// Keep Unicode letters (including accents), marks, digits and common name separators.
		.replace(/[^\p{L}\p{M}0-9._' -]/gu, '');
}

function buildUsername(firstname, lastname) {
	const safeFirstname = sanitizeNamePart(firstname).toLowerCase().replace(/\s+/g, '.');
	const safeLastname = sanitizeNamePart(lastname).toLowerCase().replace(/\s+/g, '.');
	const base = `${safeFirstname}.${safeLastname}`.replace(/\.+/g, '.').replace(/^\.|\.$/g, '');
	return base || `contributeur.${Date.now()}`;
}

async function ensureContributorRoleForUser(userId) {
	const contributorRole = await prisma.role.findUnique({
		where: { roleName: 'contributeur' },
		select: { roleId: true },
	});

	if (!contributorRole) {
		throw new Error('Role contributeur not found');
	}

	const existingUserRole = await prisma.userRole.findUnique({
		where: {
			userId_roleId: {
				userId,
				roleId: contributorRole.roleId,
			},
		},
		select: { userId: true },
	});

	if (!existingUserRole) {
		await prisma.userRole.create({
			data: {
				userId,
				roleId: contributorRole.roleId,
			},
		});
	}
}

async function ensureClientLinkForUser(clientId, userId, position) {
	const existingLink = await prisma.clientUserRole.findUnique({
		where: {
			clientId_userId: {
				clientId,
				userId,
			},
		},
		select: { userId: true },
	});

	if (existingLink) return;

	await prisma.clientUserRole.create({
		data: {
			clientId,
			userId,
			position: position || null,
			isManager: false,
		},
	});
}

async function createOrLinkContributor(projectId, contributorPayload) {
	const firstname = sanitizeNamePart(contributorPayload?.firstname || '');
	const lastname = sanitizeNamePart(contributorPayload?.lastname || '');
	const providedEmail = typeof contributorPayload?.email === 'string'
		? contributorPayload.email.trim().toLowerCase()
		: '';
	const position =
		typeof contributorPayload?.position === 'string'
			? contributorPayload.position.trim()
			: '';

	if (!firstname || !lastname) {
		throw new Error('Missing contributor firstname/lastname');
	}

	// Business rule: do not create/link a contributor when the same full name already exists.
	const existingByFullName = await prisma.user.findFirst({
		where: {
			firstname: { equals: firstname, mode: 'insensitive' },
			lastname: { equals: lastname, mode: 'insensitive' },
		},
		select: { userId: true },
	});

	if (existingByFullName) {
		throw new Error('Contributor with same firstname/lastname already exists');
	}

	if (providedEmail && !isValidEmail(providedEmail)) {
		throw new Error('Invalid contributor email');
	}

	const project = await prisma.project.findUnique({
		where: { projectId },
		select: { clientId: true },
	});

	if (!project) {
		throw new Error('Project not found');
	}

	const existingUser = providedEmail
		? await prisma.user.findUnique({
				where: { email: providedEmail },
				select: { userId: true, firstname: true, lastname: true },
			})
		: null;

	if (existingUser) {
		await ensureClientLinkForUser(project.clientId, existingUser.userId, position);
		await ensureContributorRoleForUser(existingUser.userId);

		return {
			mode: 'linked_existing',
			userId: existingUser.userId,
		};
	}

	let username = buildUsername(firstname, lastname);
	let suffix = 1;
	while (await prisma.user.findUnique({ where: { username }, select: { userId: true } })) {
		suffix += 1;
		username = `${buildUsername(firstname, lastname)}.${suffix}`;
	}

	const email = providedEmail || null;

	const createdUser = await prisma.user.create({
		data: {
			username,
			firstname,
			lastname,
			email,
			password: null,
		},
		select: {
			userId: true,
		},
	});

	await ensureClientLinkForUser(project.clientId, createdUser.userId, position);
	await ensureContributorRoleForUser(createdUser.userId);

	return {
		mode: 'created',
		userId: createdUser.userId,
	};
}

module.exports.applyIdeationActions = async (actions, projectId, availableQuestions) => {
	const result = {
		requested: Array.isArray(actions) ? actions.length : 0,
		applied: [],
		skipped: [],
	};

	if (!Array.isArray(actions) || actions.length === 0) {
		return result;
	}

	const availableQuestionIds = new Set(
		(availableQuestions || []).map((question) => question.questionId),
	);

	for (const action of actions) {
		if (
			action.type !== ALLOWED_ACTIONS.GENERATE_NEW_IDEATION_RESPONSE &&
			action.type !== ALLOWED_ACTIONS.GENERATE_NEW_CONTRIBUTOR
		) {
			result.skipped.push({ action, reason: 'Unsupported action type' });
			continue;
		}

		if (action.type === ALLOWED_ACTIONS.GENERATE_NEW_CONTRIBUTOR) {
			try {
				const contributorResult = await createOrLinkContributor(
					projectId,
					action.contributor,
				);

				result.applied.push({
					type: action.type,
					userId: contributorResult.userId,
					mode: contributorResult.mode,
				});
			} catch (error) {
				result.skipped.push({
					action,
					reason: error.message || 'Failed to create contributor',
				});
			}

			continue;
		}

		if (!action.answer) {
			result.skipped.push({ action, reason: 'Missing answer field' });
			continue;
		}

		if (!availableQuestionIds.has(action.questionId)) {
			result.skipped.push({
				action,
				reason: 'Question not available for this project context',
			});
			continue;
		}

		const isLinked = await isQuestionLinkedToProject(projectId, action.questionId);
		if (!isLinked) {
			result.skipped.push({
				action,
				reason: 'Question is not linked to this project',
			});
			continue;
		}

		try {
			const createdResponse = await createResponse({
				label: action.answer,
				projectId,
				questionId: action.questionId,
			});

			result.applied.push({
				type: action.type,
				questionId: action.questionId,
				responseId: createdResponse.responseId,
			});
		} catch (error) {
			result.skipped.push({
				action,
				reason: error.message || 'Failed to persist action',
			});
		}
	}

	return result;
};

module.exports.buildIdeationPrompt = async ({
	message,
	historyWithUser,
	availableQuestions,
	projectId,
}) => {
	// Fetch responses for the project to determine unanswered questions
	const responses = await prisma.response.findMany({
		where: {
			projectId: Number(projectId),
		},
		select: {
			questionId: true,
		},
	});

	// Get unique questionIds that have responses
	const answeredQuestionIds = new Set(responses.map(r => r.questionId));

	// Filter questions without answers
	const questionsWithoutAnswers = availableQuestions.filter(q => !answeredQuestionIds.has(q.questionId));
	console.log(`Available questions: ${availableQuestions.length}, Answered: ${answeredQuestionIds.size}, Unanswered: ${questionsWithoutAnswers.length}`);
	console.log( "questionsWithoutAnswers for prompt:", questionsWithoutAnswers.map(q => q.label).join(', '));

	const basePrompt = (await getIdeationPromptTemplate())?.trim() || DEFAULT_IDEATION_PROMPT;

	const dynamicParts = [
		`Questions existantes pour ce projet (JSON): ${JSON.stringify(availableQuestions)}`,
		`Questions qui n'ont pas encore été abordées : ${questionsWithoutAnswers.map(q => q.label).join(', ')}`,
		`Historique de conversation (JSON): ${JSON.stringify(historyWithUser)}`,
		`Dernier message utilisateur: ${message}`,
	];

	return [basePrompt, ...dynamicParts].join('\n\n');
};

module.exports.createIdeationChatbot = async (data) => {
	const validProjectId = Number(data.projectId);
	if (!Number.isInteger(validProjectId) || validProjectId <= 0) {
		throw new Error('Invalid projectId');
	}

	const remainingQuestionIds = parseQuestionIds(data.remainingQuestionIds);

	try {
		return await prisma.ideationChatBotMistral.create({
			data: {
				projectId: validProjectId,
				chatSummary: data.chatSummary ?? null,
				lastMessages: data.lastMessages ?? null,
				remainingQuestionsToAsk: remainingQuestionIds.length
					? {
							connect: remainingQuestionIds.map((questionId) => ({ questionId })),
						}
					: undefined,
			},
			include: chatbotInclude,
		});
	} catch (error) {
		if (error.code === 'P2002') {
			throw new Error('Chatbot already exists for this project');
		}
		throw error;
	}
};


module.exports.getIdeationChatbotByProjectId = async (projectId) => {
	const validProjectId = Number(projectId);
	if (!Number.isInteger(validProjectId) || validProjectId <= 0) {
		throw new Error('Invalid projectId');
	}

	const chatbot = await prisma.ideationChatBotMistral.findUnique({
		where: { projectId: validProjectId },
		include: chatbotInclude,
	});

	if (!chatbot) {
		throw new Error('Chatbot not found');
	}

	return chatbot;
};

module.exports.updateIdeationChatbot = async (chatbotId, data) => {
	const validChatbotId = Number(chatbotId);
	if (!Number.isInteger(validChatbotId) || validChatbotId <= 0) {
		throw new Error('Invalid chatbotId');
	}

	const updateData = {};

	if (data.chatSummary !== undefined) {
		updateData.chatSummary = data.chatSummary ?? null;
	}

	if (data.lastMessages !== undefined) {
		updateData.lastMessages = data.lastMessages ?? null;
	}

	if (data.remainingQuestionIds !== undefined) {
		const remainingQuestionIds = parseQuestionIds(data.remainingQuestionIds);
		updateData.remainingQuestionsToAsk = {
			set: remainingQuestionIds.map((questionId) => ({ questionId })),
		};
	}

	try {
		return await prisma.ideationChatBotMistral.update({
			where: { chatbotId: validChatbotId },
			data: updateData,
			include: chatbotInclude,
		});
	} catch (error) {
		if (error.code === 'P2025') {
			throw new Error('Chatbot not found');
		}
		throw error;
	}
};

module.exports.deleteIdeationChatbot = async (chatbotId) => {
	const validChatbotId = Number(chatbotId);
	if (!Number.isInteger(validChatbotId) || validChatbotId <= 0) {
		throw new Error('Invalid chatbotId');
	}

	try {
		return await prisma.ideationChatBotMistral.delete({
			where: { chatbotId: validChatbotId },
		});
	} catch (error) {
		if (error.code === 'P2025') {
			throw new Error('Chatbot not found');
		}
		throw error;
	}
};

module.exports.generateIdeationAnswer = async (prompt) => {
	return mistralService.CallMistralAPI(prompt);
};

module.exports.IDEATION_ALLOWED_ACTIONS = ALLOWED_ACTIONS;

