<template>
  <GameLayout nameGame="Кодові імена">
    <div class="containerCodenames">
      <!-- Анимация загрузки -->
      <div v-if="!wordsLoaded" class="loading-spinner">
        <div class="spinner"></div>
      </div>

      <!-- Основное содержимое -->
      <div v-else class="content">
        <div class="progress">
          <div class="team">
            <span class="team-name">Сині ({{ bluePlayersCount }}): </span>
            <span class="team-progress">{{ blueRevealedCount }} / {{ blueTotal }} </span>
           
          </div>
          <div class="team">
            <span class="team-name">Червоні ({{ redPlayersCount }}): </span>
            <span class="team-progress">{{ redRevealedCount }} / {{ redTotal }}</span>
            
          </div>
          <br>
          <div class="current-team">
            <span>Ваша команда: {{ userTeam }} </span>
            <button class="my_button" @click="changeTeam">Змінити команду</button>
          </div>
        </div>
        <div class="grid">
          <div
            v-for="word in words"
            :key="word"
            class="word"
            :class="{
              revealed: !!revealedWords[word],
              red: revealedWords[word] === 'red',
              blue: revealedWords[word] === 'blue',
              neutral: revealedWords[word] === 'neutral',
              bomb: revealedWords[word] === 'bomb',
              'red-border': showColors && board[word] === 'red',
              'blue-border': showColors && board[word] === 'blue',
              'neutral-border': showColors && board[word] === 'neutral',
              'bomb-border': showColors && board[word] === 'bomb'
            }"
            @click="confirmRevealWord(word)"
          >
            {{ word }}
          </div>
        </div>
        <div class="buttonsCode">
          <button class="btn-grad" v-if="info_share" @click="confirmStartGame">Почати гру</button>
          <button class="btn-grad" v-if="gameStarted" @click="toggleShowColors">{{ showColors ? 'скрити' : 'показати' }}</button>
          <div class="groupShare">
            <button class="btn-grad" v-if="info_share" @click="showTelegramShareModalUser = true">Додати гравців</button>
            <button class="btn-grad" v-if="info_share" @click="showTelegramShareModalCaptain = true">Додати капітана</button>
          </div>
          <button class="btn-grad" v-if="!gameStarted" @click="refreshWords">Оновити слова</button>
        </div>
      </div>
    </div>
    
    <!-- Модальное окно для отображения победителя -->
    <div v-if="showWinnerModal" class="modal-unique">
      <div class="modal-content-unique">
        <p>{{ winnerMessage }}</p>
        <button class="button_finish" @click="closeWinnerModal">OK</button>
      </div>
    </div>

    <!-- Модальное окно для выбора команды -->
    <div v-if="showTeamSelectionModal" class="modal-unique">
      <div class="modal-content-unique">
        <p>За яку команду гратимеш?</p>
        <button class="button_finish" @click="selectTeam('червоні')">Червоні</button>
        <button class="button_finish" @click="selectTeam('сині')">Сині</button>
      </div>
    </div>

    <!-- Модальное окно для подтверждения выбора слова -->
    <div v-if="showConfirmRevealModal" class="modal-unique">
      <div class="modal-content-unique">
        <p>Точно?</p>
        <button class="button_finish" @click="revealWord(selectedWord)">Так</button>
        <button class="button_finish" @click="closeConfirmRevealModal">Ні</button>
      </div>
    </div>

    <div v-if="showTelegramShareModalCaptain" class="modal-unique">
      <div class="modal-content-unique">
        <TelegramShareButton :url="url_captan_share" text="Ти капітан, давай грати" />
        <button class="button_finish" @click="showTelegramShareModalCaptain = false">Закрити</button>
      </div>
    </div>
    <div v-if="showTelegramShareModalUser" class="modal-unique">
      <div class="modal-content-unique">
        <TelegramShareButton :url="url_share" text="Доеднуйся до нас у гру Кодові імена!" />
        <button class="button_finish" @click="showTelegramShareModalUser = false">Закрити</button>
      </div>
    </div>
  </GameLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import GameLayout from '../GameLayout.vue';
import ShareButton from '@/components/ShareButton.vue';
import TelegramShareButton from '@/components/TelegramShareButton.vue';
import { v4 as uuidv4 } from 'uuid';

const route = useRoute();
const router = useRouter();
const gameId = ref(route.params.gameId);
const words = ref([]);
const revealedWords = ref({});
const board = ref({});
let socket;
const url_share = `https://fizigames-799b6804c93a.herokuapp.com/codenames/player-view/${gameId.value}`;

const redRevealedCount = computed(() => Object.values(revealedWords.value).filter(role => role === 'red').length);
const blueRevealedCount = computed(() => Object.values(revealedWords.value).filter(role => role === 'blue').length);

const redTotal = ref(0);
const blueTotal = ref(0);

const redPlayersCount = ref(0);
const bluePlayersCount = ref(0);

const showWinnerModal = ref(false);
const winnerMessage = ref('');

const wordsLoaded = ref(false);

const showTeamSelectionModal = ref(!localStorage.getItem('userTeam'));

const showConfirmRevealModal = ref(false);
const selectedWord = ref('');

const userTeam = ref(localStorage.getItem('userTeam') || '');

const playerId = ref(localStorage.getItem('playerId') || uuidv4());
localStorage.setItem('playerId', playerId.value);

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

        redTotal.value = Object.values(message.board).filter(role => role === 'red').length;
        blueTotal.value = Object.values(message.board).filter(role => role === 'blue').length;

        redPlayersCount.value = message.redPlayersCount;
        bluePlayersCount.value = message.bluePlayersCount;

        wordsLoaded.value = true;
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
  localStorage.setItem('userTeam', team);
  userTeam.value = team;
  showTeamSelectionModal.value = false;

  socket.send(JSON.stringify({ type: "selectTeam", team, playerId: playerId.value }));
};

const changeTeam = () => {
  showTeamSelectionModal.value = true;
};

onMounted(() => {
  if (gameId.value) {
    connectWebSocket();

    setTimeout(() => {
      if (!wordsLoaded.value) {
        location.reload();
      }
    }, 3000);
  } else {
    console.error("Missing gameId");
  }
});
</script>

<style scoped>
.my_button {
  border: 1px solid;
  padding: 7px;
  border-radius: 12px;
  margin-left: 10px;
}

.groupShare {
  width: 100%;
  display: flex;
  padding: 10px;
}

.containerCodenames {
  padding-bottom: 100px;
}

.button_finish {
  width: 150px;
  margin: 25px;
  padding: 20px;
  border-radius: 12px;
  color: white !important; 
  background: linear-gradient(to right, #DA22FF 0%, #9733EE 100%);
  box-shadow: 0px 5px 10px 0px rgba(0, 0, 0, 0.4);
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
  z-index: 1000;
}

.modal-content-unique {
  background: white;
  padding: 20px;
  border-radius: 8px;
  text-align: center;
}

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
