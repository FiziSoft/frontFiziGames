<template>
  <GameLayout :nameGame="t('games.alias.name')">
    <div class="containerFormCreate">
      <form class="formCreate">
        <div v-if="showContinueGameDialog" class="modal-overlay">
          <div class="modal">
            <p>{{ t('games.alias.create_room.continue_game') }}</p>
            <div style="max-width: 200px;">
              <button @click="continueExistingGame" class="btn-grad">{{ t('games.alias.create_room.yes') }}</button>
              <button @click="startNewGame" class="btn-grad">{{ t('games.alias.create_room.no') }}</button>
            </div>
          </div>
        </div>
        <div class="formElement">
          <label for="team1Name">{{ t('games.alias.create_room.team1_name') }}</label>
          <input v-model="team1Name" type="text" id="team1Name" class="input-gradient">
        </div>
        <div class="formElement">
          <label for="team2Name">{{ t('games.alias.create_room.team2_name') }}</label>
          <input v-model="team2Name" type="text" id="team2Name" class="input-gradient">
        </div>
        <div class="formElement">
          <label for="difficulty">{{ t('games.alias.create_room.difficulty') }} <br>
            <p class="difficulty-info">({{ getCategoryExample(difficulty.value) }})</p>
          </label>
          <select v-model="difficulty" id="difficulty" class="input-gradient">
            <option v-for="(label, value) in difficultyOptions" :key="value" :value="value">{{ label }}</option>
          </select>
        </div>
        <div class="formElement">
          <label for="targetScore">{{ t('games.alias.create_room.target_score') }}</label>
          <input v-model="targetScore" type="number" id="targetScore" class="input-gradient" min="1">
        </div>
        <div class="formElement" style="margin-top: 10px;">
          <label for="scoringModeElement" id="scoringModeElement">
            {{ t('games.alias.create_room.strict_mode') }}
            <TooltipModal 
              :text="t('games.alias.create_room.strict_mode_description')"
              targetId="scoringModeElement" 
            />
          </label>
          <input v-model="scoringModeCheckbox" type="checkbox" id="scoringModeCheckbox" class="checkbox-custom">
          <label for="scoringModeCheckbox" class="checkbox-label"></label>
        </div>
        <div class="formElement" style="margin-top: 20px;">
          <label for="lastWordMode">{{ t('games.alias.create_room.last_word_common') }}</label>
          <input v-model="lastWordMode" type="checkbox" id="lastWordMode" class="checkbox-custom">
          <label for="lastWordMode" class="checkbox-label"></label>
        </div>
        <div class="btnDiv">
          <button :disabled="!isButtonActive" type="button" @click="createRoom" class="btn-grad">{{ t('games.alias.create_room.create_button') }}</button>
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
import { useRouter, useRoute } from "vue-router";
import { v4 as uuidv4 } from 'uuid';
import GameLayout from "../GameLayout.vue";
import { loadWordsForGame, loadNamesForGame } from '@/wordsStorage'; // Импорт функций загрузки слов и названий
import TooltipModal from '@/components/TooltipModal.vue';

const router = useRouter();
const team1Name = ref('');
const team2Name = ref('');
const difficulty = ref(1); // По умолчанию Легкая (1)
const targetScore = ref(50); // Установка значения по умолчанию
const errorMessage = ref('');
const scoringModeCheckbox = ref(false); // Используем чекбокс вместо выбора режима
const lastWordMode = ref(false); // По умолчанию выключено

const route = useRoute();


const playerName = ref(localStorage.getItem('playerName') || '');


import { useI18n } from 'vue-i18n';
const { t, locale } = useI18n();

const difficultyOptions = computed(() => ({
  1: t('games.alias.difficulty_1'),
  2: t('games.alias.difficulty_2'),
  3: t('games.alias.difficulty_3'),
  4: t('games.alias.difficulty_4')
}));

const wordsData = ref([]);
const namesData = ref([]);

const categoryExamples = computed(() => {
  if (!wordsData.value[difficulty.value]) return '';
  
  const words = wordsData.value[difficulty.value];
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
const generateRandomNames = async () => {
  try {
    namesData.value = await loadNamesForGame(locale.value); // Загрузка названий команд

    const randomNameIndex1 = Math.floor(Math.random() * namesData.value.length);
    let randomNameIndex2;

    team1Name.value = namesData.value[randomNameIndex1];

    do {
      randomNameIndex2 = Math.floor(Math.random() * namesData.value.length);
    } while (randomNameIndex2 === randomNameIndex1);

    team2Name.value = namesData.value[randomNameIndex2];
  } catch (error) {
    console.error('Failed to load team names:', error);
  }
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
onMounted(async () => {
  if (route.query.locale) {
    locale.value = route.query.locale;
  }

  await loadWords();  // Загрузка слов
  await generateRandomNames();  // Генерация случайных названий команд

  checkForExistingGame();
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
    errorMessage.value = t('games.alias.create_room.error_too_long_team_name', { maxTeamNameLength });
    return false;
  }
  if (team2Name.value.length > maxTeamNameLength) {
    errorMessage.value = t('games.alias.create_room.error_too_long_team_name', { maxTeamNameLength });
    return false;
  }
  if (targetScore.value > maxTargetScore) {
    errorMessage.value = t('games.alias.create_room.error_too_high_score', { maxTargetScore });
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
    try{
      axios.post(url_stat, {
        game_id: 34,
        room_number: roomId,
        creator_name: playerName.value,
        language: locale.value,
        player_count: 0,
        is_local: true,
            
      });
    }
    catch(error){
      console.log("not stat")

    }
    

    router.push({ name: 'AliasRoom', params: { roomId: roomId }, query: { locale: locale.value } });
  } catch (error) {
    console.error('Ошибка при создании комнаты:', error);
    errorMessage.value = t('games.alias.create_room.error_general');
  }
};


import axios from 'axios';

import { url_stat } from "@/link";


const resetGame = () => {


    

  Object.keys(localStorage).forEach(key => {
    if (key.startsWith('alias_')) {
      localStorage.removeItem(key);
    }
  });
};

// Загрузка слов для игры
const loadWords = async () => {
  try {
    wordsData.value = await loadWordsForGame(locale.value);  // Загрузка слов
  } catch (error) {
    console.error('Failed to load words:', error);
  }
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
  display: flex;
  flex-direction: column;
  top: 25%;
  left: 18%;
  max-width: 64%;
  height: 50%;
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
  text-align: center;
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
