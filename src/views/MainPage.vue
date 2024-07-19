<template>
  <div class="mainContainer mainPage body_main_page">
    <div class="text-gradient">{{ $t('welcome') }}</div>
    <hr>
    <br>
    <div>{{ $t('best_online_games') }}</div>
    <div class="name_game" v-for="game in games" :key="game.key">
      <a :href="network_url + game.url">
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
import { ref } from 'vue';
import ModalMain from '@/components/ModalMain.vue';

// const network_url = 'https://fizigames-799b6804c93a.herokuapp.com';
const network_url = 'http://localhost:8080';

const games = ref([
  {
    key: 'rsp',
    url: '/rsp-createRoom',
    icon: 'fa-solid fa-hands-asl-interpreting',
  },
  {
    key: 'spy',
    url: '/spy/createRoom',
    icon: 'fa-solid fa-user-secret',
  },
  {
    key: 'tod',
    url: '/tod',
    icon: 'fa-solid fa-hat-wizard',
  },
  {
    key: 'five_second',
    url: '/five-second',
    icon: 'fa-solid fa-stopwatch',
  },
  {
    key: 'codenames',
    url: '/codenames',
    icon: 'fa-solid fa-sitemap',
  },
]);

const selectedGame = ref(null);

const openModal = (game) => {
  selectedGame.value = game;
};
</script>

<style lang="sass">
.mainContainer
  display: flex
  flex-direction: column
  align-items: center
  text-align: center
  padding: 20px

.logo_main
  font-size: 79px

.name_game
  border: 1px solid var(--border-color)
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

.name_game a
  text-decoration: none
  color: inherit
  display: flex
  align-items: center
  flex: 1 // Для равномерного распределения пространства между элементами

.name_game h1
  display: flex
  align-items: center
  gap: 10px
  font-size: 1.5em
  width: 100%
  margin: 0 // Удаление дополнительных отступов для выравнивания

.name_game i
  font-size: 1.5em
  flex: 0 0 20%
  text-align: center

.game-name
  flex: 1 // Выравнивание названия игр
  text-align: left

.name_game:hover
  transform: scale(1.05)
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2)

.info-button
  background: none
  border: none
  cursor: pointer
  font-size: 1.2em
  color: inherit
  margin-left: 10px // Добавление отступа слева для выравнивания

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
</style>
