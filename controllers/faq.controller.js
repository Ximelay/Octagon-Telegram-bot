const faqService = require('../services/faq.service')
//! Проблема с callback'ами - на данный момент команды работаю по одному разу
// Обработчик поиска по ключевому слову
const handleFAQSearchByKeyword = async (
	bot,
	chatId,
	keyword,
	isBackPressed = false
) => {
	if (isBackPressed) {
		return // Если нажата кнопка "Назад", прерываем выполнение
	}

	try {
		const result = await faqService.searchFAQByKeyword(keyword)

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
	} catch (error) {
		console.error(`Ошибка при поиске по ключевому слову: ${error.message}`)
		bot.sendMessage(chatId, 'Произошла ошибка при выполнении поиска.')
	}
}

// Обработчик поиска по разделам
const handleFAQSearchBySection = async (bot, chatId) => {
	try {
		const sections = await faqService.getFAQSections()

		if (sections.length > 0) {
			const sectionsButtons = sections.map(section => [
				{ text: section.section, callback_data: `section_${section.section}` },
			])

			bot.sendMessage(chatId, 'Выберите раздел:', {
				reply_markup: { inline_keyboard: sectionsButtons },
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
			bot.sendMessage(
				chatId,
				'Нет доступных разделов для поиска. Попробуйте другой вариант:',
				options
			)
		}
	} catch (error) {
		console.error(`Ошибка при получении разделов: ${error.message}`)
		bot.sendMessage(chatId, 'Произошла ошибка при получении разделов.')
	}
}

// Обработчик вопросов по разделу
const handleFAQBySection = async (bot, chatId, section) => {
	try {
		const faqs = await faqService.getFAQsBySection(section)

		if (faqs.length > 0) {
			const faqButtons = faqs.map(faq => [
				{ text: faq.question, callback_data: `faq_${faq.id}` },
			])

			bot.sendMessage(chatId, 'Выберите вопрос:', {
				reply_markup: { inline_keyboard: faqButtons },
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
			bot.sendMessage(
				chatId,
				`В разделе "${section}" нет вопросов. Попробуйте другой раздел или вариант поиска:`,
				options
			)
		}
	} catch (error) {
		console.error(`Ошибка при получении вопросов по разделу: ${error.message}`)
		bot.sendMessage(chatId, 'Произошла ошибка при получении вопросов.')
	}
}

// Обработчик вывода вопроса и ответа по ID
const handleFAQByID = async (bot, chatId, faqId) => {
	try {
		const faq = await faqService.getFAQById(faqId)

		if (faq) {
			bot.sendMessage(chatId, `Вопрос: ${faq.question}\nОтвет: ${faq.answer}`)
		} else {
			bot.sendMessage(chatId, 'Вопрос не найден.')
		}
	} catch (error) {
		console.error(`Ошибка при получении вопроса по ID: ${error.message}`)
		bot.sendMessage(chatId, 'Произошла ошибка при получении вопроса.')
	}
}

// Обработчик для кнопки "Назад" — перезапуск команды /faq
const handleFAQBack = async (bot, chatId) => {
	const options = {
		reply_markup: {
			inline_keyboard: [
				[{ text: 'Поиск по ключевому слову', callback_data: 'search_keyword' }],
				[{ text: 'Поиск по разделам', callback_data: 'search_sections' }],
			],
		},
	}
	bot.sendMessage(chatId, 'Выберите тип поиска:', options)
}

module.exports = {
	handleFAQSearchByKeyword,
	handleFAQSearchBySection,
	handleFAQBySection,
	handleFAQByID,
	handleFAQBack,
}
