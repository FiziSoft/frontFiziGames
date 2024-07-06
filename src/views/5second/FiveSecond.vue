<template>
  <GameLayout nameGame="5 секунд">
    <div class="game-container">
      <div class="player-list">
        <div v-for="(player, index) in five_second_users" :key="index" :class="{'current-player': index === currentPlayer}">
          <p>{{ player.name }} - {{ player.score }} очков</p>
        </div>
      </div>

      <div class="card" v-if="currentQuestion && !gameOver">
        <p>{{ currentQuestion.question }}</p>
      </div>
      <div class="controls" v-if="!gameOver">
        <button class="btn-grad" @click="startGame" :disabled="isRunning">Почати</button>
        <p v-if="isRunning" class="timer">{{ timeLeft }}</p>
      </div>
      <div v-if="gameOver" class="modal">
        <button class="btn-grad" @click="playerAnswered(true)">+</button>
        <button class="btn-grad" @click="playerAnswered(false)">-</button>
      </div>
    </div>
  </GameLayout>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import questions from './questions.json'
import GameLayout from '../GameLayout.vue'

// Импорт аудиофайла
import alarmSound from '@/assets/sound/alarm.mp3'

const alarm = new Audio(alarmSound)

const route = useRoute()
const router = useRouter()

const currentQuestion = ref(null)
const timeLeft = ref(5)
const isRunning = ref(false)
const gameOver = ref(false)
const currentPlayer = ref(0)
const five_second_users = ref([])

let timer = null

const startGame = () => {
  if (isRunning.value) return

  isRunning.value = true
  gameOver.value = false
  timeLeft.value = 5

  timer = setInterval(() => {
    if (timeLeft.value > 0) {
      timeLeft.value--
    } else {
      clearInterval(timer)
      isRunning.value = false
      gameOver.value = true
      alarm.play() // Проигрывание аудио
    }
  }, 1000)
}

const nextQuestion = () => {
  currentQuestion.value = questions[Math.floor(Math.random() * questions.length)]
  gameOver.value = false
  currentPlayer.value = (currentPlayer.value + 1) % five_second_users.value.length
  saveGameState()
}

const playerAnswered = (answeredCorrectly) => {
  if (answeredCorrectly) {
    five_second_users.value[currentPlayer.value].score += 1
  }
  nextQuestion()
}

const saveGameState = () => {
  const gameState = {
    currentPlayer: currentPlayer.value,
    five_second_users: five_second_users.value,
    roomId: route.params.roomId
  }
  localStorage.setItem('five_second_game_state', JSON.stringify(gameState))
}

const loadGameState = () => {
  const savedState = localStorage.getItem('five_second_game_state')
  if (savedState) {
    const gameState = JSON.parse(savedState)
    currentPlayer.value = gameState.currentPlayer
    five_second_users.value = gameState.five_second_users.map(user => ({ ...user, score: user.score || 0 }));
  }
}

const clearGameState = () => {
  localStorage.removeItem('five_second_game_state')
}

onMounted(() => {
  const roomId = route.params.roomId
  // Load players from localStorage
  const savedUsers = JSON.parse(localStorage.getItem('five_second_users')) || []
  five_second_users.value = savedUsers.map(user => ({ ...user, score: user.score || 0 }))
  loadGameState()
  if (!currentQuestion.value) {
    currentQuestion.value = questions[Math.floor(Math.random() * questions.length)]
  }
})

watch(five_second_users, saveGameState, { deep: true })
watch(currentPlayer, saveGameState)

router.beforeEach((to, from, next) => {
  if (to.name === 'five-second-room' && from.name !== 'five-second-room') {
    clearGameState()
  }
  next()
})
</script>

<style scoped>
:root {
  --bg-color: #f9f9f9;
  --text-color: #000;
  --btn-bg-color: linear-gradient(to right, #ff758c, #ff7eb3);
  --modal-bg-color: rgba(0, 0, 0, 0.8);
}

[data-theme="dark"] {
  --bg-color: #333;
  --text-color: #fff;
  --btn-bg-color: linear-gradient(to right, #6a11cb, #2575fc);
  --modal-bg-color: rgba(255, 255, 255, 0.8);
}

[data-theme="light"] {
  --bg-color: #f9f9f9;
  --text-color: #000;
  --btn-bg-color: linear-gradient(to right, #ffdd00, #fbb034);
  --modal-bg-color: rgba(0, 0, 0, 0.8);
}

.game-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100vh;
  padding: 10px;
  color: var(--text-color);
}

.card {
  background-color: #fff; /* Устанавливаем белый фон для карточки */
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 20px;
  margin: 20px 0;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  width: 80%;
  max-width: 450px;
  min-height: 100px;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #000 !important;
}

.card p {
  font-size: 1.5em; /* Увеличиваем размер текста */
}

.controls {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 20px;
}


.modal {
  background-color: var(--modal-bg-color);
  color: var(--text-color);
  padding: 20px;
  border-radius: 8px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1000;
}

.timer {
  font-weight: 100;
  font-size: 50px; /* Увеличиваем размер таймера */
  color: var(--text-color);
}

.player-list {
  margin-bottom: 20px;
}

.player-list div {
  margin: 10px 0; /* Увеличиваем отступы между игроками */
  color: var(--text-color); /* Устанавливаем цвет текста для всех игроков */
  font-size: 1.2em; /* Увеличиваем размер текста для списка игроков */
}

.current-player {
  font-weight: bold;
  background-color: #d3d3d3;
  padding: 10px; /* Увеличиваем отступы для текущего игрока */
  border-radius: 5px;
  color: black !important; /* Устанавливаем черный цвет текста для текущего игрока */
}

@media (max-width: 768px) {
  .card {
    padding: 15px;
    font-size: 18px; /* Увеличиваем размер текста в карточке на планшетах */
  }
  .btn-grad {
    font-size: 18px; /* Увеличиваем размер текста кнопок на планшетах */
    padding: 12px 24px; /* Увеличиваем размер кнопок на планшетах */
  }
  .timer {
    font-size: 40px; /* Увеличиваем размер таймера на планшетах */
  }
}

@media (max-width: 480px) {
  .card {
    padding: 20px;
    font-size: 16px; /* Увеличиваем размер текста в карточке на мобильных устройствах */
  }
  .btn-grad {
    font-size: 16px; /* Увеличиваем размер текста кнопок на мобильных устройствах */
    padding: 10px 20px; /* Увеличиваем размер кнопок на мобильных устройствах */
  }
  .timer {
    font-size: 35px; /* Увеличиваем размер таймера на мобильных устройствах */
  }
  .player-list div {
    font-size: 1.5em; /* Увеличиваем размер текста для списка игроков на мобильных устройствах */
  }
}
</style>
