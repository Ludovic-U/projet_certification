
const { PrismaClient } = require('@prisma/client');
const mistralService = require('./mistralService');

const prisma = new PrismaClient();

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

function parseQuestionIds(questionIds) {
	if (!Array.isArray(questionIds)) return [];

	return questionIds
		.map((id) => Number(id))
		.filter((id) => Number.isInteger(id) && id > 0);
}

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

