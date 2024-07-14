<template>
  <GameLayout nameGame="Шпіон">
    <div>
      <h2>Доедналися до гри:</h2>
      <ul v-if="room.players.length">
        <li v-for="(player, key) in room.players" :key="key">{{ player.name }}</li> 
      </ul>
    </div>

    <div v-if="loading">
      Loading...
    </div>
    <div v-else class="containerFormCreate">
      <div v-if="gameState === 'WaitPlayers'">
        <div class="waiting">Очікуємо на гравців</div>
        <TelegramShareButton :url="qrCodeValue" text="Давай грати в Шпіона" />
      </div>
      <div v-else-if="gameState === 'GameCanBeStart'">
        <h1 v-if="isSpy" class="spy-notice">Ви шпіон!</h1>
        <h2 v-if="!isSpy">{{ cur_world }}</h2>
        <table class="formCreate">
          <thead>
            <tr>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="i in filteredPlayers" :key="i.id" class="formElement">
              <td class="tableElement">{{ i.name }}</td>
            </tr>
            <TimerFizi :timeInSeconds="time_game" :autoStart="true" 
              timerTimeLeftKey="spyTimerTimeLeft"
              timerIsRunningKey="spyIsRunning"
              lastUpdateTimeKey="spylastUpdateTime"/>
          </tbody>
        </table>
        <div class="spyDiv" v-if="isSpy">
          <div>
            <ul>
              <li v-for="word in room.theme" :key="word">{{ word }}</li>
            </ul>
          </div>
        </div>
      </div>
      <div v-if="showVotingModal" class="modal">
        <div class="modal-content">
          <span class="close" @click="showVotingModal = false">&times;</span>
          <h2>Выберите шпиона</h2>
          <button v-for="player in filteredPlayers" :key="player.id" @click="voteForPlayer(player.id)">
            {{ player.name }}
          </button>
        </div>
      </div>
      <div v-if="showGuessingModal" class="modal">
        <div class="modal-content">
          <span class="close" @click="showGuessingModal = false">&times;</span>
          <h2>Выберите загаданное слово</h2>
          <button v-for="word in room.theme" :key="word" @click="guessWord(word)">
            {{ word }}
          </button>
        </div>
      </div>
      <div v-if="showResultModal" class="modal">
        <div class="modal-content">
          <span class="close" @click="showResultModal = false">&times;</span>
          <h2>Результат игры</h2>
          <p>{{ gameResult }}</p>
          <ButtonHome></ButtonHome>
        </div>
      </div>
      <div v-if="errorMessage" class="error-message">
        {{ errorMessage }}
      </div>
    </div>
  </GameLayout>
</template>

<script setup>
import axios from 'axios';
import { ref, reactive, onMounted, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import GameLayout from '../GameLayout.vue';
import TimerFizi from '@/components/TimerFizi.vue';
import TelegramShareButton from '@/components/TelegramShareButton.vue';
import ButtonHome from '@/components/ButtonHome.vue';


const url_serv = "mysterious-eyrie-00377-cd0134972bbc.herokuapp.com";

// const url_serv = "127.0.0.1:7000";

const loading = ref(true);
const gameState = ref('WaitPlayers');
const isSpy = ref(false);
const cur_world = ref('');
const time_game = ref(0);
const errorMessage = ref('');
const showVotingModal = ref(false);
const showGuessingModal = ref(false);
const showResultModal = ref(false);
const gameResult = ref('');
const route = useRoute();
const router = useRouter();
const room = reactive({ name: '', players: [], theme: [] });
const qrCodeValue = ref('');

const connectToWebSocket = (roomId, playerName, playerHash) => {
  console.log(`Connecting to WebSocket for room ${roomId} as player ${playerName} with hash ${playerHash}`);
  const websocket = new WebSocket(`wss://${url_serv}/start/${roomId}?name=${encodeURIComponent(playerName)}&player_hash=${playerHash || ''}`);

  websocket.onopen = () => {
    console.log('WebSocket connected');
    loading.value = false;
  };

  websocket.onmessage = (event) => {
    const message = JSON.parse(event.data);

    if (message.hash) {
      localStorage.setItem('spyPlayerHash', message.hash);
    }

    const eventType = message.event;
    if (eventType === 'GameCanBeStart') {
      gameState.value = 'GameCanBeStart';
      cur_world.value = message.world_spy;
      time_game.value = parseInt(message.room.time_game);
      isSpy.value = false; // Обнуляем значение
    } else if (eventType === 'YouAreSpy') {
      gameState.value = 'GameCanBeStart';
      time_game.value = parseInt(message.room.time_game);
      isSpy.value = true;
      cur_world.value = ''; // Очистим текущее слово
    } else if (eventType === 'VotingStarted') {
      if (isSpy.value) {
        showGuessingModal.value = true;
      } else {
        showVotingModal.value = true;
      }
    } else if (eventType === 'GameResult') {
      gameResult.value = message.result;
      showResultModal.value = true;
    } else if (eventType === 'NewPlayerConnected') {
      console.log("New player connected:", message.room.players);
      room.players = message.room.players;
    }

    Object.assign(room, message.room);
  };

  websocket.onclose = (event) => {
    console.log('WebSocket closed:', event);
  };

  websocket.onerror = (error) => {
    console.error('WebSocket error:', error);
  };
};

const checkRoomExists = async (roomId) => {
  try {
    const response = await axios.get(`https://${url_serv}/rooms/${roomId}`);
    return response.status === 200 && response.data;
  } catch (error) {
    if (error.response && error.response.status === 404) {
      errorMessage.value = "Комната не существует. Пожалуйста, проверьте ID комнаты и попробуйте снова.";
    } else {
      console.error('Error checking room:', error);
      errorMessage.value = "Произошла ошибка. Пожалуйста, попробуйте снова позже.";
    }
    return false;
  }
};

const playerName = ref(localStorage.getItem('spyPlayerName') || '');

const isButtonActive = computed(() => {
  return playerName.value.trim().length > 0;
});

const voteForPlayer = async (playerId) => {
  const roomId = route.params.id;
  try {
    await axios.post(`https://${url_serv}/vote`, null, {
      params: { room_id: roomId, player_id: playerId }
    });
  } catch (error) {
    console.error('Error voting for player:', error);
  } finally {
    showVotingModal.value = false;
  }
};

const guessWord = async (word) => {
  const roomId = route.params.id;
  try {
    await axios.post(`https://${url_serv}/guess`, null, {
      params: { room_id: roomId, word: word }
    });
  } catch (error) {
    console.error('Error guessing word:', error);
  } finally {
    showGuessingModal.value = false;
  }
};

const filteredPlayers = computed(() => {
  return room.players.filter(player => player.name !== playerName.value);
});

onMounted(async () => {
  const playerNameFromStorage = localStorage.getItem('spyPlayerName');
  const roomId = route.params.id;
  const playerHash = localStorage.getItem('spyPlayerHash');

  if (!playerNameFromStorage || !roomId) {
    router.push('/');
    return;
  }

  const exists = await checkRoomExists(roomId);
  if (exists) {
    playerName.value = playerNameFromStorage;
    qrCodeValue.value = `https://salty-crag-94803-5b1ef9ad0209.herokuapp.com//spy/connect/${roomId}`;
    connectToWebSocket(roomId, playerNameFromStorage, playerHash);
  } else {
    router.push('/');
  }
});

const connectedPlayers = ref([]);

watch(() => room.players, (newPlayers) => {
  connectedPlayers.value = newPlayers;
  console.log('Players updated:', newPlayers);
  console.log('Connected players:', connectedPlayers.value.length);
});
</script>

<style scoped>
.error-message {
  color: red;
  margin-top: 10px;
}
.spy-notice {
  color: red;
  font-size: 2em;
}
.modal {
  display: block;
  position: fixed;
  z-index: 1;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  overflow: auto;
  background-color: rgba(0, 0, 0, 0.4);
  color: black;
}

.modal-content {
  background-color: #fefefe;
  margin: 15% auto;
  padding: 20px;
  border: 1px solid #888;
  width: 80%;
  text-align: center;
  max-width: 450px;
}

.close {
  color: #aaa;
  float: right;
  font-size: 28px;
  font-weight: bold;
}

.close:hover,
.close:focus {
  color: black;
  text-decoration: none;
  cursor: pointer;
}

button {
  display: block;
  width: 100%;
  padding: 10px;
  margin: 10px 0;
  font-size: 1.2em;
  color: #000;
  background-color: #f2f2f2;
  border: 1px solid #ccc;
  cursor: pointer;
}

button:hover {
  background-color: #ddd;
}
</style>
