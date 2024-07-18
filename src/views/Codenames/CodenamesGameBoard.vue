<template>
  <GameLayout nameGame="Кодові імена">
    <div class="containerCodenames">
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
        <button class="btn-grad" v-if="gameStarted" @click="toggleShowColors">On/Off</button>
        <button class="btn-grad" v-if="!gameStarted" @click="refreshWords">Оновити слова</button>
      </div>
    </div>
    <div v-if="showModal" class="modal">
      <div class="modal-content">
        <p>Вы уверены, что хотите начать игру?</p>
        <button @click="startGame">Да</button>
        <button @click="closeModal">Нет</button>
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
import { useRoute } from 'vue-router';
import GameLayout from '../GameLayout.vue';
import ShareButton from '@/components/ShareButton.vue';

const route = useRoute();
const gameId = ref(route.params.gameId);
const words = ref([]);
const revealedWords = ref({});
const board = ref({});
const showOnlyRevealed = ref(false);
const showColors = ref(false);
const showModal = ref(false);
const gameStarted = ref(false);
const info_share = ref(true)

let socket;
const url_share = `https://fizigames-799b6804c93a.herokuapp.com/codenames/player-view/${gameId.value}`;

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
        console.log(`Revealed word: ${message.word}, role: ${message.role}`);
      } else if (message.type === "initialize") {
        words.value = message.words;
        board.value = message.board;
        gameStarted.value = message.gameStarted;
        showColors.value = gameStarted.value;
        revealedWords.value = message.revealedWords;
        console.log("Initialized game state:", message);
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
  if (revealedWords.value[word]) return;

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
  info_share.value = false
  showModal.value = true;
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
  console.log("Requested words refresh");
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
