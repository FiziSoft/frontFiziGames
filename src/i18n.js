import { createI18n } from 'vue-i18n';
import en from './locales/en.json';
import ru from './locales/ru.json';
import uk from './locales/uk.json';

const messages = {
  en,
  ru,
  uk
};

const i18n = createI18n({
  locale: 'uk', // текущий язык
  fallbackLocale: 'uk', // язык по умолчанию, если перевод не найден
  messages,
});

export default i18n;
