<template>
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
      <button class="btn-grad" @click="startGame" :disabled="isRunning">Start</button>
      <p v-if="isRunning">Time left: {{ timeLeft }}s</p>
    </div>
    <div v-if="gameOver" class="modal">
      <button class="btn-grad" @click="playerAnswered(true)">Смог ответить</button>
      <button class="btn-grad" @click="playerAnswered(false)">Не смог ответить</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import questions from './questions.json'

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
}

const playerAnswered = (answeredCorrectly) => {
  if (answeredCorrectly) {
    five_second_users.value[currentPlayer.value].score += 1
  }
  nextQuestion()
}

onMounted(() => {
  const roomId = route.params.roomId
  // Load players from localStorage
  const players = JSON.parse(localStorage.getItem('five_second_users')) || []
  five_second_users.value = players.map(player => ({ ...player, score: 0 }))
  if (!currentQuestion.value) {
    currentQuestion.value = questions[Math.floor(Math.random() * questions.length)]
  }
})
</script>

<style scoped>
.game-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  color: black;
}

.card {
  background-color: #f9f9f9;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 20px;
  margin: 20px 0;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.controls {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 20px;
}

.btn-grad {
  padding: 10px 20px;
  font-size: 16px;
  margin: 10px;
  cursor: pointer;
}

.btn-grad:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.modal {
  background-color: rgba(0, 0, 0, 0.8);
  color: white;
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

.player-list {
  margin-bottom: 20px;
}

.player-list div {
  margin: 5px 0;
}

.current-player {
  font-weight: bold;
  background-color: #d3d3d3;
  padding: 5px;
  border-radius: 5px;
}
</style>
