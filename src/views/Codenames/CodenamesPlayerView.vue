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
          </div>
          <div class="team">
            <span class="team-name">Червоні: </span>
            <span class="team-progress">{{ redRevealedCount }} / {{ redTotal }}</span>
          </div>
          <br>
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
  </GameLayout>
</template>

<script setup>
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

// Состояние модального окна победителя
const showWinnerModal = ref(false);
const winnerMessage = ref('');

// Состояние для отслеживания загрузки слов
const wordsLoaded = ref(false);

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

        wordsLoaded.value = true; // Устанавливаем состояние загрузки слов
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
    winnerMessage.value = `Ваша команда програла!`;
    showWinnerModal.value = true;
  }
};

const closeWinnerModal = () => {
  showWinnerModal.value = false;
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
}

.modal-unique button {
  
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
