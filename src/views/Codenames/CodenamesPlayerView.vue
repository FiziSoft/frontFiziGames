<template>
  <GameLayout :nameGame="$t('games.codenames.name')">
    <div class="containerCodenames">
      <!-- Анимация загрузки -->
      <div v-if="!wordsLoaded" class="loading-spinner">
        <div class="spinner"></div>
      </div>

      <!-- Основное содержимое -->
      <div v-else>
        <div class="progress">
          <div class="team">
            <span class="team-name">{{ $t('games.codenames.teams.blue') }} ({{ bluePlayersCount }}): </span>
            <span class="team-progress">{{ blueRevealedCount }} / {{ blueTotal }}</span>
          </div>
          <div class="team">
            <span class="team-name">{{ $t('games.codenames.teams.red') }} ({{ redPlayersCount }}): </span>
            <span class="team-progress">{{ redRevealedCount }} / {{ redTotal }}</span>
          </div>
          <br>
          <div class="current-team">
            <span>{{ $t('games.codenames.teams.your_team') }}: {{ userTeam }}</span>
            <button class="reload_team" @click="changeTeam"><i class="fa-solid fa-retweet"></i></button>
          </div>
        </div>
        <div :class="`grid grid-${words.length}`">
          <div
            v-for="word in words"
            :key="word"
            class="word"
            :class="{ 
              revealed: !!revealedWords[word], 
              red: revealedWords[word] === 'red', 
              blue: revealedWords[word] === 'blue', 
              neutral: revealedWords[word] === 'neutral', 
              bomb: revealedWords[word] === 'bomb' 
            }"
            @click="confirmRevealWord(word)"
          >
            {{ word }}
          </div>
        </div>
        <div class="share_button">
          <ShareButton :url="url_share" :text="$t('games.codenames.play_codenames')"></ShareButton>
        </div>
      </div>

    </div>
    
    <!-- Модальное окно для отображения победителя -->
    <div v-if="showWinnerModal" class="modal-unique">
      <div class="modal-content-unique">
        <p>{{ winnerMessage }}</p>
        <button @click="closeWinnerModal">{{ $t('close') }}</button>
      </div>
    </div>

    <!-- Модальное окно для выбора команды -->
    <div v-if="showTeamSelectionModal" class="modal-unique">
      <div class="modal-content-unique">
        <p>{{ $t('games.codenames.choose_team') }}</p>
        <button class="my_button" @click="selectTeam('red')">{{ $t('games.codenames.teams.red') }}</button>
        <button class="my_button" @click="selectTeam('blue')">{{ $t('games.codenames.teams.blue') }}</button>
      </div>
    </div>

    <!-- Модальное окно для подтверждения выбора слова -->
    <div v-if="showConfirmRevealModal" class="modal-unique">
      <div class="modal-content-unique">
        <p>{{ $t('games.codenames.confirm_reveal') }}</p>
        <button class="my_button" @click="revealWord(selectedWord)">{{ $t('yes') }}</button>
        <button class="my_button" @click="closeConfirmRevealModal">{{ $t('no') }}</button>
      </div>
    </div>
  </GameLayout>
</template>

<script setup>
// eslint-disable-next-line
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import GameLayout from '../GameLayout.vue';
import ShareButton from '@/components/ShareButton.vue';
import { v4 as uuidv4 } from 'uuid';

const { t, locale } = useI18n();

const route = useRoute();
const router = useRouter();
const gameId = ref(route.params.gameId);
const words = ref([]);
const revealedWords = ref({});
const board = ref({});
let socket;
const url_share = `https://fizi.cc/codenames/player-view/${gameId.value}`;


import bombSound from '@/assets/sound/sunk_sound.mp3';
import revealSound from '@/assets/sound/plus_click.mp3'; // Импорт звука для кнопки "-"
import missSound from '@/assets/sound/hit_sound.mp3';
import neutralSound from '@/assets/sound/plus_click1.mp3';



// Вычисляемое свойство для подсчета угаданных слов
const redRevealedCount = computed(() => Object.values(revealedWords.value).filter(role => role === 'red').length);
const blueRevealedCount = computed(() => Object.values(revealedWords.value).filter(role => role === 'blue').length);

// Общее количество слов для каждой команды
const redTotal = ref(0);
const blueTotal = ref(0);

// Количество игроков в каждой команде
const redPlayersCount = ref(0);
const bluePlayersCount = ref(0);

// Состояние модального окна победителя
const showWinnerModal = ref(false);
const winnerMessage = ref('');

// Состояние для отслеживания загрузки слов
const wordsLoaded = ref(false);

// Состояние для выбора команды
const showTeamSelectionModal = ref(!localStorage.getItem('userTeam'));

// Состояние для подтверждения выбора слова
const showConfirmRevealModal = ref(false);
const selectedWord = ref('');

// Состояние команды пользователя
const userTeam = ref(localStorage.getItem('userTeam') || '');

// Уникальный идентификатор игрока
const playerId = ref(localStorage.getItem('playerId') || uuidv4());
localStorage.setItem('playerId', playerId.value);

const connectWebSocket = () => {
  const wsUrl = `wss://codenames-72ce2135032c.herokuapp.com/ws/${gameId.value}`;
  console.log(`Connecting to WebSocket at ${wsUrl}`);
  try {
    socket = new WebSocket(wsUrl);

    socket.onopen = () => {
      console.log('WebSocket connection established');
      socket.send(JSON.stringify({ type: "joinGame", playerId: playerId.value }));

      // Если игрок уже выбирал команду, сообщаем серверу
      if (userTeam.value) {
        socket.send(JSON.stringify({ type: "selectTeam", team: userTeam.value, playerId: playerId.value }));
      }
    };

    socket.onmessage = (event) => {
      console.log('Received message:', event.data);
      const message = JSON.parse(event.data);
      if (message.type === "reveal") {
        revealedWords.value[message.word] = message.role;
        checkForWinner(message.word, message.revealingPlayerTeam);
      } else if (message.type === "initialize") {
        words.value = message.words;
        revealedWords.value = message.revealedWords;
        board.value = message.board;

        // Подсчитываем общее количество слов для каждой команды
        redTotal.value = Object.values(message.board).filter(role => role === 'red').length;
        blueTotal.value = Object.values(message.board).filter(role => role === 'blue').length;

        // Подсчитываем количество игроков в каждой команде
        redPlayersCount.value = message.redPlayersCount;
        bluePlayersCount.value = message.bluePlayersCount;

        wordsLoaded.value = true; // Устанавливаем состояние загрузки слов

        // Устанавливаем локализацию
        locale.value = message.locale;
        localStorage.setItem('language', message.locale);
      } else if (message.type === "updateTeams") {
        redPlayersCount.value = message.redPlayersCount;
        bluePlayersCount.value = message.bluePlayersCount;
      } else if (message.type === "startGame") {
        location.reload(); // Программное обновление страницы при начале новой игры
      } else if (message.type === "winner") {
        winnerMessage.value = t('games.codenames.winner_message', { team: message.winner });
        showWinnerModal.value = true;
      }
    };

    socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    socket.onclose = (event) => {
      console.log('WebSocket connection closed:', event);
    };
  } catch (error) {
    console.error('Failed to connect to WebSocket:', error);
  }
};

const checkForWinner = (word, revealingPlayerTeam) => {
  if (board.value[word] === 'bomb') {
    const winningTeam = revealingPlayerTeam === 'blue' ? 'red' : 'blue';
    socket.send(JSON.stringify({ type: "winner", winner: winningTeam }));
  } else if (blueRevealedCount.value === blueTotal.value) {
    socket.send(JSON.stringify({ type: "winner", winner: 'blue' }));
  } else if (redRevealedCount.value === redTotal.value) {
    socket.send(JSON.stringify({ type: "winner", winner: 'red' }));
  }
};

const closeWinnerModal = () => {
  showWinnerModal.value = false;
};

const confirmRevealWord = (word) => {
  selectedWord.value = word;
  showConfirmRevealModal.value = true;
};


const playSound = (sound) => {
  const audio = new Audio(sound);
  audio.play();
};

const revealWord = (word) => {
  if (revealedWords.value[word] || winnerMessage.value) return;

  console.log(`Revealing word: ${word}`);

/// Определяем, какой звук воспроизводить
if (board.value[word] === 'bomb') {
    playSound(bombSound);
  } else if (board.value[word] === userTeam.value) {
    playSound(revealSound); // Если слово соответствует команде пользователя
  } else if (board.value[word] === 'neutral') {
    playSound(neutralSound); // Если слово нейтральное
  } else {
    playSound(missSound); // Если слово соответствует команде соперника
  }

  socket.send(JSON.stringify({ type: "reveal", word, playerId: playerId.value, revealingPlayerTeam: userTeam.value }));
  showConfirmRevealModal.value = false;
};

const closeConfirmRevealModal = () => {
  showConfirmRevealModal.value = false;
};

const selectTeam = (team) => {
  // Сохраняем выбор команды в localStorage
  localStorage.setItem('userTeam', team);
  userTeam.value = team;
  showTeamSelectionModal.value = false;

  // Сообщаем серверу о выборе команды
  socket.send(JSON.stringify({ type: "selectTeam", team, playerId: playerId.value }));
};

const changeTeam = () => {
  showTeamSelectionModal.value = true;
};

onMounted(() => {
  if (gameId.value) {
    connectWebSocket();

    if (userTeam.value) {
      showTeamSelectionModal.value = false;
    }

    // Запускаем таймер на 3 секунды для проверки загрузки слов
    setTimeout(() => {
      if (!wordsLoaded.value) {
        location.reload(); // Обновляем страницу, если слова не загружены
      }
    }, 1000);
  } else {
    console.error("Missing gameId");
  }
});
</script>

<style scoped>

.containerCodenames {
  margin-bottom: 50px;
}

.share_button {
  margin-top: 30px;
  margin-left: 30px;
}

.modal-unique {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  color: #000 !important;
}

.reload_team {
  background-color: transparent;
  padding: 5px;
  border: 1px solid;
  margin-left: 10px;
  border-radius: 12px;
}

.my_button {
  width: 100px;
  margin: 20px;
  padding: 15px;
  border-radius: 12px;
  color: white !important;
  background: linear-gradient(to right, #DA22FF 0%, #9733EE 100%);
  box-shadow: 0px 5px 10px 0px rgba(0, 0, 0, 0.4);
}

.modal-content-unique {
  background: white;
  padding: 20px;
  border-radius: 8px;
  text-align: center;
}

/* Анимация загрузки */
.loading-spinner {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}

.spinner {
  border: 8px solid rgba(0, 0, 0, 0.1);
  border-top: 8px solid #3498db;
  border-radius: 50%;
  width: 60px;
  height: 60px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
