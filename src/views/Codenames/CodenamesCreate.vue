<template>
  <GameLayout :nameGame="$t('games.codenames.title')">
    <div class="containerFormCreate">
      <div id="" class="formCreate">
        <strong>{{ $t('games.codenames.title') }}</strong>
        <button class="btn-grad" @click="createGame(12)">{{ $t('games.codenames.create_game', { count: 12 }) }}</button>
        <button class="btn-grad" @click="createGame(16)">{{ $t('games.codenames.create_game', { count: 16 }) }}</button>
        <button class="btn-grad" @click="createGame(20)">{{ $t('games.codenames.create_game', { count: 20 }) }}</button>
        <button class="btn-grad" @click="createGame(25)">{{ $t('games.codenames.create_game', { count: 25 }) }}</button>
      </div>
    </div>
  </GameLayout>
</template>

<script setup>
import { ref } from 'vue';

import { useI18n } from 'vue-i18n';
import { useRouter, useRoute } from 'vue-router';
import axios from 'axios';
import GameLayout from '../GameLayout.vue';
import { url_stat } from "@/link";



const playerName = ref(localStorage.getItem('playerName') || '');

const { locale } = useI18n();
const router = useRouter();
const route = useRoute();

const setLocaleFromRoute = () => {
  if (route.query.locale) {
    locale.value = route.query.locale;
  }
};

// Устанавливаем локализацию из параметров маршрута при загрузке страницы
setLocaleFromRoute();

const createGame = async (numWords) => {
  try {
    const response = await axios.post(`https://codenames-72ce2135032c.herokuapp.com/create_game/${numWords}`, {
      locale: locale.value,
    });
    const { game_id } = response.data;

    axios.post(url_stat, {
      game_id: 1,
      room_number: game_id,
      creator_name: playerName.value,
      language: locale.value,
      player_count: 0,
      is_local: false,
           
    });


    router.push({
      name: 'codenames-gameboard',
      params: {
        gameId: game_id,
        playerId: generatePlayerId(),
        locale: locale.value,
      },
    });
  } catch (error) {
    console.error("Error creating game:", error);
  }
};

const generatePlayerId = () => {
  return 'player-' + Math.random().toString(36).substr(2, 9);
};
</script>
