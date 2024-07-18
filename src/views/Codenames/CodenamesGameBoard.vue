<template>
  <GameLayout nameGame="Кодові імена">
    <div class="containerCodenames">
      <div class="progress">
        <div class="team">
          <span class="team-name">Сині: </span>
          <span class="team-progress">{{ blueRevealedCount }} / {{ blueTotal }}</span>
        </div>
        <div class="team">
          <span class="team-name">Червоні: </span>
          <span class="team-progress">{{ redRevealedCount }} / {{ redTotal }}</span>
        </div>
        <br>
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
          @click="revealWord(word)"
        >
          {{ word }}
        </div>
      </div>
      <div class="buttonsCode">
        <button class="btn-grad" v-if="info_share" @click="confirmStartGame">Почати гру</button>
        <button class="btn-grad" v-if="gameStarted" @click="toggleShowColors">{{ showColors ? 'скрити' : 'показати' }}</button>
        <button class="btn-grad" v-if="info_share" @click="showTelegramShareModal = true">Додати капітана</button>

        <button class="btn-grad" v-if="!gameStarted" @click="refreshWords">Оновити слова</button>
      </div>
    </div>
    <div v-if="showModal" class="modal-unique">
      <div class="modal-content-unique">
        <p v-if="bombSelected">Ваша команда програла</p>
        <p v-else>Команда {{ winner }} виграла!</p>
        <div>
          <button class="button_finish" @click="restartGame">Почати нову гру</button>
          <button class="button_finish" @click="changeWordsCount">Змінити кількість слів</button>
        </div>
      </div>
    </div>
    <div v-if="showTelegramShareModal" class="modal-unique">
      <div class="modal-content-unique">
        <TelegramShareButton :url="url_captan_share" text="Ти капітан, давай грати" />
        <button class="button_finish" @click="showTelegramShareModal = false">Закрити</button>
      </div>
    </div>
    <div class="info_captain" v-show="info_share"> 
      <i class="fa-solid fa-arrow-left"></i> пошерся своїм друзям
    </div>
    <ShareButton :url="url_share" text="Поділитися"></ShareButton>
  </GameLayout>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import GameLayout from '../GameLayout.vue';
import ShareButton from '@/components/ShareButton.vue';
import TelegramShareButton from '@/components/TelegramShareButton.vue';  // Предполагая, что этот компонент существует

const route = useRoute();
const router = useRouter();
const gameId = ref(route.params.gameId);
const words = ref([]);
const revealedWords = ref({});
const board = ref({});
const showOnlyRevealed = ref(false);
const showColors = ref(false);
const showModal = ref(false);
const gameStarted = ref(false);
const info_share = ref(true);
const showTelegramShareModal = ref(false);
const winner = ref(null);
const bombSelected = ref(false);
const url_captan_share = window.location.href;



let socket;
const url_share = `https://fizigames-799b6804c93a.herokuapp.com/codenames/player-view/${gameId.value}`;

const redRevealedCount = computed(() => Object.values(revealedWords.value).filter(role => role === 'red').length);
const blueRevealedCount = computed(() => Object.values(revealedWords.value).filter(role => role === 'blue').length);

const redTotal = ref(0);
const blueTotal = ref(0);

const checkForWinner = () => {
  if (redRevealedCount.value === redTotal.value) {
    winner.value = 'червоні';
    showModal.value = true;
  } else if (blueRevealedCount.value === blueTotal.value) {
    winner.value = 'сині';
    showModal.value = true;
  }
};

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
        if (message.role === 'bomb') {
          bombSelected.value = true;
          winner.value = blueRevealedCount.value > redRevealedCount.value ? 'червоні' : 'сині';
          showModal.value = true;
        } else {
          checkForWinner();
        }
        console.log(`Revealed word: ${message.word}, role: ${message.role}`);
      } else if (message.type === "initialize") {
        words.value = message.words;
        board.value = message.board;
        gameStarted.value = message.gameStarted;
        showColors.value = gameStarted.value;
        revealedWords.value = message.revealedWords;
        console.log("Initialized game state:", message);

        redTotal.value = Object.values(message.board).filter(role => role === 'red').length;
        blueTotal.value = Object.values(message.board).filter(role => role === 'blue').length;
      } else if (message.type === "startGame") {
        gameStarted.value = true;
        showColors.value = true;
        console.log("Game started");
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

const revealWord = (word) => {
  if (revealedWords.value[word] || winner.value) return;

  console.log(`Revealing word: ${word}`);
  socket.send(JSON.stringify({ type: "reveal", word }));
};

const toggleReveal = () => {
  words.value.forEach(word => {
    if (!revealedWords.value[word]) {
      revealWord(word);
    }
  });
};

const toggleShowColors = () => {
  showColors.value = !showColors.value;
};

const confirmStartGame = () => {
  info_share.value = false;
  gameStarted.value = true;
  showColors.value = true;
};

const startGame = () => {
  showModal.value = false;
  gameStarted.value = true;
  showColors.value = true;
  socket.send(JSON.stringify({ type: "startGame" }));
};

const closeModal = () => {
  showModal.value = false;
};

const refreshWords = () => {
  socket.send(JSON.stringify({ type: "refreshWords" }));
  revealedWords.value = {};
  winner.value = null;
  bombSelected.value = false;
  console.log("Requested words refresh");
};

const restartGame = () => {
  refreshWords();
  startGame();
};

const changeWordsCount = () => {
  router.push({ name: 'codenames-create' });
};

const filteredWords = computed(() => {
  if (showOnlyRevealed.value) {
    return words.value.filter(word => revealedWords.value[word]);
  }
  return words.value;
});

onMounted(() => {
  if (gameId.value) {
    connectWebSocket();
  } else {
    console.error("Missing gameId");
  }
});
</script>

<style>
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
</style>
