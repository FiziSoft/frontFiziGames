<template>
  <GameLayout nameGame="Alias">
    <div class="containerFormCreate">
      <form class="formCreate">
        <div v-if="showContinueGameDialog" class="modal-overlay">
        <div class="modal">
          <p>Хотите продолжить незавершённую игру?</p>
          <button @click="continueExistingGame" class="btn-grad">Да</button>
          <button @click="startNewGame" class="btn-grad">Нет</button>
        </div>
      </div>
        <div class="formElement">
          <label for="team1Name">Команда:</label>
          <input v-model="team1Name" type="text" id="team1Name" class="input-gradient">
        </div>
        <div class="formElement">
          <label for="team2Name">Команда:</label>
          <input v-model="team2Name" type="text" id="team2Name" class="input-gradient">
        </div>
        <div class="formElement">
          <label for="difficulty">Сложность игры: <br>
            <p class="difficulty-info">({{ getCategoryExample(difficulty.value) }})</p>
          </label>
          <select v-model="difficulty" id="difficulty" class="input-gradient">
            <option v-for="(label, value) in difficultyOptions" :key="value" :value="value">{{ label }}</option>
          </select>
        </div>
        <div class="formElement">
          <label for="scoringModeElement" id="scoringModeElement">
            Штраф за пропуск:
            <TooltipModal 
              text="<strong>Строго</strong> — отнимать балл при выборе минус. <br/><strong>Просто</strong> — пропускать слово при выборе минус."
              targetId="scoringModeElement" 
            />
          </label>
          <input v-model="scoringModeCheckbox" type="checkbox" id="scoringModeCheckbox" class="checkbox-custom">
          <label for="scoringModeCheckbox" class="checkbox-label"></label>
        </div>
        <div class="formElement">
          <label for="lastWordMode">Последнее слово, общее?</label>
          <input v-model="lastWordMode" type="checkbox" id="lastWordMode" class="checkbox-custom">
          <label for="lastWordMode" class="checkbox-label"></label>
        </div>
        <div class="btnDiv">
          <button :disabled="!isButtonActive" type="button" @click="createRoom" class="btn-grad">Создать комнату</button>
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
import wordsData from '@/views/Alias/alias_worlds_ru.json'; // JSON с словами для игры
import TooltipModal from '@/components/TooltipModal.vue';

const router = useRouter();
const team1Name = ref('');
const team2Name = ref('');
const difficulty = ref(1); // По умолчанию Легкая (1)
const targetScore = ref(50);
const errorMessage = ref('');
const scoringModeCheckbox = ref(false); // Используем чекбокс вместо выбора режима
const lastWordMode = ref(false); // По умолчанию выключено

const difficultyOptions = ref({
  1: 'Легкая',
  2: 'Средняя',
  3: 'Трудная',
  4: 'Смешанная'
});

const categoryExamples = computed(() => {
  if (!wordsData[difficulty.value]) return '';
  
  const words = wordsData[difficulty.value];
  const shuffledWords = words.sort(() => 0.5 - Math.random()); // Перемешиваем массив случайным образом
  return shuffledWords.slice(0, 3).join(', '); // Берем первые три элемента из перемешанного массива
});

const getCategoryExample = (difficulty) => {
  return categoryExamples.value || '';
};

const isButtonActive = computed(() => {
  return team1Name.value.trim().length > 0 && team2Name.value.trim().length > 0 && targetScore.value;
});


// Генерация случайного имени
const generateRandomNames = () => {
  const randomNameIndex1 = Math.floor(Math.random() * namesData.length);
  let randomNameIndex2;

  team1Name.value = namesData[randomNameIndex1];

  do {
    randomNameIndex2 = Math.floor(Math.random() * namesData.length);
  } while (randomNameIndex2 === randomNameIndex1);

  team2Name.value = namesData[randomNameIndex2];
};

const showContinueGameDialog = ref(false);

const showContinueGameModal = () => {
  showContinueGameDialog.value = true;
};

const continueExistingGame = () => {
  const roomId = localStorage.getItem('alias_RoomId');
  router.push({ name: 'AliasRoom', params: { roomId: roomId } });
};

const startNewGame = () => {
  showContinueGameDialog.value = false;
  resetGame(); // Удалить предыдущую игру
};



// Генерация случайных имен при загрузке компонента
onMounted(() => {
  checkForExistingGame();

  generateRandomNames();
});

const checkForExistingGame = () => {
  const existingGame = localStorage.getItem('alias_currentWord');
  if (existingGame) {
    showContinueGameModal();
  }
};
const maxTeamNameLength = 10;
const maxTargetScore = 100;

const validateInput = () => {
  if (team1Name.value.length > maxTeamNameLength) {
    errorMessage.value = `Название команды 1 не может быть длиннее ${maxTeamNameLength} символов.`;
    return false;
  }
  if (team2Name.value.length > maxTeamNameLength) {
    errorMessage.value = `Название команды 2 не может быть длиннее ${maxTeamNameLength} символов.`;
    return false;
  }
  if (targetScore.value > maxTargetScore) {
    errorMessage.value = `Целевой счет не может превышать ${maxTargetScore} очков.`;
    return false;
  }
  return true;
};

const createRoom = async () => {
  if (!validateInput()) return;
  
  try {
    resetGame();

    const roomId = uuidv4();
    localStorage.setItem('alias_team1Name', team1Name.value);
    localStorage.setItem('alias_team2Name', team2Name.value);
    localStorage.setItem('alias_difficulty', difficulty.value);
    localStorage.setItem('alias_targetScore', targetScore.value);
    localStorage.setItem('alias_scoringMode', scoringModeCheckbox.value ? 'strict' : 'simple');
    localStorage.setItem('alias_lastWordMode', lastWordMode.value);
    localStorage.setItem('alias_RoomId', roomId);

    router.push({ name: 'AliasRoom', params: { roomId: roomId } });
  } catch (error) {
    console.error('Ошибка при создании комнаты:', error);
    errorMessage.value = "Произошла ошибка при создании комнаты. Пожалуйста, попробуйте снова.";
  }
};

const resetGame = () => {
  localStorage.clear();
};
</script>

<style scoped>

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  top: 2%;
  width: 400px;
  height: 90%;
  background: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
  text-align: center;
}

.btn-grad {
  margin: 10px;
  padding: 10px 20px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 10px;
  cursor: pointer;
}

.error-message {
  color: red;
  margin-top: 10px;
}

.checkbox-custom {
  display: none;
}

.checkbox-custom + .checkbox-label {
  display: inline-block;
  width: 30px;
  height: 30px;
  border: 2px solid #238a59;
  border-radius: 4px;
  background-color: white;
  cursor: pointer;
  vertical-align: middle;
  position: relative;
  margin-right: 30px;
}

.checkbox-custom:checked + .checkbox-label::after {
  content: '✓';
  position: absolute;
  width: 42px;
  height: 42px;
  top: -80%;
  left: 75%;
  transform: translate(-50%, -50%);
  font-size: 60px;
  color: #238a59;
}

.reset-button {
  margin-top: 10px;
  background-color: #FF5733;
}

.info-icon {
  font-weight: bold;
  cursor: pointer;
  margin-left: 5px;
  color: #7b4caf;
}

.difficulty-info {
  font-size: 0.9em;
  color: #666;
  margin-top: 5px;
}

.checkbox-custom:checked + .checkbox-label::after {
  opacity: 1;
}
</style>
