<template>
    <GameLayout nameGame="Шпіон">
      <div class="container">
        <p>Тема гри: <strong> {{ selectedTheme }}</strong></p>
        <p v-if="!timerStarted">Вже знають слово: {{ knownPlayersCount }} / {{ numPlayers }}</p>
        <div v-if="!gameStarted">
          <div v-if="showWord">
            <h2 class="currentWord" v-if="isSpy">Ти шпіон!</h2>
            <h2 class="currentWord" v-else>{{ currentWord }}</h2>
            <button @click="nextPlayer" class="btn-round">Сховати</button>
          </div>
          <div v-else>
            <button @click="revealWord" class="btn-round">Побачити</button>
          </div>
        </div>
        <div v-else>
          <div v-if="!timerStarted && isLastPlayer">
            <button @click="startTimer" class="btn-round">Почати гру</button>
          </div>
          <div v-else>
            <TimerFiziLocal ref="timer" :timeInSeconds="remainingTime" :autoStart="timerStarted" @time-up="timeUp" />
            <div v-if="!isSpy" class="word-list">
              <!-- <h2>Список слів теми:</h2> -->
              <ul>
                <li v-for="(word, index) in themeWords" :key="index">{{ word }}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </GameLayout>
  </template>
  
  <script setup>
  import { ref, computed, onMounted, watch } from 'vue';
  import { useRouter, useRoute } from 'vue-router';
  import { v4 as uuidv4 } from 'uuid';
  import GameLayout from "../GameLayout.vue";
  import TimerFiziLocal from '@/components/TimerFiziLocal.vue';
  import themeData from './theme.json'; // Предполагается, что слова для тем хранятся в этом JSON
  
  const router = useRouter();
  const route = useRoute();
  const playerName = ref(localStorage.getItem('playerName') || '');
  const numPlayers = ref(0);
  const selectedTheme = ref('');
  const currentWord = ref('');
  const themeWords = ref([]);
  const isSpy = ref(false);
  const showWord = ref(false);
  const gameStarted = ref(false);
  const knownPlayersCount = ref(0);
  const timerStarted = ref(false);
  const remainingTime = ref(300);
  const timerRef = ref(null);
  const playerIndex = ref(parseInt(localStorage.getItem('playerIndex')) || 0);
  const spyIndex = ref(-1);
  
  const initializeRoom = () => {
    const roomId = route.params.idRoom;
    if (!roomId) {
      const newRoomId = uuidv4();
      localStorage.setItem('spyRoomId', newRoomId);
      router.push({ name: 'spyOfflineRoom', params: { idRoom: newRoomId } });
    } else {
      localStorage.setItem('spyRoomId', roomId);
    }
    numPlayers.value = parseInt(localStorage.getItem('numPlayers')) || 0;
    selectedTheme.value = localStorage.getItem('selectedTheme') || '';
    currentWord.value = localStorage.getItem('currentWord') || '';
    remainingTime.value = parseInt(localStorage.getItem('remainingTime')) || 0;
    knownPlayersCount.value = parseInt(localStorage.getItem('knownPlayersCount')) || 0;
    gameStarted.value = localStorage.getItem('gameStarted') === 'true';
    timerStarted.value = localStorage.getItem('timerStarted') === 'true';
    playerIndex.value = parseInt(localStorage.getItem('playerIndex')) || 0;
  
    if (spyIndex.value === -1) {
      spyIndex.value = Math.floor(Math.random() * numPlayers.value);
      localStorage.setItem('spyIndex', spyIndex.value);
    } else {
      spyIndex.value = parseInt(localStorage.getItem('spyIndex'));
    }
  
    isSpy.value = playerIndex.value === spyIndex.value;
    localStorage.setItem('isSpy', isSpy.value.toString());
  
    // Load words from selected theme
    themeWords.value = themeData[selectedTheme.value] || [];
    localStorage.setItem('themeWords', JSON.stringify(themeWords.value));
  };
  
  const revealWord = () => {
    showWord.value = true;
    localStorage.setItem('showWord', 'true');
  };
  
  const nextPlayer = () => {
    showWord.value = false;
    if (knownPlayersCount.value < numPlayers.value - 1) {
      knownPlayersCount.value++;
      playerIndex.value++;
      localStorage.setItem('knownPlayersCount', knownPlayersCount.value);
      localStorage.setItem('playerIndex', playerIndex.value);
      isSpy.value = playerIndex.value === spyIndex.value;
      localStorage.setItem('isSpy', isSpy.value.toString());
    } else {
      knownPlayersCount.value++;
      localStorage.setItem('knownPlayersCount', knownPlayersCount.value);
      gameStarted.value = true;
      localStorage.setItem('gameStarted', 'true');
    }
  };
  
  const startTimer = () => {
    timerStarted.value = true;
    localStorage.setItem('timerStarted', 'true');
    if (timerRef.value) {
      timerRef.value.start();
    }
  };
  
  const timeUp = () => {
    console.log('Time is up!');
  };
  
  const isLastPlayer = computed(() => {
    return knownPlayersCount.value === numPlayers.value;
  });
  
  watch([gameStarted, timerStarted, remainingTime], ([newGameStarted, newTimerStarted, newRemainingTime]) => {
    localStorage.setItem('gameStarted', newGameStarted.toString());
    localStorage.setItem('timerStarted', newTimerStarted.toString());
    localStorage.setItem('remainingTime', newRemainingTime.toString());
  });
  
  onMounted(() => {
    initializeRoom();
  });
  </script>
  
  <style scoped>
  .container {
    text-align: center;
    font-size: x-large;
  }
  
  .currentWord {
    color: brown;
    font-size: 2.5em;
    font-weight: 100;
  }
  
  .btn-round {
    display: inline-block;
    width: 200px;
    height: 200px;
    font-size: 24px;
    border-radius: 50%;
    background-color: SeaGreen;
    color: white;
    cursor: pointer;
    margin-top: 20px;
    box-shadow: 1px 7px 18px rgba(0, 0, 0, 0.7);
    transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
  }
  
  .btn-round:hover {
    transform: scale(1.05);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.3);
  }
  
  h2 {
    margin: 20px 0;
  }
  
 
  
  .word-list {
    
  }
  
  .word-list ul {
    list-style-type: none;
    padding: 0;
  }
  
  .word-list li {
    font-size: 1.2em;
    margin: 5px 0;
  }
  </style>
  