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
        <div class="formElement radio-container">
          <label class="btn-gradient-1 radio-label">
            <input type="radio" v-model="gameMode" value="online" class="radio-input">
            <span>Онлайн</span>
          </label>
          <label class="btn-gradient-1 radio-label">
            <input type="radio" v-model="gameMode" value="offline" class="radio-input">
            <span>Оффлайн</span>
          </label>
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

const url_serv = "https://spy-02051e1fd8ed.herokuapp.com"; // Добавлено для устранения ошибки

const sendCreateRoomRequest = async () => {
  try {
    if (selectedTheme.value) {
      const words = themes.value[selectedTheme.value];
      const randomIndex = Math.floor(Math.random() * words.length);
      selectedWord.value = words[randomIndex];
    }

    const roomData = {
      name: playerName.value,
      req_players: numPlayers.value,
      time_game: time_game.value,
      theme_str: selectedTheme.value,
      word: selectedWord.value,
      theme_words: themes.value[selectedTheme.value]
    };

    localStorage.setItem('playerName', playerName.value);
    localStorage.setItem('numPlayers', numPlayers.value);
    localStorage.setItem('selectedTheme', selectedTheme.value);
    localStorage.setItem('currentWord', selectedWord.value);
    localStorage.setItem('knownPlayersCount', '0');
    localStorage.setItem('remainingTime', time_game.value * 60);
    localStorage.setItem('gameStarted', 'false');
    localStorage.setItem('timerStarted', 'false');

    if (gameMode.value === 'offline') {
      const roomId = uuidv4();
      localStorage.setItem('spyRoomId', roomId);
      localStorage.setItem('playerIndex', '0');
      router.push({ name: 'spyOfflineRoom', params: { idRoom: roomId } });
    } else {
      const response = await axios.post(`${url_serv}/create_room`, roomData);
      const roomId = response.data.id;
      localStorage.setItem('spyRoomId', roomId);
      localStorage.setItem('spyPlayerHash', uuidv4());
      router.push({ name: 'spyGameRoom', params: { id: roomId } }).then(() => {
        window.location.reload();
      });
    }
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

.radio-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 18px;
}

.radio-label {
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 18px;
}

.radio-input {
  width: 30px;
  height: 30px;
  margin-bottom: 5px;
}
</style>
