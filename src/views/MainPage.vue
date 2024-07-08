<template>
  <div class="mainContainer mainPage body_main_page">
    <div class="text-gradient">Fizi Games</div>
    <hr>
    <br>
    <div>Найкращі настільні ігри Онлайн для компаній</div>
    <div class="name_game" v-for="game in games" :key="game.name">
      <a :href="network_url + game.url">
        <h1>
          <i :class="game.icon"></i>
          <div class="game-name">{{ game.name }}</div>
        </h1>
      </a>
    </div>
    <br>
  </div>
</template>

<script setup>
import { ref } from 'vue';

// const network_url = ref('http://localhost:8080');
const network_url = 'https://salty-crag-94803-5b1ef9ad0209.herokuapp.com';

const games = ref([
  { name: 'Камінь Ножиці Бумага', url: '/rsp-createRoom', icon: 'fa-solid fa-hands-asl-interpreting' },
  { name: 'Шпіон', url: '/spy/createRoom', icon: 'fa-solid fa-user-secret' },
  { name: 'Правда або Дія', url: '/tod', icon: 'fa-solid fa-hat-wizard' },
  { name: '5 Секунд', url: '/five-second', icon: 'fa-solid fa-stopwatch' },
]);
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

.name_game a
  text-decoration: none
  color: inherit
  display: flex
  align-items: center

.name_game h1
  display: flex
  align-items: center
  gap: 10px
  font-size: 1.5em
  width: 100%

.name_game i
  font-size: 1.5em
  flex: 0 0 20%
  text-align: center

.game-name
  flex: 0 0 80%
  text-align: left

.name_game:hover
  transform: scale(1.05)
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2)

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
