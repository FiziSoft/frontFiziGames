<template>
  <GameLayout nameGame="Шпіон">
    <AnimatedBackground
      :number-of-images="3"
      :min-size="20"
      :max-size="80"
      :min-speed="10"
      :max-speed="150"
    />
    <div class="containerFormCreate">
      <form class="formCreate">
        <div class="formElement">
          <label class="input-label" for="playerName">Ваше ім'я:</label>
          <input v-model="playerName" type="text" id="playerName" class="input-gradient">
        </div>
        <div class="formElement">
          <label class="input-label">Кількість гравців:</label>
          <input v-model="numPlayers" class="input-gradient" placeholder=" " type="number" max="18" min="1" />
        </div>
        <div class="formElement">
          <label class="input-label" for="time_game">Час на гру (хв):</label>
          <input v-model="time_game" type="number" id="time_game" class="input-gradient" max="20" min="1" />
        </div>
        <div class="formElement">
          <label class="input-label" for="selectedTheme">Тема гри:</label>
          <select v-model="selectedTheme" id="selectedTheme" class="input-gradient">
            <option value="" disabled selected>Зроби вибір</option>
            <option v-for="theme in themeOptions" :key="theme" :value="theme">{{ theme }}</option>
          </select>
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
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { v4 as uuidv4 } from 'uuid';
import GameLayout from "../GameLayout.vue";
import axios from "axios";

import { useI18n } from 'vue-i18n';
import { url_stat } from "@/link";
import { loadSpyData } from '@/wordsStorage'; // Импорт функции загрузки данных для игры "Шпіон"
import AnimatedBackground from "@/components/AnimatedBackground.vue";

const { locale } = useI18n();
const savedLocale = localStorage.getItem('language') || 'ua';
locale.value = savedLocale;

const router = useRouter();
const playerName = ref(localStorage.getItem('playerName') || '');
const numPlayers = ref(null);
const time_game = ref(null);
const selectedTheme = ref("");
const selectedWord = ref(null);
const themes = ref({});
const themeOptions = ref([]);
const errorMessage = ref('');
const isButtonActive = computed(() => {
  return (
    playerName.value.trim().length > 0 &&
    numPlayers.value &&
    time_game.value &&
    selectedTheme.value
  );
});

// Функция для загрузки данных тем из IndexedDB или сервера
const loadThemes = async () => {
  try {
    const storedData = await loadSpyData(locale.value);
    themes.value = storedData;
    themeOptions.value = Object.keys(storedData);
  } catch (error) {
    console.error("Ошибка при загрузке данных тем:", error);
    errorMessage.value = "Не удалось загрузить темы. Пожалуйста, попробуйте снова.";
  }
};

const validateInputs = () => {
  if (numPlayers.value > 18) {
    errorMessage.value = "Кількість гравців не може бути більше 18";
    return false;
  }
  if (time_game.value > 20) {
    errorMessage.value = "Час на гру не може бути більше 20 хвилин";
    return false;
  }
  return true;
};

const sendCreateRoomRequest = async () => {
  if (!validateInputs()) return;

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

onMounted(() => {
  loadThemes(); // Загружаем данные тем при монтировании компонента
});
</script>

<style scoped>
.error-message {
  color: red;
  margin-top: 10px;
}

.input-label {
  margin-bottom: 5px;
  display: block;
}

.select-label {
  margin-top: 10px;
  display: block;
}

input[type="number"] {
  -moz-appearance: textfield;
}

input[type="number"]::-webkit-outer-spin-button,
input[type="number"]::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.btnDiv {
  margin-top: 20px;
  text-align: center;
}
</style>
