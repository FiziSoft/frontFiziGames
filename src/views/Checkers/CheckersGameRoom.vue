<template>
  <GameLayout :name-game="$t('games.checkers.name')">
    <div class="containerFormCreate">
      
      <!-- Телеграм кнопка и уведомление -->
      <div v-if="!isPlayerOnline" class="shareLocal">
        <TelegramShareButton 
          description="" 
          :url="url_connect" 
          :text="$t('games.checkers.play_checkers')" 
        ></TelegramShareButton> 
        <h2> &#8592; {{ $t('games.checkers.add_opponent') }} </h2>  
      </div>

      <!-- Игровое поле -->
      <div v-if="isPlayerOnline" class="game-board">
        <div class="my_board"><h3>{{ $t('games.checkers.player') }}: <strong>{{ playerName }}</strong></h3></div>
        <div class="board">
          <div class="label-row">
            <div class="cell label"></div>
            <div v-for="colIndex in 8" :key="'top-label-' + colIndex" class="cell label">
              {{ colIndex }}
            </div>
          </div>
          <div v-for="(row, rowIndex) in board" :key="'row-' + rowIndex" class="row">
            <div class="cell label">{{ String.fromCharCode(65 + rowIndex) }}</div>
            <div
              v-for="(cell, colIndex) in row"
              :key="'cell-' + colIndex"
              :class="getCellClass(cell)"
              class="cell"
              @click="makeMove(rowIndex, colIndex)"
            ></div>
          </div>
        </div>
      </div>

      <!-- Индикатор хода -->
      <div class="turn-indicator" v-if="isPlayerOnline">
        <div v-if="isMyTurn()" class="turn-box your-turn">{{ $t('games.checkers.your_turn') }}</div>
        <div v-else class="turn-box opponent-turn">{{ $t('games.checkers.opponent_turn') }}</div>
      </div>

      <!-- Информация об оппоненте -->
      <h3 class="opponentName" v-if="opponentName !== 'Opponent'">
        {{ $t('games.checkers.opponent') }}: <strong>{{ opponentName }}</strong>
      </h3>

      <!-- Модальное окно победы -->
      <div v-if="winnerModal" class="modal">
        <div class="modal-content">
          <p class="win_text">{{ winnerMessage }}</p>
          <div style="width: 200px;">
            <div class="btn-grad" @click="startNewGame">{{ $t('games.checkers.start_new_game') }}</div>
            <div class="btn-grad" @click="exitGame">{{ $t('games.checkers.exit') }}</div>
          </div>
        </div>
      </div>
    </div>
  </GameLayout>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import GameLayout from '../GameLayout.vue';
import ReconnectingWebSocket from 'reconnecting-websocket';
import axios from 'axios';
import { useI18n } from 'vue-i18n';
import { url_main_page, url_serv_checkers_wss } from "@/link";
import TelegramShareButton from '@/components/TelegramShareButton.vue';

const { t, locale } = useI18n();
const route = useRoute();
const router = useRouter();

const playerName = ref(localStorage.getItem('playerName') || '');
const isPlayerOnline = ref(false);
const board = ref(Array(8).fill(null).map(() => Array(8).fill('')));
const currentTurn = ref(null);
const winner = ref(null);
const winnerModal = ref(false);
const winnerMessage = ref('');
const opponentName = ref('');
const selectedPiece = ref(null);  // Добавляем переменную для отслеживания выбранной фишки
const roomId = route.params.roomId;
const playerId = route.params.playerId;
const ws = ref(null);

// Устанавливаем ссылку для подключения игрока
const url_connect = `${url_main_page}/checkers/connect/${roomId}`;

// Проверка чья очередь ходить
const isMyTurn = () => currentTurn.value === playerId;

// Определение класса клетки на доске
const getCellClass = (cell, row, col) => {
    if (cell.includes('selected')) return 'selected-piece';
    if (cell === 'black-piece') return 'black-piece';
    if (cell === 'white-piece') return 'white-piece';
    if (cell === 'black-king') return 'black-king';
    if (cell === 'white-king') return 'white-king';
    return (row + col) % 2 === 1 ? 'dark-cell' : 'light-cell';  // Раскрашиваем клетки
};

// Обработка хода
const makeMove = async (row, col) => {
    if (!selectedPiece.value) {
        const piece = board.value[row][col];
        if (isMyTurn() && (piece === 'black-piece' || piece === 'white-piece' || piece === 'black-king' || piece === 'white-king')) {
            if (piece.startsWith(playerId)) {  // Выбираем только свои фишки
                selectedPiece.value = { row, col };
                console.log(`Selected piece at row ${row}, col ${col}`);
                highlightSelectedPiece(row, col);  // выделение фишки
            }
        } else {
            console.log("No piece to select at this position.");
        }
        return;
    }

    if (selectedPiece.value.row === row && selectedPiece.value.col === col) {
        // Снимаем выделение, если та же фишка была выбрана повторно
        clearHighlightedPiece();
        selectedPiece.value = null;
        return;
    }

    // Если фишка уже выбрана, пытаемся сделать ход
    const move = { type: 'move', row, col, playerId, fromRow: selectedPiece.value.row, fromCol: selectedPiece.value.col };
    console.log("Sending move:", move);
    ws.value.send(JSON.stringify(move));
    selectedPiece.value = null; // сбрасываем выбор после попытки хода
};

// Функция для выделения выбранной фишки
const highlightSelectedPiece = (row, col) => {
    board.value[row][col] = `${board.value[row][col]} selected`;
};

// Функция для снятия выделения с фишки
const clearHighlightedPiece = () => {
    const { row, col } = selectedPiece.value;
    board.value[row][col] = board.value[row][col].replace(' selected', '');
};

// Обновление состояния игры
const updateGameState = (data) => {
    console.log("Updating game state with data:", data);

    if (data && data.Connections && data.Players) {
        if (Object.keys(data.Connections).length === 2) {
            isPlayerOnline.value = true;  // Запускаем игру, показываем доску
        }

        board.value = data.Board || Array(8).fill(null).map(() => Array(8).fill(''));
        currentTurn.value = data.CurrentTurn || playerId;

        const players = Object.keys(data.Players);
        const opponentKey = players.find(key => key !== playerId);

        if (opponentKey && data.Players[opponentKey]) {
            opponentName.value = data.Players[opponentKey].Name || "Opponent";
        } else {
            opponentName.value = "Opponent";
        }

        if (data.winner) {
            winner.value = data.winner;
            winnerModal.value = true;
            winnerMessage.value = data.winner === playerId ? t('games.checkers.game_won') : t('games.checkers.game_lost');
        }
    } else {
        console.error("Received invalid game state data:", data);
    }
};

// Подключение к WebSocket
const initializeWebSocket = () => {
    ws.value = new ReconnectingWebSocket(`${url_serv_checkers_wss}/ws/${roomId}/${playerId}`, [], {
        maxRetries: 10,
        minReconnectionDelay: 1000,
    });

    ws.value.onopen = () => {
        console.log("WebSocket connection opened");
    };

    ws.value.onmessage = async (event) => {
        const data = JSON.parse(event.data);
        updateGameState(data);  // Обновление состояния игры при каждом сообщении
    };

    ws.value.onerror = (error) => {
        console.error("WebSocket error:", error);
    };

    ws.value.onclose = (event) => {
        console.log("WebSocket connection closed with code:", event.code, "reason:", event.reason);
        isPlayerOnline.value = false;
    };

    // Отправка пинг каждые 5 секунд
    setInterval(() => {
        if (ws.value && ws.value.readyState === WebSocket.OPEN) {
            console.log("Sending ping...");
            ws.value.send(JSON.stringify({ type: 'ping' }));
        }
    }, 15000);
};

onMounted(() => {
    initializeWebSocket();
});

onUnmounted(() => {
    if (ws.value) {
        ws.value.close();
    }
});
</script>

<style scoped>
.containerFormCreate {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 20px;
}

.shareLocal {
    margin-bottom: 20px;
    text-align: center;
}

.game-board {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-top: 20px;
}

.my_board {
    margin-bottom: 10px;
}

.board {
    display: grid;
    grid-template-columns: repeat(9, 50px);
    grid-template-rows: repeat(9, 50px);
    gap: 2px;
}

.cell {
    width: 50px;
    height: 50px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid #000;
}

.label-row .cell.label {
    border: none;
    font-weight: bold;
    text-align: center;
}

.cell.label {
    background-color: #f0f0f0;
}

.cell.dark-cell {
    background-color: #8b4513;
}

.cell.light-cell {
    background-color: #f5deb3;
}

.cell.empty {
    background-color: #fff;
}

.cell.black-piece {
    background-color: #000;
    border-radius: 50%;
}

.cell.white-piece {
    background-color: #fff;
    border-radius: 50%;
    border: 2px solid #000;
}

.cell.black-king,
.cell.white-king {
    position: relative;
}

.cell.black-king::after,
.cell.white-king::after {
    content: "K";
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-weight: bold;
    color: red;
}

.selected-piece {
    border: 3px solid yellow;
    box-shadow: 0 0 10px yellow;
}

.turn-indicator {
    margin-top: 10px;
    text-align: center;
}

.turn-box {
    padding: 10px 20px;
    border-radius: 10px;
    font-weight: bold;
}

.your-turn {
    background-color: #8bc34a;
    color: #fff;
}

.opponent-turn {
    background-color: #f44336;
    color: #fff;
}

.opponentName {
    margin-top: 15px;
    font-size: 18px;
}

.modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
}

.modal-content {
    background-color: #fff;
    padding: 20px;
    border-radius: 10px;
    text-align: center;
}

.win_text {
    font-size: 24px;
    margin-bottom: 20px;
}

.btn-grad {
    background: linear-gradient(90deg, #ff8a00, #e52e71);
    color: white;
    padding: 10px 20px;
    margin: 10px;
    border-radius: 25px;
    cursor: pointer;
    text-align: center;
    font-weight: bold;
}

.btn-grad:hover {
    opacity: 0.8;
}
</style>
