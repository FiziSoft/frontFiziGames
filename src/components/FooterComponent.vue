<template>
  <div class="mainFooter">
    <button class="menuBurger" @click="toggleModal">
      <i :class="isModalOpen ? 'fa fa-chevron-down' : 'fa fa-bars'"></i>
    </button>
    <span class="menuFizi" @click="goToHome">FiziGames</span>

    <div v-if="isModalOpen" class="modal-overlay" @click.self="toggleModal">
      <div class="modal-content">
        <button class="menuBurger" @click="toggleModal">
          <i class="fa fa-chevron-down"></i>
        </button>
        <span class="menuFizi">FiziGames</span>
        <div class="modal-body">
          <div class="modal-section">
            <label>{{ $t('select_theme') }}</label>
            <select @change="handleChangeTheme" :value="currentTheme">
              <option value="default">{{ $t('themes.default') }}</option>
              <option value="theme1">{{ $t('themes.theme1') }}</option>
              <option value="theme2">{{ $t('themes.theme2') }}</option>
              <option value="theme3">{{ $t('themes.theme3') }}</option>
              <option value="theme4">{{ $t('themes.theme4') }}</option>
            </select>
          </div>
          <div class="modal-section">
            <label>{{ $t('select_language') }}</label>
            <select @change="changeLanguage" :value="locale">
              <option value="ua">Українська</option>
              <option value="ru">Русский</option>
              <option value="en">English</option>
            </select>
          </div>
          <ShareButton url="https://fizi.cc" text="Запрошую пограти на Fizi.cc (Найкращі настільні ігри Он-лайн)"></ShareButton>
          <button class="close-button" @click="toggleModal">{{ $t('close') }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { inject, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import ShareButton from './ShareButton.vue';


const router = useRouter();
const { locale } = useI18n();
const currentTheme = inject('currentTheme');
const changeTheme = inject('changeTheme');
const isModalOpen = ref(false);

const goToHome = () => {
  router.push('/');
};

const toggleModal = () => {
  isModalOpen.value = !isModalOpen.value;
};

const handleChangeTheme = (event) => {
  changeTheme(event.target.value);
};

const changeLanguage = (event) => {
  const lang = event.target.value;
  locale.value = lang;
  localStorage.setItem('language', lang);
};
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
  position: fixed
  bottom: 0
  box-shadow: 0 -4px 10px rgba(0, 0, 0, 0.1)
  border-top: 1px solid rgba(0, 0, 0, 0.1)
  z-index: 1000
  margin-top: 50px
  

.menuBurger
  background: none
  border: none
  font-size: 24px
  cursor: pointer
  color: var(--burger-color) !important

.menuFizi
  font-size: 18px
  color: var(--text-color) !important
  cursor: pointer
  text-decoration: none

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
  z-index: 999
  

.modal-content
  background: var(--bg-color)
  width: 100%
  max-width: 500px
  height: 70%
  padding: 20px
  border-top-left-radius: 20px
  border-top-right-radius: 20px
  box-shadow: 0 -4px 10px rgba(0, 0, 0, 0.2)
  display: flex
  flex-direction: column
  align-items: center
  color: #000 !important

.modal-body
  width: 100%
  display: flex
  flex-direction: column
  align-items: center

.modal-section
  margin: 15px 0
  width: 100%

.modal-section label
  display: block
  margin-bottom: 5px
  font-size: 16px
  color: #000 !important

.modal-section select
  width: 100%
  padding: 10px
  border-radius: 5px
  border: 1px solid #000 !important
  background: #fff
  color: #000 !important
  font-size: 16px
  cursor: pointer

.close-button
  margin-top: 20px
  padding: 10px 20px
  background: var(--btn-gradient-color) !important
  border: none
  border-radius: 5px
  color: var(--text-color) !important
  font-size: 16px
  cursor: pointer
</style>
