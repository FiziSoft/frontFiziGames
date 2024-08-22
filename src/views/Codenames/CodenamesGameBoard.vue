<template>
  <GameLayout :nameGame="$t('games.codenames.name')">
    <div class="containerCodenames">
     
      
      <!-- Анимация загрузки -->
      <div v-if="!wordsLoaded" class="loading-spinner">
        <div class="loader"></div>
      </div>
      
      <!-- Основное содержимое -->
      <div v-else class="content">
        <div class="progress">
          <div class="team">
            <span class="team-name">{{ $t('games.codenames.teams.blue') }} ({{ bluePlayersCount }}): </span>
            <span class="team-progress">{{ blueTotal }} / {{ blueRevealedCount }}</span>
          </div>
          <div class="team">
            <span class="team-name">{{ $t('games.codenames.teams.red') }} ({{ redPlayersCount }}): </span>
            <span class="team-progress"> {{ redTotal }} / {{ redRevealedCount }}</span>
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
          <button class="btn-grad"  id="btnStart" v-if="info_share" @click="confirmStartGame">{{ $t('games.codenames.start_game') }}</button>
          <button  class="btn-grad" v-if="gameStarted" @click="toggleShowColors">{{ showColors ? $t('games.codenames.hide_colors') : $t('games.codenames.show_colors') }}</button>
          <div class="groupShare">
            <button class="btn-grad" id="btnUsers" v-if="info_share" @click="showTelegramShareModalUser = true">{{ $t('games.codenames.add_players') }}</button>
            <button class="btn-grad" id="btnCaptain" v-if="info_share" @click="showTelegramShareModalCaptain = true">{{ $t('games.codenames.add_captain') }}</button>
          </div>
          <button class="btn-grad" v-if="!gameStarted" @click="refreshWords">{{ $t('games.codenames.update_words') }}</button>
        </div>
      </div>
    </div>
    
    <!-- Модальное окно для отображения победителя -->
    <div v-if="showModal" class="modal-unique">
      <div class="modal-content-unique">
        <p v-if="bombSelected">{{ $t('games.codenames.winner_message', { team: winner }) }}</p>
        <p v-else>{{ $t('games.codenames.winner_message', { team: winner }) }}</p>
        <div>
          <button class="btn-grad" @click="restartGame">{{ $t('games.codenames.start_game') }}</button>
          <button class="btn-grad" @click="changeWordsCount">{{ $t('games.codenames.update_words') }}</button>
        </div>
      </div>
    </div>
    <div v-if="showTelegramShareModalCaptain" class="modal-unique">
      <div  class="modal-content-unique">
        <TelegramShareButton :description="$t('games.codenames.add_captain')" :url="url_captan_share" :text="$t('games.codenames.play_codenames')" />
        <button  class="btn-grad" @click="showTelegramShareModalCaptain = false">{{ $t('close') }}</button>
      </div>
    </div>
    <div v-if="showTelegramShareModalUser" class="modal-unique">
      <div class="modal-content-unique">
        <TelegramShareButton :description="$t('games.codenames.add_players')" :url="url_share" :text="$t('games.codenames.play_codenames')" />
        <button class="btn-grad"  @click="showTelegramShareModalUser = false">{{ $t('close') }}</button>
      </div>
    </div>

    <!-- Компонент подсказок -->
    <ToolTripFizi v-if="showTour" :steps="steps" />
     <!-- Кнопка для запуска тура -->
     <!-- <button @click="startTour" class="tourDiv"><i class="fa-regular fa-circle-question"></i></button> -->
  </GameLayout>
</template>

<script setup>
import { useI18n } from 'vue-i18n';
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import GameLayout from '../GameLayout.vue';
import ShareButton from '@/components/ShareButton.vue';
import TelegramShareButton from '@/components/TelegramShareButton.vue';  
import { v4 as uuidv4 } from 'uuid';
import ToolTripFizi from '@/components/ToolTripFizi.vue';



import bombSound from '@/assets/sound/sunk_sound.mp3';
import revealSound from '@/assets/sound/plus_click.mp3'; // Импорт звука для кнопки "-"
import { url_main_page } from "@/link";


const { locale, t } = useI18n();
const route = useRoute();
const router = useRouter();
const gameId = ref(route.params.gameId);

if (route.params.locale) {
  locale.value = route.params.locale;
}

const words = ref([]);
const revealedWords = ref({});
const board = ref({});
const showOnlyRevealed = ref(false);
const showColors = ref(false);
const showModal = ref(false);
const gameStarted = ref(false);
const info_share = ref(true);
const showTelegramShareModalUser = ref(false);
const showTelegramShareModalCaptain = ref(false);

const winner = ref(null);
const bombSelected = ref(false);
const url_captan_share = window.location.href;
const wordsLoaded = ref(false);  

let socket;
const url_share = `${url_main_page}/codenames/player-view/${gameId.value}`;

const redRevealedCount = computed(() => Object.values(revealedWords.value).filter(role => role === 'red').length);
const blueRevealedCount = computed(() => Object.values(revealedWords.value).filter(role => role === 'blue').length);

const redTotal = ref(0);
const blueTotal = ref(0);

const redPlayersCount = ref(0);
const bluePlayersCount = ref(0);

const playerId = ref(localStorage.getItem('playerId') || uuidv4());
localStorage.setItem('playerId', playerId.value);

const isCaptain = ref(false);

const userTeam = ref(localStorage.getItem('userTeam') || '');

const checkForWinner = (revealingPlayerTeam, word) => {
  if (revealedWords.value[word] === 'bomb') {
    winner.value = revealingPlayerTeam === 'red' ? 'blue' : 'red';
    bombSelected.value = true;
    showModal.value = true;
  } else if (redRevealedCount.value === redTotal.value) {
    winner.value = 'red';
    showModal.value = true;
  } else if (blueRevealedCount.value === blueTotal.value) {
    winner.value = 'blue';
    showModal.value = true;
  }
};

const connectWebSocket = () => {
  const wsUrl = `wss://codenames-72ce2135032c.herokuapp.com/ws/${gameId.value}`;
  try {
    socket = new WebSocket(wsUrl);

    socket.onopen = () => {
      socket.send(JSON.stringify({ type: "playerJoin", playerId: playerId.value, isCaptain: isCaptain.value }));
    };

    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === "reveal") {
        revealedWords.value[message.word] = message.role;
        checkForWinner(message.revealingPlayerTeam, message.word);
      } else if (message.type === "initialize") {
        words.value = message.words;
        board.value = message.board;
        gameStarted.value = message.gameStarted;
        showColors.value = gameStarted.value;
        revealedWords.value = message.revealedWords;

        redTotal.value = Object.values(message.board).filter(role => role === 'red').length;
        blueTotal.value = Object.values(message.board).filter(role => role === 'blue').length;

        redPlayersCount.value = message.redPlayersCount;
        bluePlayersCount.value = message.bluePlayersCount;

        wordsLoaded.value = true;  
        
        // Set locale from server
        locale.value = message.locale;
      } else if (message.type === "startGame") {
        gameStarted.value = true;
        showColors.value = true;
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

const playSound = (sound) => {
  const audio = new Audio(sound);
  audio.play();
};

const revealWord = (word) => {
  if (revealedWords.value[word] || winner.value) return;
  // Определяем, какой звук воспроизводить
  if (board.value[word] === 'bomb') {
    playSound(bombSound);
  } else {
    playSound(revealSound);
  }
  socket.send(JSON.stringify({ type: "reveal", word, playerId: playerId.value, playerTeam: userTeam.value }));
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
    isCaptain.value = !!route.query.isCaptain;
    connectWebSocket();

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

const steps = [
  {
    element: '.team-name',
    title: t('games.codenames.tour.teamNameTitle'),
    description: t('games.codenames.tour.teamName'),
    position: 'bottom'
  },
  {
    element: '.team-progress',
    title: t('games.codenames.tour.team-progressTitle'),
    description: t('games.codenames.tour.team-progress'),
    position: 'bottom'
  },
  {
    element: '.grid',
    title: t('games.codenames.tour.gridTitle'),
    description: t('games.codenames.tour.grid'),
    position: 'bottom'
  },
  {
    element: '#btnUsers',
    title: t('games.codenames.tour.usersTitle'),
    description: t('games.codenames.tour.users'),
    position: 'top'
  }
  ,
  {
    element: '#btnCaptain',
    title: t('games.codenames.tour.captainTitle'),
    description: t('games.codenames.tour.captain'),
    position: 'top'
  }
  ,
  {
    element: '#btnStart',
    title: t('games.codenames.tour.startTitle'),
    description: t('games.codenames.tour.start'),
    position: 'top'
  }
];

const showTour = ref(false);

const startTour = () => {
  showTour.value = true;
};
</script>

<style scoped>

.buttonsCode {
  padding: 0 25px;
}
 


.groupShare {
  width: 100%;
  display: flex;
  gap:20px
}

.tourDiv {
  background-color: transparent;
  font-size: 30px;
  position: relative;
  bottom: 80px;
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
  align-items: center
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

/* HTML: <div class="loader"></div> */
/* HTML: <div class="loader"></div> */
/* HTML: <div class="loader"></div> */

</style>
