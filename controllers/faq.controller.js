const faqService = require('../services/faq.service')

// Обработчик поиска по ключевому слову
const handleFAQSearchByKeyword = async (bot, chatId, keyboard) => {
	const result = await faqService.searchFAQByKeyword(keyboard)

	if (result.length > 0) {
		result.forEach(r => {
			bot.sendMessage(
				chatId,
				`Вопрос: ${r.item.question}\nОтвет: ${r.item.answer}`
			)
		})
	} else {
		const options = {
			reply_markup: {
				inline_keyboard: [
					[{ text: 'Назад', callback_data: 'faq_back' }],
					[{ text: 'Главное меню', callback_data: 'main_menu' }],
				],
			},
		}
		bot.sendMessage(chatId, 'Ничего не найдено, попробуйте еще раз:', options)
	}
}

// Обработчик поиска по разделам
const handleFAQSearchBySection = async (bot, chatId) => {
	const sections = await faqService.getFAQSections();

	const sectionsButtons = sections.map(section => [
		{ text: section.section, callback_data: `section_${section.section}` },
	])

	bot.sendMessage(chatId, 'Выберите раздел:', {
		reply_markup: { inline_keyboard: sectionsButtons },
	})
}

// Обработчик вопросов по разделу
const handleFAQBySection = async (bot, chatId, section) => {
	const faqs = await faqService.getFAQsBySection(section)

	const faqButtons = faqs.map(faq => [
		{ text: faq.question, callback_data: `faq_${faq.id}` },
	])

	bot.sendMessage(chatId, 'Выберите вопрос:', {
		reply_markup: { inline_keyboard: faqButtons },
	})
}

// Обработчик вывода вопроса и ответа
const handleFAQByID = async (bot, chatId, faqId) => {
	const faq = await faqService.getFAQById(faqId);

	if (faq) {
		bot.sendMessage(chatId, `Вопрос: ${faq.question}\n Ответ: ${faq.answer}`);
	} else {
		bot.sendMessage(chatId, 'Вопрос не найден')
	}
};

module.exports = {
	handleFAQSearchByKeyword,
	handleFAQSearchBySection,
	handleFAQBySection,
	handleFAQByID,
}
