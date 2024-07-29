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
import themeData from './theme.json'; // Убедитесь, что путь правильный
import axios from "axios";

const router = useRouter();
const playerName = ref(localStorage.getItem('PlayerName') || '');
const numPlayers = ref(null);
const time_game = ref(null);
const selectedTheme = ref(null);
const selectedWord = ref(null);
const themes = ref(themeData);
const themeOptions = ref(Object.keys(themeData)); // Получаем все темы из JSON файла
const errorMessage = ref('');
const isButtonActive = computed(() => {
  return playerName.value.trim().length > 0 && numPlayers.value && time_game.value && selectedTheme.value;
});

// const url_serv = "http://localhost:7000"
const url_serv = "https://spy-02051e1fd8ed.herokuapp.com";



const sendCreateRoomRequest = async () => {
  try {
    // Выбираем случайное слово перед отправкой запроса
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
      theme_words: themes.value[selectedTheme.value] // Добавляем все слова темы
    };

    console.log('Отправка данных на сервер:', roomData);

    const response = await axios.post(`${url_serv}/create_room`, roomData);

    const roomId = response.data.id;
    localStorage.setItem('PlayerName', playerName.value);
    localStorage.setItem('spyRoomId', roomId);
    localStorage.setItem('spyPlayerHash', uuidv4());

    router.push({ name: 'spyGameRoom', params: { id: roomId } }).then(() => {
      window.location.reload();
    });
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
