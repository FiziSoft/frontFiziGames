<template>
  <GameLayout name-game="Морський Бій">
    <div class="containerFormCreate">
      <div class="game-board" :class="currentTurnClass('my')">
        <h3>Гравець {{ playerName }}</h3>
        <br>
        <div class="board">
          <div class="label-row">
            <div :class="['cell', 'label', currentTurnClassLabel('my')]"></div>
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
      <div class="shareLocal" v-show="!opponentName">
        <ShareButton :url="url_connect" text="Давай грати в Морський Бій"></ShareButton> 
        <h2>  &#8592;	  Додай собі оппонента </h2>  
      </div>
      <div class="game-board" :class="currentTurnClass('opponent')">
        <h3>Гравець {{ opponentName }}</h3>
        <br>
        <div class="board">
          <div class="label-row">
            <div :class="['cell', 'label', currentTurnClassLabel('opponent')]"></div>
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

const myBoard = ref(Array(10).fill(null).map(() => Array(10).fill('')));
const opponentBoard = ref(Array(10).fill(null).map(() => Array(10).fill('')));
const currentTurn = ref(null);
const winner = ref(null);
const winnerModal = ref(false);
const winnerMessage = ref('');
const route = useRoute();
const router = useRouter();
const ws = ref(null);
const opponentName = ref('');

const playerName = ref(localStorage.getItem('playerName') || '');

const roomId = route.params.roomId;
const playerId = route.params.playerId;

const url_connect = `https://fizi.cc/battle-sea/connect/${roomId}`;
// const url_connect = `http://localhost:8080/battle-sea/connect/${roomId}`;

// const url_serv = "http://localhost:7001";  // или ваш сервер
const url_serv = "https://seabattle-acb2eb1faa50.herokuapp.com";

const getCellClass = (cell, isMyBoard) => {
  if (cell === 'hit') return 'hit';
  if (cell === 'miss') return 'miss';
  if (cell === 'ship' && isMyBoard) return 'ship';
  return 'empty';
};

const currentTurnClass = (board) => {
  if (currentTurn.value === playerId && board === 'opponent') {
    return 'current-turn';
  }
  if (currentTurn.value !== playerId && board === 'my') {
    return 'opponent-turn';
  }
  return '';
};

const currentTurnClassLabel = (board) => {
  if (currentTurn.value === playerId && board === 'opponent') {
    return 'label-current-turn';
  }
  if (currentTurn.value !== playerId && board === 'my') {
    return 'label-opponent-turn';
  }
  return '';
};

const makeMove = async (row, col) => {
  try {
    console.log(`Making move: row=${row}, col=${col}, playerId=${playerId}`);
    await axios.post(`${url_serv}/api/move/${roomId}`, {
      row,
      col,
      playerId
    });
    await updateGameState(); // Обновляем состояние игры после хода
  } catch (error) {
    console.error("Error making move:", error);
    if (error.response && error.response.status === 403) {
      console.error("Не ваш ход или недопустимый ход.");
    }
  }
};

const updateGameState = async () => {
  try {
    const response = await axios.get(`${url_serv}/api/game-state/${roomId}`, {
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
  // ws.value = new WebSocket(`ws://localhost:7001/ws/${roomId}/${playerId}`);
  ws.value = new WebSocket(`wss://seabattle-acb2eb1faa50.herokuapp.com/ws/${roomId}/${playerId}`);

  ws.value.onmessage = (event) => {
    const data = JSON.parse(event.data);
    currentTurn.value = data.current_turn;
    myBoard.value = playerId === data.admin.id ? data.adminBoard : data.playerBoard;
    opponentBoard.value = playerId === data.admin.id ? data.playerBoard : data.adminBoard;
    opponentName.value = playerId === data.admin.id ? data.player.name : data.admin.name;
    if (data.player_joined && playerId === data.admin.id) {
      window.location.reload();
    }
    if (data.winner) {
      winner.value = data.winner;
      winnerModal.value = true;
      winnerMessage.value = data.winner === playerId ? 'Вы победили!' : 'Вы проиграли!';
    }
  };
};

const startNewGame = async () => {
  try {
    await axios.post(`${url_serv}/api/start-new-game/${roomId}`);
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
  axios.get(`${url_serv}/api/game-state/${roomId}`, {
    params: { playerId }
  })
  .then(response => {
    currentTurn.value = response.data.current_turn;
    myBoard.value = playerId === response.data.admin.id ? response.data.adminBoard : response.data.playerBoard;
    opponentBoard.value = playerId === response.data.admin.id ? response.data.playerBoard : response.data.adminBoard;
    opponentName.value = playerId === response.data.admin.id ? response.data.player.name : response.data.admin.name;
  })
  .catch(error => {
    console.error("Error fetching game state:", error);
  });
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

.game-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
}

.game-board {
  margin-bottom: 20px;
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

.current-turn {
  border: 2px solid SeaGreen;
  padding: 10px;
}

.opponent-turn {
  border: 2px solid IndianRed;
  padding: 10px;
}

.label-current-turn {
  background-color: SeaGreen;
}

.label-opponent-turn {
  background-color: IndianRed;
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
</style>
