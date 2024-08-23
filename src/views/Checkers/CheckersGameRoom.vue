<template>
    <GameLayout name-game="Checkers">
      <div class="checkers-board">
        <div v-for="(row, rowIndex) in displayBoard" :key="rowIndex" class="row">
          <div v-for="(cell, cellIndex) in row" :key="cellIndex" :class="['cell', cell.color]" @click="handleClick(rowIndex, cellIndex)">
            <span v-if="cell.piece" :class="['piece', cell.piece]"></span>
          </div>
        </div>
      </div>
      <div class="game-info">
        <div>Current Turn: {{ currentTurn }}</div>
      </div>
    </GameLayout>
  </template>
  
  <script setup>
  import { ref, computed } from 'vue';
  import { useRoute } from 'vue-router';
  import GameLayout from "../GameLayout.vue";
  
  const route = useRoute();
  
  // Данные игрока и комнаты
  const playerId = route.params.playerId;
  const roomId = route.params.roomId;
  
  // Стартовое состояние доски
  const initialBoard = [
    // 8x8 массив для шашек. 'p' - для игрока 1, 'P' - для игрока 2
    [{ piece: 'p' }, { piece: null }, { piece: 'p' }, { piece: null }, { piece: 'p' }, { piece: null }, { piece: 'p' }, { piece: null }],
    [{ piece: null }, { piece: 'p' }, { piece: null }, { piece: 'p' }, { piece: null }, { piece: 'p' }, { piece: null }, { piece: 'p' }],
    [{ piece: 'p' }, { piece: null }, { piece: 'p' }, { piece: null }, { piece: 'p' }, { piece: null }, { piece: 'p' }, { piece: null }],
    [{ piece: null }, { piece: null }, { piece: null }, { piece: null }, { piece: null }, { piece: null }, { piece: null }, { piece: null }],
    [{ piece: null }, { piece: null }, { piece: null }, { piece: null }, { piece: null }, { piece: null }, { piece: null }, { piece: null }],
    [{ piece: null }, { piece: 'P' }, { piece: null }, { piece: 'P' }, { piece: null }, { piece: 'P' }, { piece: null }, { piece: 'P' }],
    [{ piece: 'P' }, { piece: null }, { piece: 'P' }, { piece: null }, { piece: 'P' }, { piece: null }, { piece: 'P' }, { piece: null }],
    [{ piece: null }, { piece: 'P' }, { piece: null }, { piece: 'P' }, { piece: null }, { piece: 'P' }, { piece: null }, { piece: 'P' }],
  ];
  
  const board = ref(initialBoard);
  const currentTurn = ref('Player 1');
  
  // Обратная сторона доски для второго игрока
  const isPlayerOne = true; // Установить в зависимости от ID игрока
  const displayBoard = computed(() => {
    return isPlayerOne ? board.value : board.value.slice().reverse();
  });
  
  const handleClick = (rowIndex, cellIndex) => {
    console.log(`Clicked cell: (${rowIndex}, ${cellIndex})`);
    // Добавьте логику для обработки кликов по клеткам доски
  };
  
  </script>
  
  <style scoped>
  .checkers-board {
    display: grid;
    grid-template-columns: repeat(8, 1fr);
    gap: 2px;
    max-width: 400px;
    margin: 0 auto;
  }
  
  .row {
    display: contents;
  }
  
  .cell {
    width: 50px;
    height: 50px;
    background-color: #d18b47;
  }
  
  .cell:nth-child(even) {
    background-color: #ffce9e;
  }
  
  .piece {
    display: block;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    margin: 5px auto;
  }
  
  .p {
    background-color: black;
  }
  
  .P {
    background-color: white;
  }
  
  .game-info {
    text-align: center;
    margin-top: 20px;
    font-size: 1.2em;
  }
  </style>
  