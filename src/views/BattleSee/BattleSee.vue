<template>
  <GameLayout name-game="Морський Бій">
    <div class="containerFormCreate">
      <div class="game-board">
        <h3>Гравець <strong>{{ playerName }}</strong></h3>
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

      <div v-if="!opponentName" class="shareLocal">
        <ShareButton :url="url_connect" text="Давай грати в Морський Бій"></ShareButton> 
        <h2> &#8592; Додай собі оппонента </h2>  
      </div>

      <div class="turn-indicator">
        <div v-if="isMyTurn()" class="turn-box your-turn">Ваш хід</div>
        <div v-else class="turn-box opponent-turn">Хід опонента</div>
      </div>

      <div class="game-board">
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
        <h3>Гравець <strong>{{ opponentName }}</strong></h3>
      </div>
    </div>

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
import axios from 'axios';
import ShareButton from '@/components/ShareButton.vue';
import GameLayout from '../GameLayout.vue';
import { url_main_page, url_serv_battle_sea, url_serv_battle_sea_wss } from "@/link";
import ReconnectingWebSocket from 'reconnecting-websocket';

const myBoard = ref(Array(10).fill(null).map(() => Array(10).fill('')));
const opponentBoard = ref(Array(10).fill(null).map(() => Array(10).fill('')));
const currentTurn = ref(null);
const winner = ref(null);
const winnerModal = ref(false);
const winnerMessage = ref('');
const moveMessage = ref('');
const moveMessageClass = ref('');
const route = useRoute();
const router = useRouter();
const ws = ref(null);
const opponentName = ref('');
const cornerClass = ref('');

const playerName = ref(localStorage.getItem('playerName') || '');

const roomId = route.params.roomId;
const playerId = route.params.playerId;

const url_connect = `${url_main_page}/battle-sea/connect/${roomId}`;

const getCellClass = (cell, isMyBoard) => {
  if (cell === 'hit') return 'hit';
  if (cell === 'miss') return 'miss';
  if (cell === 'ship' && isMyBoard) return 'ship';
  return 'empty';
};

const isMyTurn = () => {

  return currentTurn.value === playerId;
  
};

const makeMove = async (row, col) => {
  try {
    console.log(`Making move: row=${row}, col=${col}, playerId=${playerId}`);
    const response = await axios.post(`${url_serv_battle_sea}/api/move/${roomId}`, {
      row,
      col,
      playerId
    });
    handleMoveResponse(response.data);
    await updateGameState(); // Обновляем состояние игры после хода
  } catch (error) {
    console.error("Error making move:", error);
    if (error.response && error.response.status === 403) {
      console.error("Не ваш ход или недопустимый ход.");
    }
  }
};

const handleMoveResponse = (data) => {

  console.log(data.message)
  if (data.message === 'miss') {
    moveMessageClass.value = 'miss';
  } else if (data.message === 'hit') {
    moveMessageClass.value = 'ahit';
  } else if (data.message === 'sunk') {
    moveMessageClass.value = 'asunk';
  }
  cornerClass.value = moveMessageClass.value;

  setTimeout(() => {
    cornerClass.value = 'none';

  }, 700);
};

const updateGameState = async () => {
  try {
    const response = await axios.get(`${url_serv_battle_sea}/api/game-state/${roomId}`, {
      params: { playerId }
    });
    const data = response.data;
    // Обновляем состояние досок и другой информации в компоненте
    myBoard.value = playerId === data.admin.id ? data.adminBoard : data.playerBoard;
    opponentBoard.value = playerId === data.admin.id ? data.playerBoard : data.adminBoard;
    currentTurn.value = data.current_turn;
    opponentName.value = playerId === data.admin.id ? data.player.name : data.admin.name;
    
    if (data.winner) {
      winner.value = data.winner;
      winnerModal.value = true;
      winnerMessage.value = data.winner === playerId ? 'Вы победили!' : 'Вы проиграли!';
    }
  } catch (error) {
    console.error("Error fetching game state:", error);
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
    } else {
      currentTurn.value = data.current_turn;
    }
    await updateGameState(); // Обновляем состояние игры при получении сообщения
  };

  setInterval(() => {
    updateGameState();
  }, 2000);

  ws.value.onclose = () => {
    console.log("WebSocket connection closed");
  };
};

const startNewGame = async () => {
  try {
    await axios.post(`${url_serv_battle_sea}/api/start-new-game/${roomId}`);
    winnerModal.value = false;
    window.location.reload();
  } catch (error) {
    console.error("Error starting new game:", error);
  }

  setTimeout(() => {
    moveMessage.value = '';
  }, 700);
};

const exitGame = () => {
  router.push('/');
};

onMounted(() => {
  updateGameState();
  initializeWebSocket();
});

onUnmounted(() => {
  if (ws.value) {
    ws.value.close();
  }
});
</script>

<style scoped>




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

.game-board {
  border: 2px solid transparent;
}

.board {
  display: grid;
  grid-template-columns: repeat(11, 30px); /* 10 columns + 1 for labels */
}

.row {
  display: grid;
}

.cell {
  width: 30px;
  height: 30px;
  border: 1px solid rgba(59, 55, 55, 0.7);
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
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
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

/* @media (max-width: 768px) {
  .containerFormCreate {    flex-direction: column;
  }
  
  .game-board {
    max-width: 360px;
  }

  .board {
    grid-template-columns: repeat(11, 20px);
  }

  .cell {
    width: 20px;
    height: 20px;
  }
} */
</style>
