const { FAQ } = require('../models');
const Fuse = require('fuse.js');

// Поиск по ключевому слову
const searchFAQByKeyword = async (keyword) => {
  const faqs = await FAQ.findAll();

  const options = {
    keys: ['question', 'answer'],
    threshold: 0.3, //Небольшие опечатки
  };

  const fuse = new Fuse(faqs.map(faq => faq.dataValues), options);
  const result = fuse.search(keyword);
  return result;
};

// Получение разделов
const getFAQSections = async () => {
	const sections = await FAQ.findAll({
		attributes: ['section'],
		group: 'section',
	})
	return sections
}

// Получение вопросов из разделов
const getFAQsBySection = async section => {
	return await FAQ.findAll({ where: { section } })
}

const getFAQById = async (faqId) => {
	return await FAQ.findByPk(faqId);
}

module.exports = {
	searchFAQByKeyword,
	getFAQSections,
	getFAQsBySection,
	getFAQById
}