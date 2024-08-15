/* eslint-disable */

<template>
<GameLayout :nameGame="`Alias игра до: ${targetScore} очков`">
  <div class="gameContainer">
    <audio ref="gameAudio" :src="audioFile"></audio>

      <div class="teamNames">
        <div :class="team1Class">
          {{ team1Name }}: {{ teamScores.team1 }} 
        </div>
        <div :class="team2Class">
          {{ team2Name }}: {{ teamScores.team2 }} 
        </div>
      </div>

      <div class="gameActions">
        <!-- <p>Игра до: {{ targetScore }} очков</p> -->
        <div v-if="!isGameRunning" @click="startGame" class="startButton">Начать</div>
        <div v-else>
          <div v-if="!showFinalResults && !showResultModal" class="scoreContainer">
            <button @click="handleScoreAction(true)" class="btn-choice top-btn">+</button>
            <p class="currentWord">{{ currentWord }}</p>
            <button @click="handleScoreAction(false)" class="btn-choice bottom-btn">-</button>
          </div>
        </div>

      </div>
      <div v-if="timer > 0" class="timer">{{ timer }} сек</div>
      <div v-else-if="showResultModal" class="results">
        <div class="modal">
          <p>Выберите команду для добавления очка:</p>
          <button @click="addPointToTeam('team1')" class="btn-team">{{ team1Name }}</button>
          <button @click="addPointToTeam('team2')" class="btn-team">{{ team2Name }}</button>
        </div>
      </div>
      <div v-else-if="showFinalResults" class="results">

       
        <p >
          <u>Результат за раунд</u>: 
          <strong>
          <span v-if="roundScore > 0">+{{ roundScore }}</span>
          <span v-else-if="roundScore < 0">{{ roundScore }}</span>
          <span v-else>0 очков</span>
        </strong>

        </p>

  <div class="wordList">
    <ul class="result_ul">
  <!-- Убедитесь, что команда не отображается для последнего слова, если lastWordMode выключен -->
  <li class="result_row" v-for="(word, index) in currentRoundWords" :key="word">
    <div>{{ word }}</div>
    <div>
      {{ wordResults[word] }}
      <span v-if="index === currentRoundWords.length - 1 && wordResults[word] === '+' && lastWordMode">
  ({{ wordResultsDetails[word] }})
</span>

    </div>
  </li>



</ul>

  </div>

 

  <button @click="endTurn" class="btn-grad">Продолжить</button>
</div>

      <div v-if="showWinnerModal" class="modal">
        <p>{{ winnerName }} победила!</p>
        <button @click="resetGame" class="btn-team">Начать заново</button>
        <button @click="exitGame" class="btn-team">Выйти</button>
      </div>
    </div>
  </GameLayout>
</template>

<script setup>
import { ref, onMounted, reactive, computed } from 'vue';
import { useRoute } from 'vue-router';
import wordsData from '@/views/Alias/alias_worlds_ru.json'; // JSON с словами для игры
import GameLayout from '../GameLayout.vue';

import audioFile from '@/assets/sound/60sec.mp3';


const gameAudio = ref(null); // Привязка аудио элемента


const route = useRoute();
const team1Name = ref(localStorage.getItem('alias_team1Name') || 'Команда 1');
const team2Name = ref(localStorage.getItem('alias_team2Name') || 'Команда 2');
const difficulty = ref(localStorage.getItem('alias_difficulty') || 1);
const targetScore = ref(localStorage.getItem('alias_targetScore') || 10);
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


const last_move = ref(false)
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
  let words = wordsData[difficulty.value];

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
      // Добавляем очки только текущей команде
      teamScores.value[currentTeam.value]++;
      wordResultsDetails[currentWord.value] = currentTeam.value === 'team1' ? team1Name.value : team2Name.value;
    } else if (scoringMode.value === 'strict') {
      // Вычитание очков также для текущей команды
      teamScores.value[currentTeam.value]--;
      wordResultsDetails[currentWord.value] = currentTeam.value === 'team1' ? team1Name.value : team2Name.value;
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
      // isGameRunning.value = false;
      // showFinalResults.value = true;
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
    winnerName.value = 'Ничья';
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
  showWinnerModal.value = false;
  isGameRunning.value = false;
  currentTeam.value = 'team1';
  timer.value = time_cur;
  startGame();
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

onMounted(() => {
  if (route.params.idRoom !== localStorage.getItem('alias_RoomId')) {
    console.log('Комната не найдена!');
  } else {
    // Проверяем, если есть текущее слово, значит игра была начата ранее, иначе показываем кнопку "Начать"
    if (localStorage.getItem('alias_currentWord')) {
      startGame();
    } else {
      isGameRunning.value = false; // Показываем кнопку "Начать"
    }
  }
});







console.log('Результаты слов:', wordResults.value);
console.log('Детали результатов слов:', wordResultsDetails.value);
console.log('Текущая команда:', currentTeam.value);
console.log('Результат раунда:', roundScore.value);


</script>

<style scoped>
.gameContainer {
  font-size: x-large;
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
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
}

.gameActions {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.startButton, .btn-grad {
  background-color: #4CAF50;
  color: white;
  padding: 15px 32px;
  text-align: center;
  font-size: 16px;
  margin-top: 20px;
  cursor: pointer;
  border: none;
  border-radius: 10px;
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
  box-shadow: 0px 0px 15px rgba(0, 0, 0, 0.5);
  z-index: 1000;
  color: black!important;
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

.teamName {
  font-size: 1.5em;
  padding: 10px;
  border: 2px solid transparent;
  border-radius: 10px;
}

.activeTeam {
  border-color:.5px black;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
  /* font-weight: bold; */
}

.result_row {
  display: flex;
  width: 250px;
  justify-content: space-between;
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
  font-size: 3em; /* Увеличиваем размер текста кнопок */
  width: 100px;
  height: 100px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid;
  margin: 10px 0;
  background-color: transparent;
}

.currentWord {
  font-size: 2em; /* Увеличиваем размер слова */
  margin: 20px 0;
  text-align: center;
}


.scoreButtons {
  display: flex;
  justify-content: space-around;
  width: 50%;
  margin-top: 20px;
  color: black;
  font-size: xx-large;
}


</style>
