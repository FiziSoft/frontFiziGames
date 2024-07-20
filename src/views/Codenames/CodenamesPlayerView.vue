<template>
  <GameLayout nameGame="Кодові імена">
    <div class="containerCodenames">
      <!-- Анимация загрузки -->
      <div v-if="!wordsLoaded" class="loading-spinner">
        <div class="spinner"></div>
      </div>

      <!-- Основное содержимое -->
      <div v-else>
        <div class="progress">
          <div class="team">
            <span class="team-name">Сині: </span>
            <span class="team-progress">{{ blueRevealedCount }} / {{ blueTotal }}</span>
            <span class="team-players">Гравців: {{ bluePlayersCount }}</span>
          </div>
          <div class="team">
            <span class="team-name">Червоні: </span>
            <span class="team-progress">{{ redRevealedCount }} / {{ redTotal }}</span>
            <span class="team-players">Гравців: {{ redPlayersCount }}</span>
          </div>
          <br>
          <div class="current-team">
            <span>Ваша команда: {{ userTeam }}</span>
            <button class="my_button" @click="changeTeam">Змінити команду</button>
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
      </div>
    </div>
    <ShareButton :url="url_share" text='Давай грати в "Кодові імена"'></ShareButton>
    
    <!-- Модальное окно для отображения победителя -->
    <div v-if="showWinnerModal" class="modal-unique">
      <div class="modal-content-unique">
        <p>{{ winnerMessage }}</p>
        <button @click="closeWinnerModal">OK</button>
      </div>
    </div>

    <!-- Модальное окно для выбора команды -->
    <div v-if="showTeamSelectionModal" class="modal-unique">
      <div class="modal-content-unique">
        <p>За яку команду гратимеш?</p>
        <button @click="selectTeam('червоні')">Червоні</button>
        <button @click="selectTeam('сині')">Сині</button>
      </div>
    </div>

    <!-- Модальное окно для подтверждения выбора слова -->
    <div v-if="showConfirmRevealModal" class="modal-unique">
      <div class="modal-content-unique">
        <p>Точно?</p>
        <button class="my_button" @click="revealWord(selectedWord)">Так</button>
        <button class="my_button" @click="closeConfirmRevealModal">Ні</button>
      </div>
    </div>
  </GameLayout>
</template>

<script setup>
// eslint-disable-next-line
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import GameLayout from '../GameLayout.vue';
import ShareButton from '@/components/ShareButton.vue';

const route = useRoute();
const router = useRouter();
const gameId = ref(route.params.gameId);
const words = ref([]);
const revealedWords = ref({});
const board = ref({});
let socket;
const url_share = `https://fizigames-799b6804c93a.herokuapp.com/codenames/player-view/${gameId.value}`;

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

const connectWebSocket = () => {
  const wsUrl = `wss://codenames-72ce2135032c.herokuapp.com/ws/${gameId.value}`;
  console.log(`Connecting to WebSocket at ${wsUrl}`);
  try {
    socket = new WebSocket(wsUrl);

    socket.onopen = () => {
      console.log('WebSocket connection established');
    };

    socket.onmessage = (event) => {
      console.log('Received message:', event.data);
      const message = JSON.parse(event.data);
      if (message.type === "reveal") {
        revealedWords.value[message.word] = message.role;
        checkForWinner();
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
      } else if (message.type === "updateTeams") {
        redPlayersCount.value = message.redPlayersCount;
        bluePlayersCount.value = message.bluePlayersCount;
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

const checkForWinner = () => {
  if (blueRevealedCount.value === blueTotal.value) {
    winnerMessage.value = 'Команда Сині виграла!';
    showWinnerModal.value = true;
  } else if (redRevealedCount.value === redTotal.value) {
    winnerMessage.value = 'Команда Червоні виграла!';
    showWinnerModal.value = true;
  } else if (Object.values(revealedWords.value).includes('bomb')) {
    if (userTeam.value === 'червоні') {
      winnerMessage.value = 'Ваша команда програла!';
    } else {
      winnerMessage.value = 'Команда Червоні виграла!';
    }
    showWinnerModal.value = true;
  }
};

const closeWinnerModal = () => {
  showWinnerModal.value = false;
};

const confirmRevealWord = (word) => {
  selectedWord.value = word;
  showConfirmRevealModal.value = true;
};

const revealWord = (word) => {
  if (revealedWords.value[word] || winnerMessage.value) return;

  console.log(`Revealing word: ${word}`);
  socket.send(JSON.stringify({ type: "reveal", word }));
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
  socket.send(JSON.stringify({ type: "selectTeam", team }));
};

const changeTeam = () => {
  showTeamSelectionModal.value = true;
};

onMounted(() => {
  if (gameId.value) {
    connectWebSocket();

    // Запускаем таймер на 3 секунды для проверки загрузки слов
    setTimeout(() => {
      if (!wordsLoaded.value) {
        location.reload(); // Обновляем страницу, если слова не загружены
      }
    }, 3000);
  } else {
    console.error("Missing gameId");
  }
});
</script>

<style scoped>
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
  height: 100vh; /* Высота экрана */
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
