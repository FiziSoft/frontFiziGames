<template>
  <GameLayout name-game="Морський Бій">
    <div class="containerFormCreate">
      
      <!-- Игровое поле игрока -->
      <div v-if="opponentName !== 'Opponent' && isBoardVisible" class="game-board">
      <div class="my_board"><h3>Гравець: <strong>{{ playerName }}</strong> </h3> 
        
      </div>
        <div class="board">
          <div class="label-row">
            <div class="cell label"></div>
            <div v-for="colIndex in 10" :key="'top-label-' + colIndex" class="cell label">
              {{ String.fromCharCode(1040 + colIndex - 1) }}
            </div>
          </div>
          <div v-for="(row, rowIndex) in myBoard" :key="'my-row-' + rowIndex" class="row">
            <div class="cell label">{{ rowIndex + 1 }}</div>
            <div
              v-for="(cell, colIndex) in row"
              :key="'my-cell-' + colIndex"
              :class="getCellClass(cell, true)"
              class="cell"
            ></div>
          </div>
        </div>
      </div>

      <!-- Ряд для жизней игрока -->
      <div v-if="opponentName !== 'Opponent'" class="life-row">
        <div v-for="(life, index) in playerLives" :key="'player-life-' + index" class="life-dot"></div>
      </div>

      <!-- Телеграм кнопка и уведомление -->
      <div v-if="opponentName == 'Opponent'" class="shareLocal">
        <TelegramShareButton :url="url_connect" text="Давай грати в Морський Бій"></TelegramShareButton> 
        <h2> &#8592; Додай собі оппонента </h2>  
      </div>

      <!-- Индикатор хода -->
      <div class="turn-indicator" v-if="opponentName !== 'Opponent'">
        <div v-if="isMyTurn()" class="turn-box your-turn">Ваш хід</div>
        <div v-else class="turn-box opponent-turn">Хід опонента</div>
        <i 
        :class="isBoardVisible ? 'fa-regular fa-eye-slash' : 'fa-regular fa-eye'" 
        @click="toggleVisibility"
      ></i>
      </div>

      <!-- Ряд для жизней оппонента -->
      <div v-if="opponentName !== 'Opponent'" class="life-row">
        <div v-for="(life, index) in opponentLives" :key="'opponent-life-' + index" class="life-dot"></div>
      </div>
      
      <!-- Игровое поле оппонента -->
      <div class="game-board" v-if="opponentName !== 'Opponent'">
        <div class="board">
          <div class="label-row">
            <div class="cell label" :class="cornerClass"></div>
            <div v-for="colIndex in 10" :key="'top-label-' + colIndex" class="cell label">
              {{ String.fromCharCode(1040 + colIndex - 1) }}
            </div>
          </div>
          <div v-for="(row, rowIndex) in opponentBoard" :key="'opponent-row-' + rowIndex" class="row">
            <div class="cell label">{{ rowIndex + 1 }}</div>
            <div
              v-for="(cell, colIndex) in row"
              :key="'opponent-cell-' + colIndex"
              :class="getCellClass(cell, false)"
              class="cell"
              @click="makeMove(rowIndex, colIndex)"
            ></div>
          </div>
        </div>
        <h3 class="opponentName" v-if="opponentName !== 'Opponent'">Гравець: <strong>{{ opponentName }}</strong></h3>
      </div>
    </div>

    <!-- Модальное окно победы -->
    <div v-if="winnerModal" class="modal">
      <div class="modal-content">
        <p>{{ winnerMessage }}</p>
        <button @click="startNewGame">Начать сначала</button>
        <button @click="exitGame">Выход</button>
      </div>
    </div>
  </GameLayout>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import TelegramShareButton from '@/components/TelegramShareButton.vue';
import GameLayout from '../GameLayout.vue';
import { url_main_page, url_serv_battle_sea_wss, url_serv_battle_sea } from "@/link";
import ReconnectingWebSocket from 'reconnecting-websocket';
import axios from 'axios';

const myBoard = ref(Array(10).fill(null).map(() => Array(10).fill('')));
const opponentBoard = ref(Array(10).fill(null).map(() => Array(10).fill('')));
const currentTurn = ref(null);
const winner = ref(null);
const winnerModal = ref(false);
const winnerMessage = ref('');
const moveMessageClass = ref('');
const route = useRoute();
const router = useRouter();
const ws = ref(null);
const opponentName = ref('');
const playerLives = ref(20);
const opponentLives = ref(20);
const cornerClass = ref('');

const playerName = ref(localStorage.getItem('playerName') || '');

const roomId = route.params.roomId;
const playerId = route.params.playerId;

const url_connect = `${url_main_page}/battle-sea/connect/${roomId}`;


const isBoardVisible = ref(true); // Управляет видимостью блока

const toggleVisibility = () => {
  isBoardVisible.value = !isBoardVisible.value; // Переключаем видимость

};

const getCellClass = (cell, isMyBoard) => {
  if (cell === 'hit') return 'hit';
  if (cell === 'miss') return 'miss';
  if (cell === 'ship' && isMyBoard) return 'ship';
  return 'empty';
};

const isMyTurn = () => currentTurn.value === playerId;

const makeMove = async (row, col) => {
  if (!isMyTurn()) return;

  console.log(`Making move: row=${row}, col=${col}, playerId=${playerId}`);
  const move = { type: 'move', row, col, playerId };
  ws.value.send(JSON.stringify(move));
};

const handleMoveResponse = (data) => {
  if (data.message === 'miss') {
    moveMessageClass.value = 'miss';
  } else if (data.message === 'hit') {
    moveMessageClass.value = 'ahit';
    opponentLives.value -= 1;
  } else if (data.message === 'sunk') {
    moveMessageClass.value = 'asunk';
    opponentLives.value -= 1;
  }
  cornerClass.value = moveMessageClass.value;

  setTimeout(() => {
    cornerClass.value = 'none';
  }, 700);
};



const startNewGame = async () => {
  try {
    await axios.post(`${url_serv_battle_sea}/api/start-new-game/${roomId}`);
    winnerModal.value = false;
    window.location.reload();
  } catch (error) {
    console.error("Error starting new game:", error);
  }
};

const exitGame = () => {
  router.push('/');
};

onMounted(() => {
  const updateGameState = async (data) => {
    myBoard.value = playerId === data.admin.id ? data.adminBoard : data.playerBoard;
    opponentBoard.value = playerId === data.admin.id ? data.playerBoard : data.adminBoard;
    currentTurn.value = data.current_turn;
    playerLives.value = playerId === data.admin.id ? data.adminLives : data.playerLives;
    opponentLives.value = playerId === data.admin.id ? data.playerLives : data.adminLives;

    opponentName.value = playerId === data.admin.id ? (data.player ? data.player.name : "Opponent") : data.admin.name;

    if (data.winner) {
      winner.value = data.winner;
      winnerModal.value = true;
      winnerMessage.value = data.winner === playerId ? 'Вы победили!' : 'Вы проиграли!';
    }

    if (data.game_started) {
      window.location.reload();  // Обновляем страницу
    }
  };

  const initializeWebSocket = () => {
    console.log(`Connecting to WebSocket for room: ${roomId}, playerId: ${playerId}`);
    ws.value = new ReconnectingWebSocket(`${url_serv_battle_sea_wss}${roomId}/${playerId}`, [], {
      maxRetries: 10,
      minReconnectionDelay: 1000,
    });

    ws.value.onmessage = async (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'move') {
        handleMoveResponse(data);
      }
      await updateGameState(data); 
    };

    ws.value.onclose = () => {
      console.log("WebSocket connection closed");
    };
  };

  initializeWebSocket();
});


onUnmounted(() => {
  if (ws.value) {
    ws.value.close();
  }
});
</script>

<style scoped>

.opponentName {
  margin-top: 5px;
  margin-left: 30px;
}

.my_board {
  display: flex;
  justify-content: space-between;
  margin-bottom: 5px;
}

.shareLocal {
  max-width: 400px;
  display: flex;
  justify-content: center;
  align-content: center;
  align-items: center;
}

.shareLocal h2 {
  margin-left: 30px;
}

.containerFormCreate {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.life-row {
  display: flex;
  justify-content: center;
  margin: 10px 0;
}

.life-dot {
  width: 7px;
  height: 7px;
  background-color: #5d6269;
  border-radius: 50%;
  margin: 0 5px;
}

.game-board {
  border: 2px solid transparent;
}

.board {
  display: grid;
  grid-template-columns: repeat(11, 30px);
}

.row {
  display: grid;
}

.cell {
  width: 30px;
  height: 30px;
  border: .5px solid rgba(59, 55, 55, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
}

.hit {
  background-color: IndianRed;
}

.miss {
  background-color: DodgerBlue;    
}

.ship {
  background-color: DimGrey; 
}

.empty {
  background-color: white;
}

.label {
}

.label-row {
  display: grid;
}

.modal {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: white;
  border: 1px solid black;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
}

.modal-content {
  display: flex;
  flex-direction: column;
  align-items: center;
}

button {
  margin-top: 10px;
  padding: 10px 20px;
  border: none;
  background-color: #007BFF;
  color: white;
  cursor: pointer;
}

button:hover {
  background-color: #0056b3;
}

.turn-indicator {
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 5px 0;
  border: 1px solid;
}

.turn-box {
  padding: 5px 10px;
  border-radius: 12px;
 
}

.your-turn {
  color: SeaGreen;
  background-color: #e0f7e0;
}

.opponent-turn {
  color: IndianRed;
  background-color: #f7e0e0;
}

.amiss {
  background-color: DodgerBlue;
}

.ahit {
  background-color: IndianRed;
}

.asunk {
  background-color: black !important;
}

.corner-none {
  background-color: transparent;
}
</style>
