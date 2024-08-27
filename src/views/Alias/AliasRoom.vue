<template>
  <GameLayout :nameGame="`${t('games.alias.game_room.title', { targetScore: targetScore })}`">
    <div class="gameContainer">
      <audio ref="gameAudio" :src="audioFile"></audio>
      <audio ref="plusButtonSound" :src="plusSound"></audio> <!-- Аудио для кнопки "+" -->
      <audio ref="minusButtonSound" :src="minusSound"></audio> <!-- Аудио для кнопки "-" -->

      <div class="teamNames">
        <div :class="team1Class">
          {{ team1Name }} <br> {{ teamScores.team1 }}
        </div>
        <div :class="team2Class">
          {{ team2Name }} <br> {{ teamScores.team2 }}
        </div>
      </div>

      <div class="gameActions">
        <div v-if="!isGameRunning" @click="startGame" class="startButton">{{ t('games.alias.game_room.start_button') }}</div>
        <div v-else>
          <div v-if="!showFinalResults && !showResultModal" class="scoreContainer">
            <button @click="handleScoreAction(true)" class="btn-choice top-btn">{{ t('games.alias.game_room.score_action.plus') }}</button>
            <p class="currentWord">{{ currentWord }}</p>
            <button @click="handleScoreAction(false)" class="btn-choice bottom-btn">{{ t('games.alias.game_room.score_action.minus') }}</button>
          </div>
        </div>
      </div>
      <div v-if="timer > 0 && isGameRunning" class="timer">{{ t('games.alias.game_room.timer', { timer }) }}</div>
      <div v-else-if="showResultModal" class="results">
        <div class="modal">
          <p>{{ t('games.alias.game_room.choose_team') }}</p>
          <button @click="addPointToTeam('team1')" class="btn-team">{{ team1Name }}</button>
          <button @click="addPointToTeam('team2')" class="btn-team">{{ team2Name }}</button>
        </div>
      </div>
      <div v-else-if="showFinalResults" class="results">
        <div class="result_round">
          <p>{{ t('games.alias.game_room.round_result.title') }}
            <strong>
              <span v-if="roundScore > 0">{{ t('games.alias.game_room.round_result.score.positive', { score: roundScore }) }}</span>
              <span v-else-if="roundScore < 0">{{ t('games.alias.game_room.round_result.score.negative', { score: roundScore }) }}</span>
              <span v-else>{{ t('games.alias.game_room.round_result.score.neutral') }}</span>
            </strong>
          </p>
        </div>
        <div class="wordList">
          <ul class="result_ul">
            <li class="result_row" v-for="(word, index) in currentRoundWords" :key="word">
              <div>{{ word }}</div>
              <div style="display: flex; margin-left: 15px;">
                {{ wordResults[word] }}
                <p style="margin-left: 5px;" v-if="index === currentRoundWords.length - 1 && wordResults[word] === '+' && lastWordMode">
                  ({{ wordResultsDetails[word] }})
                </p>
              </div>
            </li>
          </ul>
        </div>
        <button @click="endTurn" ref="continueButton" class="btn-grad">{{ t('games.alias.game_room.end_turn') }}</button>
      </div>

      <div v-if="showWinnerModal" class="modal">
        <p>{{ t('games.alias.game_room.final_results.winner_message', { winnerName }) }}</p>
        <button @click="resetGame" class="btn-team">{{ t('games.alias.game_room.final_results.reset_button') }}</button>
        <button @click="exitGame" class="btn-team">{{ t('games.alias.game_room.final_results.exit_button') }}</button>
      </div>
    </div>
  </GameLayout>
</template>

<script setup>
import { ref, onMounted, reactive, computed, watch, nextTick } from 'vue';
import { useRoute } from 'vue-router';
import GameLayout from '../GameLayout.vue';
import { loadWordsForGame } from '@/wordsStorage'; // Подключаем функцию работы с IndexedDB
import audioFile from '@/assets/sound/60sec.mp3';
import plusSound from '@/assets/sound/plus_click.mp3'; // Импорт звука для кнопки "+"
import minusSound from '@/assets/sound/miss_sound.mp3'; // Импорт звука для кнопки "-"

const gameAudio = ref(null); // Привязка аудио элемента
const plusButtonSound = ref(null); // Привязка для звука кнопки "+"
const minusButtonSound = ref(null); // Привязка для звука кнопки "-"
const continueButton = ref(null);


const scrollToContinueButton = async () => {
  await nextTick();  // Убедиться, что DOM обновлён
  const button = continueButton.value;
  if (button) {
    button.scrollIntoView({ behavior: 'smooth' });
  }
};

// Функция для воспроизведения звука кнопки "+"
const playPlusSound = () => {
  const audioElement = plusButtonSound.value;
  if (audioElement) {
    audioElement.play();
  }
};

// Функция для воспроизведения звука кнопки "-"
const playMinusSound = () => {
  const audioElement = minusButtonSound.value;
  if (audioElement) {
    audioElement.play();
  }
};

const route = useRoute();
const team1Name = ref(localStorage.getItem('alias_team1Name') || t('games.alias.default_team1_name'));
const team2Name = ref(localStorage.getItem('alias_team2Name') || t('games.alias.default_team2_name'));
const difficulty = ref(localStorage.getItem('alias_difficulty') || 1);
const targetScore = ref(localStorage.getItem('alias_targetScore') || 50);
const scoringMode = ref(localStorage.getItem('alias_scoringMode') || 'strict'); // 'strict' или 'simple'
const lastWordMode = ref(localStorage.getItem('alias_lastWordMode') === 'true'); // Опция "последнее общее слово"
const time_cur = 60;
const timer = ref(Number(localStorage.getItem('alias_timer')) || time_cur);
const currentWord = ref(localStorage.getItem('alias_currentWord') || '');
const isGameRunning = ref(false);
const showResultModal = ref(false);
const showFinalResults = ref(false);
const showWinnerModal = ref(false);
const winnerName = ref('');
const teamScores = ref({
  team1: Number(localStorage.getItem('alias_team1Score')) || 0,
  team2: Number(localStorage.getItem('alias_team2Score')) || 0
});
const currentTeam = ref(localStorage.getItem('alias_currentTeam') || 'team1');
const usedWords = ref(new Set(JSON.parse(localStorage.getItem('alias_usedWords') || '[]')));

const currentRoundWords = reactive([]);
const wordResults = reactive({});
const wordResultsDetails = reactive({}); // Хранит информацию о том, какой команде был отдан балл

let wordsData = ref([]); // Список слов для игры

import { useI18n } from 'vue-i18n';
const { locale, t } = useI18n();

if (route.params.locale) {
  locale.value = route.params.locale;
}
// Получение языка из localStorage или установка 'ua' по умолчанию
const savedLocale = localStorage.getItem('language') || 'ua';
locale.value = savedLocale;

const last_move = ref(false);
let interval;

const roundScore = computed(() => {
  let score = 0;

  currentRoundWords.forEach((word, index) => {
    // Для всех слов, кроме последнего, считаем как обычно
    if (index !== currentRoundWords.length - 1) {
      if (wordResults[word] === '+') {
        score++;
      } else if (wordResults[word] === '-' && scoringMode.value === 'strict') {
        score--;
      }
    } else {
      // Для последнего слова
      if (wordResults[word] === '+') {
        // Если слово не является последним общим или оно является последним общим, но плюс ставится текущей командой
        if (!lastWordMode.value || (lastWordMode.value && wordResultsDetails[word] === currentTeam.value)) {
          score++;
        }
      }
    }
  });

  return score;
});

const team1Class = computed(() => {
  return currentTeam.value === 'team1' ? 'teamName activeTeam' : 'teamName';
});

const team2Class = computed(() => {
  return currentTeam.value === 'team2' ? 'teamName activeTeam' : 'teamName';
});

const startGame = () => {
  const audioElement = gameAudio.value;
  if (audioElement) {
    audioElement.play(); // Запуск аудио
  }
  isGameRunning.value = true;

  currentRoundWords.splice(0, currentRoundWords.length);
  for (const key in wordResults) {
    delete wordResults[key];
    delete wordResultsDetails[key];
  }

  nextWord();

  interval = setInterval(() => {
    if (timer.value > 0) {
      timer.value--;
      localStorage.setItem('alias_timer', timer.value);
    } else {
      clearInterval(interval);
      if (lastWordMode.value) {
        // showResultModal.value = true;
      } else {
        finalizeRound();
      }
    }
  }, 1000);
};

const nextWord = () => {
  let words = wordsData.value[difficulty.value];

  // Проверяем, существуют ли слова для текущего уровня сложности
  if (!words || words.length === 0) {
    console.error('No words available for the current difficulty level:', difficulty.value);
    return;
  }

  if (usedWords.value.size >= words.length - 10) {
    usedWords.value.clear();
    localStorage.removeItem('alias_usedWords');
    console.log('Все слова использованы, начинаем заново.');
  }

  let randomIndex;
  let word;

  do {
    randomIndex = Math.floor(Math.random() * words.length);
    word = words[randomIndex];
  } while (usedWords.value.has(word));

  usedWords.value.add(word);
  currentWord.value = word;
  localStorage.setItem('alias_currentWord', currentWord.value);
  localStorage.setItem('alias_usedWords', JSON.stringify([...usedWords.value]));
};

const handleScoreAction = (isPlus) => {
  if (timer.value > 0) {
    if (isPlus) {
      playPlusSound(); // Воспроизведение звука при нажатии "+"
      // Добавляем очки только текущей команде
      teamScores.value[currentTeam.value]++;
      wordResultsDetails[currentWord.value] = currentTeam.value === 'team1' ? team1Name.value : team2Name.value;
    } else if (scoringMode.value === 'strict') {
      playMinusSound(); // Воспроизведение звука при нажатии "-"
      // Вычитание очков также для текущей команды
      teamScores.value[currentTeam.value]--;
      wordResultsDetails[currentWord.value] = currentTeam.value === 'team1' ? team1Name.value : team2Name.value;
    } else {
      playMinusSound(); // Воспроизведение звука при нажатии "-"
    }

    wordResults[currentWord.value] = isPlus ? '+' : '-';
    currentRoundWords.push(currentWord.value);

    localStorage.setItem('alias_wordResults', JSON.stringify(wordResults));
    localStorage.setItem(`alias_${currentTeam.value}Score`, teamScores.value[currentTeam.value]);

    nextWord();
  } else {
    handleLastWordAction(isPlus);
  }
};

const handleLastWordAction = (isPlus) => {
  // Если включен режим последнего общего слова
  if (lastWordMode.value) {
    wordResults[currentWord.value] = isPlus ? '+' : '-';
    currentRoundWords.push(currentWord.value);

    localStorage.setItem('alias_wordResults', JSON.stringify(wordResults));

    if (isPlus) {
      showResultModal.value = true; // Показать модальное окно для выбора команды
    } else {
      finalizeRound();
    }
  } else {
    // Если режим общего последнего слова выключен, просто добавляем очко текущей команде
    if (isPlus) {
      teamScores.value[currentTeam.value]++;
      localStorage.setItem(`alias_${currentTeam.value}Score`, teamScores.value[currentTeam.value]);
    }
    finalizeRound();
  }
};

const addPointToTeam = (team) => {
  teamScores.value[team]++;
  localStorage.setItem(`alias_${team}Score`, teamScores.value[team]);

  // Добавляем информацию о команде, которой отдан балл, для отображения в результатах
  wordResultsDetails[currentWord.value] = team === 'team1' ? team1Name.value : team2Name.value;

  showResultModal.value = false;
  finalizeRound();
};

const finalizeRound = () => {
  if (!showResultModal.value) {
    showFinalResults.value = true;
    checkForWin();
  }
};

const checkForWin = () => {
  if (teamScores.value.team2 >= targetScore.value && teamScores.value.team1 <= targetScore.value) {
    endGame('team2');
  }

  if (teamScores.value.team2 <= targetScore.value && last_move.value === true) {
    last_move.value = false;
    endGame('team1');
  }

  if (teamScores.value.team1 >= targetScore.value && currentTeam.value === 'team1') {
    if (teamScores.value.team2 >= targetScore.value) {
      endGame('draw');
    } else {
      last_move.value = true;
    }
  } else if (teamScores.value.team2 >= targetScore.value && teamScores.value.team1 >= targetScore.value) {
    if (teamScores.value.team1 >= targetScore.value) {
      endGame('draw');
    } else {
      endGame('team2');
    }
  }
};

const endGame = (winnerTeam) => {
  clearInterval(interval);

  if (winnerTeam === 'draw') {
    winnerName.value = t('games.alias.game_room.final_results.draw');
  } else {
    winnerName.value = winnerTeam === 'team1' ? team1Name.value : team2Name.value;
  }

  showWinnerModal.value = true;

  teamScores.value.team1 = 0;
  teamScores.value.team2 = 0;
  localStorage.removeItem('alias_team1Score');
  localStorage.removeItem('alias_team2Score');
  localStorage.removeItem('alias_currentWord');
  localStorage.removeItem('alias_timer');
  localStorage.removeItem('alias_wordResults');
};

const resetGame = () => {
  // Скрыть модальное окно победителя и результаты
  showWinnerModal.value = false;
  showFinalResults.value = false;

  // Сбросить состояние игры
  isGameRunning.value = false;

  // Сбросить текущую команду и таймер
  currentTeam.value = 'team1';
  timer.value = time_cur;

  // Очистить текущее слово и результаты текущего раунда
  currentWord.value = '';
  currentRoundWords.splice(0, currentRoundWords.length);

  // Очистить результаты слов и детали результатов
  for (const key in wordResults) {
    delete wordResults[key];
    delete wordResultsDetails[key];
  }

  // Убедиться, что после сброса отображается кнопка "Начать"
};

const exitGame = () => {
  showWinnerModal.value = false;
  // Логика для выхода из игры или возврата на главный экран
};

const endTurn = () => {
  clearInterval(interval);
  currentTeam.value = currentTeam.value === 'team1' ? 'team2' : 'team1';
  localStorage.setItem('alias_currentTeam', currentTeam.value);
  timer.value = time_cur;
  localStorage.setItem('alias_timer', timer.value);
  isGameRunning.value = false;
  showFinalResults.value = false;
};

onMounted(async () => {
  try {
    const allWordsData = await loadWordsForGame(locale.value);
    wordsData.value = allWordsData;

    if (route.params.idRoom !== localStorage.getItem('alias_RoomId')) {
      console.log('Комната не найдена!');
    } else {
      if (localStorage.getItem('alias_currentWord')) {
        await startGame();
      } else {
        isGameRunning.value = false; // Показываем кнопку "Начать"
      }
    }
  } catch (error) {
    console.error('Failed to load words for the game:', error);
  }
});

watch(showFinalResults, (newVal) => {
  if (newVal) {
    scrollToContinueButton();
  }
});

</script>

<style scoped>
.gameContainer {
  max-width: 800px;
  margin: 0 auto;
  font-size: large;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-bottom: 50px;
}

.teamNames {
  display: flex;
  justify-content: space-between;
  width: 100%;
}

.teamName {
  font-size: 1.3em;
  padding: 10px;
  border: 2px solid transparent;
  border-radius: 10px;
}

.highlighted {
  font-weight: bold;
  color: #4CAF50;
}

.activeTeam {
  border-color: black;
  box-shadow: 0 0 10px var(--box-shadow-color);
}

.gameActions {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.startButton {
  display: inline-block;
  width: 150px;
  height: 150px;
  font-size: 24px;
  border-radius: 50%;
  background-color: SeaGreen;
  color: white;
  cursor: pointer;
  margin-top: 20px;
  box-shadow: 1px 7px 18px var(--box-shadow-big-color);
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
  border: .5px solid var(--border-color);
  padding-top: 59px;
}

.timer {
  font-size: 2em;
  margin-top: 20px;
}

.results {
  margin-top: 20px;
  text-align: center;
}

.wordList {
  margin-top: 10px;
  text-align: left;
}

.wordList ul {
  list-style-type: none;
  padding: 0;
}

.wordList li {
  margin: 5px 0;
}

.modal {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0px 4px 8px var(--box-shadow-big-color);
  z-index: 1000;
  color: black !important;
}

.btn-team {
  margin: 10px;
  padding: 10px 20px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 10px;
  cursor: pointer;
}

.activeTeam {
  border: .5px solid var(--border-color);
  box-shadow: 0px 4px 8px var(--box-shadow-big-color);
}

.result_row {
  display: flex;
  width: 200px;
  justify-content: space-around;
}

.result_ul {
  font-size: x-large;
  display: flex;
  flex-direction: column;
  justify-items: center;
  align-items: center;
}

.scoreContainer {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.btn-choice {
  font-size: 3em;
  width: 100px;
  height: 100px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border:0.5px solid var(--border-color);
  margin: 10px 0;
  background-color: transparent;
  box-shadow: 0px 5px 15px 0px var(--box-shadow-big-color);
}

.currentWord {
  font-size: 2rem;
  position: relative;
  text-shadow: 2px 2px 0 #1b221b, 4px 4px 0 #080908, 6px 6px 0 #0a0a0a blur(4px);
  border-radius: 50px;
  margin: 15px 0;
}

.currentWord::before {
  content: "завод";
  position: absolute;
  top: 0;
  left: 0;
  color: #070a07;
  text-shadow: none;
  z-index: -1;
  transform: translate(8px, 8px);
  filter: blur(4px);
}

.result_round {
  border: 0.2px solid;
  padding: 10px;
  border-radius: 12px;
}
</style>
