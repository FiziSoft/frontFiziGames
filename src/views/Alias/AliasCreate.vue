<template>
  <GameLayout nameGame="Alias">
    <div class="containerFormCreate">
      <form class="formCreate">
        <div class="formElement">
          <label for="team1Name">Команда:</label>
          <input v-model="team1Name" type="text" id="team1Name" class="input-gradient">
        </div>
        <div class="formElement">
          <label for="team2Name">Команда:</label>
          <input v-model="team2Name" type="text" id="team2Name" class="input-gradient">
        </div>
        <div class="formElement">
          <label for="difficulty">Сложность игры:</label>
          <select v-model="difficulty" id="difficulty" class="input-gradient">
            <option v-for="(label, value) in difficultyOptions" :key="value" :value="value">{{ label }}</option>
          </select>
        </div>
        <div class="formElement">
          <label for="targetScore">До скольки очков играем?</label>
          <input v-model="targetScore" type="number" id="targetScore" class="input-gradient">
        </div>
        <div class="formElement">
          <label for="scoringMode">Режим подсчета очков:</label>
          <select v-model="scoringMode" id="scoringMode" class="input-gradient">
            <option value="strict">Строго (отнимать очко при выборе "-")</option>
            <option value="simple">Просто (пропускать слово при выборе "-")</option>
          </select>
        </div>
        <div class="formElement">
          <label for="lastWordMode">Последнее слово, общее?</label>
          <input v-model="lastWordMode" type="checkbox" id="lastWordMode" class="checkbox-custom">
          <label for="lastWordMode" class="checkbox-label"></label>
        </div>
        <div class="btnDiv">
          <button :disabled="!isButtonActive" type="button" @click="createRoom" class="btn-grad">Создать комнату</button>
          <!-- <button type="button" @click="resetGame" class="btn-grad reset-button">Начать новую игру</button> -->
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
import namesData from '@/views/Alias/alias_name.json'; // JSON с именами для команд
import axios from "axios";


const router = useRouter();
const team1Name = ref('');
const team2Name = ref('');
const difficulty = ref(1); // По умолчанию Легкая (1)
const targetScore = ref(50);
const errorMessage = ref('');
const scoringMode = ref('strict'); // По умолчанию Строго
const lastWordMode = ref(false); // По умолчанию выключено

const difficultyOptions = ref({
  1: 'Легкая',
  2: 'Средняя',
  3: 'Трудная',
  4: 'Смешанная'
});

const isButtonActive = computed(() => {
  return team1Name.value.trim().length > 0 && team2Name.value.trim().length > 0 && targetScore.value;
});

// Функция для генерации случайного имени
const generateRandomNames = () => {
  const randomNameIndex1 = Math.floor(Math.random() * namesData.length);
  let randomNameIndex2;

  // Генерация имени для первой команды
  team1Name.value = namesData[randomNameIndex1];

  // Генерация имени для второй команды, пока оно не станет уникальным
  do {
    randomNameIndex2 = Math.floor(Math.random() * namesData.length);
  } while (randomNameIndex2 === randomNameIndex1);

  team2Name.value = namesData[randomNameIndex2];
};


// Генерация случайных имен при загрузке компонента
onMounted(() => {
  generateRandomNames();
});

const createRoom = async () => {
  try {
    resetGame()

    const roomId = uuidv4();
    localStorage.setItem('alias_team1Name', team1Name.value);
    localStorage.setItem('alias_team2Name', team2Name.value);
    localStorage.setItem('alias_difficulty', difficulty.value); // Сохраняем значение сложности как число
    localStorage.setItem('alias_targetScore', targetScore.value);
    localStorage.setItem('alias_scoringMode', scoringMode.value); // Сохраняем режим подсчета очков
    localStorage.setItem('alias_lastWordMode', lastWordMode.value); // Сохраняем режим последнего общего слова
    localStorage.setItem('alias_RoomId', roomId);
    
   
    // Перенаправление на компонент с игрой
    router.push({ name: 'AliasRoom', params: { roomId: roomId } });
  } catch (error) {
    console.error('Ошибка при создании комнаты:', error);
    errorMessage.value = "Произошла ошибка при создании комнаты. Пожалуйста, попробуйте снова.";
  }
};

const resetGame = () => {
  // Очищаем все данные в localStorage
  localStorage.removeItem('alias_team1Name');
  localStorage.removeItem('alias_team2Name');
  localStorage.removeItem('alias_difficulty');
  localStorage.removeItem('alias_targetScore');
  localStorage.removeItem('alias_scoringMode');
  localStorage.removeItem('alias_lastWordMode');
  localStorage.removeItem('alias_RoomId');
  localStorage.removeItem('alias_currentWord');
  localStorage.removeItem('alias_timer');
  // localStorage.removeItem('alias_usedWords');
  localStorage.removeItem('alias_wordResults');
  localStorage.removeItem('alias_team1Score');
  localStorage.removeItem('alias_team2Score');
  localStorage.removeItem('alias_currentTeam');

  // Перезагружаем страницу
  // window.location.reload();
};
</script>

<style scoped>
.error-message {
  color: red;
  margin-top: 10px;
}

.checkbox-custom {
  display: none;
}

.checkbox-custom + .checkbox-label {
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 2px solid #4CAF50;
  border-radius: 4px;
  background-color: white;
  cursor: pointer;
  vertical-align: middle;
  position: relative;
}

.checkbox-custom:checked + .checkbox-label::after {
  content: '';
  position: absolute;
  width: 12px;
  height: 12px;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: #4CAF50;
  border-radius: 2px;
}

.reset-button {
  margin-top: 10px;
  background-color: #FF5733; /* Оранжевый цвет для кнопки */
}
</style>
