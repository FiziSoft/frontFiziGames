<template>
  <GameLayout :nameGame="$t('games.five_second.name')">
    <div class="game-container">
      <div class="player-list">
        <div v-for="(player, index) in five_second_users" :key="index" :class="{'current-player': index === currentPlayer}">
          <p>{{ player.name }} - {{ player.score }} {{ $t('games.five_second.score') }}</p>
        </div>
      </div>

      <div class="card" v-if="currentQuestion && !gameOver">
        <h3 class="gameTypeText">{{ $t('games.five_second.game_type_3') }}</h3>
        <p><strong>{{ currentQuestion.question }}</strong></p>
      </div>

      <div class="controls" v-if="!gameOver">
        <button class="btn-grad" v-if="!isRunning" @click="startGame">{{ $t('games.five_second.start_game') }}</button>
        <button class="btn-icon" v-if="!isRunning" @click="refreshQuestion">
          <i style="margin-top: 15px;" class="fa fa-refresh"></i>
        </button>
        <p v-if="isRunning" class="timer">{{ timeLeft }}</p>
      </div>

      <div v-if="gameOver" class="modal yes_or_not_div">
        <button class="btn-grad" @click="playerAnswered(true)">{{ $t('games.five_second.answer_correct') }}</button>
        <button class="btn-grad" @click="playerAnswered(false)">{{ $t('games.five_second.answer_wrong') }}</button>
      </div>
    </div>
  </GameLayout>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import GameLayout from '../GameLayout.vue'

// eslint-disable-next-line
import alarmSound from '@/assets/sound/tic5sec.mp3'







const alarm = new Audio(alarmSound)

const { t, locale } = useI18n()
const route = useRoute()
const router = useRouter()

const currentQuestion = ref(null)
const timeLeft = ref(5)
const isRunning = ref(false)
const gameOver = ref(false)
const currentPlayer = ref(0)
const five_second_users = ref([])

const gameType = ref(localStorage.getItem('five_second_game_type') || '3')
const questions = ref([])

let timer = null


if (route.params.locale) {
  locale.value = route.params.locale;
}
// Получение языка из localStorage или установка 'ua' по умолчанию
const savedLocale = localStorage.getItem('language') || 'ua';
locale.value = savedLocale;


const loadQuestions = async () => {
  try {
    const questionsModule = await import(`./questions_${gameType.value}_${locale.value}.json`)
    questions.value = questionsModule.default
  } catch (error) {
    console.error("Ошибка загрузки вопросов:", error)
  }
}

const startGame = () => {
  if (isRunning.value) return

  alarm.play()
  
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
    }
  }, 1000)
}

const refreshQuestion = () => {
  currentQuestion.value = questions.value[Math.floor(Math.random() * questions.value.length)]
}

const nextQuestion = () => {
  currentQuestion.value = questions.value[Math.floor(Math.random() * questions.value.length)]
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
    roomId: route.params.roomId,
    gameType: gameType.value
  }
  localStorage.setItem('five_second_game_state', JSON.stringify(gameState))
}

const loadGameState = () => {
  const savedState = localStorage.getItem('five_second_game_state')
  if (savedState) {
    const gameState = JSON.parse(savedState)
    currentPlayer.value = gameState.currentPlayer
    five_second_users.value = gameState.five_second_users.map(user => ({ ...user, score: user.score || 0 }))
    gameType.value = gameState.gameType
    loadQuestions()
  }
}

const clearGameState = () => {
  localStorage.removeItem('five_second_game_state')
}

const gameTypeText = computed(() => {
  return gameType.value === '3' ? 'Назви три' : 'Назви п\'ять'
})

onMounted(async () => {
  const roomId = route.params.roomId
  // Загружаем игроков из localStorage
  const savedUsers = JSON.parse(localStorage.getItem('five_second_users')) || []
  five_second_users.value = savedUsers.map(user => ({ ...user, score: user.score || 0 }))
  loadGameState()
  
  // Устанавливаем вопросы в зависимости от типа игры
  await loadQuestions()

  // Загружаем первый вопрос
  if (questions.value.length > 0 && !currentQuestion.value) {
    currentQuestion.value = questions.value[Math.floor(Math.random() * questions.value.length)]
  }
})

watch(five_second_users, saveGameState, { deep: true })
watch(currentPlayer, saveGameState)
watch(gameType, saveGameState)

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
.yes_or_not_div {
  width: 400px;
  height: 200px;
}

.btn-grad {
  margin: 15px;
}

.btn-icon {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: var(--text-color);
  margin-left: 10px;
}

.btn-icon:hover {
  color: var(--btn-bg-color);
}

.gameTypeText {
  color: #000;
  font-size: 25px;
}

.game-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100vh;
  padding: 10px;
  color: var(--text-color);
}

.card p {
  font-size: 1.5em;
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
  font-size: 50px;
  color: var(--text-color);
}

.player-list {
  margin-bottom: 20px;
}

.player-list div {
  margin: 10px 0;
  color: var(--text-color);
  font-size: 1.2em;
}

.current-player {
  font-weight: bold;
  background-color: transparent;
  padding: 10px;
  border-radius: 5px;
  color: black !important;
  border: 1px solid;
  border-radius: 12px;
  box-shadow: 0px 5px 10px 0px rgba(0, 0, 0, 0.3);
}

@media (max-width: 768px) {
  .card {
    padding: 15px;
    font-size: 18px;
  }
  .btn-grad {
    font-size: 18px;
    padding: 12px 24px;
  }
  .btn-icon {
    font-size: 18px;
  }
  .timer {
    font-size: 40px;
  }
}

@media (max-width: 480px) {
  .card {
    padding: 20px;
    font-size: 16px;
  }
  .btn-grad {
    font-size: 16px;
    padding: 10px 20px;
  }
  .btn-icon {
    font-size: 16px;
  }
  .timer {
    font-size: 35px;
  }
  .player-list div {
    font-size: 1.5em;
  }
}
</style>
