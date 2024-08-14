<template>
  <GameLayout nameGame="Шпіон">
    <div class="containerFormCreate">
      <form class="formCreate">
        <div class="formElement">
          <label class="btn-gradient-1" for="playerName">Ваше ім'я:</label>
          <input v-model="playerName" type="text" id="playerName" class="input-gradient">
        </div>
        <div class="formElement">
          <label>Кількість гравців:</label>
          <input v-model="numPlayers" class="input-gradient" placeholder=" " type="number" />
        </div>
        <div class="formElement">
          <label class="btn-gradient-1" for="time_game">Час на гру (хв):</label>
          <input v-model="time_game" type="number" id="time_game" class="input-gradient">
        </div>
        <div class="formElement">
          <Dropdown_my :items="themeOptions" v-model="selectedTheme" label="Тема гри:" />
        </div>
        <div class="btnDiv">
          <button :disabled="!isButtonActive" type="button" @click="sendCreateRoomRequest" class="btn-grad">Почати гру</button>
        </div>
      </form>
      <div v-if="errorMessage" class="error-message">
        {{ errorMessage }}
      </div>
    </div>
  </GameLayout>
</template>

<script setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { v4 as uuidv4 } from 'uuid';
import GameLayout from "../GameLayout.vue";
import Dropdown_my from "/src/components/Dropdown_my.vue";
import themeData from './theme.json';
import axios from "axios";

import { useI18n } from 'vue-i18n';
import { url_stat } from "@/link";
const { locale } = useI18n();
const savedLocale = localStorage.getItem('language') || 'ua';
locale.value = savedLocale;


const router = useRouter();
const playerName = ref(localStorage.getItem('playerName') || '');
const numPlayers = ref(null);
const time_game = ref(null);
const selectedTheme = ref(null);
const selectedWord = ref(null);
const themes = ref(themeData);
const themeOptions = ref(Object.keys(themeData));
const gameMode = ref('offline');
const errorMessage = ref('');
const isButtonActive = computed(() => {
  return playerName.value.trim().length > 0 && numPlayers.value && time_game.value && selectedTheme.value;
});

const sendCreateRoomRequest = async () => {
  try {
    if (selectedTheme.value) {
      const words = themes.value[selectedTheme.value];
      const randomIndex = Math.floor(Math.random() * words.length);
      selectedWord.value = words[randomIndex];
    }

    localStorage.setItem('playerName', playerName.value);
    localStorage.setItem('numPlayers', numPlayers.value);
    localStorage.setItem('selectedTheme', selectedTheme.value);
    localStorage.setItem('currentWord', selectedWord.value);
    localStorage.setItem('knownPlayersCount', '0');
    localStorage.setItem('remainingTime', time_game.value * 60);
    localStorage.setItem('gameStarted', 'false');
    localStorage.setItem('timerStarted', 'false');

    const roomId = uuidv4();
    localStorage.setItem('spyRoomId', roomId);
    localStorage.setItem('playerIndex', '0');

    axios.post(url_stat, {
      game_id: 5,
      room_number: roomId,
      creator_name: playerName.value,
      language: locale.value,
      player_count: numPlayers.value,
      is_local: true,
     
      
    });


    router.push({ name: 'spyOfflineRoom', params: { idRoom: roomId } });
  } catch (error) {
    console.error('Ошибка при создании комнаты:', error);
    errorMessage.value = "Произошла ошибка при создании комнаты. Пожалуйста, попробуйте снова.";
  }
};
</script>

<style scoped>
.error-message {
  color: red;
  margin-top: 10px;
}
</style>
