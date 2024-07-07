<template>
  <GameLayout nameGame="К Н Б">
    <div class="mainContainer">
      <div class="creatorInfo">Кімнату створив {{ room.name }} для {{ room.required_players }}-x гравців</div>
      <div v-if="gameState === 'GameCanBeStart'">
        <table class="formCreate">
          <thead>
            <tr>
              <th>Гравець</th>
              <th>Рахунок</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="i in room.players" :key="i.id" class="formElement">
              <td class="tableElement">{{ i.name }}</td>
              <td class="tableElement">{{ i.score }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <br>
      <div v-if="gameState === 'WaitPlayers'">
        <div class="waiting">Очікуємо на гравців</div>
        <br>
        <a :href="`/connect/${room.id}`">https://salty-crag-94803-5b1ef9ad0209.herokuapp.com/connect/{{ room.id }}</a>
        <br>
        <qrcode-vue :value="qrCodeValue" :size="200" level="L" />
      </div>
      <div v-if="gameState === 'GameCanBeStart'">
        <button @click="showPopup" class="choose-btn">Зробити вибір</button>
        <div :class="{ 'modal-overlay': true, 'show': showChoice }">
          <div class="modal-content choice-modal">
            <div>Роби свій вибір</div>
            <div class="groupButtonCont vertical">
              <button @click="sendPlayerChoiceToServer('rock')" class="btn_rock activeButton"></button>
              <button @click="sendPlayerChoiceToServer('scissors')" class="btn_sci activeButton"></button>
              <button @click="sendPlayerChoiceToServer('paper')" class="btn_paper activeButton"></button>
            </div>
          </div>
        </div>
      </div>
      <div :class="{ 'modal-overlay': true, 'show': showResult }">
        <div class="modal-content">
          <div class="result_w">{{ resultMessage }}</div>
          <button @click="playAgain" class="btn-grad">Грати ще</button>
        </div>
      </div>
    </div>
  </GameLayout>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import QrcodeVue from 'qrcode.vue'
import GameLayout from '../GameLayout.vue'

const pName = localStorage.getItem('playerName')
const route = useRoute()
const router = useRouter()
let choiseGet = ref(true)
let gameState = ref('WaitPlayers')
const room = reactive({
  name: '',
  players: [],
})

const showChoice = ref(false)
const showResult = ref(false)
const resultMessage = ref('')

const showPopup = () => {
  showChoice.value = true
}

const closePopup = () => {
  showChoice.value = false
  showResult.value = false
}

const qrCodeValue = `https://salty-crag-94803-5b1ef9ad0209.herokuapp.com/connect/${route.params.id}`

const userHash = localStorage.getItem('hash')
let websocket

if (userHash) {
  websocket = new WebSocket(`wss://rsp-f1c55df7ba69.herokuapp.com/start/${route.params.id}?name=${pName}&player_hash=${userHash}`)
} else {
  websocket = new WebSocket(`wss://rsp-f1c55df7ba69.herokuapp.com/start/${route.params.id}?name=${pName}`)
}

const sendPlayerChoiceToServer = (choice) => {
  websocket.send(choice)
  resultMessage.value = `Ви обрали ${choice}`
  choiseGet.value = false
  showChoice.value = false
}

const playAgain = () => {
  choiseGet.value = true
  showResult.value = false
  gameState.value = 'GameCanBeStart'
  showPopup()
}

websocket.onmessage = function (event) {
  const message = JSON.parse(event.data)

  const eventType = message.event
  if (message.hash) {
    localStorage.setItem('hash', message.hash)
  }

  if (eventType === 'GameCanBeStart') {
    gameState.value = 'GameCanBeStart'
    showPopup()
  } else if (['Win', 'Draw', 'Lose'].includes(eventType)) {
    choiseGet.value = false
    resultMessage.value = eventType === 'Win' ? 'Виграш' : eventType === 'Draw' ? 'Нічия' : 'Програш'
    showResult.value = true
  }

  Object.assign(room, message['room'])
}
</script>

<style scoped lang="sass">
.creatorInfo
  font-size: 20px
  text-align: center

.formCreate
  width: 100%
  max-width: 600px
  margin: 0 auto
  border-collapse: collapse
  margin-top: 15px

  th, td
    padding: 10px
    text-align: center

  th
    background-color: var(--gradient-color)
    color: var(--text-color)

  td
    border-bottom: 1px solid var(--border-color)

.waiting
  text-align: center
  font-size: 18px

.choose-btn
  display: block
  margin: 20px auto
  padding: 10px 20px
  background-color: var(--btn-gradient-color)
  color: white
  border: none
  border-radius: 5px
  cursor: pointer
  font-size: 16px

.modal-overlay
  position: fixed
  top: 0
  left: 0
  right: 0
  bottom: 60px
  background-color: rgba(0, 0, 0, 0)
  display: none
  align-items: flex-end
  justify-content: center
  z-index: 1

.result_w
  font-size: 36px

.modal-overlay.show
  display: flex

.modal-content
  background-color: #fff
  padding: 20px
  border-radius: 8px
  z-index: 2
  width: 100%
  max-width: 300px
  text-align: center
  color: black

.choice-modal
  border-radius: 8px 8px 0 0

.groupButtonCont
  display: flex
  flex-direction: column
  justify-content: space-around
  align-items: center
  margin-top: 20px
  height: 50vh

  button
    width: 80%
    margin: 10px 0
    padding: 20px
    background-color: var(--btn-gradient-color)
    color: white
    border: none
    border-radius: 5px
    cursor: pointer
</style>
