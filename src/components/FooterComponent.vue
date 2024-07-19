<template>
  <div>
    <div class="mainFooter">
      <button class="menuBurger" @click="toggleModal">
        <i :class="isModalOpen ? 'fa fa-chevron-down' : 'fa fa-bars'"></i>
      </button>
      <span class="menuFizi">FiziGames</span>
    </div>

    <div v-if="isModalOpen" class="modal-overlay" @click.self="toggleModal">
      <div class="modal-content">
        <button class="menuBurger" @click="toggleModal">
          <i class="fa fa-chevron-down"></i>
        </button>
        <span class="menuFizi">FiziGames</span>
        <div class="modal-body">
          <div class="modal-section">
            <label>{{ $t('select_theme') }}</label>
            <select @change="changeTheme($event)" :value="currentTheme">
              <option value="default">{{ $t('themes.default') }}</option>
              <option value="theme1">{{ $t('themes.theme1') }}</option>
              <option value="theme2">{{ $t('themes.theme2') }}</option>
              <option value="theme3">{{ $t('themes.theme3') }}</option>
              <option value="theme4">{{ $t('themes.theme4') }}</option>
            </select>
          </div>
          <div class="modal-section">
            <label>{{ $t('select_language') }}</label>
            <select @change="changeLanguage($event)" :value="locale">
              <option value="uk">Українська</option>
              <option value="ru">Русский</option>
              <option value="en">English</option>
            </select>
          </div>
          <button class="close-button" @click="toggleModal">{{ $t('close') }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';

const router = useRouter();
const { locale } = useI18n();
const currentTheme = ref('default');
const isModalOpen = ref(false);

const themes = {
  default: {
    '--bg-color': 'linear-gradient(90deg, rgba(65,41,90,1) 0%, rgba(47,7,67,1) 100%)',
    '--text-color': '#fff',
    '--gradient-color': 'linear-gradient(to right, #DA22FF 0%, #9733EE 51%, #DA22FF 100%)',
    '--btn-gradient-color': 'linear-gradient(to right, #DA22FF, #9733EE)',
    '--btn-delete-color': '#fff',
    '--fizi-gradient': 'linear-gradient(to right, #FF512F, #DD2476)',
    '--border-color': '#ddd'
  },
  theme1: {
    '--bg-color': '#ff7e5f',
    '--text-color': '#000',
    '--gradient-color': 'linear-gradient(to right, #ff7e5f, #ffb27d)',
    '--btn-gradient-color': 'linear-gradient(to right, #ff4e50, #f9d423)',
    '--btn-delete-color': '#000',
    '--fizi-gradient': 'linear-gradient(to right, #6A82FB, #FC5C7D)',
    '--border-color': '#000'
  },
  theme2: {
    '--bg-color': '#9733ee',
    '--text-color': '#fff',
    '--gradient-color': 'linear-gradient(to right, #9733ee, #da22ff)',
    '--btn-gradient-color': 'linear-gradient(to right, #6a11cb, #2575fc)',
    '--btn-delete-color': '#fff',
    '--fizi-gradient': 'linear-gradient(to right, #FF5F6D, #FFC371)',
    '--border-color': '#ddd'
  },
  theme3: {
    '--bg-color': '#f9f9a1',
    '--text-color': '#000',
    '--gradient-color': 'linear-gradient(to right, #f9f9a1, #fce16b)',
    '--btn-gradient-color': 'linear-gradient(to right, #ffdd00, #fbb034)',
    '--btn-delete-color': '#000',
    '--fizi-gradient': 'linear-gradient(to right, #00F260, #0575E6)',
    '--border-color': '#000'
  },
  theme4: {
    '--bg-color': '#f8c4d4',
    '--text-color': '#000',
    '--gradient-color': 'linear-gradient(to right, #f8c4d4, #f7a3b0)',
    '--btn-gradient-color': 'linear-gradient(to right, #ff758c, #ff7eb3)',
    '--btn-delete-color': '#000',
    '--fizi-gradient': 'linear-gradient(to right, #8E2DE2, #4A00E0)',
    '--border-color': '#000'
  },
};

const applyTheme = (theme) => {
  const root = document.documentElement;
  const themeProperties = themes[theme];
  for (const prop in themeProperties) {
    root.style.setProperty(prop, themeProperties[prop]);
  }
  localStorage.setItem('theme', theme);
};

const goToHome = () => {
  router.push('/'); // переход на главный экран
};

const changeTheme = (event) => {
  currentTheme.value = event.target.value;
  applyTheme(currentTheme.value);
};

const changeLanguage = (event) => {
  const lang = event.target.value;
  locale.value = lang;
  localStorage.setItem('language', lang);
};

const toggleModal = () => {
  isModalOpen.value = !isModalOpen.value;
};

onMounted(() => {
  const savedTheme = localStorage.getItem('theme') || 'default';
  currentTheme.value = savedTheme;
  applyTheme(savedTheme);

  const savedLanguage = localStorage.getItem('language') || 'uk';
  locale.value = savedLanguage;
});
</script>

<style lang="sass">
.mainFooter
  display: flex
  justify-content: space-between
  align-items: center
  width: 100%
  padding: 10px 20px
  height: 50px
  background: var(--bg-color)
  position: sticky
  bottom: 0
  box-shadow: 0 -4px 10px rgba(0, 0, 0, 0.1)
  border-top: 1px solid rgba(0, 0, 0, 0.1)

.menuBurger
  background: none
  border: none
  font-size: 24px
  cursor: pointer
  color: var(--text-color)

.menuFizi
  font-size: 18px
  color: var(--text-color)

.modal-overlay
  position: fixed
  top: 0
  left: 0
  width: 100%
  height: 100%
  background: rgba(0, 0, 0, 0.5)
  display: flex
  justify-content: center
  align-items: flex-end

.modal-content
  background: var(--bg-color)
  width: 100%
  padding: 20px
  border-top-left-radius: 20px
  border-top-right-radius: 20px
  box-shadow: 0 -4px 10px rgba(0, 0, 0, 0.2)
  display: flex
  flex-direction: column
  align-items: center

.modal-body
  width: 100%
  display: flex
  flex-direction: column
  align-items: center

.modal-section
  margin: 15px 0
  width: 80%

.modal-section label
  display: block
  margin-bottom: 5px
  font-size: 16px
  color: var(--text-color)

.modal-section select
  width: 100%
  padding: 10px
  border-radius: 5px
  border: 1px solid var(--text-color)
  background: transparent
  color: var(--text-color)
  font-size: 16px
  cursor: pointer

.close-button
  margin-top: 20px
  padding: 10px 20px
  background: var(--btn-gradient-color)
  border: none
  border-radius: 5px
  color: var(--btn-delete-color)
  font-size: 16px
  cursor: pointer
</style>
