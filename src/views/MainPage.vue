<template>
  <div class="mainContainer">
    <div class="header">
      <div class="text-gradient">{{ $t('welcome') }}</div>
      <div class="locale-container">
        <select v-model="currentLocale" @change="changeLocale" class="locale-selector">
          <option value="ua">Ua</option>
          <option value="ru">Ru</option>
          <option value="en">En</option>
          <option value="pl">Pl</option>
          <option value="es">Es</option>
        </select>
      </div>
    </div>

    <hr>
    <br>
    <div>{{ $t('best_online_games') }}</div>
    <div class="name_game" v-for="game in games" :key="game.key">
      <a :href="`${url_main_page}${game.url}?locale=${currentLocale}`">
        <h1>
          <i :class="game.icon"></i>
          <div class="game-name">{{ $t(`games.${game.key}.name`) }}</div>
        </h1>
      </a>
      <button @click="openModal(game)" class="info-button">
        <i class="fa-regular fa-circle-question"></i>
      </button>
    </div>
    <br>
    <ModalMain v-if="selectedGame" :game="selectedGame" @close="selectedGame = null" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import ModalMain from '@/components/ModalMain.vue';

import {url_main_page} from "@/link"
import { setLocale } from '@/i18n';



const games = ref([


  {
    key: 'alias',
    url: '/alias',
    icon: 'fa-solid fa-a',  
  },
  {
    key: 'codenames',
    url: '/codenames',
    icon: 'fa-solid fa-sitemap',
  },
  
  {
    key: 'battleSee',
    url: '/battle-sea',
    icon: 'fa-solid fa-ship',
  },
  {
    key: 'loseFriends',
    url: '/bye-friends',
    icon: 'fa-solid fa-users-slash',  
  },
  {
    key: 'spy',
    url: '/spy/createRoom',
    icon: 'fa-solid fa-user-secret',
  },
  {
    key: 'five_second',
    url: '/five-second',
    icon: 'fa-solid fa-stopwatch',
  },
  {
    key: 'tod',
    url: '/tod',
    icon: 'fa-solid fa-hat-wizard',
  }
  // {
  //   key: 'rsp',
  //   url: '/rsp-createRoom',
  //   icon: 'fa-solid fa-hands-asl-interpreting',
  // }
  
 
  
  
]);

const selectedGame = ref(null);
const { locale } = useI18n();
const currentLocale = ref(locale.value);

const openModal = (game) => {
  selectedGame.value = game;
};

const changeLocale = async (event) => {
  const lang = event.target.value;
  await setLocale(lang); // Используем централизованную функцию смены языка
};

onMounted(() => {
  const savedLanguage = localStorage.getItem('language') || 'ua';
  currentLocale.value = savedLanguage;
  locale.value = savedLanguage;
});
</script>


<style lang="sass">
.mainContainer
  display: flex
  flex-direction: column
  align-items: center
  text-align: center
  padding: 20px
  background: var(--bg-color) !important
  color: var(--text-color) !important
  margin-bottom: 50px
.header
  display: flex
  flex-direction: column
  align-items: center
  width: 100%
  position: relative

.locale-container
  margin-top: 10px // Добавляем отступ сверху для мобильной версии
  color: #000

.locale-selector
  padding: 5px
  border-radius: 5px
  border: 1px solid var(--border-color) !important
  background: transparent !important
  color: var(--text-color) !important
  font-size: 16px
  cursor: pointer

.logo_main
  font-size: 79px

.name_game
  border: 1px solid var(--border-color) !important
  padding: 20px
  border-radius: 12px
  margin: 20px
  text-decoration: none !important
  width: 80%
  max-width: 600px
  transition: transform 0.3s ease, box-shadow 0.3s ease
  display: flex
  justify-content: space-between
  align-items: center
  color: var(--text-color) !important // Устанавливаем цвет текста

.name_game a
  text-decoration: none !important
  color: inherit !important
  display: flex
  align-items: center
  flex: 1 // Для равномерного распределения пространства между элементами

.name_game h1
  display: flex
  align-items: center
  gap: 10px
  font-size: 1.5em
  width: 100%
  margin: 0 !important // Удаление дополнительных отступов для выравнивания
  color: var(--text-color) !important // Устанавливаем цвет текста

.name_game i
  font-size: 1.5em
  flex: 0 0 20%
  text-align: center
  color: var(--text-color) !important // Устанавливаем цвет иконок

.game-name
  flex: 1 // Выравнивание названия игр
  text-align: left
  color: var(--text-color) !important // Устанавливаем цвет текста

.name_game:hover
  transform: scale(1.05)
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2)

.info-button
  background: none
  border: none
  cursor: pointer
  font-size: 1.2em
  color: inherit
  margin-left: 10px !important // Добавление отступа слева для выравнивания

.menuBurger
  background: none
  border: none
  font-size: 24px
  cursor: pointer
  color: var(--burger-color) !important

@mixin gradient-text
  background: linear-gradient(45deg, #ff6b6b, #f06595, #cc5de8, #845ef7, #5c7cfa, #339af0, #22b8cf, #20c997, #51cf66, #94d82d, #fcc419, #ff922b, #ff6b6b)
  -webkit-background-clip: text
  -webkit-text-fill-color: transparent
  background-clip: text
  text-fill-color: transparent

.text-gradient
  @include gradient-text
  font-size: 3em // Увеличить или уменьшить размер по желанию
  font-weight: 700
  margin: 0 auto
</style>
